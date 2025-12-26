"use client";

import Button from "@/commonComponents/Button";
import { Field } from "@/commonComponents/form/Field";
import { SingleSelect } from "@/commonComponents/form/SingleSelect";
import { TextInput } from "@/commonComponents/form/TextInput";
import Modal from "@/commonComponents/Modal";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CreateAddressDto,
  CreateAgentProfileDto,
  CreateEmployeeDto,
  CreateUserCoreDto,
  CreateUserDto,
  UserEntity,
} from "../helper";
import { Checkbox } from "@/commonComponents/form/Checkbox";
import FileInput from "@/commonComponents/FileInput";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import apiClient from "@/Utils/apiClient";

export type Designation = { id: number; name: string; levelOrder: number };

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isUUID = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
type AddressForm = CreateAddressDto & { id?: string; delete?: boolean };
type Props = {
  open: boolean;
  mode: "add" | "edit";
  saving?: boolean;

  /** data */
  designations: Designation[];
  users: UserEntity[];
  initialUser?: UserEntity | null; // for edit

  /** events */
  onClose: () => void;
  onSubmit: (payload: CreateUserDto) => Promise<void> | void;
};
const STEPS = [
  { id: 1, title: "User Details", desc: "Identity, role & login access" },
  { id: 2, title: "Employee", desc: "Designation & reporting manager" },
  { id: 3, title: "Extras", desc: "Addresses & agent profile" },
] as const;
const ErrorText = ({ text }: { text?: string }) =>
  text ? <p className="text-xs text-rose-600 mt-1">{text}</p> : null;

const SectionCard = ({
  title,
  subTitle,
  right,
  children,
}: {
  title: string;
  subTitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="app-card border app-border rounded-2xl p-4 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="app-text md:text-[12px] text-[10px] font-Gordita-Bold">
          {title}
        </p>
        {subTitle ? (
          <p className="app-muted md:text-xs text-[10px]  mt-1">{subTitle}</p>
        ) : null}
      </div>
      {right}
    </div>
    {children}
  </div>
);
const defaultAddress = (isDefault = true) => ({
  id: undefined,
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  locality: "",
  landmark: "",
  isDefault,
});
function dedupeAddressesFromApi(list: any[]): any[] {
  const seen = new Set<string>();
  return (list || []).filter((a) => {
    const key =
      [
        a.address1,
        a.address2,
        a.city,
        a.state,
        a.zip,
        a.country,
        a.locality,
        a.landmark,
      ]
        .map((x) =>
          String(x || "")
            .trim()
            .toLowerCase()
        )
        .join("|") || a.id;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function normalizeAddresses(list: any[]) {
  // remove fully empty rows
  const cleaned = (list || []).filter((a) =>
    [
      a.address1,
      a.city,
      a.state,
      a.zip,
      a.country,
      a.locality,
      a.landmark,
      a.address2,
    ].some((x) => String(x || "").trim().length > 0)
  );

  if (!cleaned.length) return [defaultAddress(true)];

  // Ensure exactly 1 default
  let foundDefault = false;
  const normalized = cleaned.map((a: any, idx: number) => {
    const isDef = !!a.isDefault;
    if (isDef && !foundDefault) foundDefault = true;
    return { ...defaultAddress(false), ...a, isDefault: isDef };
  });

  if (!foundDefault) normalized[0].isDefault = true;

  let firstDefaultIdx = normalized.findIndex((x) => x.isDefault);
  normalized.forEach((x, i) => {
    if (i !== firstDefaultIdx) x.isDefault = false;
  });

  return normalized;
}

export default function UserOnboardModal({
  open,
  mode,
  saving = false,
  designations,
  users,
  initialUser,
  onClose,
  onSubmit,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isAgent, setIsAgent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [userCore, setUserCore] = useState<CreateUserCoreDto>({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    password: "",
    phone: "",
    profileImage: "",
    systemRole: "STANDARD",
  });

  const [employee, setEmployee] = useState<CreateEmployeeDto>({
    designationId: 0,
    reportsToId: undefined,
  });

  const [addresses, setAddresses] = useState<AddressForm[]>([
    defaultAddress(true),
  ]);

  const [addressesTouched, setAddressesTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [agentProfile, setAgentProfile] = useState<CreateAgentProfileDto>({
    npm: "",
    yearsOfExperience: 0,
    ahipCertified: false,
    ahipProofUrl: "",
    stateLicensed: false,
    accessLevel: "TRAINING",
    bankAccounts: [],
  });

  const hydratedKeyRef = useRef<string>("");

  useEffect(() => {
    if (!open) {
      hydratedKeyRef.current = "";
      return;
    }

    const userId = (initialUser as any)?.id || "new";
    const key = `${mode}:${userId}`;
    if (hydratedKeyRef.current === key) return;
    hydratedKeyRef.current = key;

    setStep(1);
    setErrors({});
    setAddressesTouched(false);

    if (mode === "edit" && initialUser) {
      setIsAgent(!!(initialUser as any).agentProfile);

      setUserCore({
        firstName: (initialUser as any).firstName || "",
        lastName: (initialUser as any).lastName || "",
        dob:
          typeof (initialUser as any).dob === "string"
            ? (initialUser as any).dob.slice(0, 10)
            : String((initialUser as any).dob || "").slice(0, 10),
        email: (initialUser as any).email || "",
        password: (initialUser as any).password,
        phone: (initialUser as any).phone || "",
        profileImage: (initialUser as any)?.profileImage || "",
        systemRole: (initialUser as any).systemRole || "STANDARD",
      });

      setEmployee({
        designationId: (initialUser as any).employee?.designation?.id || 0,
        reportsToId: (initialUser as any).employee?.reportsTo?.id || undefined,
      });

      const deduped = dedupeAddressesFromApi(
        (initialUser as any).addresses || []
      );

      const mapped: AddressForm[] = deduped.map((a: any) => ({
        id: a.id,
        delete: false,
        address1: a.address1 || "",
        address2: a.address2 || "",
        city: a.city || "",
        state: a.state || "",
        zip: a.zip || "",
        country: a.country || "",
        locality: a.locality || "",
        landmark: a.landmark || "",
        isDefault: !!a.isDefault,
      }));

      setAddresses(
        mapped.length ? normalizeAddresses(mapped) : [defaultAddress(true)]
      );

      if ((initialUser as any).agentProfile) {
        const agent = (initialUser as any).agentProfile;

        setAgentProfile({
          npm: agent.npm || "",
          yearsOfExperience: Number(agent.yearsOfExperience || 0),
          ahipCertified: !!agent.ahipCertified,
          ahipProofUrl: agent.ahipProofUrl || "",
          stateLicensed: !!agent.stateLicensed,
          stateLicenseNumber: agent.stateLicenseNumber || "",
          accessLevel: agent.accessLevel || "TRAINING",
          bankAccounts:
            agent.bankAccounts?.map((b: any) => ({
              id: b.id,
              bankName: b.bankName,
              accountNumber: b.accountNumber,
              ifscNumber: b.ifscNumber,
              accountHolderName: b.accountHolderName,
              isPrimary: b.isPrimary ?? false,
              isVerified: b.isVerified ?? false,
            })) || [], // default to empty array if none
        });
      } else {
        setAgentProfile({
          npm: "",
          yearsOfExperience: 0,
          ahipCertified: false,
          ahipProofUrl: "",
          stateLicensed: false,
          stateLicenseNumber: "",
          accessLevel: "TRAINING",
          bankAccounts: [],
        });
      }

      return;
    }

    setIsAgent(false);
    setUserCore({
      firstName: "",
      lastName: "",
      dob: "",
      email: "",
      password: "",
      phone: "",
      profileImage: "",
      systemRole: "STANDARD",
    });
    setEmployee({ designationId: 0, reportsToId: undefined });
    setAddresses([defaultAddress(true)]);
    setAgentProfile({
      npm: "",
      yearsOfExperience: 0,
      ahipCertified: false,
      ahipProofUrl: "",
      stateLicensed: false,
      stateLicenseNumber: "",
      accessLevel: "TRAINING",
      bankAccounts: [],
    });
  }, [open, mode, initialUser]);

  const role = (userCore.systemRole || "STANDARD") as "ADMIN" | "STANDARD";
  const isAdmin = role === "ADMIN";

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!userCore.firstName?.trim()) e.firstName = "First name is required";
    if (!userCore.lastName?.trim()) e.lastName = "Last name is required";
    if (!userCore.dob) e.dob = "DOB is required";
    if (!userCore.email?.trim()) e.email = "Email is required";
    if (mode === "add" && !userCore.password?.trim())
      e.password = "Password is required";
    if (!userCore.phone?.trim()) e.phone = "Phone is required";
    setErrors((p) => ({ ...p, ...e }));
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (isAdmin) return true;
    if (!employee.designationId || employee.designationId < 1)
      e.designationId = "Designation is required";
    setErrors((p) => ({ ...p, ...e }));
    return Object.keys(e).length === 0;
  };
  

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (isAdmin) return true;

    const hasAnyAddressData = addresses.some((a) =>
      [a.address1, a.city, a.state, a.zip, a.country].some(
        (x) => (x || "").trim().length > 0
      )
    );

    if (hasAnyAddressData) {
      addresses.forEach((a, idx) => {
        const base = `addresses.${idx}`;
        if (!a.address1?.trim()) e[`${base}.address1`] = "Address1 required";
        if (!a.city?.trim()) e[`${base}.city`] = "City required";
        if (!a.state?.trim()) e[`${base}.state`] = "State required";
        if (!a.zip?.trim()) e[`${base}.zip`] = "Zip required";
        if (!a.country?.trim()) e[`${base}.country`] = "Country required";
      });
    }

    if (isAgent) {
      if (!(agentProfile as any).npm?.trim()) e.npm = "NPN is required";
      if (!Number.isFinite(Number((agentProfile as any).yearsOfExperience)))
        e.yearsOfExperience = "Years must be a number";
      if (Number((agentProfile as any).yearsOfExperience) < 0)
        e.yearsOfExperience = "Years must be >= 0";
      if (!(agentProfile as any).accessLevel)
        e.accessLevel = "Access level required";

      if (
        (agentProfile as any).ahipCertified &&
        !(agentProfile as any).ahipProofUrl?.trim()
      ) {
        e.ahipProofUrl = "AHIP Proof URL required";
      }

      if (
        (agentProfile as any).stateLicensed &&
        !(agentProfile as any).stateLicenseNumber?.trim()
      ) {
        e.stateLicenseNumber = "State License Number required";
      }
    }

    setErrors((p) => ({ ...p, ...e }));
    return Object.keys(e).length === 0;
  };

  const buildPayload = (): CreateUserDto => {
    const dto: any = {
      user: {
        firstName: userCore.firstName.trim(),
        lastName: userCore.lastName.trim(),
        dob: userCore.dob,
        email: userCore.email.trim(),
        password: userCore.password?.trim(),
        phone: userCore.phone.trim(),
        profileImage: userCore.profileImage?.trim() || undefined,
        systemRole: role,
      },
    };

    if (mode === "edit" && !dto.user.password) delete dto.user.password;
    if (isAdmin) return dto;

    dto.employee = {
      designationId: Number(employee.designationId),
      reportsToId: employee.reportsToId || undefined,
    };

    const normalized = normalizeAddresses(addresses);

    const hasAnyAddressData = normalized.some((a) =>
      [a.address1, a.city, a.state, a.zip, a.country].some(
        (x) => (x || "").trim().length > 0
      )
    );

    if (hasAnyAddressData) {
      if (mode === "edit" && initialUser?.id) {
        const keep = normalized.find((x) => x.isDefault) || normalized[0];

        if (!keep?.id) {
          throw new Error(
            "Edit mode address must include id. Please refresh and try again."
          );
        }

        const deletes =
          (initialUser as any)?.addresses
            ?.filter((db: any) => db?.id && db.id !== keep.id)
            .map((db: any) => ({ id: db.id, delete: true })) || [];

        dto.addresses = [
          {
            id: keep.id,
            address1: keep.address1.trim(),
            address2: keep.address2?.trim() || undefined,
            city: keep.city.trim(),
            state: keep.state.trim(),
            zip: keep.zip.trim(),
            country: keep.country.trim(),
            locality: keep.locality?.trim() || undefined,
            landmark: keep.landmark?.trim() || undefined,
            isDefault: true,
          },
          ...deletes,
        ];
      } else {
        dto.addresses = normalized.map((a: any) => ({
          address1: a.address1.trim(),
          address2: a.address2?.trim() || undefined,
          city: a.city.trim(),
          state: a.state.trim(),
          zip: a.zip.trim(),
          country: a.country.trim(),
          locality: a.locality?.trim() || undefined,
          landmark: a.landmark?.trim() || undefined,
          isDefault: !!a.isDefault,
        }));
      }
    }

    if (isAgent) {
      dto.agentProfile = {
        npm: (agentProfile as any).npm.trim(),
        yearsOfExperience: Number((agentProfile as any).yearsOfExperience),
        ahipCertified: !!(agentProfile as any).ahipCertified,
        ahipProofUrl: (agentProfile as any).ahipCertified
          ? (agentProfile as any).ahipProofUrl?.trim() || undefined
          : undefined,
        stateLicensed: !!(agentProfile as any).stateLicensed,
        stateLicenseNumber: (agentProfile as any).stateLicensed
          ? (agentProfile as any).stateLicenseNumber?.trim() || undefined
          : undefined,
        accessLevel: (agentProfile as any).accessLevel,
        bankAccounts:
          (agentProfile as any).bankAccounts?.map((b: any) => ({
            id: b.id,
            bankName: b.bankName.trim(),
            accountNumber: b.accountNumber.trim(),
            ifscNumber: b.ifscNumber.trim(),
            accountHolderName: b.accountHolderName.trim(),
            isPrimary: b.isPrimary ?? false,
            isVerified: b.isVerified ?? false,
          })) || [],
      };
    }

    return dto;
  };
  const [reportsToOptions, setReportsToOptions] = useState<
    { label: string; value: string }[]
  >([]);
  useEffect(() => {
  if (!employee.designationId) {
    setReportsToOptions([]);
    return;
  }

  const fetchReportsTo = async () => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.employee}/report-to/${employee.designationId}`,
        {},
        true
      );

      if (Array.isArray(res.body)) {
        const options = res.body.map((emp: any) => ({
          label: `${emp.name} (${emp.designation})`, // what user sees
          value: String(emp.id), // what gets submitted
        }));

        setReportsToOptions(options);
      }
    } catch (err) {
      console.error("Failed to fetch reports-to employees", err);
    }
  };

  fetchReportsTo();
}, [employee.designationId]);


  const title = useMemo(() => {
    if (mode === "add") return "Add User";
    return `Edit User — ${(initialUser as any)?.firstName || ""}`;
  }, [mode, initialUser]);

  const stepMeta = STEPS.find((s) => s.id === step)!;
  const progressPct = step === 1 ? 33 : step === 2 ? 66 : 100;

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      if (isAdmin) return setStep(3);
      return setStep(2);
    }
    if (step === 2) {
      if (!validateStep2()) return;
      return setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 3) return setStep(isAdmin ? 1 : 2);
    if (step === 2) return setStep(1);
  };

  const handleSubmit = async () => {
    try {
      const ok1 = validateStep1();
      const ok2 = validateStep2();
      const ok3 = validateStep3();
      if (!ok1 || !ok2 || !ok3) return;

      await onSubmit(buildPayload());
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="app-card border app-border rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3">
            {STEPS.map((s) => {
              const disabled = isAdmin && s.id === 2;
              const active = step === s.id;
              const done = step > s.id;

              return (
                <Button
                  key={s.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setStep(s.id as any)}
                  className={[
                    "flex-1 text-left rounded-2xl p-3 border transition",
                    disabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:shadow-sm",
                    active ? "border-blue-500/50 bg-blue-500/5" : "app-border",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "w-9 h-9 rounded-xl flex items-center justify-center border font-Gordita-Bold text-sm",
                        active
                          ? "bg-blue-600 text-white border-blue-600"
                          : done
                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-300"
                          : "app-card app-text app-border",
                      ].join(" ")}
                    >
                      {done ? "✓" : s.id}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={[
                          "text-sm font-Gordita-Bold",
                          active ? "text-blue-600" : "app-text",
                        ].join(" ")}
                      >
                        {s.title}
                      </p>
                      <p className="text-xs app-muted">{s.desc}</p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="mt-3 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs app-muted">
            <span>{stepMeta.title}</span>
            <span>{progressPct}%</span>
          </div>
        </div>

        {step === 1 ? (
          <SectionCard
            title="User Details"
            subTitle="Basic info, role & login access"
          >
            <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
              <Field label="First Name" required error={errors.firstName}>
                <TextInput
                  value={userCore.firstName}
                  onChange={(e: any) => {
                    setUserCore((p: any) => ({
                      ...p,
                      firstName: e.target.value,
                    }));
                    if (errors.firstName)
                      setErrors((p) => ({ ...p, firstName: "" }));
                  }}
                  placeholder="First name"
                  error={!!errors.firstName}
                />
              </Field>

              <Field label="Last Name" required error={errors.lastName}>
                <TextInput
                  value={userCore.lastName}
                  onChange={(e: any) => {
                    setUserCore((p: any) => ({
                      ...p,
                      lastName: e.target.value,
                    }));
                    if (errors.lastName)
                      setErrors((p) => ({ ...p, lastName: "" }));
                  }}
                  placeholder="Last name"
                  error={!!errors.lastName}
                />
              </Field>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
              <Field label="DOB" required error={errors.dob}>
                <TextInput
                  type="date"
                  value={userCore.dob}
                  onChange={(e: any) => {
                    setUserCore((p: any) => ({ ...p, dob: e.target.value }));
                    if (errors.dob) setErrors((p) => ({ ...p, dob: "" }));
                  }}
                  error={!!errors.dob}
                />
              </Field>

              <Field label="System Role">
                <SingleSelect
                  value={userCore.systemRole || "STANDARD"}
                  onChange={(v: any) =>
                    setUserCore((p: any) => ({ ...p, systemRole: v }))
                  }
                  options={[
                    { label: "STANDARD", value: "STANDARD" },
                    { label: "ADMIN", value: "ADMIN" },
                  ]}
                  placeholder="Select role"
                  searchable
                />
              </Field>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
              <Field label="Email" required error={errors.email}>
                <TextInput
                  type="email"
                  value={userCore.email}
                  onChange={(e: any) => {
                    setUserCore((p: any) => ({ ...p, email: e.target.value }));
                    if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                  }}
                  placeholder="Email"
                  error={!!errors.email}
                />
              </Field>

              <Field label="Phone" required error={errors.phone}>
                <TextInput
                  value={userCore.phone}
                  onChange={(e: any) => {
                    setUserCore((p: any) => ({ ...p, phone: e.target.value }));
                    if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
                  }}
                  placeholder="Phone"
                  error={!!errors.phone}
                />
              </Field>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
              <Field
                label={mode === "add" ? "Password" : "Password (leave empty)"}
                required={mode === "add"}
                error={errors.password}
              >
                <TextInput
                  type={showPassword ? "text" : "password"}
                  value={userCore.password}
                  onChange={(e: any) => {
                    setUserCore((p: any) => ({
                      ...p,
                      password: e.target.value,
                    }));
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: "" }));
                  }}
                  placeholder={
                    mode === "add"
                      ? "Create password"
                      : "Leave blank to keep existing"
                  }
                  error={!!errors.password}
                  rightIcon={
                    <Button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowPassword((p) => !p)}
                      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 app-muted" />
                      ) : (
                        <Eye className="w-4 h-4 app-muted" />
                      )}
                    </Button>
                  }
                />
              </Field>

              <Field label="Profile Image (optional)">
                <FileInput
                  type="file"
                  folderName="users/profile"
                  initialFileUrl={userCore.profileImage || ""}
                  onFileChange={(url: any) => {
                    setUserCore((p) => ({ ...p, profileImage: url }));
                    toast.success("Profile picture uploaded!");
                  }}
                />
              </Field>
            </div>

            {!isAdmin ? (
              <div className="rounded-2xl border app-border p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="app-text font-Gordita-Bold text-sm">
                    Agent User
                  </p>
                  <p className="app-muted text-xs mt-1">
                    Enable if this user should have an Agent profile
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAgent((p) => !p)}
                  className={[
                    "px-4 py-2 rounded-xl text-sm font-Gordita-Bold transition border",
                    isAgent
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "app-btn",
                  ].join(" ")}
                >
                  {isAgent ? "Enabled" : "Disabled"}
                </button>
              </div>
            ) : null}
          </SectionCard>
        ) : null}

        {step === 2 ? (
          <SectionCard
            title="Employee Details"
            subTitle="Designation & reporting chain"
          >
            {isAdmin ? (
              <div className="rounded-xl border app-border p-3 app-card">
                <p className="app-text font-Gordita-Bold text-sm">Admin user</p>
                <p className="app-muted text-xs mt-1">
                  Employee details are skipped for ADMIN.
                </p>
              </div>
            ) : (
              <>
                <Field
                  label="Designation"
                  required
                  error={errors.designationId}
                >
                  <SingleSelect
                    value={
                      employee.designationId
                        ? String(employee.designationId)
                        : ""
                    }
                    onChange={(v: any) => {
                      setEmployee((p: any) => ({
                        ...p,
                        designationId: v,
                      }));
                      if (errors.designationId)
                        setErrors((p) => ({ ...p, designationId: "" }));
                    }}
                    options={[
                      { label: "Select Designation", value: "" },
                      ...designations
                        .slice()
                        .sort((a, b) => a.levelOrder - b.levelOrder)
                        .map((d) => ({
                          label: `${d.name} (Level ${d.levelOrder})`,
                          value: String(d.id),
                        })),
                    ]}
                    placeholder="Select Designation"
                    searchable
                    error={!!errors.designationId}
                  />
                </Field>

               <Field label="Reports To (optional)" error={errors.reportsToId}>
  <SingleSelect
    value={employee.reportsToId || ""}
    onChange={(v: any) => {
      setEmployee((p: any) => ({
        ...p,
        reportsToId: v || undefined,
      }));
      if (errors.reportsToId)
        setErrors((p) => ({ ...p, reportsToId: "" }));
    }}
    options={[
      { label: "None", value: "" },
      ...reportsToOptions, // <-- Correct source
    ]}
    placeholder="Select Reports To"
    searchable
    error={!!errors.reportsToId}
  />
</Field>

              </>
            )}
          </SectionCard>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            {!isAdmin ? (
              <>
                <SectionCard
                  title="Addresses"
                  subTitle="Optional. Add at least required fields "
                >
                  <div className="space-y-3">
                    {(addresses || []).map((a, idx) => {
                      const base = `addresses.${idx}`;

                      return (
                        <div
                          key={a.id ?? idx}
                          className="rounded-2xl border app-border p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-Gordita-Bold app-text">
                              Address #{idx + 1}
                            </p>

                            {(addresses || []).length > 1 ? (
                              <button
                                type="button"
                                className="text-xs text-rose-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddressesTouched(true);
                                  setAddresses((p) =>
                                    normalizeAddresses(
                                      (p || []).filter((_, i) => i !== idx)
                                    )
                                  );
                                }}
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>

                          <Field
                            label="Address 1"
                            required
                            error={errors[`${base}.address1`]}
                          >
                            <TextInput
                              value={a.address1}
                              onChange={(e: any) => {
                                setAddressesTouched(true);
                                setAddresses((p) =>
                                  (p || []).map((x, i) =>
                                    i === idx
                                      ? { ...x, address1: e.target.value }
                                      : x
                                  )
                                );

                                if (errors[`${base}.address1`]) {
                                  setErrors((p) => ({
                                    ...p,
                                    [`${base}.address1`]: "",
                                  }));
                                }
                              }}
                              placeholder="Flat/House, Street"
                              error={!!errors[`${base}.address1`]}
                            />
                          </Field>

                          <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
                            <Field
                              label="City"
                              required
                              error={errors[`${base}.city`]}
                            >
                              <TextInput
                                value={a.city}
                                onChange={(e: any) => {
                                  setAddressesTouched(true);
                                  setAddresses((p) =>
                                    (p || []).map((x, i) =>
                                      i === idx
                                        ? { ...x, city: e.target.value }
                                        : x
                                    )
                                  );

                                  if (errors[`${base}.city`]) {
                                    setErrors((p) => ({
                                      ...p,
                                      [`${base}.city`]: "",
                                    }));
                                  }
                                }}
                                placeholder="City"
                                error={!!errors[`${base}.city`]}
                              />
                            </Field>

                            <Field
                              label="State"
                              required
                              error={errors[`${base}.state`]}
                            >
                              <TextInput
                                value={a.state}
                                onChange={(e: any) => {
                                  setAddressesTouched(true);
                                  setAddresses((p) =>
                                    (p || []).map((x, i) =>
                                      i === idx
                                        ? { ...x, state: e.target.value }
                                        : x
                                    )
                                  );

                                  if (errors[`${base}.state`]) {
                                    setErrors((p) => ({
                                      ...p,
                                      [`${base}.state`]: "",
                                    }));
                                  }
                                }}
                                placeholder="State"
                                error={!!errors[`${base}.state`]}
                              />
                            </Field>
                          </div>

                          <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
                            <Field
                              label="Zip"
                              required
                              error={errors[`${base}.zip`]}
                            >
                              <TextInput
                                value={a.zip}
                                onChange={(e: any) => {
                                  setAddressesTouched(true);
                                  setAddresses((p) =>
                                    (p || []).map((x, i) =>
                                      i === idx
                                        ? { ...x, zip: e.target.value }
                                        : x
                                    )
                                  );

                                  if (errors[`${base}.zip`]) {
                                    setErrors((p) => ({
                                      ...p,
                                      [`${base}.zip`]: "",
                                    }));
                                  }
                                }}
                                placeholder="Zip"
                                error={!!errors[`${base}.zip`]}
                              />
                            </Field>

                            <Field
                              label="Country"
                              required
                              error={errors[`${base}.country`]}
                            >
                              <TextInput
                                value={a.country}
                                onChange={(e: any) => {
                                  setAddressesTouched(true);
                                  setAddresses((p) =>
                                    (p || []).map((x, i) =>
                                      i === idx
                                        ? { ...x, country: e.target.value }
                                        : x
                                    )
                                  );

                                  if (errors[`${base}.country`]) {
                                    setErrors((p) => ({
                                      ...p,
                                      [`${base}.country`]: "",
                                    }));
                                  }
                                }}
                                placeholder="Country"
                                error={!!errors[`${base}.country`]}
                              />
                            </Field>
                          </div>

                          <Field label="Set as default">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="defaultAddress"
                                checked={!!a.isDefault}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setAddressesTouched(true);
                                  setAddresses((p) =>
                                    normalizeAddresses(
                                      (p || []).map((x, i) => ({
                                        ...x,
                                        isDefault: i === idx,
                                      }))
                                    )
                                  );
                                }}
                              />
                              <span className="text-xs app-text">Default</span>
                            </div>
                          </Field>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>

                {isAgent ? (
                  <SectionCard
                    title="Agent Profile"
                    subTitle="Only shown when Agent is enabled"
                  >
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
                      <Field label="NPN" required error={errors.npm}>
                        <TextInput
                          value={agentProfile.npm}
                          onChange={(e: any) =>
                            setAgentProfile((p: any) => ({
                              ...p,
                              npm: e.target.value,
                            }))
                          }
                          placeholder="NPN"
                          error={!!errors.npm}
                        />
                      </Field>

                      <Field
                        label="Years of Experience"
                        required
                        error={errors.yearsOfExperience}
                      >
                        <TextInput
                          type="number"
                          min={0}
                          value={agentProfile.yearsOfExperience}
                          onChange={(e: any) =>
                            setAgentProfile((p: any) => ({
                              ...p,
                              yearsOfExperience: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          error={!!errors.yearsOfExperience}
                        />
                      </Field>
                    </div>

                    <div className="grid md:grid-cols-2 grid-cols-1 gap-3 pt-2">
                      <div className="rounded-2xl border app-border p-4 flex items-center justify-between">
                        <div>
                          <p className="app-text font-Gordita-Bold text-sm">
                            AHIP Certified
                          </p>
                          <p className="app-muted text-xs mt-1">
                            Enable if agent has AHIP
                          </p>
                        </div>
                        <Checkbox
                          checked={agentProfile.ahipCertified}
                          onChange={(e) =>
                            setAgentProfile((p: any) => ({
                              ...p,
                              ahipCertified: e.target.checked,
                            }))
                          }
                        />
                      </div>

                      <div className="rounded-2xl border app-border p-4 flex items-center justify-between">
                        <div>
                          <p className="app-text font-Gordita-Bold text-sm">
                            State Licensed
                          </p>
                          <p className="app-muted text-xs mt-1">
                            Enable if agent has state license
                          </p>
                        </div>
                        <Checkbox
                          checked={agentProfile.stateLicensed}
                          onChange={(e) =>
                            setAgentProfile((p: any) => ({
                              ...p,
                              stateLicensed: e.target.checked,
                            }))
                          }
                        />
                      </div>
                    </div>

                    {agentProfile.ahipCertified && (
                      <Field
                        label="AHIP Proof URL"
                        required
                        error={errors.ahipProofUrl}
                      >
                        <TextInput
                          value={agentProfile.ahipProofUrl || ""}
                          onChange={(e: any) =>
                            setAgentProfile((p: any) => ({
                              ...p,
                              ahipProofUrl: e.target.value,
                            }))
                          }
                          placeholder="https://..."
                          error={!!errors.ahipProofUrl}
                        />
                      </Field>
                    )}

                    {agentProfile.stateLicensed && (
                      <Field
                        label="State License Number"
                        required
                        error={errors.stateLicenseNumber}
                      >
                        <TextInput
                          value={agentProfile.stateLicenseNumber || ""}
                          onChange={(e: any) =>
                            setAgentProfile((p: any) => ({
                              ...p,
                              stateLicenseNumber: e.target.value,
                            }))
                          }
                          placeholder="Enter license number"
                          error={!!errors.stateLicenseNumber}
                        />
                      </Field>
                    )}

                    <Field
                      label="Access Level"
                      required
                      error={errors.accessLevel}
                    >
                      <SingleSelect
                        value={agentProfile.accessLevel}
                        onChange={(v: any) =>
                          setAgentProfile((p: any) => ({
                            ...p,
                            accessLevel: v,
                          }))
                        }
                        options={[
                          { label: "TRAINING", value: "TRAINING" },
                          { label: "ALL_ACCESS", value: "ALL_ACCESS" },
                        ]}
                        placeholder="Select access"
                      />
                    </Field>

                    <div className="grid md:grid-cols-2 grid-cols-1 gap-3 mt-4">
                      <Field label="Bank Name" required>
                        <TextInput
                          value={agentProfile.bankAccounts?.[0]?.bankName || ""}
                          onChange={(e) => {
                            const updated = [
                              {
                                ...(agentProfile.bankAccounts?.[0] || {}),
                                bankName: e.target.value,
                              },
                            ];
                            setAgentProfile((p: any) => ({
                              ...p,
                              bankAccounts: updated,
                            }));
                          }}
                        />
                      </Field>

                      <Field label="Account Number" required>
                        <TextInput
                          value={
                            agentProfile.bankAccounts?.[0]?.accountNumber || ""
                          }
                          onChange={(e) => {
                            const updated = [
                              {
                                ...(agentProfile.bankAccounts?.[0] || {}),
                                accountNumber: e.target.value,
                              },
                            ];
                            setAgentProfile((p: any) => ({
                              ...p,
                              bankAccounts: updated,
                            }));
                          }}
                        />
                      </Field>

                      <Field label="IFSC Number" required>
                        <TextInput
                          value={
                            agentProfile.bankAccounts?.[0]?.ifscNumber || ""
                          }
                          onChange={(e) => {
                            const updated = [
                              {
                                ...(agentProfile.bankAccounts?.[0] || {}),
                                ifscNumber: e.target.value,
                              },
                            ];
                            setAgentProfile((p: any) => ({
                              ...p,
                              bankAccounts: updated,
                            }));
                          }}
                        />
                      </Field>

                      <Field label="Account Holder Name" required>
                        <TextInput
                          value={
                            agentProfile.bankAccounts?.[0]?.accountHolderName ||
                            ""
                          }
                          onChange={(e) => {
                            const updated = [
                              {
                                ...(agentProfile.bankAccounts?.[0] || {}),
                                accountHolderName: e.target.value,
                              },
                            ];
                            setAgentProfile((p: any) => ({
                              ...p,
                              bankAccounts: updated,
                            }));
                          }}
                        />
                      </Field>
                    </div>
                  </SectionCard>
                ) : null}
              </>
            ) : (
              <SectionCard
                title="Admin User"
                subTitle="Employee/Address/Agent steps are skipped"
              >
                <div className="rounded-xl border app-border p-3 app-card">
                  <p className="app-text font-Gordita-Bold text-sm">
                    ADMIN user
                  </p>
                  <p className="app-muted text-xs mt-1">
                    Only user core fields will be submitted.
                  </p>
                </div>
              </SectionCard>
            )}
          </div>
        ) : null}

        <div className="sticky bottom-0 app-card backdrop-blur border-t app-border pt-3">
          <div className="flex items-center justify-between">
            <Button
              className="app-btn px-4 py-2 rounded-xl"
              onClick={handleBack}
            >
              ← Back
            </Button>

            <div className="flex items-center gap-2">
              {step !== 3 ? (
                <Button
                  className="md:px-4 px-2 md:py-2 py-1 md:text-[14px] text-[12px] font-Gordita-Medium  rounded-xl app-card app-text hover:app-surface"
                  onClick={handleNext}
                >
                  Next →
                </Button>
              ) : (
                <Button
                  className="md:px-4 px-2 md:py-2 py-1 md:text-[14px] text-[12px] rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  disabled={saving}
                  onClick={handleSubmit}
                >
                  {saving
                    ? "Saving..."
                    : mode === "add"
                    ? "Create User"
                    : "Update User"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
