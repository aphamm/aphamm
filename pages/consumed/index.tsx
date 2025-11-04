import type { NextPageWithLayout } from "next";
import Layout from "../../components/Layout";
import { getAllConsumed, type Read } from "../../lib/consumed";

interface ConsumedProps {
  reads: Read[];
}

const Consumed: NextPageWithLayout<ConsumedProps> = ({ reads }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {reads
        .slice()
        .sort((a, b) => b.rating - a.rating)
        .map((read) => (
          <a key={read.title} href={read.slug}>
            {read.title.toLowerCase()}
          </a>
        ))}
    </div>
  );
};

Consumed.getLayout = (page) => <Layout>{page}</Layout>;

export async function getStaticProps() {
  const reads = getAllConsumed();
  return { props: { reads } };
}

export default Consumed;
