"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Modal from "@/commonComponents/Modal";
import Button from "@/commonComponents/Button";
import {
  X,
  Eye,
  Download,
  Copy,
  FileText,
  Link2,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-hot-toast";
import FilePreviewModal from "../FilePreviewModal"


import { forceDownload, getFileNameFromUrl, isImage, isPdf } from "../../helper";






type RowProps = {
  label: string;
  value?: React.ReactNode;
  copyText?: string;
};

function InfoRow({ label, value, copyText }: RowProps) {
  const isEmpty = value === undefined || value === null || value === "" || value === "-";

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="md:text-xs text-[12px] font-semibold app-text uppercase tracking-wide w-1/3">
        {label}
      </div>
      <div className="flex items-center gap-2 w-2/3">
        <div className="md:text-sm text-[10px] font-medium app-muted break-words">
          {isEmpty ? (
            <span className="px-2 py-1 rounded-full text-xs font-semibold app-surface app-text">
              Not provided
            </span>
          ) : (
            value
          )}
        </div>
        {copyText && (
          <Button
            type="button"
            className="p-2 rounded-xl border bg-white hover:bg-gray-50 transition"
            title="Copy"
            onClick={async () => {
              await navigator.clipboard.writeText(copyText);
              toast.success("Copied");
            }}
          >
            <Copy className="h-4 w-4 text-gray-700" />
          </Button>
        )}
      </div>
    </div>
  );
}


type DocRowProps = {
  label: string;
  url?: string;
  onPreview: (url: string, label: string) => void;
};

function DocRow({ label, url, onPreview }: DocRowProps) {
  const cleanUrl = (url || "").trim();
  if (!cleanUrl) return <InfoRow label={label} value="-" />;

  const fileName = getFileNameFromUrl(cleanUrl);
  const showImg = isImage(cleanUrl);
  const showPDF = isPdf(cleanUrl);

  return (
    <div className="py-3">
      <div className="text-[11px] font-semibold app-text uppercase tracking-wide mb-2">
        {label}
      </div>

      <div className="group relative rounded-2xl border app-card overflow-hidden shadow-sm hover:shadow-md transition">
        {/* Preview area */}
        <div className="relative h-44 bg-gray-50">
          {showImg ? (
            <Image
              src={cleanUrl}
              alt={fileName}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2 app-text">
              {showPDF ? <FileText className="h-10 w-10" /> : <Link2 className="h-10 w-10" />}
              <div className="text-sm font-semibold">
                {showPDF ? "PDF Document" : "File Link"}
              </div>
              <div className="text-xs app-muted">Click View to open</div>
            </div>
          )}

         
          <div className="absolute inset-0 app-surface opacity-0 group-hover:opacity-100 transition" />

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
            <Button
              type="button"
              className="!p-2.5 rounded-xl app-card shadow"
              onClick={() => onPreview(cleanUrl, label)}
              title="View"
            >
              <Eye className="h-4 w-4 app-text" />
            </Button>

            <Button
              type="button"
              className="!p-2.5 rounded-xl app-card shadow"
              onClick={() => forceDownload(cleanUrl, fileName)}
              title="Download"
            >
              <Download className="h-4 w-4 app-text" />
            </Button>
          </div>

          {/* File type pill */}
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full app-card text-xs font-semibold app-text shadow">
            {showImg ? (
              <ImageIcon className="h-3.5 w-3.5" />
            ) : showPDF ? (
              <FileText className="h-3.5 w-3.5" />
            ) : (
              <Link2 className="h-3.5 w-3.5" />
            )}
            {showImg ? "Image" : showPDF ? "PDF" : "Link"}
          </div>
        </div>

        
        <div className="p-3">
          <div className="text-sm font-semibold app-text truncate">{fileName}</div>
          <div className="text-xs app-muted truncate">{cleanUrl}</div>
        </div>
      </div>
    </div>
  );
}

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="app-surface rounded-2xl shadow-sm p-4 border app-border">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="app-text font-bold md:text-sm text-[14px]">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:gap-3 gap-1">{children}</div>
    </div>
  );
}




type Props = {
  open: boolean;
  onClose: () => void;
  application: any | null; 
};

export default function ApplicationDetailsModal({ open, onClose, application }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>("Preview");

  const fullName = useMemo(() => {
    if (!application) return "";
    return `${application.firstName} ${application.lastName}`;
  }, [application]);

  if (!application) return null;

  const openPreview = (url: string, label: string) => {
    setPreviewUrl(url);
    setPreviewLabel(label);
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        
        <div className="flex items-start justify-between md:gap-3 gap-2 border-b md:pb-4 pb-2">
          <div className="min-w-0">
            <div className="font-bold md:text-xl text-[18px] truncate app-text">{fullName}</div>
            <div className="md:text-xs text-[14px] app-muted mt-1">Application ID: {application.id}</div>
          </div>

         
        </div>

        {/* Content */}
       <div className="md:mt-4 mt-2 grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-2">
  <CardSection title="Personal">
    <InfoRow label="First Name" value={application.firstName} />
    <InfoRow label="Last Name" value={application.lastName} />
    <InfoRow label="DOB" value={application.dateOfBirth} />
    <InfoRow label="Email" value={application.email} copyText={application.email} />
    <InfoRow label="Phone" value={application.phoneNumber} copyText={application.phoneNumber} />
    <InfoRow label="NPN" value={application.npn} />
    <InfoRow label="About You" value={application.aboutYou} />
  </CardSection>

  <CardSection title="Address">
    <InfoRow label="Address 1" value={application.address1} />
    <InfoRow label="Address 2" value={application.address2} />
    <InfoRow label="City" value={application.city} />
    <InfoRow label="State" value={application.state} />
    <InfoRow label="Zip" value={application.zip} />
  </CardSection>

  <CardSection title="Professional">
    <InfoRow label="Years of Exp" value={application.yearsOfExperience ?? "-"} />
    <InfoRow label="Carrier" value={application.carrier ?? "-"} />
    <InfoRow
      label="AHIP Certified"
      value={
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            application.ahipCertified ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {application.ahipCertified ? "Yes" : "No"}
        </span>
      }
    />
    <InfoRow label="State License No" value={application.stateLicenseNumber} />

   
    <div className="mt-2">
      <h4 className="md:text-sm text-[12px] font-bold app-text mb-2">State Licenses</h4>
      {application.stateLicenses?.length ? (
        <div className="grid md:gap-3 gap-1">
          {application.stateLicenses.map((s: any) => (
            <div key={s.id} className="rounded-2xl border p-3 bg-gray-50">
              <div className="md:text-sm text-[12px] font-semibold app-text mb-2">
                State: <span className="app-muted">{s.state || "-"}</span>
              </div>
              <DocRow
                label="Document"
                url={s.documentUrl}
                onPreview={(u) => openPreview(u, `State License (${s.state || "N/A"})`)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm app-text">No state licenses uploaded.</div>
      )}
    </div>
  </CardSection>

  <CardSection title="Bank">
    <InfoRow label="Bank Name" value={application.bankName} />
    <InfoRow label="Account Holder" value={application.accountHolderName} />
    <InfoRow label="Account Number" value={application.accountNumber} />
  </CardSection>
</div>


        <div className="mt-4">
          <CardSection title="Documents">
           { application.ahipCertified && <DocRow label="AHIP Proof" url={application.ahipProofUrl} onPreview={openPreview} />} 
            <DocRow label="Identity Document" url={application.identityDocumentUrl} onPreview={openPreview} />
            <DocRow
              label="Commission Assignment"
              url={application.commissionAssignmentUrl}
              onPreview={openPreview}
            />
            <DocRow label="ENO Certificate" url={application.enoCertificateUrl} onPreview={openPreview} />

            <div className="pt-3 md:text-xs text-[10px] app-muted">
              Submitted at: {application.createdAt}
            </div>
          </CardSection>
        </div>
      </Modal>

      <FilePreviewModal
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        url={previewUrl}
        label={previewLabel}
      />
    </>
  );
}
