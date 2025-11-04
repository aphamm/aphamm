import fs from "node:fs";
import path from "node:path";
import { getMdxContent, type MaybeContent } from "./mdx";

export interface Read {
  title: string;
  author: string;
  date: string;
  rating: number;
  coverImage: string;
  spineColor: string;
  textColor: string;
  slug: string;
  summary: string;
}

export function getAllConsumed(): Read[] {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "content", "consumed", "index.json"),
      "utf8",
    ),
  );
}

export async function getRead(slug: string): Promise<MaybeContent<Read>> {
  const read = await getMdxContent<Read>("consumed", `${slug}.mdx`);
  if (!read) {
    return undefined;
  }

  return {
    ...read,
  };
}
