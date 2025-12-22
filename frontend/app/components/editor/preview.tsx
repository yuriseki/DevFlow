import { Code } from "bright";
import { MDXRemote } from "next-mdx-remote/rsc";

Code.theme = {
  light: "github-light",
  dark: "github-dark",
  lightSelector: "html.light",
};

/**
 * Preview component that renders markdown content using MDX.
 * @param content - The markdown string to render. Defaults to an empty string.
 * @returns JSX element displaying the formatted markdown content.
 */
const Preview = ({ content = "" }: { content: string }) => {
  const processContent = (text: string): string => {
    return text
      .split(/(```[\s\S]*?```)/)
      .map((part) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Replaces for code blocks.
          return part.replace(/\\/g, "").replace(/&#x20;/g, "");
        } else {
          // Replaces for normal text.
          return part
            .replace(/\\/g, "")
            .replace(/&#x20;/g, "")
            .replace(/[<>\[\](){}_~|+\-!]/g, "\\$&");
        }
      })
      .join("");
  };
  const formattedContent = processContent(content);
  return (
    <section className="markdown prose prose-p:my-0 prose-ol:my-0 prose-ul:my-0 grid wrap-break-word">
      <MDXRemote
        source={formattedContent}
        components={{
          pre: (props) => (
            <Code
              {...props}
              lineNumbers
              className="shadow-dark-200 shadow-lime-200"
            />
          ),
        }}
      />
    </section>
  );
};

export default Preview;
