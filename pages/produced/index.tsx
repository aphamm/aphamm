import type { NextPageWithLayout } from "next";
import Layout from "../../components/Layout";
import { getProduced, type Write } from "../../lib/produced";

interface PageProps {
  data: Write[];
}

const Page: NextPageWithLayout<PageProps> = ({ data }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {data.map((write) => (
        <a
          key={write.title}
          href={write.links[0]?.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {write.title.toLowerCase()}
        </a>
      ))}
    </div>
  );
};

Page.getLayout = (page) => <Layout>{page}</Layout>;

export async function getStaticProps() {
  const data = getProduced();
  return { props: { data } };
}

export default Page;
