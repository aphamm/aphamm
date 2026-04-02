import type { NextPageWithLayout } from "next";
import Carousel from "../components/Carousel";
import { getProduced, type Write } from "../lib/produced";

interface Props {
  publications: Write[];
}

const Home: NextPageWithLayout<Props> = ({ publications }) => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 0",
      }}
    >
      {/* fractal noise warp filter */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="warp">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008"
              numOctaves="3"
              result="w"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="w"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="B"
              id="warp-displacement"
            />
          </filter>
        </defs>
      </svg>
      {/* top */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "0 32px",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-signifier)",
            fontSize: 32,
            fontWeight: 400,
            fontStyle: "italic",
            letterSpacing: "-0.01em",
            color: "var(--fg)",
            lineHeight: 1.1,
          }}
        >
          apham
        </h1>
        <nav
          style={{
            display: "flex",
            gap: 20,
            paddingTop: 8,
            alignItems: "center",
          }}
        >
          <a
            href="https://github.com/aphamm"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <a
            href="https://x.com/austinphamm"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </nav>
      </header>

      {/* carousel */}
      <Carousel items={publications} />

      {/* bottom */}
      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          padding: "0 32px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-signifier)",
            fontSize: 11,
            fontWeight: 200,
            color: "#aaa",
            lineHeight: 1.5,
          }}
        >
          deep learning researcher
        </p>
        <p
          style={{
            fontFamily: "var(--font-signifier)",
            fontSize: 11,
            fontWeight: 200,
            color: "#aaa",
            textAlign: "right",
            lineHeight: 1.5,
          }}
        >
          surrender to life
        </p>
      </footer>
    </div>
  );
};

Home.getLayout = (page) => <>{page}</>;

export async function getStaticProps() {
  const publications = getProduced();
  return { props: { publications } };
}

export default Home;
