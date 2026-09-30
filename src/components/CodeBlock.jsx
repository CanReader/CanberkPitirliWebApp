import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import glsl from "react-syntax-highlighter/dist/esm/languages/prism/glsl";
import hlsl from "react-syntax-highlighter/dist/esm/languages/prism/hlsl";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import cmake from "react-syntax-highlighter/dist/esm/languages/prism/cmake";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";

// Loaded lazily from BlogPost only when a post actually contains code blocks,
// so the highlighter never lands in the main bundle. Uses the light Prism
// build with just the languages the blog writes about.
const languages = {
  cpp,
  c,
  csharp,
  rust,
  glsl,
  hlsl,
  javascript,
  typescript,
  python,
  go,
  java,
  bash,
  cmake,
  json,
};
for (const [name, lang] of Object.entries(languages)) {
  SyntaxHighlighter.registerLanguage(name, lang);
}
// Common aliases
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("ts", typescript);
SyntaxHighlighter.registerLanguage("sh", bash);
SyntaxHighlighter.registerLanguage("shell", bash);
SyntaxHighlighter.registerLanguage("cs", csharp);
SyntaxHighlighter.registerLanguage("py", python);

// A quiet theme built from the site palette: desaturated hues on the dark
// surface, comments dimmed rather than colored, the accent green reserved for
// keywords so control flow is what the eye finds first.
const base = {
  color: "#d4d4d8",
  background: "none",
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: "0.875rem",
  lineHeight: "1.7",
  textAlign: "left",
  whiteSpace: "pre",
  wordSpacing: "normal",
  wordBreak: "normal",
  tabSize: 4,
  hyphens: "none",
};
const theme = {
  'code[class*="language-"]': base,
  'pre[class*="language-"]': { ...base, padding: "1rem 1.25rem", margin: 0, overflow: "auto" },
  comment: { color: "#71717a", fontStyle: "italic" },
  prolog: { color: "#71717a" },
  doctype: { color: "#71717a" },
  cdata: { color: "#71717a" },
  punctuation: { color: "#a1a1aa" },
  operator: { color: "#a1a1aa" },
  keyword: { color: "#6ee7b7" },
  boolean: { color: "#f0b27a" },
  number: { color: "#f0b27a" },
  constant: { color: "#f0b27a" },
  symbol: { color: "#f0b27a" },
  string: { color: "#e6c98f" },
  char: { color: "#e6c98f" },
  "attr-value": { color: "#e6c98f" },
  "template-string": { color: "#e6c98f" },
  "class-name": { color: "#93c5e8" },
  builtin: { color: "#93c5e8" },
  "attr-name": { color: "#93c5e8" },
  property: { color: "#c9d1d9" },
  function: { color: "#f4f4f5" },
  macro: { color: "#c4b5a0" },
  directive: { color: "#c4b5a0" },
  "directive-hash": { color: "#c4b5a0" },
  tag: { color: "#6ee7b7" },
  selector: { color: "#6ee7b7" },
  variable: { color: "#d4d4d8" },
  regex: { color: "#e6c98f" },
  important: { color: "#f0b27a", fontWeight: "600" },
  bold: { fontWeight: "600" },
  italic: { fontStyle: "italic" },
};

export default function CodeBlock({ language, code }) {
  return (
    <SyntaxHighlighter
      style={theme}
      language={language}
      PreTag="div"
      customStyle={{
        margin: 0,
        borderRadius: 0,
        background: "transparent",
        padding: "1rem 1.25rem 1.15rem",
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
