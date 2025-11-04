import {
  Flex,
  Heading,
  Image,
  Stack,
  VStack,
  Text,
  Divider,
  Link,
} from "@chakra-ui/react";
import { NextPageWithLayout } from "next";
import Layout from "../../components/Layout";
import { Prose } from "@nikolovlazar/chakra-ui-prose";
import { MDXRemote } from "next-mdx-remote";
import { Read, getAllConsumed } from "../../lib/consumed";
import { NextSeo } from "next-seo";

interface ConsumedProps {
  reads: Read[];
}

const Consumed: NextPageWithLayout<ConsumedProps> = ({ reads }) => {
  return (
    <>
      <NextSeo title="Consumed | Austin Pham" />
      <Stack spacing={5}>
        {reads
          .slice()
          .sort((a, b) => b.rating - a.rating)
          .map((read, index) => (
            <Stack key={read.title} scrollMarginTop={20}>
              <Stack>
                {index > 0 && <Divider mb={3} width="100%" />}
                <Flex direction="row" align="flex-start" gap={6}>
                  <Image
                    border="1px solid"
                    borderColor="gray.200"
                    src={read.coverImage}
                    alt={read.title}
                    height={{ base: "100px", sm: "140px", md: "160px" }}
                  />

                  <VStack align="flex-start" flexGrow={1}>
                    <Link href={read.slug}>
                      <Heading size="md">{read.title}</Heading>
                    </Link>
                    <Text color="#999" size="md">
                      {read.author}
                    </Text>
                    <Text color="#666">
                      Read: {read.date} • Rating: {read.rating}/10
                    </Text>
                    <Prose>
                      <MDXRemote compiledSource={read.summary} />
                    </Prose>
                  </VStack>
                </Flex>
              </Stack>
            </Stack>
          ))}
      </Stack>
    </>
  );
};

export default Consumed;

Consumed.getLayout = (page) => <Layout>{page}</Layout>;

export async function getStaticProps() {
  const reads = getAllConsumed();
  return { props: { reads } };
}

