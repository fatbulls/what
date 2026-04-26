import type { Metadata } from "next";
import ContactUsClient from "./contact-us-client";

const description =
  "Reach the What Shop support team for delivery questions, custom requests, or collaboration.";

export const metadata: Metadata = {
  title: "Contact Us",
  description,
  alternates: { canonical: "/contact-us" },
  openGraph: {
    title: "Contact Us",
    description,
    type: "website",
    url: "/contact-us",
  },
};

export default function ContactUsPage() {
  return <ContactUsClient />;
}
