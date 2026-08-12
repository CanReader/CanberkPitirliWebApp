import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
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

export default function CodeBlock({ language, code }) {
  return (
    <SyntaxHighlighter
      style={vscDarkPlus}
      language={language}
      PreTag="div"
      customStyle={{
        margin: 0,
        borderRadius: 0,
        background: "#0d0d10",
        fontSize: "0.85rem",
        lineHeight: "1.6",
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
