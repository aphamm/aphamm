import { Space_Mono } from "@next/font/google";
import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import type { ReactElement } from "react";
import Layout from "../components/Layout";
import "../styles/global.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const getDefaultLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || getDefaultLayout;

  return (
    <div className={spaceMono.className}>
      <DefaultSeo title="austin pham" />
      {getLayout(<Component {...pageProps} />)}
    </div>
  );
}
