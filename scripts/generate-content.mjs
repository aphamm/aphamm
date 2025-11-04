import { serialize } from "next-mdx-remote/serialize";
import path from "path";
import fs from "fs";

async function consumed() {
  const basePath = path.join(process.cwd(), "content", "consumed");

  const readPaths = fs.readdirSync(basePath, "utf8");
  const reads = await Promise.all(
    readPaths
      .filter((fileName) => fileName.includes(".mdx"))
      .map(async (fileName) => {
        const contentPath = path.join(basePath, fileName);
        const fileContents = fs
          .readFileSync(contentPath, "utf8")
          .split("## My Notes")[0];
        const source = await serialize(fileContents, {
          parseFrontmatter: true,
          mdxOptions: { development: false },
        });

        return {
          ...source.frontmatter,
          slug: "/" + path.join("consumed", "read", fileName.split(".")[0]),
          summary: source.compiledSource,
        };
      })
  );

  reads.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  fs.writeFileSync(
    path.join(basePath, "index.json"),
    JSON.stringify(reads, undefined, 2)
  );
}

async function main() {
  await consumed();
}

main();
