import { deleteFile, uploadFile } from "../../Utils/uploadFile";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { VscClose } from "react-icons/vsc";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("No file selected");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialFileUrl) {
      setPreview(initialFileUrl);
      setFileName(initialFileUrl.split("/").pop() || "Uploaded file");
    }
  }, [initialFileUrl]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;

    setError(null);
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      const url = await uploadFile(file, folderName);
      if (!url) throw new Error("Upload failed");
      setPreview(url);
      onFileChange?.(url);
    } catch {
      setError("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!preview) return;
    try {
      setUploading(true);
      await deleteFile(preview);
      reset();
    } catch {
      setError("Failed to delete file");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setFileName("No file selected");
    onFileChange?.("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={twMerge("space-y-2", className)}>
      {/* Label */}
      {label && (
        <label
          className={twMerge("block text-sm font-medium text-white", labelCls)}
        >
          {label}
          {required && (
            <span className={twMerge("ml-1 text-red-400", requiredClass)}>
              {required}
            </span>
          )}
        </label>
      )}

      {/* Sub Label */}
      {sublabel && (
        <p className={twMerge("text-sm text-slate-400", sublabelClass)}>
          {sublabel}
        </p>
      )}

      {/* Input Row */}
      <div className="flex items-center gap-3">
        <label
          htmlFor={name}
          className={twMerge(
            "px-4 py-2 rounded-xl cursor-pointer text-sm font-medium",
            "bg-blue-500/20 border border-blue-500/30 text-blue-400",
            "hover:bg-blue-500/30 transition-all",
            uploading && "opacity-60 cursor-not-allowed"
          )}
        >
          {uploading ? "Uploading..." : "Choose File"}
        </label>

        <span className="text-slate-400 text-sm truncate max-w-45">
          {fileName}
        </span>

        <input
          ref={inputRef}
          id={name}
          type="file"
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />
      </div>

      {/* Error */}
      {(error || errorMessage) && (
        <p className={twMerge("text-sm text-red-400", errorTextClass)}>
          {error || errorMessage}
        </p>
      )}

      {/* Preview */}
      {preview && (
        <div className="relative w-24 h-24 mt-3 rounded-xl overflow-hidden border border-white/10">
          <img
            src={preview}
            alt="Selected file"
            className="w-full h-full object-cover"
          />

          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading}
            aria-label="Remove uploaded file"
            title="Remove uploaded file"
            className="absolute top-1 right-1 w-6 h-6 rounded-full
             bg-red-500/20 border border-red-500/30
             text-red-400 flex items-center justify-center
             hover:bg-red-500/30 transition-all"
          >
            <VscClose aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileInput;
