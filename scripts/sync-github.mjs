// Regenerates src/data/repositories.json from the live GitHub API.
//
//   node scripts/sync-github.mjs
//
// Facts (dates, languages, license, stars, size, visibility, fork status) come
// from the GitHub API through the `gh` CLI, which must be authenticated as the
// account owner so private repositories are included. Everything editorial
// (summary, type, categories, tech stack, highlights) comes from
// scripts/repo-annotations.js.
//
// The result is committed to the repo, so `npm run build` never needs network
// access or a GitHub token. Run this script when repositories change.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { annotations } from "./repo-annotations.js";
import { cv } from "./repo-cv.js";
import { career } from "../src/data/career.js";

const OWNER = "CanReader";
const OUT = new URL("../src/data/repositories.json", import.meta.url).pathname;

const FIELDS = [
  "name",
  "visibility",
  "description",
  "createdAt",
  "updatedAt",
  "pushedAt",
  "primaryLanguage",
  "languages",
  "repositoryTopics",
  "stargazerCount",
  "forkCount",
  "isArchived",
  "isFork",
  "isTemplate",
  "homepageUrl",
  "url",
  "diskUsage",
  "defaultBranchRef",
].join(",");

function gh(args) {
  return execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

console.log(`Fetching repositories for ${OWNER}...`);
const raw = JSON.parse(gh(["repo", "list", OWNER, "--limit", "500", "--json", FIELDS]));
console.log(`  ${raw.length} repositories`);

// `gh repo list` does not reliably populate licenseInfo, so ask per repo.
// These are independent requests; run them a few at a time.
console.log("Fetching licenses...");
const licenses = new Map();
const queue = [...raw];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const repo = queue.shift();
      try {
        const spdx = gh(["api", `repos/${OWNER}/${repo.name}`, "--jq", '.license.spdx_id // ""']).trim();
        licenses.set(repo.name, spdx && spdx !== "NOASSERTION" ? spdx : null);
      } catch {
        licenses.set(repo.name, null);
      }
    }
  })
);

const DAY = 24 * 60 * 60 * 1000;
const now = new Date();
const today = now.toISOString().slice(0, 10);
const date = (iso) => (iso ? iso.slice(0, 10) : null);

function languageBreakdown(entries) {
  const list = (entries ?? []).map((e) => ({ name: e.node.name, bytes: e.size }));
  const total = list.reduce((sum, l) => sum + l.bytes, 0);
  if (!total) return { languages: [], language_breakdown: {}, bytes: {} };
  list.sort((a, b) => b.bytes - a.bytes);
  const breakdown = {};
  const bytes = {};
  for (const l of list) {
    breakdown[l.name] = Number(((l.bytes / total) * 100).toFixed(1));
    bytes[l.name] = l.bytes;
  }
  return { languages: list.map((l) => l.name), language_breakdown: breakdown, bytes };
}

const missing = [];
// name -> { language: bytes of source }, kept out of the payload but used for
// the aggregate below. Real code bytes, not diskUsage, which counts committed
// binary assets and would let two Unreal repos dominate the whole tally.
const languageBytes = new Map();

const repositories = raw
  .map((r) => {
    const a = annotations[r.name];
    const c = cv[r.name] ?? {};
    if (!a) missing.push(r.name);

    const { languages, language_breakdown, bytes } = languageBreakdown(r.languages);
    languageBytes.set(r.name, bytes);
    const pushed = new Date(r.pushedAt);
    const daysSincePush = Math.floor((now - pushed) / DAY);

    return {
      name: r.name,
      visibility: r.visibility.toLowerCase(),
      url: r.url,
      homepage: r.homepageUrl || null,

      type: a?.type ?? "uncategorized",
      categories: a?.categories ?? [],
      status: a?.status ?? null,
      role: a?.role ?? null,

      created: date(r.createdAt),
      last_updated: date(r.pushedAt),
      days_since_update: daysSincePush,
      age_years: Number(((now - new Date(r.createdAt)) / (365.25 * DAY)).toFixed(1)),

      license: licenses.get(r.name) ?? null,
      primary_language: r.primaryLanguage?.name ?? null,
      languages,
      language_breakdown,
      tech_stack: a?.tech_stack ?? [],
      topics: (r.repositoryTopics ?? []).map((t) => t.name),

      summary: a?.summary ?? r.description ?? null,
      highlights: a?.highlights ?? [],
      description: r.description || null,

      // CV layer. cv_tier defaults to "omit": a repo earns its place on a CV
      // by having an entry written for it, rather than by merely existing.
      cv_tier: c.cv_tier ?? "omit",
      role_relevance: c.role_relevance ?? {},
      metrics: c.metrics ?? [],
      keywords: c.keywords ?? [],
      cv_bullets: c.cv_bullets ?? [],
      transferable_framing: c.transferable_framing ?? {},
      ...(c.omit_reason ? { omit_reason: c.omit_reason } : {}),

      stars: r.stargazerCount,
      forks: r.forkCount,
      size_kb: r.diskUsage,
      default_branch: r.defaultBranchRef?.name ?? null,

      is_fork: r.isFork,
      is_template: r.isTemplate,
      is_archived: r.isArchived,
      ...(a?.upstream ? { upstream: a.upstream } : {}),
      ...(a?.client ? { client: a.client } : {}),
      ...(a?.product ? { product: a.product } : {}),
      ...(a?.related ? { related: a.related } : {}),
    };
  })
  .sort((x, y) => y.last_updated.localeCompare(x.last_updated));

// ── Aggregate stats, computed rather than hand-maintained ───────────────────
const own = repositories.filter((r) => !r.is_fork);

function tally(items) {
  const counts = {};
  for (const key of items) counts[key] = (counts[key] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]));
}

const totalsByLanguage = {};
for (const r of own) {
  for (const [lang, size] of Object.entries(languageBytes.get(r.name) ?? {})) {
    totalsByLanguage[lang] = (totalsByLanguage[lang] ?? 0) + size;
  }
}

const stats = {
  total: repositories.length,
  own: own.length,
  forks: repositories.length - own.length,
  public: repositories.filter((r) => r.visibility === "public").length,
  private: repositories.filter((r) => r.visibility === "private").length,
  active_last_90_days: own.filter((r) => r.days_since_update <= 90).length,
  total_stars: repositories.reduce((s, r) => s + r.stars, 0),
  first_repository: own.reduce((min, r) => (r.created < min ? r.created : min), today),
  latest_update: own[0]?.last_updated ?? null,
  by_type: tally(own.map((r) => r.type)),
  by_category: tally(own.flatMap((r) => r.categories)),
  by_status: tally(own.map((r) => r.status).filter(Boolean)),
  by_primary_language: tally(own.map((r) => r.primary_language).filter(Boolean)),
  source_bytes_by_language: Object.fromEntries(
    Object.entries(totalsByLanguage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
  ),
};

// ── Role index ──────────────────────────────────────────────────────────────
// Precomputed so a CV generator can ask "best evidence for a backend role" and
// get a ranked shortlist without scoring 78 repos itself. Ranked by relevance
// score first, then recency, so a strong recent project outranks a strong old
// one at the same score.
// Employment and teaching are indexed alongside repositories, and outrank them
// at equal score: paid work beats a side project on every CV.
const TIER_RANK = { employment: -1, headline: 0, supporting: 1, omit: 2 };
const roleIndex = {};
const push = (role, entry) => (roleIndex[role] ??= []).push(entry);

for (const repo of repositories) {
  if (repo.cv_tier === "omit") continue;
  for (const [role, score] of Object.entries(repo.role_relevance)) {
    if (!score) continue;
    push(role, { name: repo.name, kind: "repository", score, tier: repo.cv_tier, last_updated: repo.last_updated });
  }
}

for (const job of career.experience) {
  for (const [role, score] of Object.entries(job.role_relevance ?? {})) {
    if (!score) continue;
    push(role, {
      name: `${job.role}, ${job.company}`,
      kind: "experience",
      id: job.id,
      score,
      tier: "employment",
      last_updated: job.end ?? today.slice(0, 7),
      confidential: job.confidential ?? false,
    });
  }
}

for (const course of career.teaching) {
  for (const [role, score] of Object.entries(course.role_relevance ?? {})) {
    if (!score) continue;
    push(role, { name: course.title, kind: "teaching", id: course.id, score, tier: "employment", last_updated: course.years });
  }
}

for (const role of Object.keys(roleIndex)) {
  roleIndex[role].sort(
    (a, b) =>
      b.score - a.score ||
      TIER_RANK[a.tier] - TIER_RANK[b.tier] ||
      String(b.last_updated).localeCompare(String(a.last_updated))
  );
}

const cvSummary = {
  headline: repositories.filter((r) => r.cv_tier === "headline").length,
  supporting: repositories.filter((r) => r.cv_tier === "supporting").length,
  omit: repositories.filter((r) => r.cv_tier === "omit").length,
  experience_entries: career.experience.length,
  shipped_products: career.shipped_products.length,
  confidential_entries: career.experience.filter((e) => e.confidential).length,
  roles: Object.fromEntries(Object.entries(roleIndex).map(([role, list]) => [role, list.length])),
};

const payload = {
  $schema: "https://canberkpitirli.com/getprojects.schema.json",
  owner: OWNER,
  name: "Canberk Pitirli",
  title: "Software Developer and Instructor",
  bio: "Software developer and instructor experienced in desktop, game, graphics, full-stack and mobile development, with a focus on quality and performance.",
  location: "Turkey",
  links: {
    website: "https://canberkpitirli.com",
    github: `https://github.com/${OWNER}`,
    linkedin: "https://www.linkedin.com/in/bereader/",
    email: "canberkpitirli@gmail.com",
  },
  generated: today,
  source: "GitHub API via gh CLI, merged with hand-written project notes",
  stats,
  cv_index: { ...cvSummary, by_role: roleIndex },
  experience: career.experience,
  shipped_products: career.shipped_products,
  teaching: career.teaching,
  education: career.education,
  certifications: career.certifications,
  personal: career.personal,
  repositories,
};

writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");

console.log(`  ✓ ${OUT}`);
console.log(`  ${stats.total} repositories (${stats.public} public, ${stats.private} private, ${stats.forks} forks)`);
if (missing.length) {
  console.warn(`\n  ⚠ ${missing.length} repos have no entry in repo-annotations.js:`);
  for (const name of missing) console.warn(`      ${name}`);
}
