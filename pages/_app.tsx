import localFont from "@next/font/local";
import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import type { ReactElement } from "react";
import { Analytics } from "@vercel/analytics/react";
import Layout from "../components/Layout";
import "../styles/global.css";

const signifier = localFont({
  src: [
    {
      path: "../public/fonts/test-signifier-vf-roman.woff2",
      style: "normal",
    },
    {
      path: "../public/fonts/test-signifier-vf-italic.woff2",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-signifier",
});

const getDefaultLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || getDefaultLayout;

  return (
    <div className={signifier.variable}>
      <DefaultSeo
        title="apham"
        description="deep learning researcher"
        openGraph={{
          type: "website",
          url: "https://apham.sh",
          title: "apham",
          description: "deep learning researcher",
          images: [{ url: "https://apham.sh/opengraph-image.jpeg" }],
        }}
        twitter={{
          handle: "@austinphamm",
          cardType: "summary_large_image",
        }}
      />
      {getLayout(<Component {...pageProps} />)}
      <Analytics />
    </div>
  );
}
