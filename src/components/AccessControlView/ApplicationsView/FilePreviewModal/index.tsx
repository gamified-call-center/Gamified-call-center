"use client";

import React, { useMemo } from "react";
import Modal from "@/commonComponents/Modal";
import { Download, ExternalLink, X } from "lucide-react";
import { forceDownload, getFileNameFromUrl, isImage, isPdf } from "../../helper";
import Image from "next/image";
import Button from "@/commonComponents/Button";

type FilePreviewModalProps = {
  open: boolean;
  onClose: () => void;
  url: string | null;
  label?: string;
};

export default function FilePreviewModal({ open, onClose, url, label }: FilePreviewModalProps) {
  const fileName = useMemo(() => (url ? getFileNameFromUrl(url) : "download"), [url]);
  const showImage = url ? isImage(url) : false;
  const showPdf = url ? isPdf(url) : false;

  if (!url) return null;

  return (
    <Modal open={open} onClose={onClose}>
     
      <div className="sticky top-0 z-10 bg-white border-b pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-bold md:text-lg text-[16px] truncate app-text">
              {label || "Preview"}{" "}
              <span className="app-muted md:text-sm text-[12px] font-semibold">• {fileName}</span>
            </div>
            <div className="text-xs app-muted break-all line-clamp-1">{url}</div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="p-2 rounded-xl border app-card hover:app-surface transition"
              onClick={() => forceDownload(url, fileName)}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>



            
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 rounded-2xl border  overflow-hidden">
        {showImage && (
          <div className="relative w-full h-[72vh] ">
            <Image
              src={url}
              alt={fileName}
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              className="object-contain"
            />
          </div>
        )}

        {showPdf && <iframe src={url} title={fileName} className="w-full h-[72vh]" />}

        {!showImage && !showPdf && (
          <div className="md:p-4 p-2 text-[12px] md:text-sm app-muted">
            Preview not available for this file type. Use download .
          </div>
        )}
      </div>

     
      <div className="md:mt-4  mt-2 flex items-center justify-end gap-2">
        <Button
          className="inline-flex items-center gap-2 md:px-4 px-2 md:py-2 py-1  btn-text rounded-xl app-card app-text hover:opacity-90"
          onClick={() => forceDownload(url, fileName)}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
    </Modal>
  );
}
