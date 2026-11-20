import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import { defaultUrlTransform } from "react-markdown";
import { urlAttributes } from "html-url-attributes";
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root } from "mdast";
import type { Element, Root as HtmlTree } from "hast";

export type Heading = { id: string; label: string; level: number };
export type WritingDocument = { tree: HtmlTree; headings: Heading[]; words: number };

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

type DirectiveNode = {
  type?: string;
  name?: string;
  value?: string;
  attributes?: Record<string, string | null | undefined>;
  data?: Record<string, unknown>;
  children?: DirectiveNode[];
};

const writingDirectives: Plugin<[], Root> = () => (tree) => {
  const visit = (node: DirectiveNode) => {
    // Keep ordinary prose such as ratios (5:1) and DOIs (doi:10...) literal.
    if (node.type === "textDirective" && node.name) {
      node.type = "text";
      node.value = `:${node.name}`;
      delete node.name;
      delete node.attributes;
      delete node.children;
      return;
    }
    if (node.type === "containerDirective" && node.name) {
      const kind = node.name === "interactive" ? "interactive" : node.name;
      node.data = {
        ...node.data,
        hName: "div",
        hProperties: {
          "data-writing-directive": kind,
          "data-type": node.attributes?.type || "",
        },
      };
    }
    node.children?.forEach(visit);
  };
  visit(tree as unknown as DirectiveNode);
};

const compiler = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkDirective)
  .use(writingDirectives)
  .use(remarkRehype, {
    handlers: {
      html: (_state, node) => ({ type: "text", value: node.value }),
    },
  })
  .use(rehypeKatex);

function headingText(element: Element): string {
  return element.children.map((child) =>
    child.type === "text" ? child.value : child.type === "element" ? headingText(child) : "",
  ).join("");
}

export function compileWriting(markdown: string): WritingDocument {
  const tree = compiler.runSync(compiler.parse(markdown));
  const headings: Heading[] = [];
  visit(tree, (node) => {
    delete node.position;
    delete node.data;
    if (node.type !== "element") return;

    // Preserve react-markdown's URL policy when shipping the compiled document.
    for (const key of Object.keys(node.properties)) {
      if (!Object.hasOwn(urlAttributes, key)) continue;
      const tags = urlAttributes[key];
      if (!tags || tags.includes(node.tagName)) {
        node.properties[key] = defaultUrlTransform(String(node.properties[key] ?? ""));
      }
    }
    if (/^h[1-4]$/.test(node.tagName)) {
      const label = headingText(node);
      const id = slugifyHeading(label);
      node.properties.id = id;
      const level = Number(node.tagName.slice(1));
      if (level > 1) headings.push({ id, label, level });
    }
  });
  return { tree, headings, words: markdown.trim().split(/\s+/).length };
}
