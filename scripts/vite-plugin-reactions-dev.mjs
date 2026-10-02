// Dev-only stand-in for public/api/reactions.php, so the reaction bar works
// under `npm run dev` without PHP or the production database. Same contract,
// same validation, kept in memory (restarting the dev server clears it).
// Never part of the build: `apply: "serve"`.
const EMOJI = ["1f60d", "1f525", "1f92f", "1f44f", "1f914"];
const TARGET = /^(post|series):[a-z0-9][a-z0-9-]{0,98}$/;
const VISITOR = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export default function reactionsDevApi() {
  // target -> emoji -> Set(visitor)
  const store = new Map();

  const state = (target, visitor) => {
    const byEmoji = store.get(target) ?? new Map();
    const counts = Object.fromEntries(EMOJI.map((e) => [e, byEmoji.get(e)?.size ?? 0]));
    const mine = visitor ? EMOJI.filter((e) => byEmoji.get(e)?.has(visitor)) : [];
    return { counts, mine };
  };

  const send = (res, status, body) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(body));
  };

  return {
    name: "reactions-dev-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/reactions.php", (req, res) => {
        const url = new URL(req.url, "http://localhost");
        if (req.method === "GET") {
          const target = url.searchParams.get("target") ?? "";
          const visitor = url.searchParams.get("visitor") ?? "";
          if (!TARGET.test(target)) return send(res, 400, { error: "bad_target" });
          return send(res, 200, state(target, VISITOR.test(visitor) ? visitor : ""));
        }
        if (req.method !== "POST") return send(res, 405, { error: "method_not_allowed" });
        if (!(req.headers["content-type"] ?? "").startsWith("application/json")) {
          return send(res, 415, { error: "json_only" });
        }
        let raw = "";
        req.on("data", (c) => (raw += c));
        req.on("end", () => {
          let input;
          try {
            input = JSON.parse(raw);
          } catch {
            return send(res, 400, { error: "bad_json" });
          }
          const { target = "", emoji = "", visitor = "", on } = input ?? {};
          if (!TARGET.test(target) || !EMOJI.includes(emoji) || !VISITOR.test(visitor)) {
            return send(res, 400, { error: "bad_request" });
          }
          if (!store.has(target)) store.set(target, new Map());
          const byEmoji = store.get(target);
          if (!byEmoji.has(emoji)) byEmoji.set(emoji, new Set());
          if (on === true) byEmoji.get(emoji).add(visitor);
          else byEmoji.get(emoji).delete(visitor);
          send(res, 200, state(target, visitor));
        });
      });
    },
  };
}
