import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>
      <body style={{ background: "#f8f8f6" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
