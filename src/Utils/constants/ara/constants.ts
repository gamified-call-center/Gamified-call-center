// src/features/ara/deals/constants.ts

import { SelectOption } from "@/commonComponents/form/SingleSelect";

export const COVERAGE_OPTIONS: SelectOption[] = [
  { label: "Dental", value: "DENTAL" },
  { label: "Vision", value: "VISION" },
  { label: "Medical", value: "MEDICAL" },
];

export const CAREER_OPTIONS: SelectOption[] = [
  { label: "Select", value: "" },
  { label: "Employed", value: "EMPLOYED" },
  { label: "Self-Employed", value: "SELF_EMPLOYED" },
  { label: "Unemployed", value: "UNEMPLOYED" },
  { label: "Retired", value: "RETIRED" },
  { label: "Student", value: "STUDENT" },
];

export const WORK_TYPE_OPTIONS: SelectOption[] = [
  { label: "Select", value: "" },
  { label: "Full-time", value: "FULL_TIME" },
  { label: "Part-time", value: "PART_TIME" },
  { label: "Contract", value: "CONTRACT" },
  { label: "Gig / Freelance", value: "GIG" },
];

export const DOCUMENTS_NEEDED_OPTIONS: SelectOption[] = [
  { label: "Select", value: "" },
  { label: "ID Proof", value: "ID_PROOF" },
  { label: "Income Proof", value: "INCOME_PROOF" },
  { label: "Address Proof", value: "ADDRESS_PROOF" },
  { label: "Bank Statement", value: "BANK_STATEMENT" },
];

export const SOCIAL_PROVIDED_OPTIONS: SelectOption[] = [
  { label: "Select", value: "" },
  { label: "Yes", value: "YES" },
  { label: "No", value: "NO" },
  { label: "Partial", value: "PARTIAL" },
];

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { label: "Select", value: "" },
  { label: "English", value: "EN" },
  { label: "Spanish", value: "ES" },
  { label: "Other", value: "OTHER" },
];
