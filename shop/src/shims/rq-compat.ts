"use client";

// v3 → v5 compatibility shim. ChawkBazar's *.query.ts files were written
// against react-query v3's positional-argument API. v5 switched to a single
// object-argument API. Rather than rewrite 40 hook definitions, we
// accept both forms here and forward to v5 underneath. Everything else in
// `@tanstack/react-query` is re-exported unchanged.

import * as rq from "@tanstack/react-query";

export * from "@tanstack/react-query";

type AnyFn = (...args: any[]) => any;

function isOptionsObject(first: any): boolean {
  return (
    typeof first === "object" &&
    first !== null &&
    !Array.isArray(first) &&
    ("queryFn" in first || "mutationFn" in first || "queryKey" in first)
  );
}

export function useQuery<TData = unknown, TError = Error>(
  keyOrOptions: any,
  queryFn?: AnyFn,
  options?: any
): rq.UseQueryResult<TData, TError> {
  if (isOptionsObject(keyOrOptions)) {
    return rq.useQuery(keyOrOptions) as any;
  }
  const queryKey = Array.isArray(keyOrOptions) ? keyOrOptions : [keyOrOptions];
  return rq.useQuery({
    queryKey,
    queryFn: queryFn ? () => queryFn({ queryKey } as any) : undefined,
    ...(options || {}),
  } as any) as any;
}

export function useMutation<TData = unknown, TError = Error, TVariables = void>(
  fnOrOptions: any,
  options?: any
): rq.UseMutationResult<TData, TError, TVariables> {
  if (isOptionsObject(fnOrOptions)) {
    return rq.useMutation(fnOrOptions) as any;
  }
  return rq.useMutation({
    mutationFn: fnOrOptions,
    ...(options || {}),
  } as any) as any;
}

export function useInfiniteQuery(
  keyOrOptions: any,
  queryFn?: AnyFn,
  options?: any
): any {
  if (isOptionsObject(keyOrOptions)) {
    return (rq.useInfiniteQuery as any)(keyOrOptions);
  }
  const queryKey = Array.isArray(keyOrOptions) ? keyOrOptions : [keyOrOptions];
  const getNextPageParam =
    (options && options.getNextPageParam) ??
    (() => undefined);
  return (rq.useInfiniteQuery as any)({
    queryKey,
    queryFn: queryFn
      ? ({ pageParam }: any) => queryFn({ queryKey, pageParam } as any)
      : undefined,
    initialPageParam: undefined,
    getNextPageParam,
    ...(options || {}),
  });
}

// Legacy alias: v3 exported `Hydrate` as a component; v5 renamed it to
// `HydrationBoundary`. Both names are provided here so existing imports keep
// working without touching the files.
export const Hydrate = rq.HydrationBoundary;
