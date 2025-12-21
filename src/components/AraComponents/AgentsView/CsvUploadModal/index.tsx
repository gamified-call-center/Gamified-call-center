import React from "react";
import Modal from "@/commonComponents/Modal";
import { FaFileCsv, FaUpload } from "react-icons/fa";

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
          <p className="mt-4 text-sm text-gray-600 font-Gordita-Medium">
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
              <h3 className="text-base font-Gordita-Bold text-gray-800">
                Upload CSV
              </h3>
              <p className="text-xs text-gray-500 font-Gordita-Medium">
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
                  <p className="text-sm font-Gordita-Bold text-gray-700">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-600 font-Gordita-Medium">
                  Click to select CSV file
                </p>
              )}
            </div>
          </label>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 border rounded-lg cursor-pointer text-sm"
            >
              Cancel
            </button>

            <button
              onClick={onUpload}
              disabled={!selectedFile}
              className={`flex-1 py-2 rounded-lg text-sm cursor-pointer  flex items-center justify-center gap-2 ${
                selectedFile
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <FaUpload />
              Upload
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
