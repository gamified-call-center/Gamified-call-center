import { deleteFile, uploadFile } from "../../Utils/uploadFile";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import Button from "../Button";
import Image from "next/image";
 
export interface FileInputProps {
  label?: string;
  type: "file";
  labelCls?: string;
  sublabel?: string;
  sublabelClass?: string;
  className?: string;
  name?: string;
  errorMessage?: string;
  required?: React.ReactNode;
  requiredClass?: string;
  errorTextClass?: string;
  onFileChange?: (url: string) => void;
  folderName?: string;
  initialFileUrl?: string;
}
 
const FileInput = ({
  label,
  labelCls,
  sublabel,
  sublabelClass,
  className,
  errorMessage,
  errorTextClass,
  required,
  requiredClass,
  name = "file-input",
  folderName,
  initialFileUrl,
  onFileChange,
}: FileInputProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("No file chosen");
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFileUrl) {
      setSelectedFile(null);
      setImagePreview(initialFileUrl);
      setFileName(initialFileUrl.split("/").pop() || "Uploaded file");
    }
  }, [initialFileUrl]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (uploading) return;
    setError(null);

    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      setUploading(true);

      const uploadedURLs = await Promise.all(files.map(file => uploadFile(file, folderName)));

      uploadedURLs.forEach(url => {
        if (url && onFileChange) {
          onFileChange(url);
        }
      });

      const lastURL = uploadedURLs[uploadedURLs.length - 1];
      if (lastURL) {
        setImagePreview(lastURL);
        setFileName(lastURL.split("/").pop() || "Uploaded file");
      } else {
        throw new Error("File upload failed.");
      }

    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload file(s).");
    } finally {
      setUploading(false);
      setSelectedFile(null);
      setImagePreview(null);
      setFileName("No file chosen");
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDeleteFile = async () => {
    if (!imagePreview) return;
    setUploading(true);
    try {
      const success = await deleteFile(imagePreview);

      if (success) {
        setImagePreview(null);
        setFileName("No file chosen");
        if (inputRef.current) inputRef.current.value = "";
        onFileChange?.("");
      } else {
        throw new Error("Failed to delete file.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={twMerge(
        "w-full border rounded-2xl p-4 shadow-md app-card transition-all",
        "border-gray-300 dark:border-gray-700",
        className
      )}
    >
      <div className="space-y-3">
        {label && (
          <label className={twMerge("text-base font-semibold app-text", labelCls)}>
            {label}
            {required && (
              <span className={twMerge("text-red-500 ml-1", requiredClass)}>
                {required}
              </span>
            )}
          </label>
        )}

        {sublabel && (
          <p className={twMerge("text-sm app-text", sublabelClass)}>
            {sublabel}
          </p>
        )}

        <div
          className={twMerge(
            "flex items-center gap-3 p-3 rounded-xl border app-card app-border"
          )}
        >
          <label
            htmlFor={name}
            className={twMerge(
              "px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition",
              "bg-[#3586FF] hover:bg-blue-600"
            )}
          >
            {uploading ? "Uploading..." : "Choose File"}
          </label>

          <span className="text-sm app-muted truncate max-w-[180px]">
            {fileName}
          </span>

          <input
            multiple               
            hidden
            id={name}
            name={name}
            ref={inputRef}
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        {error && (
          <p className={twMerge("text-sm text-red-600 dark:text-red-400", errorTextClass)}>
            {error}
          </p>
        )}
      </div>

      {imagePreview && (
        <div className="mt-4 flex items-center gap-4">
          <div
            className={twMerge(
              "relative w-24 h-24 rounded-xl overflow-hidden border bg-gray-100 dark:bg-gray-800",
              "border-gray-300 dark:border-gray-700"
            )}
          >
            <Image
              src={imagePreview}
              alt="File preview"
              fill
              className="object-cover"
            />

            <button
              onClick={handleDeleteFile}
              disabled={uploading}
              className={twMerge(
                "absolute top-2 right-2 w-7 h-7 rounded-full cursor-pointer flex items-center justify-center transition",
                "bg-red-500 hover:bg-red-600 text-white text-xs shadow-md"
              )}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className={twMerge("text-xs text-red-500 mt-2", errorTextClass)}>
          {errorMessage}
        </p>
      )}
    </div>
  );
};

 
export default FileInput;
 