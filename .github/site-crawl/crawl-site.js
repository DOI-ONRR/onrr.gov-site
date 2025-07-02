import fs from "fs";
import { parseStringPromise } from "xml2js";
import { chromium } from "playwright";
import fetch from "node-fetch";

async function run() {
  const sitemapUrl = "https://www.onrr.gov/sitemap.xml";

  // Download sitemap XML
  console.log(`Fetching sitemap from: ${sitemapUrl}`);
  const res = await fetch(sitemapUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch sitemap: ${res.statusText}`);
  }
  const xml = await res.text();

  // Parse XML to extract <loc> URLs
  const result = await parseStringPromise(xml);
  const urls = result.urlset.url.map((u) => u.loc[0]);

  const shouldVisit = (url) => {
    return !url.match(/\.(pdf|docx?|xlsx?|pptx?|zip|jpg|png|gif)$/i);
  };

  const urlsToVisit = urls.filter(shouldVisit);

  console.log(`Found ${urlsToVisit.length} URLs in sitemap.`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const allLinks = {};

  for (const url of urlsToVisit) {
    console.log(`Visiting: ${url}`);

    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle" });

      // Extract all visible <a href> links
      const links = await page.$$eval("a[href]", (anchors) =>
        anchors
          .map((a) => a.href)
          .filter((href) => href && !href.startsWith("javascript:"))
      );

      allLinks[url] = links;
    }
    catch (err) {
      console.error(`❌ Failed to visit ${url}`);
      console.error(err.message);
      allLinks[url] = [];
    }
    finally {
      await page.close();
    }
  }

  await browser.close();

  // Save results to JSON
  fs.writeFileSync(
    "found-links.json",
    JSON.stringify(allLinks, null, 2),
    "utf-8"
  );

  console.log("Saved found links to found-links.json");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});