import type { NextPageWithLayout } from "next";

const Home: NextPageWithLayout = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div>
        <p
          style={{
            color: "var(--fg)",
            fontSize: 16,
            letterSpacing: "0.2em",
            marginBottom: 64,
          }}
        >
          austin pham
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <a href="/produced">produced</a>
          <a href="/consumed">consumed</a>
          <a
            href="https://github.com/aphamm"
            target="_blank"
            rel="noopener noreferrer"
          >
            github
          </a>
          <a
            href="https://soundcloud.com/austin-pham-40930406"
            target="_blank"
            rel="noopener noreferrer"
          >
            soundcloud
          </a>
        </nav>
      </div>
    </div>
  );
};

Home.getLayout = (page) => <>{page}</>;

export default Home;
