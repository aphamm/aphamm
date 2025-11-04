import type { GetStaticPropsContext, NextPageWithLayout } from "next";
import { MDXRemote } from "next-mdx-remote";
import Layout from "../../../components/Layout";
import { getAllConsumed, getRead, type Read } from "../../../lib/consumed";
import type { Content } from "../../../lib/mdx";

interface ReadProps {
  read: Content<Read>;
}

const ReadPage: NextPageWithLayout<ReadProps> = ({ read }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p
          style={{ color: "var(--fg)", fontSize: 14, letterSpacing: "0.05em" }}
        >
          {read.metadata.title.toLowerCase()}
        </p>
        <p style={{ fontSize: 12, letterSpacing: "0.05em", marginTop: 4 }}>
          {read.metadata.author.toLowerCase()}
        </p>
      </div>
      <div className="prose" style={{ fontSize: 12 }}>
        <MDXRemote compiledSource={read.source} scope={{}} frontmatter={{}} />
      </div>
    </div>
  );
};

ReadPage.getLayout = (page) => <Layout>{page}</Layout>;

export async function getStaticPaths() {
  const reads = getAllConsumed();
  const paths = reads.map((read) => {
    const slug = read.slug.split("/").pop();
    return { params: { slug } };
  });

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  if (!params || !params.slug || typeof params.slug !== "string") {
    return { redirect: { destination: "/consumed" } };
  }

  const read = await getRead(params.slug);
  if (!read) {
    return { redirect: { destination: "/consumed" } };
  }

  return { props: { read } };
}

export default ReadPage;
