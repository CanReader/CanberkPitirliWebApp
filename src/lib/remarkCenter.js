// Remark plugin for centered blocks in posts:
//
//   :::center
//   Any Markdown here, one or more paragraphs.
//   :::
//
// Markdown has no alignment syntax and posts don't render raw HTML, so this
// wraps everything between the fences in a <div class="text-center">. It only
// looks at top-level paragraphs, so a colon elsewhere in the text (":D",
// "std::vector") is left alone, unlike remark-directive. A ":::center" with no
// closing ":::" is left as plain text rather than centering the rest of the post.

const OPEN = /^:::center[ \t]*(?:\n|$)/;
const CLOSE = /(?:^|\n):::[ \t]*$/;

const firstText = (p) => p.type === "paragraph" && p.children[0]?.type === "text" && p.children[0];
const lastText = (p) => p.type === "paragraph" && p.children.at(-1)?.type === "text" && p.children.at(-1);

// Removes the fence from a paragraph's text, dropping the text node if that
// empties it.
function strip(p, text, re) {
  text.value = text.value.replace(re, "");
  if (!text.value) p.children.splice(p.children.indexOf(text), 1);
}

export default function remarkCenter() {
  return (tree) => {
    const nodes = tree.children;
    const out = [];
    for (let i = 0; i < nodes.length; i++) {
      // The closing fence can end the opening paragraph itself or a later one.
      let j = i;
      if (OPEN.test(firstText(nodes[i])?.value ?? "")) {
        while (j < nodes.length && !CLOSE.test(lastText(nodes[j])?.value ?? "")) j++;
      }
      if (!OPEN.test(firstText(nodes[i])?.value ?? "") || j === nodes.length) {
        out.push(nodes[i]);
        continue;
      }
      strip(nodes[i], firstText(nodes[i]), OPEN);
      if (lastText(nodes[j])) strip(nodes[j], lastText(nodes[j]), CLOSE);

      out.push({
        type: "centerBlock",
        data: { hName: "div", hProperties: { className: ["text-center"] } },
        children: nodes.slice(i, j + 1).filter((n) => n.type !== "paragraph" || n.children.length),
      });
      i = j;
    }
    tree.children = out;
  };
}
