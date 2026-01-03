"use client";

import React, { useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { FaTrash } from "react-icons/fa";
import Button from "../Button";
import { uploadFile, deleteFile } from "@/Utils/uploadFile";

type MultiFileInputProps = {
  label?: string;
  labelCls?: string;
  outerCls?: string;
  buttonCls?: string;

  value?: string[]; // controlled value (urls)
  onChange: (urls: string[]) => void;

  folderName?: string;

  maxFiles?: number;
  maxFileSizeMB?: number;
  acceptedFormats?: string[];

  required?: boolean;
  errorMsg?: string;
  errorCls?: string;

  disabled?: boolean;
  helperText?: string;
};

const DEFAULT_FORMATS = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/heic",
  "application/pdf",
  "video/mp4",
  "video/quicktime", // mov
  "video/webm",
];

export default function MultiFileInput({
  label,
  labelCls,
  outerCls,
  buttonCls,
  value = [],
  onChange,
  folderName = "uploads",
  maxFiles = 5,
  maxFileSizeMB = 10,
  acceptedFormats = DEFAULT_FORMATS,
  required,
  errorMsg,
  errorCls,
  disabled,
  helperText,
}: MultiFileInputProps) {
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // keep preview always from controlled value
  const previewUrls = useMemo(() => value ?? [], [value]);

  useEffect(() => {
    // clear errors when value changes externally
    if (previewUrls.length) setLocalError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrls.length]);

  const humanLabel = () => {
    const hasVideo = acceptedFormats.some((f) => f.startsWith("video/"));
    const hasPdf = acceptedFormats.includes("application/pdf");
    if (hasVideo && hasPdf) return "files";
    if (hasVideo) return "videos";
    if (hasPdf) return "documents";
    return "photos";
  };

  const validateFiles = (files: File[]) => {
    const remainingSlots = Math.max(0, maxFiles - previewUrls.length);
    if (remainingSlots === 0) {
      setLocalError(`You can upload up to ${maxFiles} files only.`);
      return [];
    }

    const sliced = files.slice(0, remainingSlots);

    const valid = sliced.filter((file) => {
      if (!acceptedFormats.includes(file.type)) {
        setLocalError(`Invalid file type: ${file.type} (${file.name})`);
        return false;
      }
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        setLocalError(
          `File too large (>${maxFileSizeMB}MB): ${file.name}`
        );
        return false;
      }
      return true;
    });

    return valid;
  };

  const handleFiles = async (files: File[]) => {
    if (disabled) return;

    const validFiles = validateFiles(files);
    if (validFiles.length === 0) return;

    setLocalError(null);
    setUploading(true);
    setUploadProgress(0);

    const uploadResults: string[] = [];

    for (const file of validFiles) {
      const fileURL = await uploadFile(
        file,
        folderName,
        undefined,
        undefined,
        (progress) => setUploadProgress(progress)
      );

      if (fileURL) uploadResults.push(fileURL);
    }

    const next = [...previewUrls, ...uploadResults].slice(0, maxFiles);
    onChange(next);

    setUploading(false);
    setUploadProgress(0);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // reset input so selecting the same file again triggers change
    e.target.value = "";
    handleFiles(files);
  };

  const removeFile = async (index: number) => {
    if (disabled) return;

    const fileUrl = previewUrls[index];
    try {
      const ok = await deleteFile(fileUrl);
      if (ok) {
        const next = [...previewUrls];
        next.splice(index, 1);
        onChange(next);
      } else {
        setLocalError("Failed to delete file. Please try again.");
      }
    } catch {
      setLocalError("Failed to delete file. Please try again.");
    }
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(url);
  const isPDF = (url: string) => /\.pdf$/i.test(url);
  const isVideo = (url: string) => /\.(mp4|mov|webm)$/i.test(url);

  return (
    <div
      className={twMerge(
        "w-full p-4 border-2 border-dashed border-gray-300 rounded-md",
        disabled && "opacity-60 pointer-events-none",
        outerCls
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {label && (
        <label
          className={twMerge(
            "text-gray-700 md:text-[16px] text-[12px] font-Gordita-Bold mb-2 block",
            labelCls
          )}
        >
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <div
        className={twMerge(
          "relative flex flex-col items-center justify-center p-4 text-center transition duration-200 rounded-md",
          dragging ? "bg-blue-100 border border-blue-300" : "bg-gray-50"
        )}
      >
        <p className="text-[#5297FF] label-text font-Gordita-Medium">
          Drag and drop your {humanLabel()} here
        </p>

        <p className="text-gray-500 sublabel-text">
          Up to {maxFiles} files • Max size {maxFileSizeMB}MB
        </p>

        {helperText && (
          <p className="text-gray-400 text-xs mt-1">{helperText}</p>
        )}

        <input
          type="file"
          accept={acceptedFormats.join(",")}
          multiple
          onChange={onInputChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={disabled}
        />

        <div className="mt-4">
          <Button
            type="button"
            className={twMerge(
              "px-4 py-2 bg-[#5297ff] !font-Gordita-Medium text-[10px] md:text-[12px] text-white rounded-md",
              buttonCls
            )}
          >
            Upload {humanLabel()}
          </Button>
        </div>

        {uploading && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-[#5297ff] h-3 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {!!previewUrls.length && (
        <div className="mt-4 flex gap-4 overflow-x-auto">
          {previewUrls.map((url, index) => (
            <div key={`${url}-${index}`} className="relative min-w-[110px] h-[110px]">
              {isImage(url) ? (
                <Image
                  src={url}
                  alt={`preview-${index}`}
                  width={110}
                  height={110}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : isPDF(url) ? (
                <iframe
                  src={url}
                  title={`pdf-preview-${index}`}
                  className="w-full h-full rounded-md"
                />
              ) : isVideo(url) ? (
                <video
                  src={url}
                  controls
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-sm text-gray-600 rounded-md px-2">
                  File
                </div>
              )}

              <Button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 w-[26px] bg-gray-400 hover:bg-red-400 text-white rounded-md h-[26px] flex items-center justify-center"
                title="Remove"
              >
                <FaTrash fontSize="small" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {(localError || errorMsg) && (
        <p className={twMerge("text-red-500 text-xs mt-2", errorCls)}>
          {localError || errorMsg}
        </p>
      )}
    </div>
  );
}
