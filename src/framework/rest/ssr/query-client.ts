import { QueryClient } from "react-query";

const parseNumberEnv = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const ssrStaleTime = parseNumberEnv(
  process.env.REACT_QUERY_SSR_STALE_TIME,
  0
);

export const createSSRQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Allow immediate refetch on mount/focus unless overridden by env.
        staleTime: ssrStaleTime,
      },
    },
  });

