import React from "react";
import ReactMarkdown from "react-markdown";

const MarkdownViewer = ({ content }: any) => {
  return <ReactMarkdown>{content}</ReactMarkdown>;
};

export default MarkdownViewer;
