import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToMarkdown(text: any) {
  // Headers
  text = text.replace(
    /^(#{1,6})\s(.+)$/gm,
    (match: any, hashes: any, content: any) => {
      return `${hashes} ${content}\n`;
    }
  );

  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, "**$1**");

  // Italic
  text = text.replace(/\*(.*?)\*/g, "*$1*");

  // Strikethrough
  text = text.replace(/~~(.*?)~~/g, "~~$1~~");

  // Unordered list
  text = text.replace(/^[-*+]\s(.+)$/gm, "- $1");

  // Ordered list
  text = text.replace(/^(\d+)\.\s(.+)$/gm, "$1. $2");

  // Blockquotes
  text = text.replace(/^>\s(.+)$/gm, "> $1");

  // Code blocks
  text = text.replace(/```([\s\S]*?)```/g, "```\n$1\n```");

  // Inline code
  text = text.replace(/`([^`]+)`/g, "`$1`");

  // Horizontal rule
  text = text.replace(/^([-*_]){3,}$/gm, "---");

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, "[$1]($2)");

  // Images
  text = text.replace(/!\[([^\]]+)\]\(([^\)]+)\)/g, "![$1]($2)");

  // Tables
  text = text.replace(
    /^((?:\S+\s*\|\s*)+\S+)\n((?:[-:]+\s*\|\s*)+[-:]+)\n((?:(?:\S+\s*\|\s*)+\S+\n?)+)$/gm,
    (match: any, header: any, separator: any, rows: any) => {
      return `${header}\n${separator}\n${rows}`;
    }
  );

  // Task lists
  text = text.replace(/^(\s*)-\s\[([ x])\]\s(.+)$/gm, "$1- [$2] $3");

  return text;
}
