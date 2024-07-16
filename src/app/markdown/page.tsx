import MarkdownViewer from "@/components/MarkdownViewer";
import React from "react";

const Markdown = () => {
  const markdownContent = `## Answer

The three basic roles at EcoWB are:

- Supporting the work of EcoWB committees
- Leadership
- Creating or supporting EcoWB projects

These roles involve different levels of commitment and responsibility, as described in the context.
`;
  return (
    <div>
      <h1>Markdown Viewer</h1>
      <MarkdownViewer content={markdownContent} />
    </div>
  );
};

export default Markdown;
