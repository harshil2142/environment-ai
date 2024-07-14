// src/PdfViewer.js
import React, { useEffect } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";

const PdfViewer = React.memo(
  ({ url, initialPage = 1 }: any) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { jumpToPage } = pageNavigationPluginInstance;

    useEffect(() => {
      if (initialPage !== undefined && jumpToPage) {
        jumpToPage(initialPage - 1);
      }
    }, [initialPage, jumpToPage]);

    return (
      <div className="h-[80vh] w-full">
        <Worker
          workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
        >
          <Viewer
            fileUrl={url}
            plugins={[
              defaultLayoutPluginInstance,
              pageNavigationPluginInstance,
            ]}
          />
        </Worker>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.url === nextProps.url &&
      prevProps.initialPage === nextProps.initialPage
    );
  }
);

PdfViewer.displayName = "PdfViewerMemo";

export default PdfViewer;

