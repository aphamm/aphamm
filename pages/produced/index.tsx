import { NextPageWithLayout } from "next";
import Layout from "../../components/Layout";
import { Write, getProduced } from "../../lib/produced";
import { NextSeo } from "next-seo";
import { Divider, VStack, Text, HStack, Link } from "@chakra-ui/react";

interface PageProps {
  data: Write[];
}

const Page: NextPageWithLayout<PageProps> = ({ data }) => {
  return (
    <>
      <NextSeo title="Produced | Austin Pham" />
      <VStack width="100%" spacing={4}>
        <Divider width="100%" />
        {data.map((write) => (
          <>
            <VStack width="100%" align="flex-start" spacing={1}>
              <Text fontWeight="bold">{write.title}</Text>
              <Text fontSize="sm" color="gray.600" pb={4}>
                {write.description}
              </Text>
              <HStack fontSize="sm" color="blue.600" spacing={6}>
                {write.links.map((link, i) => (
                  <Link key={i} href={link.href} target="_blank">
                    {link.label}
                  </Link>
                ))}
              </HStack>
            </VStack>
            <Divider width="100%" />
          </>
        ))}
      </VStack>
    </>
  );
};

Page.getLayout = (page) => <Layout>{page}</Layout>;

export async function getStaticProps() {
  const data = getProduced();
  return { props: { data } };
}

export default Page;

