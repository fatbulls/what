import type { Metadata } from "next";
import Providers from "./providers";
import Shell from "./shell";
import "@fontsource/open-sans";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/satisfy";
import "react-toastify/dist/ReactToastify.css";
import "../styles/tailwind.css";
import "../styles/custom-plugins.css";
import "../styles/scrollbar.css";
import "../styles/swiper-carousel.css";
import "../styles/blog.css";

export const metadata: Metadata = {
  title: "What Shop",
  description: "Powered by Medusa v2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
