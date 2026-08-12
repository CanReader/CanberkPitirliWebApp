import { useEffect } from "react";
import { site } from "../data/siteConfig";

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Updates document head on client-side navigation. Crawlers and social
 * scrapers get the same values baked into the HTML by scripts/postbuild.js —
 * this component keeps the tab title and meta correct while browsing the SPA.
 */
export default function Seo({
  title,
  description,
  path = "/",
  image,
  type = "website",
  jsonLd,
}) {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const fullTitle = title ? `${title} — ${site.author}` : site.title;
    const desc = description || site.description;
    const url = site.url + path;
    const img = image
      ? image.startsWith("http")
        ? image
        : site.url + image
      : site.url + site.ogImage;

    document.title = fullTitle;
    setMeta("name", "title", fullTitle);
    setMeta("name", "description", desc);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", img);
    setMeta("property", "og:type", type);
    setMeta("property", "twitter:title", fullTitle);
    setMeta("property", "twitter:url", url);
    setMeta("property", "twitter:image", img);
    setMeta("name", "twitter:description", desc);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let script = document.getElementById("page-jsonld");
    if (jsonLdString) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "page-jsonld";
        document.head.appendChild(script);
      }
      script.textContent = jsonLdString;
    } else if (script) {
      script.remove();
    }
  }, [title, description, path, image, type, jsonLdString]);

  return null;
}
