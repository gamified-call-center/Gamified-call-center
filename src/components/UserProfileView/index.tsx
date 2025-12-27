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
  TrendingUp,
  Upload,
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

type Designation = { id: number; name: string; levelOrder?: number };
type UserMini = {
  id: string;
  firstName: string;
  lastName: string;
  designation: any;
};

type Employee = {
  id?: string;
  designation?: Designation | null;
  reportsTo?: {
    id: string;
    user: UserMini;
    designation?: Designation | null;
  } | null;
  isActive?: boolean;
};

type AgentProfile = {
  id?: string;
  npn?: string | null;
  yearsOfExperience?: number | null;
  ahipCertified?: boolean;
  ahipProofUrl?: string | null;
  stateLicenseNumber?: string | null;
  stateLicensed?: boolean;
  accessLevel?: string | null;
  isActive?: boolean;

  performanceScore?: number;
  dealsClosed?: number;
  totalRevenue?: number;
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

  employee?: Employee | null;
  agentProfile?: AgentProfile | null;
  addresses?: Address[];
};

type ModalType =
  | "profile"
  | "employee"
  | "professional"
  | "address"
  | "security";
type ModalMode = "add" | "edit";

function hasProfileData(u: UserFull | null) {
  if (!u) return false;
  return !!(u.firstName || u.lastName || u.email || u.phone || u.dob);
}

function hasEmployeeData(e: Employee | null) {
  if (!e) return false;
  return !!(e.designation?.id || e.reportsTo?.id);
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

const toDesignationOption = (d?: any): Option | null => {
  if (!d?.id) return null;
  return { label: d?.name ?? "-", value: String(d.id) };
};

const toEmployeeOption = (emp?: any): Option | null => {
  if (!emp?.id) return null;

  const name = emp?.user
    ? `${emp.user.firstName ?? ""} ${emp.user.lastName ?? ""}`.trim()
    : "Employee";

  const desg = emp?.designation?.name ? ` • ${emp.designation.name}` : "";

  return { label: `${name}${desg}`, value: String(emp.id) };
};

export default function UserProfileView() {
  const params = useParams<{ id?: string }>();
  const userId =
    (params?.id as string | undefined) 
  
  const [data, setData] = useState<UserFull | null>(null);
  const [loading, setLoading] = useState(true);

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
  const [designationOptions, setDesignationOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const res = await apiClient.get(apiClient.URLS.designation, {}, true);
        const body = (res as any)?.body ?? res;

        if (Array.isArray(body)) {
          const options: Option[] = body.map((d: any) => ({
            label: d.name,
            value: String(d.id),
          }));
          setDesignationOptions(options);
        }
      } catch (err) {
        console.error("Failed to fetch designations", err);
      }
    };

    fetchDesignations();
  }, []);

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
      id: "employee",
      label: "Employee",
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: "professional",
      label: "Professional",
      icon: <Shield className="w-4 h-4" />,
    },
    { id: "address", label: "Address", icon: <MapPin className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
    
  ];

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

  const saveEmployee = async (v: any) => {
    const dto = {
      employee: {
        ...(data?.employee?.id ? { id: data.employee.id } : {}),
        designationId: v.designation ? Number(v.designation) : null,
        reportsToId: v.reportsTo || null,
        isActive: v.isActive ?? true,
      },
    };

    await patchUser(dto);
    toast.success("Employee details saved ");
  };

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
        isActive: v.isActive ?? true,
      },
    };
    await patchUser(dto);
    toast.success("Professional details saved ");
  };

  const saveAddress = async (v: any) => {
    const dto = {
      addresses: [
        {
          ...(v.id ? { id: v.id } : {}),
          address1: v.address1.trim(),
          address2: v.address2?.trim() || null,
          city: v.city.trim(),
          state: v.state.trim(),
          zip: v.zip.trim(),
          country: v.country.trim(),
          locality: v.locality?.trim() || null,
          landmark: v.landmark?.trim() || null,
          isDefault: v.isPrimary ?? true,
        },
      ],
    };

    await patchUser(dto);
    toast.success("Address saved ");
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
      } await load()
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
            <div className="w-32 h-32 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg overflow-hidden">
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

                {data?.employee?.designation?.name && (
                  <div className="mt-2 md:text-sm text-[12px] app-text">
                    Designation:{" "}
                    <span className=" font-bold">
                      {data.employee.designation.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                
                <Button
                  onClick={() => openModal("profile", mode, init)}
                  className="flex items-center  font-medium text-nowrap gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
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
          <KV icon={<UserIcon />} label="First Name" value={data?.firstName} />
          <KV icon={<UserIcon />} label="Last Name" value={data?.lastName} />
          <KV icon={<Mail className="w-4 h-4" />} label="Email" value={data?.email} />
          <KV icon={<Phone className="w-4 h-4" />} label="Phone" value={data?.phone} />
          <KV icon={<Calendar className="w-4 h-4" />} label="DOB" value={data?.dob} />
          <KV icon={<Shield className="w-4 h-4" />} label="System Role" value={data?.systemRole} />
        </div>
      </SectionCard>
    </div>
  );
};


 const renderEmployeeTab = () => {
  const emp = data?.employee || null;
  const mode: ModalMode = emp?.id ? "edit" : "add";

  const init = {
    designation: emp?.designation?.id ? String(emp.designation.id) : "",
    reportsTo: emp?.reportsTo?.id ? String(emp.reportsTo.id) : "",
    isActive: emp?.isActive ?? true,
  };

  return (
    <div className="space-y-6 animate-fadeIn md:p-6 p-2">
      <SectionCard
        title="Employee Details"
        icon={<Briefcase className="w-5 h-5 text-purple-500" />}
        actionLabel={mode === "edit" ? "Edit" : "Add"}
        actionIcon={
          mode === "edit" ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />
        }
        onAction={() => openModal("employee", mode, init)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KV
            icon={<Award className="w-4 h-4" />}
            label="Designation"
            value={emp?.designation?.name ?? "-"}
          />
          <KV
            icon={<UserIcon />}
            label="Reports To"
            value={emp?.reportsTo?.designation?.name ?? "-"}
          />
          <KV
            icon={<CheckCircle className="w-4 h-4" />}
            label="Active"
            value={emp?.isActive ? "Yes" : "No"}
          />
        </div>
      </SectionCard>
    </div>
  );
};


  const renderProfessionalTab = () => {
    const a = data?.agentProfile || null;
    const mode: ModalMode = hasAgentData(a) ? "edit" : "add";

    const init = {
      npn: a?.npn ?? "",
      yearsOfExperience: a?.yearsOfExperience ?? 0,
      ahipCertified: a?.ahipCertified ?? false,
      ahipProofUrl: a?.ahipProofUrl ?? "",
      stateLicensed: a?.stateLicensed ?? false,
      stateLicenseNumber: a?.stateLicenseNumber ?? "",
      accessLevel: a?.accessLevel ?? "TRAINING",
      isActive: a?.isActive ?? true,
    };

    return (
      <div className="space-y-6 animate-fadeIn p-6">
        <SectionCard
          title="Professional Information"
          icon={<Shield className="w-5 h-5 text-indigo-500" />}
          actionLabel={mode === "edit" ? "Edit" : "Add"}
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
              value={a?.npn}
            />
            <KV
              icon={<TrendingUp className="w-4 h-4" />}
              label="Experience"
              value={a?.yearsOfExperience}
            />
            <KV
              icon={<Key className="w-4 h-4" />}
              label="Access Level"
              value={a?.accessLevel}
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
                value={a?.stateLicenseNumber}
              />
            )}
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

  const renderAddressTab = () => {
    const addressList = data?.addresses ?? data?.addresses ?? [];
    const primary = addressList.find((a: any) => a.isDefault);
    const mode: ModalMode = primary ? "edit" : "add";

    const init = primary
      ? { ...primary }
      : {
          address1: "",
          address2: null,
          city: "",
          state: "",
          zip: "",
          country: "",
          locality: null,
          landmark: null,

          isDefault: true,
        };

    return (
      <div className="space-y-6 animate-fadeIn p-6">
        <SectionCard
          title="Address Information"
          icon={<MapPin className="w-5 h-5 text-emerald-500" />}
          actionLabel={mode === "edit" ? "Edit Address" : "Add Address"}
          actionIcon={
            mode === "edit" ? (
              <Pencil className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )
          }
          onAction={() => openModal("address", mode, init)}
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
                      <span className="text-xs app-text  font-bold">
                        Primary
                      </span>
                    </div>
                  )}

                  <div className="text-xs  font-medium text-slate-400 mb-2">
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
                  </div>

                  {addr.address2 && (
                    <div className="mt-2">
                      <KV
                        icon={<Plus className="w-3 h-3" />}
                        label="Address 2"
                        value={addr.address2}
                      />
                    </div>
                  )}

                  {(addr.locality || addr.landmark) && (
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {addr.locality && (
                        <KV
                          label="Locality"
                          value={addr.locality}
                          icon={<MapPinHouse size={16} />}
                        />
                      )}
                      {addr.landmark && (
                        <KV
                          label="Landmark"
                          value={addr.landmark}
                          icon={<Landmark size={16} />}
                        />
                      )}
                    </div>
                  )}

                  <Button
                    className="absolute bottom-2 right-2 app-text  transition"
                    onClick={() => openModal("address", "edit", addr)}
                  >
                    <EyeOff className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg  font-bold text-slate-700 dark:text-slate-300 mb-2">
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
      case "employee":
        return renderEmployeeTab();
      case "professional":
        return renderProfessionalTab();
      case "security":
        return renderSecurityTab();
      case "address":
        return renderAddressTab();

      case "activity":
        return (
          <div className="text-center py-12 app-card">
            <Activity className="w-16 h-16 app-text mx-auto mb-4" />
            <h3 className="text-lg  font-bold app-text">
              Activity Log
            </h3>
            <p className="app-text">
              Your activity history will appear here
            </p>
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
                  {tabs.map((t) => (
                    <Button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`w-full flex items-center gap-3 font-medium px-4 py-3 rounded-xl transition-all duration-300 ${
                        activeTab === t.id
                          ? "bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
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
                      <span className="text-sm app-text">
                        Member Since
                      </span>
                      <span className="text-sm  font-medium app-text">
                        {createdAt
                          ? new Date(createdAt).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm app-text">
                        Last Login
                      </span>
                      <span className="text-sm  font-medium app-text">
                        {lastLogin
                          ? new Date(lastLogin).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm app-text">
                        Account Status
                      </span>
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
              <div className="app-surface rounded-2xl shadow-lg border app-border overflow-hidden">
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
        designationOptions={designationOptions}
        onSave={async (values) => {
          if (modalType === "profile") return saveProfile(values);
          if (modalType === "employee") return saveEmployee(values);
          if (modalType === "professional") return saveProfessional(values);
          if (modalType === "address") return saveAddress(values);
          if (modalType === "security") return savePassword(values);
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
  designationOptions,
}: {
  open: boolean;
  onClose: () => void;
  type: ModalType;
  mode: ModalMode;
  initialValues: any;
  onSave: (values: any) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;

  designationOptions: Option[];
}) {
  const [values, setValues] = useState<any>(initialValues || {});
  const [saving, setSaving] = useState(false);

  const [reportsToOptions, setReportsToOptions] = useState<Option[]>([]);

  useEffect(() => setValues(initialValues || {}), [initialValues]);

  useEffect(() => {
    if (!open) return;
    if (type !== "employee") return;

    const designationId = values?.designation;
    if (!designationId) {
      setReportsToOptions([]);
      return;
    }

    const fetchReportsTo = async () => {
      try {
        const res = await apiClient.get(
          `${apiClient.URLS.employee}/report-to/${designationId}`,
          {},
          true
        );

        const body = (res as any)?.body ?? res;

        if (Array.isArray(body)) {
          const options = body.map((emp: any) => ({
            label: emp.designation,
            value: String(emp.id),
          }));

          setReportsToOptions(options);

          if (
            values?.reportsTo &&
            !options.some((o: any) => o.value === values.reportsTo)
          ) {
            setValues((p: any) => ({ ...p, reportsTo: "" }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch reports-to employees", err);
      }
    };

    fetchReportsTo();
  }, [open, type, values?.designation]);

  if (!open) return null;

  const set = (k: string, v: any) => setValues((p: any) => ({ ...p, [k]: v }));

  const title =
    type === "profile"
      ? mode === "edit"
        ? "Edit Profile"
        : "Add Profile"
      : type === "employee"
      ? mode === "edit"
        ? "Edit Employee"
        : "Add Employee"
      : type === "professional"
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

    if (type === "employee") {
      if (!values.designation) return "Designation is required";
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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-opacity-50  md:p-4 p-2">
      <div className="w-full max-w-2xl rounded-2xl app-card border app-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b app-border">
          <h3 className="text-lg  font-bold app-text">
            {title}
          </h3>
          <Button
            onClick={onClose}
            className="p-2 rounded-lg hover:app-text"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="md:p-5 p-2 md:space-y-4 space-y-2">
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

          {type === "employee" && (
            <div className="md:space-y-4 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <Field label="Designation" required>
                  <SingleSelect
                    value={values.designation}
                    onChange={(v: string) => {
                      set("designation", v);
                      set("reportsTo", "");
                    }}
                    options={designationOptions}
                    placeholder="Select Designation"
                    placement="auto"
                    searchable
                  />
                </Field>

                <Field label="Reports To">
                  <SingleSelect
                    value={values.reportsTo}
                    onChange={(v: string) => set("reportsTo", v)}
                    options={reportsToOptions}
                    placeholder="Select Manager"
                    placement="auto"
                    searchable
                  />
                </Field>
              </div>

              <ToggleInline
                label="Is Active"
                checked={values.isActive ?? true}
                onChange={(v) => set("isActive", v)}
              />
            </div>
          )}

          {type === "professional" && (
            <div className="md:space-y-4 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="NPN">
                  <TextInput
                    value={values.npn || ""}
                    onChange={(e: any) => set("npn", e.target.value)}
                    placeholder="NPn"
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
                    placeholder="TRAINING / FULL"
                  />
                </Field>
              </div>

              <ToggleInline
                label="AHIP Certified"
                checked={!!values.ahipCertified}
                onChange={(v) => set("ahipCertified", v)}
              />
              <ToggleInline
                label="State Licensed"
                checked={!!values.stateLicensed}
                onChange={(v) => set("stateLicensed", v)}
              />

              {values.stateLicensed && (
                <Field label="State License Number">
                  <TextInput
                    value={values.stateLicenseNumber || ""}
                    onChange={(e: any) =>
                      set("stateLicenseNumber", e.target.value)
                    }
                    placeholder="License Number"
                  />
                </Field>
              )}

              <ToggleInline
                label="Is Active"
                checked={values.isActive ?? true}
                onChange={(v) => set("isActive", v)}
              />
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
        </div>

        <div className="px-5 py-4 border-t app-border flex items-center justify-end gap-2">
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
        </div>
      </div>
    </div>
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
    <div className="app-card rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 app-text rounded-lg border border-slate-200 dark:border-slate-700">
            {icon}
          </div>
          <h3 className="md:text-lg text-[14px]  font-bold app-text">
            {title}
          </h3>
        </div>

        <Button
          onClick={onAction}
          className="flex items-center font-medium   gap-2 md:px-4 px-2  py-1 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all"
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
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className=" font-medium text-slate-900 dark:text-white">{label}</div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
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
