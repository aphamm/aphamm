import {
  Flex,
  Heading,
  Stack,
  VStack,
  Text,
} from "@chakra-ui/react";
import { GetStaticPropsContext, NextPageWithLayout } from "next";
import Layout from "../../../components/Layout";
import { Prose } from "@nikolovlazar/chakra-ui-prose";
import { MDXRemote } from "next-mdx-remote";
import { Read, getAllConsumed, getRead } from "../../../lib/consumed";
import { Content } from "../../../lib/mdx";
import { NextSeo } from "next-seo";

interface ReadProps {
  read: Content<Read>;
}

const ReadPage: NextPageWithLayout<ReadProps> = ({ read }) => {
  return (
    <>
      <NextSeo
        title={read.metadata.title}
        description={`By: ${read.metadata.author} - Read: ${read.metadata.date} - Rating: ${read.metadata.rating}/10`}
        openGraph={{
          title: read.metadata.title,
          description: `By: ${read.metadata.author} - Read: ${read.metadata.date} - Rating: ${read.metadata.rating}/10`,
        }}
      />
      <Stack spacing={3}>
        <Flex direction="row" align="flex-start" gap={6}>
          <VStack align="flex-start" flexGrow={1}>
            <Heading size="xl">{read.metadata.title}</Heading>
            <Text color="gray.400" fontSize="xl">
              By: {read.metadata.author} - Read: {read.metadata.date} -
              Rating: {read.metadata.rating}/10
            </Text>
          </VStack>
        </Flex>
        <Prose>
          <MDXRemote compiledSource={read.source} />
        </Prose>
      </Stack>
    </>
  );
};

export default ReadPage;

ReadPage.getLayout = (page) => <Layout>{page}</Layout>;

export async function getStaticPaths() {
  const reads = getAllConsumed();
  const paths = reads.map((read) => {
    const slug = read.slug.split("/").pop();
    return { params: { slug } };
  });

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  if (!params || !params.slug || typeof params.slug !== "string") {
    return {
      redirect: {
        destination: "/consumed",
      },
    };
  }

  const read = await getRead(params.slug as string);
  if (!read) {
    return {
      redirect: {
        destination: "/consumed",
      },
    };
  }

  return {
    props: { read },
  };
}

