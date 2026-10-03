import Navbar from "../components/Navbar";
import Demo, { demos } from "../components/demos/Demo";

// Dev-only page (/blog/demos) listing every demo, for building them without
// a post open. Not routed in production builds.
export default function DemoGallery() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-28">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Demos</h1>
        <p className="mt-2 text-muted">
          Embed one in a post with a <code className="font-mono text-sm">```demo name flags</code> block.
        </p>
        <div className="mt-6">
          {Object.entries(demos).flatMap(([name, d]) =>
            d.variants.map((flag) => {
              const spec = `${name} ${flag}`.trim();
              return (
                <section key={spec}>
                  <h2 className="mt-8 font-mono text-sm text-muted">{spec}</h2>
                  <Demo spec={spec} />
                </section>
              );
            }),
          )}
        </div>
      </main>
    </div>
  );
}
