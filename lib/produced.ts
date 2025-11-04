import path from "path";
import fs from "fs";

export interface Write {
  title: string;
  image: string;
  description: string;
  links: {
    label: string;
    href: string;
  }[];
}

export function getProduced(): Write[] {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "content", "produced", "index.json"),
      "utf8"
    )
  );
}

