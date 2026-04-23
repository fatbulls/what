import { fetchSettings } from "@framework/settings/settings.query";
import { fetchInfiniteProducts } from "@framework/products/products.query";
import type { Category } from "@framework/types";
import { API_ENDPOINTS } from "@framework/utils/endpoints";
import type { GetStaticPathsContext, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { QueryClient } from "@/shims/rq-compat";
import { dehydrate } from "@/shims/rq-compat";
import {
  fetchCategories,
  fetchCategory,
} from "@framework/category/categories.query";

// This function gets called at build time
export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const preloadLimit = Number(process.env.NEXT_STATIC_CATEGORY_LIMIT ?? 32);
  const categories = await fetchCategories({
    queryKey: [API_ENDPOINTS.CATEGORIES, { limit: preloadLimit, parent: null }],
  });
  const paths = categories?.data?.flatMap((category: Category) =>
    locales?.map((locale) => ({ params: { slug: category.slug }, locale }))
  );
  return {
    paths,
    fallback: "blocking",
  };
}

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const slug = params?.slug as string;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  });

  try {
    await queryClient.prefetchQuery(API_ENDPOINTS.SETTINGS, fetchSettings);

    const category = await fetchCategory(slug);
    queryClient.setQueryData([API_ENDPOINTS.CATEGORIES, slug], category);

    await queryClient.prefetchInfiniteQuery(
      [API_ENDPOINTS.PRODUCTS, { category: slug }],
      fetchInfiniteProducts
    );

    return {
      props: {
        ...(await serverSideTranslations(locale!, [
          "common",
          "menu",
          "forms",
          "footer",
        ])),
        category: category ?? null,
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      },
      revalidate: Number(process.env.REVALIDATE_DURATION) ?? 120,
    };
  } catch (error) {
    // If we get here means something went wrong in promise fetching
    return {
      notFound: true,
    };
  }
};
