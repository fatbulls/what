import type { Metadata } from "next";
import OrderTrackingClient from "./order-tracking-client";

const description =
  "Look up an order by its tracking number to check status, items, and delivery details.";

export const metadata: Metadata = {
  title: "Track Your Order",
  description,
  alternates: { canonical: "/order-tracking" },
  openGraph: {
    title: "Track Your Order",
    description,
    type: "website",
    url: "/order-tracking",
  },
};

export const revalidate = 60;

export default function OrderTrackingPage() {
  return <OrderTrackingClient />;
}
