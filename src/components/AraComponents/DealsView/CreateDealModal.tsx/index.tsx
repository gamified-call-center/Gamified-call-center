// src/features/ara/deals/CreateDealModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Calendar, User } from "lucide-react";

import {
    CAREER_OPTIONS,
    COVERAGE_OPTIONS,
    DOCUMENTS_NEEDED_OPTIONS,
    LANGUAGE_OPTIONS,
    SOCIAL_PROVIDED_OPTIONS,
    WORK_TYPE_OPTIONS,
} from "../../../../Utils/constants/ara/constants";
import { TextInput } from "@/commonComponents/form/TextInput";
import { Field } from "@/commonComponents/form/Field";
import { MultiSelect } from "@/commonComponents/form/MultiSelect";
import { NumberInput } from "@/commonComponents/form/NumberInput";
import { SingleSelect } from "@/commonComponents/form/SingleSelect";
import { Textarea } from "@/commonComponents/form/Textarea";
import { FileInput } from "@/commonComponents/form/FileInput";
import Modal from "@/commonComponents/Modal";

/** ========= Types (same file, as you asked) ========= */
export type SelectOption = { label: string; value: string; disabled?: boolean };

export type DealForm = {
    coverageTypes: string[]; // MultiSelect
    firstName: string;
    lastName: string;
    numberOfApplicants: string; // keep string for input
    ffm: string;
    career: string;
    typeOfWork: string;
    monthlyIncome: string;
    documentsNeeded: string;
    socialProvided: string;
    customerLanguage: string;
    closedDate: string; // datetime-local
    agentId: string;
    notes: string;
    files: File[];
};

export type CreateDealModalMode = "CREATE" | "EDIT";

export type CreateDealModalProps = {
    open: boolean;
    onClose: () => void;

    /** dropdown options */
    agents?: SelectOption[];

    /** CREATE or EDIT */
    mode?: CreateDealModalMode;

    /** Prefill form on edit */
    initialValues?: Partial<DealForm>;

    /** Called on submit with validated form */
    onSubmit?: (payload: DealForm) => Promise<void> | void;
};

/** ========= Helpers ========= */
const pad2 = (n: number) => String(n).padStart(2, "0");

const nowAsDateTimeLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
        d.getHours()
    )}:${pad2(d.getMinutes())}`;
};

const defaultForm = (): DealForm => ({
    coverageTypes: [],
    firstName: "",
    lastName: "",
    numberOfApplicants: "",
    ffm: "",
    career: "",
    typeOfWork: "",
    monthlyIncome: "",
    documentsNeeded: "",
    socialProvided: "",
    customerLanguage: "",
    closedDate: nowAsDateTimeLocal(),
    agentId: "",
    notes: "",
    files: [],
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
                files: [], // keep empty for edit
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
            form.ffm !== base.ffm ||
            form.career !== base.career ||
            form.typeOfWork !== base.typeOfWork ||
            form.monthlyIncome !== base.monthlyIncome ||
            form.documentsNeeded !== base.documentsNeeded ||
            form.socialProvided !== base.socialProvided ||
            form.customerLanguage !== base.customerLanguage ||
            form.agentId !== base.agentId ||
            form.notes !== base.notes ||
            form.files.length > 0
        );
    }, [form]);

    const update = <K extends keyof DealForm>(key: K, value: DealForm[K]) => {
        setForm((p) => ({ ...p, [key]: value }));
        setErrors((p) => ({ ...p, [key as string]: "" }));
    };

    const validate = () => {
        const e: Record<string, string> = {};

        if (!form.coverageTypes?.length) e.coverageTypes = "Select at least one coverage type";
        if (!form.firstName.trim()) e.firstName = "First name is required";
        if (!form.lastName.trim()) e.lastName = "Last name is required";

        if (!form.numberOfApplicants) e.numberOfApplicants = "Required";
        if (form.numberOfApplicants && Number(form.numberOfApplicants) <= 0)
            e.numberOfApplicants = "Must be > 0";

        if (!form.ffm.trim()) e.ffm = "Required";
        if (!form.career) e.career = "Required";
        if (!form.typeOfWork) e.typeOfWork = "Required";
        if (!form.monthlyIncome) e.monthlyIncome = "Required";

        if (!form.documentsNeeded) e.documentsNeeded = "Required";
        if (!form.socialProvided) e.socialProvided = "Required";
        if (!form.customerLanguage) e.customerLanguage = "Required";
        if (!form.closedDate) e.closedDate = "Required";
        if (!form.agentId) e.agentId = "Select an agent";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            if (onSubmit) await onSubmit({ ...form });
            // Parent closes modal after successful API
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === "EDIT" ? "Edit Deal" : "Create New Deal"}
            subtitle={mode === "EDIT" ? "Update deal details and save changes." : "Fill details to create a new deal."}
            size="xl"
            closeOnOverlayClick={false}
            closeOnEsc={true}
            shouldConfirmClose={isDirty}

            secondaryAction={{ label: "Cancel" }}
            primaryAction={{
                label: mode === "EDIT" ? "Update" : "Submit",
                onClick: handleSubmit,
                loading: saving,
            }}
            bodyClassName="py-5"
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                    <Field label="Type of Coverage" required error={errors.coverageTypes}>
                        <MultiSelect
                            values={form.coverageTypes}
                            onChange={(v) => update("coverageTypes", v)}
                            options={COVERAGE_OPTIONS}
                            placeholder="Select"
                            placement="auto"
                            error={!!errors.coverageTypes}
                        />
                    </Field>
                </div>

                <Field label="First Name" required error={errors.firstName}>
                    <TextInput
                        value={form.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        placeholder="First Name"
                        leftIcon={<User size={18} />}
                        error={!!errors.firstName}
                    />
                </Field>

                <Field label="Last Name" required error={errors.lastName}>
                    <TextInput
                        value={form.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        placeholder="Last Name"
                        leftIcon={<User size={18} />}
                        error={!!errors.lastName}
                    />
                </Field>

                <Field label="Number of Applicants" required error={errors.numberOfApplicants}>
                    <NumberInput
                        value={form.numberOfApplicants}
                        onChange={(e) => update("numberOfApplicants", e.target.value)}
                        placeholder="Number of Applicants"
                        error={!!errors.numberOfApplicants}
                    />
                </Field>

                <Field label="FFM" required error={errors.ffm}>
                    <TextInput
                        value={form.ffm}
                        onChange={(e) => update("ffm", e.target.value)}
                        placeholder="FFM"
                        error={!!errors.ffm}
                    />
                </Field>

                <Field label="Career" required error={errors.career}>
                    <SingleSelect
                        value={form.career}
                        onChange={(v) => update("career", v)}
                        options={CAREER_OPTIONS}
                        placeholder="Select"
                        placement="auto"
                    />
                </Field>

                <Field label="Type of Work" required error={errors.typeOfWork}>
                    <SingleSelect
                        value={form.typeOfWork}
                        onChange={(v) => update("typeOfWork", v)}
                        options={WORK_TYPE_OPTIONS}
                        placeholder="Select"
                        placement="auto"
                    />
                </Field>

                <Field label="Monthly Income" required error={errors.monthlyIncome}>
                    <NumberInput
                        value={form.monthlyIncome}
                        onChange={(e) => update("monthlyIncome", e.target.value)}
                        placeholder="Monthly Income"
                        error={!!errors.monthlyIncome}
                    />
                </Field>

                <Field label="Documents Needed" required error={errors.documentsNeeded}>
                    <SingleSelect
                        value={form.documentsNeeded}
                        onChange={(v) => update("documentsNeeded", v)}
                        options={DOCUMENTS_NEEDED_OPTIONS}
                        placeholder="Select"
                        placement="auto"
                    />
                </Field>

                <Field label="Social Provided" required error={errors.socialProvided}>
                    <SingleSelect
                        value={form.socialProvided}
                        onChange={(v) => update("socialProvided", v)}
                        options={SOCIAL_PROVIDED_OPTIONS}
                        placeholder="Select"
                        placement="auto"
                    />
                </Field>

                <Field label="Customer Language" required error={errors.customerLanguage}>
                    <SingleSelect
                        value={form.customerLanguage}
                        onChange={(v) => update("customerLanguage", v)}
                        options={LANGUAGE_OPTIONS}
                        placeholder="Select"
                        placement="auto"
                    />
                </Field>

                <Field label="Closed Date" required error={errors.closedDate}>
                    <TextInput
                        type="datetime-local"
                        value={form.closedDate}
                        onChange={(e) => update("closedDate", e.target.value)}
                        leftIcon={<Calendar size={18} />}
                        error={!!errors.closedDate}
                    />
                </Field>

                <div className="md:col-span-2">
                    <Field label="Agent" required error={errors.agentId}>
                        <SingleSelect
                            value={form.agentId}
                            onChange={(v) => update("agentId", v)}
                            options={agents}
                            placeholder="Select Agent"
                            placement="auto"
                            searchable
                        />
                    </Field>
                </div>

                <div className="md:col-span-2">
                    <Field label="Notes">
                        <Textarea
                            value={form.notes}
                            onChange={(e) => update("notes", e.target.value)}
                            placeholder="Notes"
                        />
                    </Field>
                </div>

                <div className="md:col-span-2">
                    <Field label="Attachments">
                        <FileInput
                            multiple
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                update("files", files);
                            }}
                        />

                        {form.files.length > 0 ? (
                            <div className="mt-2 text-xs text-slate-500">
                                {form.files.length} file(s) selected
                            </div>
                        ) : null}
                    </Field>
                </div>
            </div>
        </Modal>
    );
}
