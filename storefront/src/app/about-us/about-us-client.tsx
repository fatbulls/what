"use client";

import Container from "@components/ui/container";
import PageHeader from "@components/ui/page-header";
import { Link } from "react-scroll";

interface Props {
  pageTitle: string;
  contentHtml: string;
  // Heading list extracted server-side from the CMS page's HTML —
  // drives the sticky scroll-spy nav on the left.
  sections: { id: string; title: string }[];
}

export default function AboutUsClient({
  pageTitle,
  contentHtml,
  sections,
}: Props) {
  return (
    <>
      <PageHeader pageHeader={pageTitle} />
      <div className="mt-12 lg:mt-14 xl:mt-16 lg:py-1 xl:py-0 border-b border-gray-300 px-4 md:px-10 lg:px-7 xl:px-16 2xl:px-24 3xl:px-32 pb-9 md:pb-14 lg:pb-16 2xl:pb-20 3xl:pb-24">
        <Container>
          <div className="flex flex-col md:flex-row">
            <nav className="md:w-72 xl:w-3/12 mb-8 md:mb-0">
              <ol className="sticky md:top-16 lg:top-28 z-10">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    {/* @ts-ignore — react-scroll's d.ts is loose */}
                    <Link
                      spy={true}
                      offset={-120}
                      smooth={true}
                      duration={500}
                      to={section.id}
                      activeClass="text-heading font-semibold"
                      className="block cursor-pointer py-3 lg:py-3.5 text-sm lg:text-base text-gray-700 uppercase"
                    >
                      {(index <= 9 ? "0" : "") + index + " " + section.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>

            <div
              className="md:w-9/12 ltr:md:pl-8 rtl:md:pr-8 pt-0 lg:pt-2 text-heading text-sm leading-7 lg:text-base lg:leading-loose [&_p]:mb-4 [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        </Container>
      </div>
    </>
  );
}
