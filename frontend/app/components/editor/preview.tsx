import { Code } from 'bright';
import { MDXRemote } from "next-mdx-remote/rsc";

Code.theme = {
  light: "github-light",
  dark: "github-dark",
  lightSelector: "html.light",
}

const Preview = ({ content = "" }: { content: string }) => {
  const formattedContent = content.replace(/\\/g, "").replace(/&#x20;/g, "");
  return <section className='markdown prose prose-p:my-0 prose-ol:my-0 prose-ul:my-0 grid wrap-break-word'>
    <MDXRemote
      source={formattedContent}
      components={{
        pre: (props) => (
          <Code
            {...props}
            lineNumbers
            className="shadow-lime-200 shadow-dark-200"
          />
        )
      }}
    />
  </section>
}

export default Preview
