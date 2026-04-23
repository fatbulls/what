import { useCallback, useEffect, useState } from "react";
import { ArrowUpOutlined } from "@ant-design/icons";

const SCROLL_THRESHOLD = 240;
const SCROLL_DURATION = 300;

const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

const BackTop = () => {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    const shouldShow = window.scrollY > SCROLL_THRESHOLD;
    setVisible(shouldShow);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const handleBackToTop = useCallback(() => {
    const start = window.scrollY;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = Math.min((currentTime - startTime) / SCROLL_DURATION, 1);
      const eased = easeInOutQuad(elapsed);
      window.scrollTo({ top: start * (1 - eased), behavior: "auto" });
      if (elapsed < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={handleBackToTop}
      className="fixed bottom-16 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-heading text-white shadow-lg transition hover:bg-heading/90"
    >
      <ArrowUpOutlined className="text-xl" />
    </button>
  );
};

export default BackTop;
