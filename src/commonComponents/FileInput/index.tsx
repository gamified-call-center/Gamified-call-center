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
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setImagePreview(URL.createObjectURL(file));
 
      try {
        setUploading(true);
        const uploadedURL = await uploadFile(file, folderName);
 
        if (uploadedURL) {
          setImagePreview(uploadedURL);
          if (onFileChange) {
            onFileChange(uploadedURL);
          }
        } else {
          throw new Error("File upload failed.");
        }
      } catch (error) {
        console.error("Upload error:", error);
        setError("Failed to upload file.");
      } finally {
        setUploading(false);
      }
    }
  };
 
  const handleDeleteFile = async () => {
    if (!imagePreview) return;
    setUploading(true);
    try {
      const success = await deleteFile(imagePreview);
 
      if (success) {
        resetFileInput();
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
 
  const resetFileInput = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFileName("No file chosen");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (onFileChange) {
      onFileChange("");
    }
  };
 
  return (
    <div className="flex flex-wrap md:flex-nowrap gap-4">
      <div className="space-y-2">
        {label && (
          <label
            className={twMerge(
              "block text-sm  font-Gordita-Medium text-gray-700",
              labelCls
            )}
          >
            {label}
            {required && (
              <span className={twMerge("text-red-400", requiredClass)}>
                {required}
              </span>
            )}
          </label>
        )}
        {sublabel && (
          <p className={twMerge("text-sm text-gray-500", sublabelClass)}>
            {sublabel}
          </p>
        )}
 
        <div className="relative flex items-center space-x-2">
          <label
            htmlFor={name}
            className="bg-[#3586FF]hover:bg-blue-700 text-white px-3 py-2 rounded-md cursor-pointer"
          >
            {uploading ? "Uploading..." : "Choose File"}
          </label>
 
          <span className="text-gray-700 truncate max-w-37.5">
            {fileName}
          </span>
          <input
            className="hidden"
            id={name}
            name={name}
            ref={inputRef}
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
          />
 
          {errorMessage && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-red-500">
              {errorMessage}
            </div>
          )}
        </div>
 
        {error && (
          <p className={twMerge("mt-2 text-sm text-red-600", errorTextClass)}>
            {error}
          </p>
        )}
      </div>
 
      {imagePreview && (
        <div className="mt-4 relative w-20 h-20">
          <Image
            src={imagePreview}
            alt="Selected file preview"
            className="w-full h-full object-cover rounded-md"
          />
          <Button
            onClick={handleDeleteFile}
            disabled={uploading}
            className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-red-600 focus:outline-none"
          >
            ✕
          </Button>
        </div>
      )}
    </div>
  );
};
 
export default FileInput;
 