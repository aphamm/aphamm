import localFont from "@next/font/local";
import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import type { ReactElement } from "react";
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
      <DefaultSeo title="apham" />
      {getLayout(<Component {...pageProps} />)}
    </div>
  );
}
