"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Activity,
  Award,
  Bell,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Grid,
  Hash,
  Home,
  Key,
  Landmark,
  Lock,
  Mail,
  MapIcon,
  MapPin,
  MapPinHouse,
  Pencil,
  Phone,
  Plus,
  QrCode,
  Save,
  Settings,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  User,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";

import apiClient from "@/Utils/apiClient";

import { Field } from "@/commonComponents/form/Field";
import { TextInput } from "@/commonComponents/form/TextInput";
import { MultiSelect } from "@/commonComponents/form/MultiSelect";
import { NumberInput } from "@/commonComponents/form/NumberInput";
import { SingleSelect } from "@/commonComponents/form/SingleSelect";
import { Textarea } from "@/commonComponents/form/Textarea";
import { FileInput } from "@/commonComponents/form/FileInput";
import Modal from "@/commonComponents/Modal";
import Loader from "@/commonComponents/Loader";
import { uploadFile } from "@/Utils/uploadFile";
import Button from "@/commonComponents/Button";
import { DEFAULT_APPS_OPTIONS } from "@/Utils/constants/ara/constants";
import { twMerge } from "tailwind-merge";





type AgentProfile = {
  id?: string;
  npn: string | null;
  yearsOfExperience: number;
  ahipCertified: boolean;
  ahipProofUrl: string | null;
  stateLicensed: boolean;
  stateLicenseNumber: string | null;
  accessLevel: "TRAINING" | "ALL_ACCESS";
  removeAgentProfile?: boolean;
  chaseExt?: string | null;
  chaseDataUsername?: string | null;
  chaseDataPassword?: string | null;
  healthSherpaUsername?: string | null;
  healthSherpaPassword?: string | null;
  myMfgUsername?: string | null;
  myMfgPassword?: string | null;
  ffmUsername?: string | null;
  apps?: string[];
  isActive?: any;
};

type Address = {
  id?: string;
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  locality?: string | null;
  landmark?: string | null;
  isDefault?: boolean;
  isPrimary?: boolean;
};
export type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscNumber: string;
  accountHolderName: string;
  isPrimary: boolean;
};

type UserFull = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  dob?: string | null;
  email?: string | null;
  phone?: string | null;
  userStatus?: string | null;
  profileImage?: string | null;
  systemRole?: string | null;
  createdAt?: string;
  updatedAt?: string;
  password?: string;
 
  agentProfile?: AgentProfile | null;
  addresses?: Address[];
  bankAccounts?: BankAccount[];
};

type ModalType =
  | "profile"
 
  | "professional"
  | "address"
  | "security"
  | "bank";
type ModalMode = "add" | "edit";

function hasProfileData(u: UserFull | null) {
  if (!u) return false;
  return !!(u.firstName || u.lastName || u.email || u.phone || u.dob);
}



function hasAgentData(a: AgentProfile | null) {
  if (!a) return false;
  return !!(
    a.npn ||
    (a.yearsOfExperience ?? 0) > 0 ||
    a.stateLicensed ||
    a.ahipCertified
  );
}

function primaryAddress(addr?: Address[]) {
  if (!addr?.length) return null;
  return addr.find((a) => a.isDefault) || addr[0] || null;
}

function normalizeSSN(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}




export default function UserProfileView() {
  const params = useParams<{ id?: string }>();
  const userId =
    (params?.id as string | undefined) 
 

  const [data, setData] = useState<UserFull | null>(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);


  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("profile");
  const [modalMode, setModalMode] = useState<ModalMode>("edit");
  const [modalInitial, setModalInitial] = useState<any>({});

  const openModal = (type: ModalType, mode: ModalMode, initial: any) => {
    setModalType(type);
    setModalMode(mode);
    setModalInitial(initial ?? {});
    setModalOpen(true);
  };
 

  

  const closeModal = () => {
    setModalOpen(false);
    setModalInitial({});
  };

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`${apiClient.URLS.user}/${userId}`);

      setData(res.body as UserFull);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [userId]);

  const patchUser = async (dto: any) => {
    if (!userId) return;
    setLoading(true);
    try {
      const updated = await apiClient.patch(
        `${apiClient.URLS.user}/${userId}`,
        dto
      );

      setData(updated.body as UserFull);
      await load();
    } catch (error) {
      console.error("errror is", error);
    } finally {
      setLoading(false);
    }
  };

  const agent = data?.agentProfile || null;

  const tabs = [
    { id: "profile", label: "Profile", icon: <UserIcon /> },
    
    {
      id: "professional",
      label: "Professional",
      icon: <Shield className="w-4 h-4" />,
    },
    { id: "address", label: "Address", icon: <MapPin className="w-4 h-4" /> },
    {
      id: "bank",
      label: "Bank Details",
      icon: <Landmark className="w-4 h-4" />,
    },
    { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
  ];
  const visibleTabs = useMemo(() => {
    if (data?.systemRole === "ADMIN") {
      return tabs.filter(
        (tab) =>  tab.id !== "professional"
      );
    }
    return tabs;
  }, [data]);

  const [profileImage, setProfileImage] = useState<string>(
    data?.profileImage || ""
  );
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingProfile) return;

    try {
      setUploadingProfile(true);

      const localPreview = URL.createObjectURL(file);
      setProfileImage(localPreview);

      const url = await uploadFile(file, "users/profile");
      if (!url) throw new Error("Upload failed");

      setProfileImage(url);
      toast.success("Profile picture uploaded!");
    } catch (err) {
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadingProfile(false);

      e.target.value = "";
    }
  };

  const exportUserData = () => {
    if (!data) return;

    const fileData = JSON.stringify(data, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `user-data-${data.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    toast.success("Data exported 📤");
  };

  const saveProfile = async (v: any) => {
    const dto = {
      user: {
        firstName: v.firstName?.trim() || null,
        lastName: v.lastName?.trim() || null,
        email: v.email?.trim() || null,
        phone: v.phone?.trim() || null,
        dob: v.dob || null,
        systemRole: v?.systemRole || "",
        profileImage: v?.profileImage || profileImage || "",
      },
    };

    await patchUser(dto);
    toast.success("Profile saved ");
  };
  const getId = (x: any) => {
    if (!x) return null;

    // if select returns uuid directly
    if (typeof x === "string") return x;

    // common select shapes
    return x.id ?? x.value ?? null;
  };
  const PasswordToggle = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
  <Button
    type="button"
    onClick={toggle}
    className="cursor-pointer p-1 bg-transparent hover:bg-transparent"
  >
    {show ? <EyeOff size={16} /> : <Eye size={16} />}
  </Button>
);


 

  const saveProfessional = async (v: any) => {
    const dto = {
      agentProfile: {
        ...(data?.agentProfile?.id ? { id: data.agentProfile.id } : {}),
        npn: v.npn?.trim() || null,
        yearsOfExperience: Number(v.yearsOfExperience ?? 0),
        ahipCertified: !!v.ahipCertified,
        ahipProofUrl: v.ahipProofUrl?.trim() || null,
        stateLicensed: !!v.stateLicensed,
        stateLicenseNumber: v.stateLicensed
          ? v.stateLicenseNumber?.trim() || null
          : null,
        accessLevel: v.accessLevel || "TRAINING",
        removeAgentProfile: !!v.removeAgentProfile,
        chaseExt: v.chaseExt?.trim() || null,
        chaseDataUsername: v.chaseDataUsername?.trim() || null,
        chaseDataPassword: v.chaseDataPassword?.trim() || null,
        healthSherpaUsername: v.healthSherpaUsername?.trim() || null,
        healthSherpaPassword: v.healthSherpaPassword?.trim() || null,
        myMfgUsername: v.myMfgUsername?.trim() || null,
        myMfgPassword: v.myMfgPassword?.trim() || null,
        ffmUsername: v.ffmUsername?.trim() || null,
        apps: v.apps?.length ? v.apps : [],
      },
    };

    await patchUser(dto);
    toast.success("Professional details saved");
  };

  
  const savePassword = async (v: any) => {
    if (v.newPassword !== v.confirmPassword) {
      toast.error("Passwords do not match ");
      return;
    }

    const dto = {
      oldPassword: v.password,
      newPassword: v.newPassword,
      confirmNewPassword: v.confirmPassword,
    };

    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.user}/${userId}/password`,
        dto,

        true
      );

      if (res.status === 200) {
        toast.success("Password updated ");
      }
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full items-center flex justify-center">
        <Loader />
      </div>
    );
  }

  const statusLabel = data?.userStatus || "-";
  const createdAt = data?.createdAt;
  const lastLogin = undefined;

  const renderProfileTab = () => {
    const mode: ModalMode = hasProfileData(data) ? "edit" : "add";
    const init = {
      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      email: data?.email || "",
      phone: data?.phone || "",
      dob: data?.dob || "",
      systemRole: data?.systemRole || "",
      profileImage: data?.profileImage || profileImage || "",
    };

    return (
      <div className="space-y-6 animate-fadeIn app-surface md:p-6 p-2">
        {/* Header Card */}
        <div className="app-gradient rounded-2xl md:p-6 p-2 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon big />
                )}
              </div>

              {/* Upload button */}
              <label className="absolute bottom-2 right-2 w-10 h-10 rounded-full app-card flex items-center justify-center cursor-pointer transition-colors shadow-lg hover:bg-[rgb(var(--btnHover))]">
                <Upload className="w-4 h-4 text-[rgb(var(--muted))]" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {/* Verified badge */}
              <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-800 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 app-text">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="md:text-3xl text-[14px]  font-bold app-heading">
                    {(data?.firstName || "-") + " " + (data?.lastName || "")}
                  </h1>

                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 md:text-sm text-[12px]  font-bold rounded-full">
                      {statusLabel}
                    </span>

                    <span className="md:text-sm text-[12px] app-muted">
                      User ID: {data?.id}
                    </span>
                  </div>

                  
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => openModal("profile", mode, init)}
                    className="flex items-center  font-medium text-nowrap gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    {mode === "edit" ? (
                      <Pencil className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {mode === "edit" ? "Edit Profile" : "Add Profile"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SectionCard
          title="Personal Information"
          icon={<Mail className="w-5 h-5 text-blue-500" />}
          actionLabel={mode === "edit" ? "Edit" : "Add"}
          actionIcon={
            mode === "edit" ? (
              <Pencil className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )
          }
          onAction={() => openModal("profile", mode, init)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <KV
              icon={<UserIcon />}
              label="First Name"
              value={data?.firstName}
            />
            <KV icon={<UserIcon />} label="Last Name" value={data?.lastName} />
            <KV
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              value={data?.email}
            />
            <KV
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              value={data?.phone}
            />
            <KV
              icon={<Calendar className="w-4 h-4" />}
              label="DOB"
              value={data?.dob}
            />
            <KV
              icon={<Shield className="w-4 h-4" />}
              label="System Role"
              value={data?.systemRole}
            />
          </div>
        </SectionCard>
      </div>
    );
  };

  

  const renderProfessionalTab = () => {
    const a = data?.agentProfile || null;
    const mode: ModalMode = hasAgentData(a) ? "edit" : "add";

    const init: AgentProfile = {
      id: a?.id,
      npn: a?.npn ?? null,
      yearsOfExperience: a?.yearsOfExperience ?? 0,
      ahipCertified: a?.ahipCertified ?? false,
      ahipProofUrl: a?.ahipProofUrl ?? null,
      stateLicensed: a?.stateLicensed ?? false,
      stateLicenseNumber: a?.stateLicenseNumber ?? null,
      accessLevel: a?.accessLevel ?? "TRAINING",

      chaseExt: a?.chaseExt ?? null,
      chaseDataUsername: a?.chaseDataUsername ?? null,
      chaseDataPassword: a?.chaseDataPassword ?? null,
      healthSherpaUsername: a?.healthSherpaUsername ?? null,
      healthSherpaPassword: a?.healthSherpaPassword ?? null,
      myMfgUsername: a?.myMfgUsername ?? null,
      myMfgPassword: a?.myMfgPassword ?? null,
      ffmUsername: a?.ffmUsername ?? null,
      apps: a?.apps ?? [],
    };

    return (
      <div className="space-y-6 p-6">
        <SectionCard
          title="Professional Information"
          actionLabel={mode === "edit" ? "Edit" : "Add"}
          icon={<Shield className="w-5 h-5 text-indigo-500" />}
          actionIcon={
            mode === "edit" ? (
              <Pencil className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )
          }
          onAction={() => openModal("professional", mode, init)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KV
              icon={<Award className="w-4 h-4" />}
              label="NPN"
              value={a?.npn ?? "-"}
            />
            <KV
              icon={<TrendingUp className="w-4 h-4" />}
              label="Experience"
              value={a?.yearsOfExperience ?? 0}
            />
            <KV
              icon={<Key className="w-4 h-4" />}
              label="Access Level"
              value={a?.accessLevel ?? "TRAINING"}
            />
            <KV
              icon={<CheckCircle className="w-4 h-4" />}
              label="AHIP Certified"
              value={a?.ahipCertified ? "Yes" : "No"}
            />
            <KV
              icon={<CheckCircle className="w-4 h-4" />}
              label="State Licensed"
              value={a?.stateLicensed ? "Yes" : "No"}
            />

            {a?.stateLicensed && (
              <KV
                icon={<FileText className="w-4 h-4" />}
                label="License No"
                value={a?.stateLicenseNumber ?? "-"}
              />
            )}

            <KV
              icon={<Phone className="w-4 h-4" />}
              label="Chase Ext"
              value={a?.chaseExt ?? "-"}
            />

            <KV
              icon={<User className="w-4 h-4" />}
              label="Chase Data Username"
              value={a?.chaseDataUsername ?? "-"}
            />

            <KV
              icon={<Lock className="w-4 h-4" />}
              label="Chase Data Password"
              value={a?.chaseDataPassword ? "••••••••" : "-"}
            />

            <KV
              icon={<User className="w-4 h-4" />}
              label="HealthSherpa Username"
              value={a?.healthSherpaUsername ?? "-"}
            />

            <KV
              icon={<Lock className="w-4 h-4" />}
              label="HealthSherpa Password"
              value={a?.healthSherpaPassword ? "••••••••" : "-"}
            />

            <KV
              icon={<User className="w-4 h-4" />}
              label="myMFG Username"
              value={a?.myMfgUsername ?? "-"}
            />

            <KV
              icon={<Lock className="w-4 h-4" />}
              label="myMFG Password"
              value={a?.myMfgPassword ? "••••••••" : "-"}
            />

            <KV
              icon={<User className="w-4 h-4" />}
              label="FFM Username"
              value={a?.ffmUsername ?? "-"}
            />

            <KV
              icon={<Grid className="w-4 h-4" />}
              label="Apps"
              value={a?.apps?.length ? a.apps.join(", ") : "-"}
            />
          </div>
        </SectionCard>
      </div>
    );
  };

  const renderSecurityTab = () => {
    const init = {
      password: data?.password ?? "",
      newPassword: "",
      confirmPassword: "",
    };

    return (
      <div className="space-y-6 animate-fadeIn p-6">
        <SectionCard
          title="Change Password"
          icon={<Lock className="w-5 h-5 text-red-500" />}
          actionLabel="Update Password"
          actionIcon={<Pencil className="w-4 h-4" />}
          onAction={() => openModal("security", "edit", init)}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-20 app-border  app-card p-4">
              <div className="md:text-sm text-[12px]  font-bold app-text">
                Password
              </div>
              <div className="mt-2 md:text-sm text-[12px] app-text">
                •••••••• (hidden)
              </div>
              <div className="mt-3 text-xs app-text">
                For security reasons we never display your password. Click
                “Update Password” to change it.
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  };

  const saveBank = async (v: any) => {
    if (!userId) return;

    const payload = {
      bankName: v.bankName?.trim(),
      accountNumber: v.accountNumber?.trim(),
      ifscNumber: v.ifscNumber?.trim(),
      accountHolderName: v.accountHolderName?.trim(),
      isPrimary: !!v.isPrimary,
    };

    // optimistic primary change
    if (payload.isPrimary && v?.id) {
      setData((prev: any) => {
        const list = prev?.bankAccounts ?? [];
        return {
          ...prev,
          bankAccounts: list.map((b: any) => ({
            ...b,
            isPrimary: b.id === v.id,
          })),
        };
      });
    }

    try {
      setLoading(true);

      const res = v?.id
        ? await apiClient.patch(
            `${apiClient.URLS.user}/${userId}/bank-accounts/${v.id}`,
            payload,
            true
          )
        : await apiClient.post(
            `${apiClient.URLS.user}/${userId}/bank-accounts`,
            payload,
            true
          );

      if (res?.status === 200 || res?.status === 201) {
        toast.success(v?.id ? "Bank updated" : "Bank added");
      } else {
        toast.success(v?.id ? "Bank updated" : "Bank added");
      }

      await load();
    } catch (e: any) {
      console.error("saveBank error", e);
      toast.error(e?.body?.message || e?.message || "Failed to save bank");
      await load(); // rollback optimistic
    } finally {
      setLoading(false);
    }
  };

  const deleteBank = async (bankId: string) => {
    if (!userId || !bankId) return;

    try {
      setLoading(true);
      const res = await apiClient.delete(
        `${apiClient.URLS.user}/${userId}/bank-accounts/${bankId}`,
        {},
        true
      );

      if (res?.status === 200 || res?.status === 204) {
        toast.success("Bank deleted");
      } else {
        toast.success("Bank deleted");
      }
      await load();
    } catch (e: any) {
      console.error("deleteBank error", e);
      toast.error(e?.body?.message || e?.message || "Failed to delete bank");
    } finally {
      setLoading(false);
    }
  };

  const setPrimaryBank = async (bankId: string) => {
    if (!userId || !bankId) return;

    // optimistic UI
    setData((prev: any) => {
      const list = prev?.bankAccounts ?? [];
      return {
        ...prev,
        bankAccounts: list.map((b: any) => ({
          ...b,
          isPrimary: b.id === bankId,
        })),
      };
    });

    try {
      setLoading(true);

      const res = await apiClient.patch(
        `${apiClient.URLS.user}/${userId}/bank-accounts/${bankId}/primary`,
        {},
        true
      );

      if (res?.status === 200) toast.success("Primary bank updated");

      await load();
    } catch (e: any) {
      console.error("setPrimaryBank error", e);
      toast.error(e?.body?.message || e?.message || "Failed to set primary");
      await load(); // rollback by reload
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async (v: any) => {
    if (!userId) return;

    const payload = {
      address1: v.address1?.trim(),
      address2: v.address2?.trim() || null,
      city: v.city?.trim(),
      state: v.state?.trim(),
      zip: v.zip?.trim(),
      country: v.country?.trim(),
      locality: v.locality?.trim() || null,
      landmark: v.landmark?.trim() || null,
      isDefault: v.isDefault ?? true,
    };

    try {
      setLoading(true);
      let res;

      if (v?.id) {
        let res = await apiClient.patch(
          `${apiClient.URLS.user}/${userId}/addresses/${v?.id}`,
          payload
        );
        if (res.status === 200) {
          toast.success("Address updated");
        }
      } else {
        let res = await apiClient.post(
          `${apiClient.URLS.user}/${userId}/addresses`,
          payload
        );
        if (res.statas === 200) {
          toast.success("Address added");
        }
      }

      await load();
    } catch (e: any) {
      console.error("saveAddress error", e);
      toast.error(e?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addr: any) => {
    if (!userId || !addr?.id) return;

    try {
      setLoading(true);
      let res = await apiClient.delete(
        `${apiClient.URLS.user}/${userId}/addresses/${addr.id}`,
        {}
      );

      if (res.status === 200) {
        toast.success("Address deleted");
      }

      await load();
    } catch (e: any) {
      console.error("deleteAddress error", e);
      toast.error(e?.message || "Failed to delete address");
    } finally {
      setLoading(false);
    }
  };
  const renderBankTab = () => {
    const bankList = (
      (data as any)?.bankAccounts ??
      (data as any)?.bank_accounts ??
      []
    ).sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

    const emptyInit = {
      bankName: "",
      accountNumber: "",
      ifscNumber: "",
      accountHolderName: "",
      isPrimary: bankList.length === 0,
    };

    return (
      <div className="space-y-6 animate-fadeIn p-6">
        <SectionCard
          title="Bank Accounts"
          icon={<Landmark className="w-5 h-5 text-emerald-500" />}
          actionLabel="Add Bank"
          actionIcon={<Plus className="w-4 h-4" />}
          onAction={() => openModal("bank", "add", emptyInit)}
        >
          {bankList.length > 0 ? (
            <div className="space-y-4">
              {bankList.map((b: any, i: number) => (
                <div
                  key={b.id}
                  className="rounded-xl border app-border app-surface md:p-4 p-2 relative hover:scale-[1.01] transition-all"
                >
                  {b.isPrimary && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs app-text font-bold">
                        Primary
                      </span>
                    </div>
                  )}

                  <div className="text-xs font-medium text-slate-400 mb-2">
                    Bank #{i + 1}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <KV
                      label="Bank Name"
                      value={b.bankName}
                      icon={<Landmark className="w-4 h-4" />}
                    />
                    <KV
                      label="Holder Name"
                      value={b.accountHolderName}
                      icon={<UserIcon />}
                    />
                    <KV
                      label="Account No"
                      value={b.accountNumber}
                      icon={<FileText className="w-4 h-4" />}
                    />
                    <KV
                      label="IFSC"
                      value={b.ifscNumber}
                      icon={<Hash className="w-4 h-4" />}
                    />
                    <KV
                      label="Verified"
                      value={b.isVerified ? "Yes" : "No"}
                      icon={<Shield className="w-4 h-4" />}
                    />
                  </div>

                  <div className="mt-3">
                    {!b.isPrimary && (
                      <Button
                        onClick={() => setPrimaryBank(b.id)}
                        className="
        inline-flex items-center gap-1.5
        px-3.5 py-2 rounded-xl btn-txt font-medium
        app-surface hover:app-card
        app-text
        border border-gray-300 dark:border-gray-600
        transition-all cursor-pointer
        shadow-xs hover:shadow-md
      "
                      >
                        <Star className="w-4 h-4 text-emerald-500" />
                        Set Primary
                      </Button>
                    )}
                  </div>

                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <Button
                      type="button"
                      className="app-text transition"
                      onClick={() => openModal("bank", "edit", b)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      type="button"
                      className="text-red-600 hover:text-red-700 transition"
                      onClick={() => deleteBank(b.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <Landmark className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                No Bank Accounts Added
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Add a bank account to receive payouts.
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    );
  };

  const renderAddressTab = () => {
    const addressList = data?.addresses ?? [];

    const mode: ModalMode = "add";

    const emptyInit = {
      address1: "",
      address2: null,
      city: "",
      state: "",
      zip: "",
      country: "",
      locality: null,
      landmark: null,
      isDefault: addressList.length === 0,
    };

    return (
      <div className="space-y-6 animate-fadeIn p-6">
        <SectionCard
          title="Address Information"
          icon={<MapPin className="w-5 h-5 text-emerald-500" />}
          actionLabel="Add Address"
          actionIcon={<Plus className="w-4 h-4" />}
          onAction={() => openModal("address", "add", emptyInit)}
        >
          {addressList.length > 0 ? (
            <div className="space-y-4">
              {addressList.map((addr: any, i: number) => (
                <div
                  key={addr.id}
                  className="rounded-xl border app-border app-surface md:p-4 p-2 relative hover:scale-[1.01] transition-all"
                >
                  {addr.isDefault && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs app-text font-bold">
                        Primary
                      </span>
                    </div>
                  )}

                  <div className="text-xs font-medium text-slate-400 mb-2">
                    Address #{i + 1}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <KV
                      icon={<Home className="w-4 h-4" />}
                      label="Address 1"
                      value={addr.address1}
                    />
                    <KV
                      icon={<Building className="w-4 h-4" />}
                      label="City"
                      value={addr.city}
                    />
                    <KV
                      icon={<MapIcon className="w-4 h-4" />}
                      label="State"
                      value={addr.state}
                    />
                    <KV
                      icon={<FileText className="w-4 h-4" />}
                      label="ZIP"
                      value={addr.zip}
                    />
                    <KV
                      icon={<Globe className="w-4 h-4" />}
                      label="Country"
                      value={addr.country}
                    />
                    {addr.address2 && (
                      <div className="mt-2">
                        {" "}
                        <KV
                          icon={<Plus className="w-3 h-3" />}
                          label="Address 2"
                          value={addr.address2}
                        />{" "}
                      </div>
                    )}{" "}
                    {(addr.locality || addr.landmark) && (
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {" "}
                        {addr.locality && (
                          <KV
                            label="Locality"
                            value={addr.locality}
                            icon={<MapPinHouse size={16} />}
                          />
                        )}{" "}
                        {addr.landmark && (
                          <KV
                            label="Landmark"
                            value={addr.landmark}
                            icon={<Landmark size={16} />}
                          />
                        )}{" "}
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <Button
                      type="button"
                      className="app-text transition"
                      onClick={() => openModal("address", "edit", addr)} // ✅ edit only here
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      type="button"
                      className="text-red-600 hover:text-red-700 transition"
                      onClick={() => handleDeleteAddress(addr)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                No Address Added
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Add your address to complete your profile
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
     
      case "professional":
        return renderProfessionalTab();
      case "security":
        return renderSecurityTab();
      case "address":
        return renderAddressTab();
      case "bank":
        return renderBankTab();

      case "activity":
        return (
          <div className="text-center py-12 app-card">
            <Activity className="w-16 h-16 app-text mx-auto mb-4" />
            <h3 className="text-lg  font-bold app-text">Activity Log</h3>
            <p className="app-text">Your activity history will appear here</p>
          </div>
        );
      default:
        return renderProfileTab();
    }
  };

  return (
    <>
      <div className="min-h-screen app-surface p-4 md:p-6">
        <div className="max-w-7xl ">
          <div className=" mb-3">
            <h1 className="md:text-2xl text-[18px]  font-bold bg-linear-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              User Profile
            </h1>

            <p className="app-text label-text ">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="flex flex-col lg:flex-row md:gap-6 gap-3">
            <div className="lg:w-1/4">
              <div className="app-card rounded-2xl shadow-lg border app-border md:p-4 p-2 sticky top-6">
                <div className="space-y-2">
                  {visibleTabs.map((t) => (
                    <Button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`w-full flex items-center gap-3 font-medium px-4 py-3 rounded-xl transition-all duration-300 ${
                        activeTab === t.id
                          ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg"
                          : " app-text"
                      }`}
                    >
                      {t.icon}
                      <span className=" font-medium">{t.label}</span>
                      <ChevronRight
                        className={`w-4 h-4 ml-auto transition-transform ${
                          activeTab === t.id ? "rotate-90" : ""
                        }`}
                      />
                    </Button>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t app-border ">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm app-text">Member Since</span>
                      <span className="text-sm  font-medium app-text">
                        {createdAt
                          ? new Date(createdAt).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm app-text">Last Login</span>
                      <span className="text-sm  font-medium app-text">
                        {lastLogin
                          ? new Date(lastLogin).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm app-text">Account Status</span>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs  font-bold rounded-full">
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm app-text rounded-lg transition-colors"
                    onClick={exportUserData}
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:w-3/4 w-full">
              <div className="app-surface rounded-2xl shadow-lg border app-border ">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.4s ease-out;
          }
        `}</style>
      </div>

      <ProfileModal
        open={modalOpen}
        onClose={closeModal}
        type={modalType}
        mode={modalMode}
        initialValues={modalInitial}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        PasswordToggle={PasswordToggle}
       
        onSave={async (values) => {
          if (modalType === "profile") return saveProfile(values);
          
          if (modalType === "professional") return saveProfessional(values);
          if (modalType === "address") return saveAddress(values);
          if (modalType === "security") return savePassword(values);
          if (modalType === "bank") return saveBank(values);
        }}
      />
    </>
  );
}

type Option = { label: string; value: string };

function ProfileModal({
  open,
  onClose,
  type,
  mode,
  initialValues,
  onSave,
  showPassword,
  setShowPassword,
 
  PasswordToggle
}: {
  open: boolean;
  onClose: () => void;
  type: ModalType;
  mode: ModalMode;
  initialValues: any;
  PasswordToggle: React.ComponentType<any>;

  onSave: (values: any) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;

 
}) {
  const [values, setValues] = useState<any>(initialValues || {});
  const [saving, setSaving] = useState(false);

  

  useEffect(() => setValues(initialValues || {}), [initialValues]);



  if (!open) return null;

  const set = (k: string, v: any) => setValues((p: any) => ({ ...p, [k]: v }));

  const title =
    type === "profile"
      ? mode === "edit"
        ? "Edit Profile"
        : "Add Profile"
      : type === "bank"
      ? mode === "edit"
        ? "Edit Bank Account"
        : "Add Bank Account"
      :type === "professional"
      ? mode === "edit"
        ? "Edit Professional"
        : "Add Professional"
      : type === "address"
      ? mode === "edit"
        ? "Edit Address"
        : "Add Address"
      : "Change Password";

  const validate = () => {
    if (type === "profile") {
      if (!values.firstName?.trim()) return "First name is required";
      if (!values.email?.trim()) return "Email is required";
    }

    

    if (type === "security") {
      if (!values.password || !values.newPassword || !values.confirmPassword)
        return "Fill all password fields";
      if (values.newPassword !== values.confirmPassword)
        return "New password and confirm password mismatch";
    }

    if (type === "address") {
      if (!values.address1?.trim()) return "Address line 1 is required";
      if (!values.city?.trim()) return "City is required";
      if (!values.state?.trim()) return "State is required";
      if (!values.zip?.trim()) return "ZIP is required";
      if (!values.country?.trim()) return "Country is required";
    }
    if (type === "bank") {
      if (!values.bankName?.trim()) return "Bank name is required";
      if (!values.accountHolderName?.trim())
        return "Account holder name is required";
      if (!values.accountNumber?.trim()) return "Account number is required";
      if (!values.ifscNumber?.trim()) return "IFSC is required";
    }

    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return toast.error(err);

    try {
      setSaving(true);
      await onSave(values);
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={title}
      scrollBody={true}
      // optional: make body taller scroll
      bodyClassName="h-full overflow-y-auto"
      primaryAction={{
        label: saving ? "Saving..." : "Save",
        onClick: handleSave,
        disabled: saving,
        loading: saving,
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: onClose,
        disabled: saving,
      }}
    >
      {type === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-2">
          <Field label="First Name" required>
            <TextInput
              value={values.firstName || ""}
              onChange={(e: any) => set("firstName", e.target.value)}
              placeholder="First Name"
            />
          </Field>

          <Field label="Last Name">
            <TextInput
              value={values.lastName || ""}
              onChange={(e: any) => set("lastName", e.target.value)}
              placeholder="Last Name"
            />
          </Field>

          <Field label="Email" required>
            <TextInput
              value={values.email || ""}
              onChange={(e: any) => set("email", e.target.value)}
              placeholder="Email"
            />
          </Field>

          <Field label="Phone">
            <TextInput
              value={values.phone || ""}
              onChange={(e: any) => set("phone", e.target.value)}
              placeholder="Phone"
            />
          </Field>

          <Field label="DOB">
            <TextInput
              type="date"
              value={values.dob || ""}
              onChange={(e: any) => set("dob", e.target.value)}
              placeholder="DOB"
            />
          </Field>
          <Field label="System Role" required>
            <SingleSelect
              value={values.systemRole || ""}
              onChange={(v: any) => set("systemRole", v)}
              options={[
                { label: "Admin", value: "ADMIN" },
                { label: "Standard", value: "STANDARD" },
              ]}
              placeholder="Select Role"
              placement="auto"
            />
          </Field>
        </div>
      )}
      {type === "bank" && (
        <div className="md:space-y-4 space-y-2">
          <Field label="Bank Name" required>
            <TextInput
              value={values.bankName || ""}
              onChange={(e: any) => set("bankName", e.target.value)}
              placeholder="HDFC / SBI / ICICI..."
              className="w-full"
            />
          </Field>

          <Field label="Account Holder Name" required>
            <TextInput
              value={values.accountHolderName || ""}
              onChange={(e: any) => set("accountHolderName", e.target.value)}
              placeholder="Name as per bank"
              className="w-full"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Account Number" required>
              <TextInput
                value={values.accountNumber || ""}
                onChange={(e: any) => set("accountNumber", e.target.value)}
                placeholder="XXXXXXXXXXXX"
                className="w-full"
              />
            </Field>

            <Field label="IFSC" required>
              <TextInput
                value={values.ifscNumber || ""}
                onChange={(e: any) => set("ifscNumber", e.target.value)}
                placeholder="IFSC Code"
                className="w-full"
              />
            </Field>
          </div>

          <div className="pt-2">
            <ToggleInline
              label="Set as Primary"
              checked={!!values.isPrimary}
              onChange={(v) => set("isPrimary", v)}
            />
          </div>
          {!values.isPrimary && (
            <p className="md:text-xs text-[10px] mt-1 font-medium app-muted">
              If you set this as Primary, existing primary account will be
              unmarked.
            </p>
          )}

          {values?.isVerified !== undefined ? (
            <p className="text-xs app-muted">
              Verification:{" "}
              <span className="font-semibold">
                {values.isVerified ? "Verified" : "Not verified"}
              </span>
            </p>
          ) : null}
        </div>
      )}

      {type === "address" && (
        <div className="md:space-y-4 space-y-2">
          <Field label="Address Line 1" required>
            <TextInput
              value={values.address1 || ""}
              onChange={(e: any) => set("address1", e.target.value)}
              placeholder="House/Street"
              className="w-full"
            />
          </Field>

          <Field label="Address Line 2">
            <TextInput
              value={values.address2 || ""}
              onChange={(e: any) => set("address2", e.target.value)}
              placeholder="Apartment, Floor, etc."
              className="w-full"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
            <Field label="City" required>
              <TextInput
                value={values.city || ""}
                onChange={(e: any) => set("city", e.target.value)}
                placeholder="City"
                className="w-full"
              />
            </Field>

            <Field label="State" required>
              <TextInput
                value={values.state || ""}
                onChange={(e: any) => set("state", e.target.value)}
                placeholder="State"
                className="w-full"
              />
            </Field>

            <Field label="ZIP" required>
              <TextInput
                value={values.zip || ""}
                onChange={(e: any) => set("zip", e.target.value)}
                placeholder="ZIP Code"
                className="w-full"
              />
            </Field>

            <Field label="Country" required>
              <TextInput
                value={values.country || ""}
                onChange={(e: any) => set("country", e.target.value)}
                placeholder="Country"
                className="w-full"
              />
            </Field>
          </div>

          <Field label="Locality">
            <TextInput
              value={values.locality || ""}
              onChange={(e: any) => set("locality", e.target.value)}
              placeholder="Locality"
              className="w-full"
            />
          </Field>

          <Field label="Landmark">
            <TextInput
              value={values.landmark || ""}
              onChange={(e: any) => set("landmark", e.target.value)}
              placeholder="Landmark"
              className="w-full"
            />
          </Field>

          <div className="pt-2">
            <ToggleInline
              label="Default / Primary Address"
              checked={values.isDefault ?? true}
              onChange={(v) => set("isDefault", v)}
            />
          </div>
        </div>
      )}

    

      {type === "professional" && (
        <div className="md:space-y-4 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="NPN">
              <TextInput
                value={values.npn || ""}
                onChange={(e: any) => set("npn", e.target.value)}
                placeholder="NPN"
              />
            </Field>

            <Field label="Years of Experience">
              <TextInput
                type="number"
                value={values.yearsOfExperience ?? 0}
                onChange={(e: any) =>
                  set("yearsOfExperience", Number(e.target.value))
                }
                placeholder="Years"
              />
            </Field>

            <Field label="Access Level">
              <TextInput
                value={values.accessLevel || "TRAINING"}
                onChange={(e: any) => set("accessLevel", e.target.value)}
                placeholder="TRAINING / ALL_ACCESS"
              />
            </Field>

            <Field label="Chase Ext">
              <TextInput
                value={values.chaseExt || ""}
                onChange={(e: any) => set("chaseExt", e.target.value)}
                placeholder="Chase extension"
              />
            </Field>
          </div>

          <ToggleInline
            label="AHIP Certified"
            checked={!!values.ahipCertified}
            onChange={(v) => set("ahipCertified", v)}
          />

          {values.ahipCertified && (
            <Field label="AHIP Proof URL">
              <TextInput
                value={values.ahipProofUrl || ""}
                onChange={(e: any) => set("ahipProofUrl", e.target.value)}
                placeholder="https://..."
              />
            </Field>
          )}

          <ToggleInline
            label="State Licensed"
            checked={!!values.stateLicensed}
            onChange={(v) => set("stateLicensed", v)}
          />

          {values.stateLicensed && (
            <Field label="State License Number">
              <TextInput
                value={values.stateLicenseNumber || ""}
                onChange={(e: any) => set("stateLicenseNumber", e.target.value)}
                placeholder="License Number"
              />
            </Field>
          )}

          {/* --- Credentials section --- */}
          <div className="rounded-2xl border app-border p-4 md:space-y-3 space-y-2">
            <p className="font-bold app-text text-sm">Portal Credentials</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Chase Data Username">
                <TextInput
                  value={values.chaseDataUsername || ""}
                  onChange={(e: any) =>
                    set("chaseDataUsername", e.target.value)
                  }
                  placeholder="Username"
                />
              </Field>

              <Field label="Chase Data Password">
                <TextInput
                   type={showPassword ? "text" : "password"}
                  value={values.chaseDataPassword || ""}
                  onChange={(e: any) =>
                    set("chaseDataPassword", e.target.value)
                  }
                  rightIcon={<PasswordToggle />}
                  placeholder="Password"
                />
              </Field>

              <Field label="HealthSherpa Username">
                <TextInput
                  value={values.healthSherpaUsername || ""}
                  onChange={(e: any) =>
                    set("healthSherpaUsername", e.target.value)
                  }
                  placeholder="Username"
                />
              </Field>

              <Field label="HealthSherpa Password">
                <TextInput
                 type={showPassword ? "text" : "password"}
                  value={values.healthSherpaPassword || ""}
                  onChange={(e: any) =>
                    set("healthSherpaPassword", e.target.value)
                  }
                  placeholder="Password"
                  rightIcon={<PasswordToggle />}
                />
              </Field>

              <Field label="myMFG Username">
                <TextInput
                  value={values.myMfgUsername || ""}
                  onChange={(e: any) => set("myMfgUsername", e.target.value)}
                  placeholder="Username"
                />
              </Field>

              <Field label="myMFG Password">
                <TextInput
                type={showPassword ? "text" : "password"}
                  value={values.myMfgPassword || ""}
                  onChange={(e: any) => set("myMfgPassword", e.target.value)}
                  placeholder="Password"
                  rightIcon={<PasswordToggle />}
                />
              </Field>

              <Field label="FFM Username">
                <TextInput
                  value={values.ffmUsername || ""}
                  onChange={(e: any) => set("ffmUsername", e.target.value)}
                  placeholder="FFM username"
                />
              </Field>
            </div>
          </div>

         
        
          <Field label="Apps">
            <MultiSelect
              values={values.apps || []}
              onChange={(v: any) => set("apps", v)}
              options={DEFAULT_APPS_OPTIONS}
              placeholder="Select Apps"
              placement="auto"
            />
          </Field>
        </div>
      )}

      {type === "security" && (
        <div className="space-y-2 md:space-y-4">
          <Field label="Current Password" required>
            <TextInput
              type={showPassword ? "text" : "password"}
              value={values.password || ""}
              onChange={(e: any) => set("password", e.target.value)}
              placeholder="Current Password"
            />
          </Field>

          <Field label="New Password" required>
            <TextInput
              type={showPassword ? "text" : "password"}
              value={values.newPassword || ""}
              onChange={(e: any) => set("newPassword", e.target.value)}
              placeholder="New Password"
            />
          </Field>

          <Field label="Confirm New Password" required>
            <TextInput
              type={showPassword ? "text" : "password"}
              value={values.confirmPassword || ""}
              onChange={(e: any) => set("confirmPassword", e.target.value)}
              placeholder="Confirm New Password"
            />
          </Field>

          <Button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center gap-2 text-sm app-text hover:app-text"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showPassword ? "Hide Passwords" : "Show Passwords"}
          </Button>
        </div>
      )}

      {/* <div className="px-5 py-4 border-t app-border flex items-center justify-end gap-2">
          <Button
            onClick={onClose}
            className="px-4 py-2 rounded-xl btn-txt hover:app-surface app-text font-medium app-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl btn-txt bg-linear-to-r from-emerald-500 to-teal-500 text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div> */}
    </Modal>
  );
}

function SectionCard({
  title,
  icon,
  actionLabel,
  actionIcon,
  onAction,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  actionLabel: string;
  actionIcon: React.ReactNode;
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="app-card rounded-2xl md:p-6 p-2 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="md:p-2 p-1 app-text rounded-lg border border-slate-200 dark:border-slate-700">
            {icon}
          </div>
          <h3 className="md:text-lg text-[12px]  font-bold app-text">
            {title}
          </h3>
        </div>

        <Button
          onClick={onAction}
          className="flex items-center font-medium text-nowrap  gap-2 md:px-4 px-2  py-1 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all"
        >
          {actionIcon}
          {actionLabel}
        </Button>
      </div>

      {children}
    </div>
  );
}

function KV({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <div className="flex items-center md:gap-3 gap-1  md:px-3 md:py-[5px] p-1 rounded-xl border border-slate-200 app-card">
      <div className="w-9 h-9 rounded-lg app-card flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="md:text-xs text-[12px]  font-medium app-text">
          {label}
        </div>
        <div className="md:text-sm  text-[10px]  font-bold app-text truncate">
          {value ?? "-"}
        </div>
      </div>
    </div>
  );
}

function ToggleInline({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border app-border app-card">
      <div className="font-medium label-text app-text">{label}</div>

      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />

        <div
          className={twMerge(
            "w-11 h-6 rounded-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all",
            "bg-gray-300 dark:bg-gray-700", // ✅ Unchecked gray based on theme
            checked &&
              "peer-checked:bg-emerald-500 peer-checked:after:translate-x-full"
          )}
        />
      </label>
    </div>
  );
}

function UserIcon({ big }: { big?: boolean }) {
  const cls = big ? "w-16 h-16 text-white" : "w-4 h-4";
  return (
    <svg
      className={cls}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
    </svg>
  );
}
