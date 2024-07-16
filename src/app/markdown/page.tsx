import MarkdownViewer from "@/components/MarkdownViewer";
import React from "react";

const Markdown = () => {
  const markdownContent = `# Basic Roles at EcoWB

## 1. Supporting the work of EcoWB committees
Volunteers in this role meet monthly and work on assignments asynchronously between meetings. The time commitment is generally 6 - 10 hours per month. Committee members may also have the opportunity to donate more time through developing special projects.

## 2. Leadership
Committee chairs, project supervisors, board members, and volunteer staff positions are all forms of volunteer leaders. These roles include the duties of participating on a committee and coordinating teams. Work involves scheduling meetings, writing documents, reviewing documents, coordinating with other volunteer leaders, and making decisions. These roles generally require 10 - 20 hours per month.

## 3. Creating or supporting EcoWB projects
Volunteers provide services to project teams, support the development of a project, or even manage a project. These duties are focused around assignments and the steps laid out in the project action plan. Activities include writing proposals, analysis, organizing workshops, collecting data, and reporting on these activities.
`;
  return (
    <div>
      <h1>Markdown Viewer</h1>
      <MarkdownViewer content={markdownContent} />
    </div>
  );
};

export default Markdown;
