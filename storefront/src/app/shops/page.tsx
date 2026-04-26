import type { Metadata } from "next";
import ShopsClient from "./shops-client";

const description =
  "Explore What Shop partner boutiques and discover local florists across Klang Valley.";

export const metadata: Metadata = {
  title: "Our Shops",
  description,
  alternates: { canonical: "/shops" },
  openGraph: {
    title: "Our Shops",
    description,
    type: "website",
    url: "/shops",
  },
};

export default function ShopsPage() {
  return <ShopsClient />;
}
