import React from "react";
import Modal from "@/commonComponents/Modal";
import { FaFileCsv, FaUpload } from "react-icons/fa";
import Button from "@/commonComponents/Button"

interface CSVUploadModalProps {
  open: boolean;
  onClose: () => void;
  selectedFile: File | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
 fileInputRef: React.RefObject<HTMLInputElement | null>;

  isLoading: boolean;
}

export default function CSVUploadModal({
  open,
  onClose,
  selectedFile,
  onFileSelect,
  onUpload,
  fileInputRef,
  isLoading,
}: CSVUploadModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeOnOverlayClick={false}
      size="sm"
      showCloseIcon={!isLoading}
      className="max-w-105"
       title="Upload CSV"
    >
      {isLoading ? (
        <div className="p-8 text-center">
          <p className="mt-4 label-text app-text font-medium">
            Uploading CSV...
          </p>
        </div>
      ) : (
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaFileCsv className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="text-base font-bold app-text">
                Upload CSV
              </h3>
              <p className="text-xs app-muted font-medium">
                Import data in bulk
              </p>
            </div>
          </div>

          {/* File Input */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={onFileSelect}
            hidden
            id="csv-upload"
          />

          <label htmlFor="csv-upload" className="cursor-pointer block mb-5">
            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50 hover:bg-blue-50 transition">
              <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
              {selectedFile ? (
                <>
                  <p className="label-text font-bold text-gray-700">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <p className="label-text text-gray-600 font-medium">
                  Click to select CSV file
                </p>
              )}
            </div>
          </label>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="flex-1 py-2 border  font-medium rounded-lg cursor-pointer label-text"
            >
              Cancel
            </Button>

            <Button
              onClick={onUpload}
              disabled={!selectedFile}
              className={`flex-1 py-2 rounded-lg label-text cursor-pointer  flex items-center justify-center gap-2 ${
                selectedFile
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <FaUpload />
              Upload
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
