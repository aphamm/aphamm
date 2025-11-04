import fs from "fs";
import path from "path";

const SITE_URL = "https://austinpham.com"; // Update this to your actual domain

function getConsumedSlugs() {
  try {
    const data = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "content", "consumed", "index.json"),
        "utf8"
      )
    );
    return data.map((item) => item.slug);
  } catch (error) {
    console.log("No consumed content found");
    return [];
  }
}

async function main() {
  const consumedSlugs = getConsumedSlugs();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/produced</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/consumed</loc>
    <priority>0.8</priority>
  </url>${consumedSlugs
      .map((slug) => {
        return `
  <url>
    <loc>${SITE_URL}${slug}</loc>
    <priority>0.6</priority>
  </url>`;
      })
      .join("")}
</urlset>`;

  if (fs.existsSync("public/sitemap.xml")) {
    fs.unlinkSync("public/sitemap.xml");
  }

  fs.writeFileSync("public/sitemap.xml", sitemap);
  console.log("✅ Sitemap generated successfully!");
}

main();
