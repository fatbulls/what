import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@components/ui/container";
import PageHeader from "@components/ui/page-header";
import { loadPage } from "@lib/cms-page";

const SLUG = "terms";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadPage(SLUG);
  if (!page) return { title: "Terms & Conditions" };
  return {
    title: page.title,
    description: page.meta_description ?? undefined,
    alternates: { canonical: `/${SLUG}` },
  };
}

export default async function TermsPage() {
  const page = await loadPage(SLUG);
  if (!page) notFound();
  return (
    <>
      <PageHeader pageHeader={page.title} />
      <Container>
        <div className="py-10 lg:py-14 max-w-4xl mx-auto">
          <article
            className="cms-page-content"
            dangerouslySetInnerHTML={{ __html: page.content ?? "" }}
          />
        </div>
      </Container>
    </>
  );
}
