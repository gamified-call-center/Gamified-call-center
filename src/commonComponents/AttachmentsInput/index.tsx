import { deleteFile, uploadFile } from "../../Utils/uploadFile";
import React, { ChangeEvent, useRef, useState } from "react";
import Button from "../Button";

type AttachmentsInputProps = {
  folderName?: string;
  value: string[];                      // ✅ uploaded URLs
  onChange: (urls: string[]) => void;   // ✅ pass URLs to parent
};

export default function AttachmentsInput({
  folderName = "deals",
  value,
  onChange,
}: AttachmentsInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (uploading) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const urls: string[] = [];

      for (const file of Array.from(files)) {
        const uploadedURL = await uploadFile(file, folderName);

        if (!uploadedURL || typeof uploadedURL !== "string") {
          throw new Error("File upload failed: URL not returned");
        }

        urls.push(uploadedURL);
      }

      onChange([...(value || []), ...urls]);

      // reset input so you can reselect same file again
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (url: string) => {
    setUploading(true);
    try {
      await deleteFile(url); // optional
      onChange((value || []).filter((u) => u !== url));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        disabled={uploading}
        onChange={handleFileChange}
        className="block w-full text-sm"
      />

      {!!value?.length && (
        <div className="space-y-2">
          {value.map((url) => (
            <div key={url} className="flex items-center justify-between gap-2 border rounded-md p-2">
              <a href={url} target="_blank" rel="noreferrer" className="text-sm underline truncate max-w-[70%]">
                {url}
              </a>

              <Button
                type="button"
                disabled={uploading}
                onClick={() => handleRemove(url)}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-md"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
