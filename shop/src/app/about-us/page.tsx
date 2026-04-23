"use client";

import Container from "@components/ui/container";
import PageHeader from "@components/ui/page-header";
import { aboutUs } from "@settings/aboutus.settings";
import { Link, Element } from "react-scroll";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {QueryClient} from "@tanstack/react-query";
import {API_ENDPOINTS} from "@framework/utils/endpoints";
import {fetchSettings} from "@framework/settings/settings.query";
import { Seo } from "@components/seo";

function makeTitleToDOMId(title: string) {
    return title.toLowerCase().split(" ").join("_");
}

export default function AboutUsPage() {
    const { t } = useTranslation("aboutUs");
    const description =
        "Learn about Because You Florist, our same-day delivery promise, and the team crafting every bouquet.";
    return (
        <>
            <Seo
                pageName="About Us"
                title="About Us"
                description={description}
                canonicalPath="/about-us"
                breadcrumbs={[
                    { name: "Home", item: "/" },
                    { name: "About Us", item: "/about-us" },
                ]}
                schema={{
                    type: "webPage",
                    data: {
                        title: "About Us",
                        description,
                    },
                }}
            />
            <PageHeader pageHeader="text-page-about-us" />
            <div className="mt-12 lg:mt-14 xl:mt-16 lg:py-1 xl:py-0 border-b border-gray-300 px-4 md:px-10 lg:px-7 xl:px-16 2xl:px-24 3xl:px-32 pb-9 md:pb-14 lg:pb-16 2xl:pb-20 3xl:pb-24">
                <Container>
                    <div className="flex flex-col md:flex-row">
                        <nav className="md:w-72 xl:w-3/12 mb-8 md:mb-0">
                            <ol className="sticky md:top-16 lg:top-28 z-10">
                                {aboutUs?.map((item, index) => (
                                    <li key={item.id}>
                                        <Link
                                            spy={true}
                                            offset={-120}
                                            smooth={true}
                                            duration={500}
                                            to={makeTitleToDOMId(item.title)}
                                            activeClass="text-heading font-semibold"
                                            className="block cursor-pointer py-3 lg:py-3.5  text-sm lg:text-base  text-gray-700 uppercase"
                                        >
                                            {(index <= 9 ? "0" : "") +
                                            index +
                                            " " +
                                            t(`${item.title}`)}
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                        {/* End of section scroll spy menu */}

                        <div className="md:w-9/12 ltr:md:pl-8 rtl:md:pr-8 pt-0 lg:pt-2">
                            {aboutUs?.map((item) => (
                                // @ts-ignore
                                <Element
                                    key={item.title}
                                    id={makeTitleToDOMId(item.title)}
                                    className="mb-10"
                                >
                                    <h2 className="text-lg md:text-xl lg:text-2xl text-heading font-bold mb-4">
                                        {t(`${item.title}`)}
                                    </h2>
                                    <div
                                        className="text-heading text-sm leading-7 lg:text-base lg:leading-loose"
                                        dangerouslySetInnerHTML={{
                                            __html: t(`${item.description}`),
                                        }}
                                    />
                                </Element>
                            ))}
                        </div>
                        {/* End of content */}
                    </div>
                </Container>
            </div>
        </>
    );
}


