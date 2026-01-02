// src/features/ara/deals/constants.ts

import { SelectOption } from "@/commonComponents/form/SingleSelect";

export const COVERAGE_OPTIONS: SelectOption[] = [
  { label: "Dental", value: "DENTAL" },
  { label: "Vision", value: "VISION" },
  { label: "Medical", value: "MEDICAL" },
];

export const CAREER_OPTIONS: SelectOption[] = [
  { label: "AMBETTER", value: "AMBETTER" },
  { label: "AETNA", value: "AETNA" },
  { label: "BCBS", value: "BCBS" },
  { label: "CARESOURCE", value: "CARESOURCE" },
  { label: "CIGNA", value: "CIGNA" },
  { label: "MOLINA", value: "MOLINA" },
  { label: "OSCAR", value: "OSCAR" },
  { label: "UNITED HEALTHCARE", value: "UNITED HEALTHCARE" },
  { label: "FLORIDA BLUE", value: "FLORIDA BLUE" },
  { label: "HEALTH FIRST", value: "HEALTH FIRST" },
  { label: "UNIV OF UTHA", value: "UNIV OF UTHA" },
  { label: "MEDICA", value: "CARESOURCE" },
  { label: "PRIORITY HEALTH", value: "PRIORITY HEALTH" },
  { label: "FIRST CHOICE", value: "FIRST CHOICE" },
  { label: "ANTHEM", value: "ANTHEM" },
  { label: "INSTIL", value: "INSTIL" },
  { label: "WELLPOINT", value: "WELLPOINT" },
  { label: "AMERITAS", value: "AMERITAS" },
  { label: "AMERIHEALTH", value: "AMERIHEALTH" },
  { label: "ALLINTHEALTH", value: "ALLINTHEALTH" },
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
  { label: "IMMIGRATION", value: "IMMIGRATION" },
  { label: "CITIZENSHIP", value: "CITIZENSHIP" },
  { label: "SS", value: "SS" },
  { label: "NONE", value: "NONE" },
];

export const SOCIAL_PROVIDED_OPTIONS: SelectOption[] = [
  { label: "Select", value: "" },
  { label: "Yes", value: "YES" },
  { label: "No", value: "NO" },
  { label: "Partial", value: "PARTIAL" },
];

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { label: "Select", value: "" },
  { label: "English", value: "ENGLISH" },
  { label: "Spanish", value: "SPANISH" },
  { label: "Other", value: "OTHER" },
];

export const DEFAULT_ROLE_OPTIONS: SelectOption[] = [
  { label: "Agent", value: "Agent" },
  { label: "Agent Lead", value: "AgentLead" },
  { label: "Manager", value: "Manager" },
];

export const DEFAULT_ACCESS_OPTIONS: SelectOption[] = [
  { label: "Training", value: "TRAINING" },
  { label: "ALL Access", value: "ALL_ACCESS" },
];

export const DEFAULT_APPS_OPTIONS: SelectOption[] = [
  { label: "ACA", value: "ACA" },
  { label: "Medicare", value: "MEDICARE" },
  { label: "Taxation", value: "TAXATION" },
  { label: "Launchpad", value: "LAUNCHPAD" },
];
export enum DealType {
  ACA = "ACA",
  MEDICARE = "MEDICARE",
  TAXATION = "TAXATION",
  LAUNCHPAD = "LAUNCHPAD",
}
