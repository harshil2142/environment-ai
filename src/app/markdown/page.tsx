import { convertToMarkdown } from "@/lib/utils";
import MarkdownViewer from "../../components/MarkdownViewer";
import React from "react";

const Markdown = () => {
  const markdownContent = convertToMarkdown(
    "Certainly. Here's a more comprehensive JavaScript function that converts a string to a wide range of Markdown formats:\n\n```javascript\nfunction convertToMarkdown(text) {\n  // Headers\n  text = text.replace(/^(#{1,6})\\s(.+)$/gm, (match, hashes, content) => {\n    return `${hashes} ${content}\\n`;\n  });\n\n  // Bold\n  text = text.replace(/\\*\\*(.*?)\\*\\*/g, '**$1**');\n\n  // Italic\n  text = text.replace(/\\*(.*?)\\*/g, '*$1*');\n\n  // Strikethrough\n  text = text.replace(/~~(.*?)~~/g, '~~$1~~');\n\n  // Unordered list\n  text = text.replace(/^[-*+]\\s(.+)$/gm, '- $1');\n\n  // Ordered list\n  text = text.replace(/^(\\d+)\\.\\s(.+)$/gm, '$1. $2');\n\n  // Blockquotes\n  text = text.replace(/^>\\s(.+)$/gm, '> $1');\n\n  // Code blocks\n  text = text.replace(/```([\\s\\S]*?)```/g, '```\\n$1\\n```');\n\n  // Inline code\n  text = text.replace(/`([^`]+)`/g, '`$1`');\n\n  // Horizontal rule\n  text = text.replace(/^([-*_]){3,}$/gm, '---');\n\n  // Links\n  text = text.replace(/\\[([^\\]]+)\\]\\(([^\\)]+)\\)/g, '[$1]($2)');\n\n  // Images\n  text = text.replace(/!\\[([^\\]]+)\\]\\(([^\\)]+)\\)/g, '![$1]($2)');\n\n  // Tables\n  text = text.replace(/^((?:\\S+\\s*\\|\\s*)+\\S+)\\n((?:[-:]+\\s*\\|\\s*)+[-:]+)\\n((?:(?:\\S+\\s*\\|\\s*)+\\S+\\n?)+)$/gm, (match, header, separator, rows) => {\n    return `${header}\\n${separator}\\n${rows}`;\n  });\n\n  // Task lists\n  text = text.replace(/^(\\s*)-\\s\\[([ x])\\]\\s(.+)$/gm, '$1- [$2] $3');\n\n  return text;\n}\n```\n\nThis function covers a wide range of Markdown formats:\n\n1. Headers (# to ######)\n2. Bold text\n3. Italic text\n4. Strikethrough text\n5. Unordered lists\n6. Ordered lists\n7. Blockquotes\n8. Code blocks\n9. Inline code\n10. Horizontal rules\n11. Links\n12. Images\n13. Tables\n14. Task lists\n\nYou can use this function like this:\n\n```javascript\nconst plainText = `\n# Main Title\n\n## Subtitle\n\nThis is **bold** and *italic* and ~~strikethrough~~.\n\n- Unordered list item 1\n- Unordered list item 2\n\n1. Ordered list item 1\n2. Ordered list item 2\n\n> This is a blockquote\n\n\\`\\`\\`\nfunction example() {\n  console.log(\"This is a code block\");\n}\n\\`\\`\\`\n\nThis is \\`inline code\\`.\n\n---\n\n[This is a link](https://example.com)\n\n![This is an image](https://example.com/image.jpg)\n\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Row 1    | Data     | Data     |\n| Row 2    | Data     | Data     |\n\n- [ ] Unchecked task\n- [x] Checked task\n`;\n\nconst markdownText = convertToMarkdown(plainText);\nconsole.log(markdownText);\n```\n\nThis function provides a more comprehensive conversion for various Markdown elements. However, please note that it assumes the input text is already somewhat formatted (e.g., tables are already in a table-like structure). For more complex conversions or specific requirements, you might need to adjust or expand this function.\n\nWould you like me to explain or break down any part of this code?"
  );

  return (
    <div>
      <h1>Markdown Viewer</h1>
      {/* <div className="m-4">{markdownContent}</div> */}
      <MarkdownViewer content={markdownContent} />
    </div>
  );
};

export default Markdown;
