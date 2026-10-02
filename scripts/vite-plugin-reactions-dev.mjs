// Dev-only stand-in for public/api/reactions.php, so the reaction bar works
// under `npm run dev` without PHP or the production database. Same contract,
// same validation, same matching rule (a reaction is yours if it came from
// your browser id or your IP), kept in memory: restarting the dev server
// clears it. Never part of the build: `apply: "serve"`.
const EMOJI = ["1f60d", "1f525", "1f92f", "1f44f", "1f602", "1f914", "1f928", "1f971", "1f621"];
const TARGET = /^(post|series):[a-z0-9][a-z0-9-]{0,98}$/;
const VISITOR = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export default function reactionsDevApi() {
  // target -> emoji -> [{ visitor, ip }]
  const store = new Map();

  const rows = (target, emoji) => {
    if (!store.has(target)) store.set(target, new Map());
    const byEmoji = store.get(target);
    if (!byEmoji.has(emoji)) byEmoji.set(emoji, []);
    return byEmoji.get(emoji);
  };
  const isYours = (row, visitor, ip) => (visitor && row.visitor === visitor) || row.ip === ip;

  const state = (target, visitor, ip) => {
    const counts = Object.fromEntries(EMOJI.map((e) => [e, rows(target, e).length]));
    const mine = EMOJI.filter((e) => rows(target, e).some((r) => isYours(r, visitor, ip)));
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
        const ip = req.socket.remoteAddress ?? "";
        if (req.method === "GET") {
          const target = url.searchParams.get("target") ?? "";
          const visitor = url.searchParams.get("visitor") ?? "";
          if (!TARGET.test(target)) return send(res, 400, { error: "bad_target" });
          return send(res, 200, state(target, VISITOR.test(visitor) ? visitor : "", ip));
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
          const list = rows(target, emoji);
          if (on === true) {
            if (!list.some((r) => isYours(r, visitor, ip))) list.push({ visitor, ip });
          } else {
            store.get(target).set(emoji, list.filter((r) => !isYours(r, visitor, ip)));
          }
          send(res, 200, state(target, visitor, ip));
        });
      });
    },
  };
}
