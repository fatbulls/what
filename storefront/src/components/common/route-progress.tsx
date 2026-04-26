"use client";

// Top-of-viewport navigation progress bar. Implemented as a DOM singleton
// rather than a React-state-backed component because App Router re-renders
// the root layout tree on every navigation, unmounting any React-tree node
// that isn't perfectly stable. The singleton DOM node + module-scoped
// animation state survive those remounts.
//
// Two React entry points share the module state:
// - <RouteProgress />: mounted at root layout; owns the click listener
//   and the pathname-change hook that marks "route committed".
// - <QueryBusyBridge />: mounted inside <Providers> (where the React Query
//   QueryClientProvider lives); reports `useIsFetching()` into the module
//   so the bar can wait for data to settle before finishing. Without this,
//   the bar races to 100% the moment the URL changes, and the user sees a
//   "done" bar while the skeleton continues for seconds.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useIsFetching } from "@tanstack/react-query";

const MIN_SHOW_MS = 180;
const IDLE_SETTLE_MS = 150; // how long queries must stay at 0 before we finish
const SAFETY_MS = 4000; // absolute cap — never hold the bar longer than this
const BAR_ID = "__route_progress_bar__";

function ensureBar(): { outer: HTMLDivElement; inner: HTMLDivElement } | null {
  if (typeof document === "undefined") return null;
  let outer = document.getElementById(BAR_ID) as HTMLDivElement | null;
  if (outer) {
    return { outer, inner: outer.firstElementChild as HTMLDivElement };
  }
  outer = document.createElement("div");
  outer.id = BAR_ID;
  outer.setAttribute("aria-hidden", "true");
  Object.assign(outer.style, {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    height: "2px",
    zIndex: "9999",
    opacity: "0",
    pointerEvents: "none",
    transition: "opacity 200ms ease-out",
  });
  const inner = document.createElement("div");
  Object.assign(inner.style, {
    height: "100%",
    width: "0%",
    background: "#0F172A",
    boxShadow: "0 0 8px rgba(0,0,0,0.25)",
    transition: "width 500ms cubic-bezier(0.1, 0.5, 0.2, 1)",
  });
  outer.appendChild(inner);
  document.body.appendChild(outer);
  return { outer, inner };
}

// Module-scoped state persists across React remounts.
let state: "idle" | "running" | "waiting-for-idle" = "idle";
let tickId: ReturnType<typeof setInterval> | null = null;
let hideId: ReturnType<typeof setTimeout> | null = null;
let idleCheckId: ReturnType<typeof setTimeout> | null = null;
let startedAt = 0;
let commitedAt = 0;
let currentPct = 0;
let queryBusy = 0;
let idleSince: number | null = null;

function clearTimers() {
  if (tickId) clearInterval(tickId);
  if (hideId) clearTimeout(hideId);
  if (idleCheckId) clearTimeout(idleCheckId);
  tickId = hideId = idleCheckId = null;
}

function startBar() {
  const parts = ensureBar();
  if (!parts) return;
  const { outer, inner } = parts;
  if (state === "running" || state === "waiting-for-idle") return;
  state = "running";
  startedAt = Date.now();
  outer.style.opacity = "1";
  inner.style.transition = "width 500ms cubic-bezier(0.1, 0.5, 0.2, 1)";
  currentPct = 10;
  inner.style.width = currentPct + "%";
  // Climb asymptotically toward 85% — we hold there until queries drain.
  tickId = setInterval(() => {
    if (currentPct < 85) {
      currentPct += (85 - currentPct) * 0.1;
      inner.style.width = currentPct + "%";
    }
  }, 80);
}

// Called when the pathname has committed — the page frame is on screen.
// But client components may still be fetching; don't finish the bar yet.
function onRouteCommitted() {
  if (state !== "running") return;
  state = "waiting-for-idle";
  commitedAt = Date.now();
  idleSince = queryBusy === 0 ? Date.now() : null;
  scheduleIdleCheck();
}

function scheduleIdleCheck() {
  if (idleCheckId) clearTimeout(idleCheckId);
  idleCheckId = setTimeout(checkIdle, 80);
}

function checkIdle() {
  if (state !== "waiting-for-idle") return;
  const now = Date.now();
  // Safety cap — bar has been visible too long, just finish.
  if (now - startedAt >= SAFETY_MS) {
    finishBar();
    return;
  }
  if (queryBusy > 0) {
    idleSince = null;
  } else if (idleSince === null) {
    idleSince = now;
  }
  if (idleSince !== null && now - idleSince >= IDLE_SETTLE_MS) {
    finishBar();
    return;
  }
  scheduleIdleCheck();
}

function finishBar() {
  const parts = ensureBar();
  if (!parts) return;
  const { outer, inner } = parts;
  clearTimers();
  inner.style.transition = "width 220ms ease-out";
  inner.style.width = "100%";
  currentPct = 100;
  const elapsed = Date.now() - startedAt;
  const wait = Math.max(0, MIN_SHOW_MS - elapsed);
  hideId = setTimeout(() => {
    outer.style.opacity = "0";
    hideId = setTimeout(() => {
      inner.style.transition = "none";
      inner.style.width = "0%";
      currentPct = 0;
      state = "idle";
      idleSince = null;
    }, 220);
  }, wait);
}

function setQueryBusy(n: number) {
  queryBusy = n;
  if (state === "waiting-for-idle") {
    // Changes in busy count may accelerate the idle-settle decision —
    // re-check right away rather than waiting for the next 80ms tick.
    if (n === 0 && idleSince === null) idleSince = Date.now();
    if (n > 0) idleSince = null;
  }
}

let clickListenerAttached = false;
function ensureClickListener() {
  if (clickListenerAttached || typeof document === "undefined") return;
  clickListenerAttached = true;
  document.addEventListener(
    "click",
    (e) => {
      const t = e.target as HTMLElement | null;
      const el = t?.closest?.("a");
      if (!el) return;
      const href = el.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (/^https?:\/\//.test(href) && !href.includes(window.location.host)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e as any).button === 1) return;
      startBar();
    },
    true,
  );
}

export default function RouteProgress() {
  const pathname = usePathname();
  useEffect(() => {
    ensureBar();
    ensureClickListener();
  }, []);
  useEffect(() => {
    onRouteCommitted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return null;
}

// Mounted inside <Providers> — bridges React Query's isFetching count
// into our module state so `waiting-for-idle` can resolve.
export function QueryBusyBridge() {
  const count = useIsFetching();
  useEffect(() => {
    setQueryBusy(count);
  }, [count]);
  return null;
}
