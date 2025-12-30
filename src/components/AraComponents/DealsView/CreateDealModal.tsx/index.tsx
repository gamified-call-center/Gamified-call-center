// src/features/ara/deals/CreateDealModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Briefcase, Calendar, Pencil, User } from "lucide-react";

import {
  CAREER_OPTIONS,
  COVERAGE_OPTIONS,
  DOCUMENTS_NEEDED_OPTIONS,
  LANGUAGE_OPTIONS,
  SOCIAL_PROVIDED_OPTIONS,
  WORK_TYPE_OPTIONS,
} from "../../../../Utils/constants/ara/constants";
import { TextInput } from "@/commonComponents/form/TextInput";
import FileInput from "@/commonComponents/FileInput";
import { Field } from "@/commonComponents/form/Field";
import { MultiSelect } from "@/commonComponents/form/MultiSelect";
import { NumberInput } from "@/commonComponents/form/NumberInput";
import { SingleSelect } from "@/commonComponents/form/SingleSelect";
import { Textarea } from "@/commonComponents/form/Textarea";
import Drawer from "@/commonComponents/Drawers";
import Button from "@/commonComponents/Button";
import toast from "react-hot-toast";
import { Checkbox } from "@/commonComponents/form/Checkbox";
/** ========= Types (same file, as you asked) ========= */
export type SelectOption = { label: string; value: string; disabled?: boolean };
export type DealStatus = "OPEN" | "CLOSED" | "REJECTED";

export type DealForm = {
  coverageTypes: string[]; // MultiSelect
  firstName: string;
  lastName: string;
  numberOfApplicants: string; // keep string for input
  ffm: boolean;
  career: string;
  typeOfWork: string;
  monthlyIncome: string;
  documentsNeeded: string;
  socialProvided: string;
  customerLanguage: string;
  closedDate: string; // datetime-local
  agentId: string;
  userId:string;
  status: DealStatus;
  notes: string;
 
documents: string[];
};

export type CreateDealModalMode = "CREATE" | "EDIT";
const DEAL_STATUS_OPTIONS = [
  { label: "Open", value: "OPEN" },
  { label: "Closed", value: "CLOSED" },
  { label: "Rejected", value: "REJECTED" },
] as const;

export type CreateDealModalProps = {
  open: boolean;
  onClose: () => void;

  agents?: SelectOption[];

  mode?: CreateDealModalMode;

  initialValues?: Partial<DealForm>;

  onSubmit?: (payload: DealForm) => Promise<void> | void;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const nowAsDateTimeLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
    d.getDate()
  )}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const defaultForm = (): DealForm => ({
  coverageTypes: [],
  firstName: "",
  lastName: "",
  numberOfApplicants: "",
  ffm: false,
  career: "",
  typeOfWork: "",
  monthlyIncome: "",
  documentsNeeded: "",
  socialProvided: "",
  customerLanguage: "",
  closedDate: nowAsDateTimeLocal(),
  agentId: "",
  userId:"",
  notes: "",
  status: "OPEN",
 
  documents: [],
});

export default function CreateDealModal({
  open,
  onClose,
  agents = [{ label: "Select Agent", value: "" }],
  mode = "CREATE",
  initialValues,
  onSubmit,
}: CreateDealModalProps) {
  const [form, setForm] = useState<DealForm>(defaultForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  /** ✅ reset/prefill whenever modal opens */
  useEffect(() => {
    if (!open) return;

    setErrors({});
    setSaving(false);

    if (mode === "EDIT") {
      setForm({
        ...defaultForm(),
        ...initialValues,
      } as DealForm);
    } else {
      setForm(defaultForm());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  const isDirty = useMemo(() => {
    // dirty check for close confirmation
    const base = defaultForm();
    return (
      form.coverageTypes.length > 0 ||
      form.firstName !== base.firstName ||
      form.lastName !== base.lastName ||
      form.numberOfApplicants !== base.numberOfApplicants ||
      // form.ffm !== base.ffm ||
      form.career !== base.career ||
      form.typeOfWork !== base.typeOfWork ||
      form.monthlyIncome !== base.monthlyIncome ||
      form.documentsNeeded !== base.documentsNeeded ||
      form.socialProvided !== base.socialProvided ||
      form.customerLanguage !== base.customerLanguage ||
      form.agentId !== base.agentId ||
      form.notes !== base.notes ||
      form.userId!==base.userId||
     
      form.documents!==base.documents
    );
  }, [form]);

  const update = <K extends keyof DealForm>(key: K, value: DealForm[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key as string]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.coverageTypes?.length)
      e.coverageTypes = "Select at least one coverage type";
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";

    if (!form.numberOfApplicants) e.numberOfApplicants = "Required";
    if (form.numberOfApplicants && Number(form.numberOfApplicants) <= 0)
      e.numberOfApplicants = "Must be > 0";

    // if (!form.ffm) e.ffm = "FFM must be enabled";
    if (!form.career) e.career = "Required";
    if (!form.typeOfWork) e.typeOfWork = "Required";
    if (!form.monthlyIncome) e.monthlyIncome = "Required";

    if (!form.documentsNeeded) e.documentsNeeded = "Required";
    if (!form.socialProvided) e.socialProvided = "Required";
    if (!form.customerLanguage) e.customerLanguage = "Required";
    if (!form.closedDate) e.closedDate = "Required";
    if (!form.userId) e.userId = "Select an agent";

    setErrors(e);
    return Object.keys(e).length === 0;
  };
  console.log(errors);

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      if (onSubmit) await onSubmit({ ...form });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      handleDrawerToggle={(v) => !v && onClose()}
      //   title={mode === "EDIT" ? "Edit Deal" : "Create Deal"}
      openVariant="right"
      panelCls=" w-[95%] md:w-[80%] lg:w-[calc(82%-190px)] app-card shadow-[0_20px_50px_rgba(0,0,0,0.18)] border-l border-slate-200 overflow-x-hidden z-[9999999] "
      panelInnerCls=" app-surface md:px-8 px-3 py-6"
      overLayCls="bg-slate-900/40  backdrop-blur-sm"
    >
      <div className="md:space-y-8 space-y-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            {mode === "EDIT" ? (
              <Pencil size={18} className="text-indigo-600" />
            ) : (
              <Briefcase size={18} className="text-indigo-600" />
            )}

            <span
              className="
        bg-linear-to-r
        from-blue-600
        via-indigo-600
        to-purple-600
        bg-clip-text
        text-transparent
      "
            >
              {mode === "EDIT" ? "Edit Deal" : "Create Deal"}
            </span>
          </div>

          <p className="mt-1 text-sm font-medium app-text">
            {mode === "EDIT"
              ? "Update deal information and save changes."
              : "Fill in the details to create a new deal."}
          </p>
        </div>

        <Section title="Coverage & Customer">
          <Field label="Coverage Type" required>
            <MultiSelect
              values={form.coverageTypes}
              onChange={(v) => update("coverageTypes", v)}
              options={COVERAGE_OPTIONS}
              placeholder="Select coverage"
            />
          </Field>

          <TwoCol>
            <Field label="First Name" required>
              <TextInput
                value={form.firstName}
                placeholder="Enter First Name "
                onChange={(e) => update("firstName", e.target.value)}
                leftIcon={<User size={16} />}
              />
            </Field>

            <Field label="Last Name" required>
              <TextInput
                value={form.lastName}
                placeholder="Enter Last Name"
                onChange={(e) => update("lastName", e.target.value)}
                leftIcon={<User size={16} />}
              />
            </Field>
          </TwoCol>

          <TwoCol>
            <Field label="Applicants">
              <NumberInput
                placeholder="Enter Number of Applicants"
                value={form.numberOfApplicants}
                onChange={(e) => update("numberOfApplicants", e.target.value)}
              />
            </Field>

            <Field label="FFM">
              <Checkbox
                label="FFM Applicable"
                checked={form.ffm}
                onChange={(e) => update("ffm", e.target.checked)}
              />
            </Field>
          </TwoCol>
        </Section>

        {/* ---------------- Work ---------------- */}
        <Section title="Work & Income">
          <TwoCol>
            <Field label="Career">
              <SingleSelect
                value={form.career}
                placeholder="Enter Career"
                onChange={(v) => update("career", v)}
                options={CAREER_OPTIONS}
              />
            </Field>

            <Field label="Work Type">
              <SingleSelect
                value={form.typeOfWork}
                onChange={(v) => update("typeOfWork", v)}
                options={WORK_TYPE_OPTIONS}
              />
            </Field>
          </TwoCol>

          <Field label="Monthly Income">
            <NumberInput
              value={form.monthlyIncome}
              placeholder="Enter Monthly Income"
              onChange={(e) => update("monthlyIncome", e.target.value)}
            />
          </Field>
        </Section>

        {/* ---------------- Documents ---------------- */}
        <Section title="Documents & Preferences">
          <TwoCol>
            <Field label="Documents Needed">
              <SingleSelect
                value={form.documentsNeeded}
                onChange={(v) => update("documentsNeeded", v)}
                options={DOCUMENTS_NEEDED_OPTIONS}
              />
            </Field>

            <Field label="Social Provided">
              <SingleSelect
                value={form.socialProvided}
                onChange={(v) => update("socialProvided", v)}
                options={SOCIAL_PROVIDED_OPTIONS}
              />
            </Field>
          </TwoCol>

          <Field label="Customer Language">
            <SingleSelect
              value={form.customerLanguage}
              onChange={(v) => update("customerLanguage", v)}
              options={LANGUAGE_OPTIONS}
            />
          </Field>
        </Section>

        {/* ---------------- Deal ---------------- */}
        <Section title="Deal Details">
          <TwoCol>
            <Field label="Closed Date">
              <TextInput
                type="datetime-local"
                value={form.closedDate}
                onChange={(e) => update("closedDate", e.target.value)}
                leftIcon={<Calendar size={16} />}
              />
            </Field>

            <Field label="Assign Agent">
              <SingleSelect
                value={form.userId}
                onChange={(v) => update("userId", v)}
                options={agents}
                searchable
              />
            </Field>
            <Field label="Deal Status">
              <SingleSelect
                value={form.status}
                onChange={(v) => update("status", v as DealStatus)}
                options={DEAL_STATUS_OPTIONS as any}
              />
            </Field>
          </TwoCol>
        </Section>

        {/* ---------------- Notes ---------------- */}
        <Section title="Notes & Attachments">
          <Field label="Notes">
            <Textarea
              value={form.notes}
              placeholder="Enter Notes......"
              onChange={(e) => update("notes", e.target.value)}
            />
          </Field>
         

          <Field label="Documents">
            <FileInput
              type="file"
              folderName="deals"
              initialFileUrl={form.documents?.[0]}
              requiredClass="app-border"
              onFileChange={(url: string) => {
    if (!url) return;
    setForm(prev => ({ ...prev, documents: [...prev.documents, url] })); 
    toast.success("Document uploaded successfully!");
  }}
            />
          </Field>
        </Section>

        {/* ---------------- Footer ---------------- */}
        <div className="sticky bottom-0 app-card px-8 py-4 flex justify-end gap-3 backdrop-blur">
          <Button
            onClick={onClose}
            className="px-4 py-2 font-medium rounded-lg app-btn transition"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg app-btn-active font-medium transition"
          >
            {mode === "EDIT" ? "Update Deal" : "Create Deal"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
type SectionProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  titleCls?: string;
};

const Section = ({ title, subtitle, titleCls, children }: SectionProps) => (
  <div className="rounded-2xl app-card shadow-sm transition-all duration-200 hover:shadow-md">
    {/* Header */}
    <div className="px-6 py-4 border-b app-border app-table-head rounded-t-2xl">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-5 w-1 rounded-full bg-indigo-600" />

        <div>
          <h3 className={"text-lg  font-bold tracking-wide app-text"}>
            {title}
          </h3>

          {subtitle ? (
            <p className="mt-1 text-sm app-muted">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="px-6 py-6 space-y-6 text-sm app-text leading-relaxed">
      {children}
    </div>
  </div>
);

const TwoCol = ({ children }: { children: React.ReactNode }) => (
  <div
    className="
      grid
      grid-cols-1
      md:grid-cols-2
      gap-x-4
      md:gap-y-4 gap-y-1
    "
  >
    {children}
  </div>
);
