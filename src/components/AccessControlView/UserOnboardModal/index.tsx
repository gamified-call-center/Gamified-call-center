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
import {
  Briefcase,
  Eye,
  EyeOff,
  MapPin,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import apiClient from "@/Utils/apiClient";
import { MultiSelect } from "@/commonComponents/form/MultiSelect";
import { DEFAULT_APPS_OPTIONS } from "@/Utils/constants/ara/constants";

export type Designation = { id: number; name: string; levelOrder: number };

type AddressForm = CreateAddressDto & { id?: string; delete?: boolean };

type Props = {
  open: boolean;
  mode: "add" | "edit";
  saving?: boolean;

  designations: Designation[];
  users: UserEntity[];
  initialUser?: UserEntity | null;

  onClose: () => void;
  onSubmit: (payload: CreateUserDto) => Promise<void> | void;
};

const STEPS = [
  {
    id: 1,
    title: "User Details",
    desc: "Identity, role & login access",
    icon: User,
  },
  {
    id: 2,
    title: "Employee",
    desc: "Designation & reporting manager",
    icon: Briefcase,
  },
  { id: 3, title: "Profile & Addresses", desc: "Optional addresses & role-based profiles", icon: MapPin }

] as const;

type SectionCardProps = {
  title: string;
  subTitle?: string;
  right?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const SectionCard = ({
  title,
  subTitle,
  right,
  icon,
  children,
  className = "",
}: SectionCardProps) => {
  return (
    <div
      className={[
        "rounded-2xl border overflow-hidden",
        "app-surface",
        "border-slate-200/70",
        "shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)]",
        className,
      ].join(" ")}
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {icon ? (
              <div className="mt-0.5 grid place-items-center w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                {icon}
              </div>
            ) : null}

            <div className="min-w-0">
              <p className="text-sm font-semibold app-text truncate">{title}</p>
              {subTitle ? (
                <p className="text-xs app-muted mt-1 leading-relaxed">
                  {subTitle}
                </p>
              ) : null}
            </div>
          </div>

          {right ? (
            <div className="shrink-0 flex items-center gap-2">{right}</div>
          ) : null}
        </div>
      </div>

      <div className="h-px bg-slate-200/70 dark:bg-slate-700/60" />
      <div className="px-5 py-4">{children}</div>
    </div>
  );
};

const emptyAddress = (isDefault = true): AddressForm => ({
  id: undefined,
  delete: false,
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

function hasAnyAddressData(list: AddressForm[]) {
  return (list || []).some((a) =>
    [
      a.address1,
      a.city,
      a.state,
      a.zip,
      a.country,
      a.address2,
      a.locality,
      a.landmark,
    ].some((x) => String(x || "").trim().length > 0)
  );
}

function normalizeAddresses(list: AddressForm[]) {
  const cleaned = (list || []).filter((a) =>
    [
      a.address1,
      a.city,
      a.state,
      a.zip,
      a.country,
      a.address2,
      a.locality,
      a.landmark,
    ].some((x) => String(x || "").trim().length > 0)
  );

  // ✅ Return empty list (no fake emptyAddress)
  if (!cleaned.length) return [];

  // ensure one default
  let foundDefault = false;
  const normalized = cleaned.map((a) => {
    const isDef = !!a.isDefault;
    if (isDef && !foundDefault) foundDefault = true;
    return { ...emptyAddress(false), ...a, isDefault: isDef };
  });

  if (!foundDefault) normalized[0].isDefault = true;

  const firstDefaultIdx = normalized.findIndex((x) => x.isDefault);
  normalized.forEach((x, i) => {
    if (i !== firstDefaultIdx) x.isDefault = false;
  });

  return normalized;
}

function validateAddress(a: AddressForm) {
  const e: Record<string, string> = {};
  if (!a.address1?.trim()) e.address1 = "Address1 required";
  if (!a.city?.trim()) e.city = "City required";
  if (!a.state?.trim()) e.state = "State required";
  if (!a.zip?.trim()) e.zip = "Zip required";
  if (!a.country?.trim()) e.country = "Country required";
  return e;
}

/** ---------------- Address Modal ---------------- */
function AddressModal({
  open,
  mode,
  value,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: "add" | "edit";
  value: AddressForm;
  onClose: () => void;
  onSave: (addr: AddressForm) => void;
}) {
  const [local, setLocal] = useState<AddressForm>(value);
  const [errs, setErrs] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocal(value);
    setErrs({});
  }, [value, open]);

  const title = mode === "add" ? "Add Address" : "Edit Address";

  const handleSave = () => {
    // If user typed anything, validate required
    const typedSomething = hasAnyAddressData([local]);
    if (!typedSomething) {
      setErrs({ address1: "Please fill at least required fields" });
      return;
    }

    const e = validateAddress(local);
    setErrs(e);
    if (Object.keys(e).length) return;

    onSave({
      ...local,
      address1: local.address1.trim(),
      city: local.city.trim(),
      state: local.state.trim(),
      zip: local.zip.trim(),
      country: local.country.trim(),
      address2: local.address2?.trim() || "",
      locality: local.locality?.trim() || "",
      landmark: local.landmark?.trim() || "",
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      className="max-w-[550px] z-[99999]"
    >
      <div className="space-y-3 ">
        <Field label="Address 1" required error={errs.address1}>
          <TextInput
            value={local.address1}
            onChange={(e: any) =>
              setLocal((p) => ({ ...p, address1: e.target.value }))
            }
            placeholder="Flat/House, Street"
            error={!!errs.address1}
          />
        </Field>

        <Field label="Address 2 (optional)">
          <TextInput
            value={local.address2 || ""}
            onChange={(e: any) =>
              setLocal((p) => ({ ...p, address2: e.target.value }))
            }
            placeholder="Area, Apartment, etc."
          />
        </Field>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
          <Field label="City" required error={errs.city}>
            <TextInput
              value={local.city}
              onChange={(e: any) =>
                setLocal((p) => ({ ...p, city: e.target.value }))
              }
              error={!!errs.city}
            />
          </Field>

          <Field label="State" required error={errs.state}>
            <TextInput
              value={local.state}
              onChange={(e: any) =>
                setLocal((p) => ({ ...p, state: e.target.value }))
              }
              error={!!errs.state}
            />
          </Field>
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
          <Field label="Zip" required error={errs.zip}>
            <TextInput
              value={local.zip}
              onChange={(e: any) =>
                setLocal((p) => ({ ...p, zip: e.target.value }))
              }
              error={!!errs.zip}
            />
          </Field>

          <Field label="Country" required error={errs.country}>
            <TextInput
              value={local.country}
              onChange={(e: any) =>
                setLocal((p) => ({ ...p, country: e.target.value }))
              }
              error={!!errs.country}
            />
          </Field>
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
          <Field label="Locality (optional)">
            <TextInput
              value={local.locality || ""}
              onChange={(e: any) =>
                setLocal((p) => ({ ...p, locality: e.target.value }))
              }
            />
          </Field>

          <Field label="Landmark (optional)">
            <TextInput
              value={local.landmark || ""}
              onChange={(e: any) =>
                setLocal((p) => ({ ...p, landmark: e.target.value }))
              }
            />
          </Field>
        </div>

        <div className="rounded-2xl border app-border p-3 flex items-center justify-between">
          <div>
            <p className="app-text font-bold text-sm">Set as default</p>
            <p className="app-muted text-xs mt-1">
              Only one default address is allowed.
            </p>
          </div>
          <Checkbox
            checked={!!local.isDefault}
            onChange={(e) =>
              setLocal((p) => ({ ...p, isDefault: e.target.checked }))
            }
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button className="app-btn px-4 py-2 rounded-xl" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="px-4 py-2 rounded-xl bg-[#541796] text-white"
            onClick={handleSave}
          >
            Save Address
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** ---------------- Main Component ---------------- */
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
    designationId: "",
    reportsToId: undefined,
  });

  const [addresses, setAddresses] = useState<AddressForm[]>([
    emptyAddress(true),
  ]);
  const [showPassword, setShowPassword] = useState(false);

  const [agentProfile, setAgentProfile] = useState<CreateAgentProfileDto>({
    npn: "",
    yearsOfExperience: 0,
    ahipCertified: false,
    ahipProofUrl: "",
    stateLicensed: false,
    accessLevel: "TRAINING",
    apps: [],
  });

  // address modal state
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [addrModalMode, setAddrModalMode] = useState<"add" | "edit">("add");
  const [addrEditIndex, setAddrEditIndex] = useState<number | null>(null);
  const [addrDraft, setAddrDraft] = useState<AddressForm>(emptyAddress(true));

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
        mapped.length ? normalizeAddresses(mapped) : [emptyAddress(true)]
      );

      if ((initialUser as any).agentProfile) {
        const agent = (initialUser as any).agentProfile;
        setAgentProfile({
          npn: agent.npn || "",
          yearsOfExperience: Number(agent.yearsOfExperience || 0),
          ahipCertified: !!agent.ahipCertified,
          ahipProofUrl: agent.ahipProofUrl || "",
          stateLicensed: !!agent.stateLicensed,
          stateLicenseNumber: agent.stateLicenseNumber || "",
          accessLevel: agent.accessLevel || "TRAINING",
          apps: agent.apps || [],
        });
      }

      return;
    }

    // add mode reset
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
    setEmployee({ designationId: "", reportsToId: undefined });
    setAddresses([emptyAddress(true)]);
    setAgentProfile({
      npn: "",
      yearsOfExperience: 0,
      ahipCertified: false,
      ahipProofUrl: "",
      stateLicensed: false,
      stateLicenseNumber: "",
      accessLevel: "TRAINING",
      apps: [],
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
    if (!employee.designationId) e.designationId = "Designation is required";
    setErrors((p) => ({ ...p, ...e }));
    return Object.keys(e).length === 0;
  };

  // ✅ validate addresses even for admin, but only if any address is filled
  const validateStep3 = () => {
    const e: Record<string, string> = {};

    const normalized = normalizeAddresses(addresses);
    const any = hasAnyAddressData(normalized);

    if (any) {
      normalized.forEach((a, idx) => {
        const base = `addresses.${idx}`;
        if (!a.address1?.trim()) e[`${base}.address1`] = "Address1 required";
        if (!a.city?.trim()) e[`${base}.city`] = "City required";
        if (!a.state?.trim()) e[`${base}.state`] = "State required";
        if (!a.zip?.trim()) e[`${base}.zip`] = "Zip required";
        if (!a.country?.trim()) e[`${base}.country`] = "Country required";
      });
    }

    if (!isAdmin && isAgent) {
      if (!(agentProfile as any).npn?.trim()) e.npn = "NPN is required";
      if (!Number.isFinite(Number((agentProfile as any).yearsOfExperience)))
        e.yearsOfExperience = "Years must be a number";
      if (Number((agentProfile as any).yearsOfExperience) < 0)
        e.yearsOfExperience = "Years must be >= 0";
      if (!(agentProfile as any).accessLevel)
        e.accessLevel = "Access level required";
       if (!(agentProfile as any).apps)
        e.apps = "apps are required";

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

    // in edit mode if password empty, don't send it
    if (mode === "edit" && !dto.user.password) delete dto.user.password;

    // employee only for non-admin
    if (!isAdmin) {
      dto.employee = {
        designationId: employee.designationId,
        reportsToId: employee.reportsToId || undefined,
      };
    }

    /** ---------------- Addresses ---------------- */
    // addresses for admin + standard (optional)
    const normalized = normalizeAddresses(addresses);
    const any = hasAnyAddressData(normalized);

    if (any) {
      if (mode === "edit" && initialUser?.id) {
        const dbAddresses: AddressForm[] = (
          (initialUser as any)?.addresses || []
        ).map((a: any) => ({
          id: a.id,
          address1: a.address1 || "",
          address2: a.address2 || "",
          city: a.city || "",
          state: a.state || "",
          zip: a.zip || "",
          country: a.country || "",
          locality: a.locality || "",
          landmark: a.landmark || "",
          isDefault: !!a.isDefault,
          delete: false,
        }));

        const dbIds = new Set(
          dbAddresses.map((d) => d.id).filter(Boolean) as string[]
        );
        const formIds = new Set(
          normalized.map((a) => a.id).filter(Boolean) as string[]
        );

        // ✅ create/update list (send ALL form addresses)
        const upserts = normalized.map((a) => ({
          ...(a.id ? { id: a.id } : {}),
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

        // ✅ deletes: any address present in DB but removed from form
        const deletes = Array.from(dbIds)
          .filter((id) => !formIds.has(id))
          .map((id) => ({ id, delete: true }));

        dto.addresses = [...upserts, ...deletes];
      } else {
        // add mode => create all
        dto.addresses = normalized.map((a) => ({
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

    /** ---------------- Agent ---------------- */
    if (!isAdmin && isAgent) {
      dto.agentProfile = {
        npn: (agentProfile as any).npn.trim(),
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
        apps: (agentProfile as any).apps || [],
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
            label: emp.fullName,
            value: String(emp.id),
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

  /** -------- Address handlers -------- */
  const openAddAddress = () => {
    setAddrModalMode("add");
    setAddrEditIndex(null);
    setAddrDraft(emptyAddress(addresses.length === 0)); // default if first
    setAddrModalOpen(true);
  };

  const openEditAddress = (idx: number) => {
    setAddrModalMode("edit");
    setAddrEditIndex(idx);
    setAddrDraft(addresses[idx] || emptyAddress(false));
    setAddrModalOpen(true);
  };

  const saveAddress = (addr: AddressForm) => {
    setAddresses((prev) => {
      const next = [...(prev || [])];

      if (addrModalMode === "add") {
        next.push(addr);
      } else if (addrEditIndex !== null) {
        next[addrEditIndex] = { ...next[addrEditIndex], ...addr };
      }

      // If saved address is default, clear others
      let merged = next;
      if (addr.isDefault) {
        merged = next.map((x, i) => ({
          ...x,
          isDefault:
            addrModalMode === "add"
              ? i === next.length - 1
              : i === addrEditIndex,
        }));
      }

      return normalizeAddresses(merged);
    });

    setAddrModalOpen(false);
    toast.success("Address saved");
  };

  const removeAddress = (idx: number) => {
    setAddresses((prev) => {
      const next = (prev || []).filter((_, i) => i !== idx);
      return normalizeAddresses(next);
    });
  };

  const setDefaultAddress = (idx: number) => {
    setAddresses((prev) =>
      normalizeAddresses(
        (prev || []).map((x, i) => ({ ...x, isDefault: i === idx }))
      )
    );
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title={title}>
        <div className="space-y-4">
          {/* step nav */}
          <div className="app-card border app-border rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              {STEPS.map((s) => {
                const disabled = isAdmin && s.id === 2;
                const active = step === s.id;
                const done = step > s.id;
                const Icon = s.icon;

                return (
                  <Button
                    key={s.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setStep(s.id as any)}
                    className={[
                      "flex-1 text-left rounded-2xl app-card md:p-3 p-1 border transition",
                      disabled
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:shadow-sm",
                      active
                        ? "border-blue-500/50 bg-blue-500/5"
                        : "app-border",
                    ].join(" ")}
                  >
                    <div className="flex items-center md:gap-3 gap-2">
                      <div
                        className={[
                          "md:w-9 w-6 md:h-9 h-6 rounded-xl flex items-center justify-center border font-bold md:text-sm text-[10px]",
                          active
                            ? "bg-[#4274a5] text-white border-[#4274a5]"
                            : done
                            ? "bg-emerald-500/10 text-emerald-700 border-emerald-300"
                            : "app-card app-text app-border",
                        ].join(" ")}
                      >
                        <span className="md:hidden">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="md:block hidden">
                          {done ? "✓" : s.id}
                        </span>
                      </div>

                      {/* TEXT SECTION */}
                      <div className="min-w-0">
                        <p
                          className={[
                            "md:text-sm text-[10px] font-bold",
                            active ? "text-[#4274a5]" : "app-text",
                          ].join(" ")}
                        >
                          {s.title}
                        </p>
                        {/* Keep description only for md and above */}
                        <p className="text-xs md:block hidden app-muted">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            <div className="mt-3 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#cfc91b] transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs app-muted">
              <span>{stepMeta.title}</span>
              <span>{progressPct}%</span>
            </div>
          </div>

          {/* Step 1 - User */}
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
                      setUserCore((p: any) => ({
                        ...p,
                        email: e.target.value,
                      }));
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
                      setUserCore((p: any) => ({
                        ...p,
                        phone: e.target.value,
                      }));
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
                    requiredClass="app-border"
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
                    <p className="app-text font-bold text-sm">Agent User</p>
                    <p className="app-muted text-xs mt-1">
                      Enable if this user should have an Agent profile
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAgent((p) => !p)}
                    className={[
                      "px-4 py-2 rounded-xl text-sm font-bold transition border",
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

          {/* Step 2 - Employee */}
          {step === 2 ? (
            <SectionCard
              title="Employee Details"
              subTitle="Designation & reporting chain"
            >
              {isAdmin ? (
                <div className="rounded-xl border app-border p-3 app-card">
                  <p className="app-text font-bold text-sm">Admin user</p>
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
                        setEmployee((p: any) => ({ ...p, designationId: v }));
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
                      placement="top"
                      placeholder="Select Designation"
                      searchable
                      error={!!errors.designationId}
                    />
                  </Field>

                  <Field
                    label="Reports To (optional)"
                    error={errors.reportsToId}
                  >
                    <SingleSelect
                      value={(employee.reportsToId as any) || ""}
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
                        ...reportsToOptions,
                      ]}
                      placeholder="Select Reports To"
                      searchable
                      placement="top"
                      error={!!errors.reportsToId}
                    />
                  </Field>
                </>
              )}
            </SectionCard>
          ) : null}

          
          {step === 3 ? (
            <div className="space-y-4">
              <SectionCard
                title="Addresses"
                subTitle="Optional. Add multiple addresses. Mark one as default."
                right={
                  <Button
                    className="md:px-3 px-2 md:py-2 py-1 font-medium btn-text rounded-xl bg-[#541796] text-white"
                    onClick={openAddAddress}
                  >
                    + Add Address
                  </Button>
                }
              >
                <div className="space-y-3">
                  {normalizeAddresses(addresses).length > 0 &&
                    normalizeAddresses(addresses).map((a, idx) => (
                      <div
                        key={a.id ?? idx}
                        className="rounded-2xl border app-border p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-sm app-text">
                              Address #{idx + 1}{" "}
                              {a.isDefault ? (
                                <span className="text-xs text-emerald-600">
                                  (Default)
                                </span>
                              ) : null}
                            </p>
                            <p className="text-xs app-muted mt-1 break-words">
                              {a.address1 || "-"}, {a.city || "-"},{" "}
                              {a.state || "-"} {a.zip || "-"},{" "}
                              {a.country || "-"}
                            </p>
                            {a.locality || a.landmark ? (
                              <p className="text-xs app-muted mt-1">
                                {a.locality ? `Locality: ${a.locality}` : ""}{" "}
                                {a.landmark ? `• Landmark: ${a.landmark}` : ""}
                              </p>
                            ) : null}
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {!a.isDefault ? (
                              <Button
                                className="app-btn px-3 py-2 rounded-xl"
                                onClick={() => setDefaultAddress(idx)}
                              >
                                Set Default
                              </Button>
                            ) : null}

                            <Button
                              className="app-btn p-2 text-blue-600 border=blue-200 rounded-xl"
                              onClick={() => openEditAddress(idx)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>

                            <Button
                              className="p-2 rounded-xl border border-rose-300 text-rose-600"
                              onClick={() => removeAddress(idx)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {!hasAnyAddressData(addresses) ? (
                    <div className="rounded-xl border app-border p-3 app-card">
                      <p className="app-text font-bold text-sm">
                        No address added
                      </p>
                      <p className="app-muted text-xs mt-1">
                        Click “Add Address” to add one.
                      </p>
                    </div>
                  ) : null}
                </div>
              </SectionCard>

              {!isAdmin && isAgent ? (
                <SectionCard
                  title="Agent Profile"
                  subTitle="Only shown when Agent is enabled"
                >
                  {/* keep your existing agent UI here (same as your code) */}
                  <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
                    <Field label="NPN" required error={errors.npn}>
                      <TextInput
                        value={agentProfile.npn}
                        onChange={(e: any) =>
                          setAgentProfile((p: any) => ({
                            ...p,
                            npn: e.target.value,
                          }))
                        }
                        placeholder="NPN"
                        error={!!errors.npn}
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
                    <div className="rounded-2xl border app-border md:p-4 p-2 flex items-center justify-between">
                      <div>
                        <p className="app-text font-bold  text-sm">
                          AHIP Certified
                        </p>
                        <p className="app-muted text-xs mt-1">
                          Enable if agent has AHIP
                        </p>
                      </div>
                      <Checkbox
                        checked={agentProfile.ahipCertified}
                        onChange={(e: any) =>
                          setAgentProfile((p: any) => ({
                            ...p,
                            ahipCertified: e.target.checked,
                          }))
                        }
                      />
                    </div>

                    <div className="rounded-2xl border app-border md:p-4 p-2 flex items-center justify-between">
                      <div>
                        <p className="app-text font-bold  label-text">
                          State Licensed
                        </p>
                        <p className="app-muted text-xs  mt-1">
                          Enable if agent has state license
                        </p>
                      </div>
                      <Checkbox
                        checked={agentProfile.stateLicensed}
                        onChange={(e: any) =>
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
                  <Field label="Apps" required error={errors.apps}>
                    <MultiSelect
                      values={agentProfile?.apps}
                      onChange={(v: any) =>
                        setAgentProfile((p: any) => ({
                          ...p,
                          apps: v,
                        }))
                      }
                      options={DEFAULT_APPS_OPTIONS}
                      placeholder="Select"
                      placement="auto"
                      error={!!errors.apps}
                    />
                  </Field>
                </SectionCard>
              ) : null}

              {isAdmin ? (
                <SectionCard
                  title="Admin User"
                  subTitle="Employee/Agent steps are skipped"
                >
                  <div className="rounded-xl border app-border p-3 app-card">
                    <p className="app-text font-bold text-sm">ADMIN user</p>
                    <p className="app-muted text-xs mt-1">
                      User core + addresses will be submitted.
                    </p>
                  </div>
                </SectionCard>
              ) : null}
            </div>
          ) : null}

        
          <div className="app-card backdrop-blur border-t app-border py-1">
            <div className="flex px-3 items-center justify-between">
              {step !== 1 &&  <Button
                className="app-btn px-4 py-2 font-medium rounded-xl"
                onClick={handleBack}
              >
                ← Back
              </Button> } 
             

              <div className="flex items-center gap-2">
                {step !== 3 ? (
                  <Button
                    className="md:px-4 px-2 md:py-2 py-1 md:text-[14px] text-[12px] font-medium rounded-xl app-card app-text hover:app-surface"
                    onClick={handleNext}
                  >
                    Next →
                  </Button>
                ) : (
                  <Button
                    className="md:px-4 px-2 md:py-2 py-1 md:text-[14px] text-[12px] rounded-xl font-medium bg-[#541796] text-white hover:bg-green-700 disabled:opacity-50"
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

      {/* Address Modal */}
      <AddressModal
        open={addrModalOpen}
        mode={addrModalMode}
        value={addrDraft}
        onClose={() => setAddrModalOpen(false)}
        onSave={saveAddress}
      />
    </>
  );
}
