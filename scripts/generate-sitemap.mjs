import fs from "fs";

const SITE_URL = "https://aphamm.vercel.app";

async function main() {
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
</urlset>`;

  if (fs.existsSync("public/sitemap.xml")) {
    fs.unlinkSync("public/sitemap.xml");
  }

  fs.writeFileSync("public/sitemap.xml", sitemap);
  console.log("✅ Sitemap generated successfully!");
}

main();
