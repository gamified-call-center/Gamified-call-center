"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/Utils/apiClient";

import Modal from "@/commonComponents/Modal";

import { Field } from "@/commonComponents/form/Field";
import { SingleSelect } from "@/commonComponents/form/SingleSelect";
import { TextInput } from "@/commonComponents/form/TextInput";
import { Checkbox } from "@/commonComponents/form/Checkbox";

import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Button from "@/commonComponents/Button";
import {
  BadgeCheck,
  Briefcase,
  Check,
  CheckCircle,
  Download,
  Eye,
  Layers,
  LayoutGrid,
  Pencil,
  Plus,
  Rows,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import UserOnboardModal from "./UserOnboardModal";
import {
  CreateAddressDto,
  CreateAgentProfileDto,
  CreateEmployeeDto,
  CreateUserCoreDto,
  CreateUserDto,
  UpdateUserDto,
  UserEntity,
} from "./helper";
import TableToolbar from "@/commonComponents/TableSearchBar";
import Loader from "@/commonComponents/Loader";
import Pagination from "@/commonComponents/Pagination";
import { cn } from "@/Utils/common/cn";

type Designation = { id: number; name: string; levelOrder: number };
type Option = { label: string; value: string };

type PermissionMaster = {
  id: number;
  code: string;
  description: string;
};

type Crud = { view: boolean; create: boolean; edit: boolean; delete: boolean };

// type ResourceRow = {
//   resource: string;
//   view: boolean;
//   create: boolean;
//   edit: boolean;
//   delete: boolean;
// };

type DesignationPermissionApiRow = {
  id?: number;
  allowed: boolean;
  permissionId?: number;
  permission?: PermissionMaster;
};

const ACTIONS: (keyof Crud)[] = ["view", "create", "edit", "delete"];

const normalizeResource = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, "_");
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isUUID = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );

const toISODate = (v: string) => v; // already YYYY-MM-DD from <input type="date">

function parsePermissionCode(
  code: string
): { resource: string; action: keyof Crud } | null {
  const parts = code.split("_");
  if (parts.length < 2) return null;

  const actionRaw = parts[parts.length - 1].toLowerCase();
  const action = (["view", "create", "edit", "delete"] as const).includes(
    actionRaw as any
  )
    ? (actionRaw as keyof Crud)
    : null;

  if (!action) return null;

  const resourceRaw = parts.slice(0, -1).join("_");
  if (!resourceRaw) return null;

  return { resource: normalizeResource(resourceRaw), action };
}

const formatResourceName = (r: string) =>
  r.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
type ViewMode = "compact" | "cards";

export default function DesignationsPermissionsPage() {
  const [designations, setDesignations] = useState<any[]>([]);
  const [tab, setTab] = useState<"users" | "designations">("users");
  const [view, setView] = useState<ViewMode>("compact");

  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<any | null>(
    null
  );

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<{ name: string; levelOrder: number }>({
    name: "",
    levelOrder: 1,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; levelOrder?: string }>(
    {}
  );
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [userMode, setUserMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<UserEntity | null>(null);
  const [tableSearch, setTableSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [confirmType, setConfirmType] = useState<"ACTIVATE" | "DEACTIVATE">(
    "DEACTIVATE"
  );

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [isAgent, setIsAgent] = useState(false);
  const [confirmdeleteOpen, setConfirmdeleteOpen] = useState(false);
  const [selecteddeleteDesignation, setSelecteddeleteDesignation] = useState<
    any | null
  >(null);

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
    designationId: undefined,
    reportsToId: undefined,
  });

  const [addresses, setAddresses] = useState<CreateAddressDto[]>([
    {
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      locality: "",
      landmark: "",
      isDefault: true,
    },
  ]);

  const [agentProfile, setAgentProfile] = useState<CreateAgentProfileDto>({
    npn: "",
    yearsOfExperience: 0,
    ahipCertified: false,
    ahipProofUrl: "",
    stateLicensed: false,
    accessLevel: "TRAINING",
     apps: []
  });
  const [page, setPage] = useState(1);
  const LIMIT = 10;
  const [total, setTotal] = useState(0);
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(
        apiClient.URLS.user,
        { page, limit: LIMIT },
        true
      );
      const body = res?.body ?? res;

      const list = body?.data?.items || body?.items || body?.data || [];
      const totalCount = body?.data?.total || body?.meta?.total || list.length;
      setUsers(Array.isArray(list) ? list : []);
      setTotal(totalCount);
    } catch (e) {
      console.error(e);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const res: any = await apiClient.get(
        apiClient.URLS.designation,
        {},
        true
      );

      setDesignations(res.body);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load designations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
    fetchUsers();
  }, []);
  const filteredDesignations = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();
    if (!q) return designations;
    return designations.filter((d) => d.name.toLowerCase().includes(q));
  }, [designations, tableSearch]);

  const isNameDuplicate = (name: string, ignoreId?: number) =>
    designations.some(
      (d) =>
        d.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        d.id !== ignoreId
    );

  const isLevelDuplicate = (levelOrder: number, ignoreId?: number) =>
    designations.some((d) => d.levelOrder === levelOrder && d.id !== ignoreId);

  const validateDesignationForm = (values: {
    name: string;
    levelOrder: number;
  }) => {
    const e: { name?: string; levelOrder?: string } = {};

    const name = values.name?.trim() || "";
    const level = Number(values.levelOrder);
    const ignoreId = selectedDesignation?.id as number;

    if (!name) e.name = "Designation name is required";

    if (!Number.isFinite(level)) {
      e.levelOrder = "Level order is required";
    } else if (!Number.isInteger(level)) {
      e.levelOrder = "Level order must be an integer";
    } else if (level < 1) {
      e.levelOrder = "Level order must be 1 or higher";
    }

    if (name && isNameDuplicate(name, ignoreId)) {
      e.name = "This designation name already exists";
    }

    if (
      Number.isInteger(level) &&
      level >= 1 &&
      isLevelDuplicate(level, ignoreId)
    ) {
      e.levelOrder = "This level order is already used";
    }

    return e;
  };

  const openAddDesignation = () => {
    setFormMode("add");
    setSelectedDesignation(null);
    setForm({ name: "", levelOrder: 1 });
    setFormOpen(true);
  };
  const [selectedDesignationId, setSelectedDesignationId] = useState<
    any | null
  >(null);

  const openEditDesignation = (d: any) => {
    setSelectedDesignationId(d.id);
    setSelectedDesignation(d);
    setForm({ name: d.name ?? "", levelOrder: Number(d.levelOrder ?? 0) });
    setFormMode("edit");
    setFormOpen(true);
  };

  const submitDesignation = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorsObj = validateDesignationForm(form);
    setErrors(errorsObj);

    if (Object.keys(errorsObj).length) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      levelOrder: Number(form.levelOrder),
    };

    try {
      let res;

      if (formMode === "edit" && selectedDesignationId) {
        const id = selectedDesignationId;
        res = await apiClient.put(
          `${apiClient.URLS.designation}/${id}`,

          payload,

          true
        );
      } else {
        res = await apiClient.post(apiClient.URLS.designation, payload, true);
      }

      if (res.status === 200 || res.status === 201) {
        setDesignations((prev) =>
          formMode === "edit"
            ? prev.map((d) => (d.id === selectedDesignationId ? res.data : d))
            : [...prev, res.data]
        );

        toast.success(
          formMode === "edit"
            ? "Designation updated successfully!"
            : "Designation created successfully!"
        );

        await fetchDesignations();
        setFormOpen(false);
      }
    } catch (error: any) {
      console.error("Error saving designation:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to save designation";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };
  const deleteDesignation = async (d: Designation) => {
    if (!d) return;

    try {
      setSaving(true);
      const res = await apiClient.delete(
        `${apiClient.URLS.designation}/${d.id}`
      );

      setDesignations((prev) => prev.filter((x) => x.id !== d.id));
      if (res.status === 200) {
        toast.success("Designation deleted");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };
  const isFormValid =
    form.name.trim().length > 0 &&
    Number.isInteger(form.levelOrder) &&
    form.levelOrder >= 1;

  const openModalForDesignation = (d: Designation) => {
    setSelectedDesignation(d);
    setOpen(true);
  };
  const TabButton = ({
    active,
    icon,
    label,
    onClick,
  }: {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }) => (
    <Button
      onClick={onClick}
      className={[
        "flex items-center gap-2 md:px-4 px-2 md:py-2 py-1 rounded-xl border transition-all text-[12px] md:text-[14px] font-medium",
        active ? "app-btn-active" : "app-btn hover:shadow-sm",
      ].join(" ")}
      type="button"
    >
      {icon}
      {label}
    </Button>
  );
  const filteredUsers = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();
    if (!q) return users;

    return users.filter((u) => {
      const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      return (
        name.includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q) ||
        (u.employee?.designation?.name || "").toLowerCase().includes(q) ||
        (u.systemRole || "").toLowerCase().includes(q)
      );
    });
  }, [users, tableSearch]);
  const resetUserWizard = () => {
    setStep(1);
    setIsAgent(false);
    setErrors({});
    setSelectedUser(null);

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

    setEmployee({ designationId: undefined, reportsToId: undefined });

    setAddresses([
      {
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        locality: "",
        landmark: "",
        isDefault: true,
      },
    ]);

    setAgentProfile({
      npn: "",
      yearsOfExperience: 0,
      ahipCertified: false,
      ahipProofUrl: "",
      stateLicensed: false,
      accessLevel: "TRAINING",
       apps: [],
    });
  };

  const openAddUser = () => {
    setUserMode("add");
    resetUserWizard();
    setUserFormOpen(true);
  };

  const openEditUser = (u: UserEntity) => {
    setUserMode("edit");
    resetUserWizard();

    setSelectedUser(u);
    setIsAgent(!!u.agentProfile);

    setUserCore({
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      dob:
        typeof u.dob === "string"
          ? u.dob.slice(0, 10)
          : String(u.dob).slice(0, 10),
      email: u.email || "",
      password: "",
      phone: u.phone || "",
      profileImage: (u as any)?.profileImage || "",
      systemRole: u.systemRole || "STANDARD",
    });

    setEmployee({
      designationId: u.employee?.designation?.id || undefined,
      reportsToId: (u.employee as any)?.reportsTo?.id || undefined,
    });

    if (u.addresses?.length) {
      setAddresses(
        u.addresses.map((a) => ({
          address1: a.address1 || "",
          address2: a.address2 || "",
          city: a.city || "",
          state: a.state || "",
          zip: a.zip || "",
          country: a.country || "",
          locality: a.locality || "",
          landmark: a.landmark || "",
          isDefault: !!a.isDefault,
        }))
      );
    }

    if (u.agentProfile) {
      setAgentProfile({
        npn: u.agentProfile.npn || "",
        yearsOfExperience: Number(u.agentProfile.yearsOfExperience || 0),
        ahipCertified: !!u.agentProfile.ahipCertified,
        ahipProofUrl: u.agentProfile.ahipProofUrl || "",
        stateLicensed: !!u.agentProfile.stateLicensed,
        accessLevel: u.agentProfile.accessLevel || "TRAINING",
        apps:u.agentProfile.apps||[]
      });
    }

    setUserFormOpen(true);
  };

  const convertToUpdateDto = (payload: CreateUserDto): UpdateUserDto => {
    const role = payload.user?.systemRole ?? "STANDARD";

    const update: UpdateUserDto = {
      user: {
        firstName: payload.user.firstName,
        lastName: payload.user.lastName,
        dob: payload.user.dob,
        email: payload.user.email,
        phone: payload.user.phone,
        profileImage: payload.user.profileImage,
        systemRole: payload.user.systemRole,

        ...(payload.user.password?.trim()
          ? { password: payload.user.password.trim() }
          : {}),
      },
    };

   
    if (payload.addresses?.length) {
      update.addresses = payload.addresses.map((a: any) => ({
        ...(a.id ? { id: a.id } : {}),
        ...(a.delete ? { delete: true } : {}),
        address1: a.address1,
        address2: a.address2,
        city: a.city,
        state: a.state,
        zip: a.zip,
        country: a.country,
        locality: a.locality,
        landmark: a.landmark,
        isDefault: a.isDefault,
      }));
    }

   
    if (role === "ADMIN") return update;

    if (payload.employee) {
      update.employee = {
        designationId: payload.employee.designationId,
        reportsToId: payload.employee.reportsToId,
      };
    }

    if (payload.agentProfile) {
      update.agentProfile = {
        npn: payload.agentProfile.npn,
        yearsOfExperience: payload.agentProfile.yearsOfExperience,
        ahipCertified: payload.agentProfile.ahipCertified,
        ahipProofUrl: payload.agentProfile.ahipCertified
          ? payload.agentProfile.ahipProofUrl
          : undefined,
        stateLicensed: payload.agentProfile.stateLicensed,
        accessLevel: payload.agentProfile.accessLevel,
        apps:payload.agentProfile.apps||[]
      };
    }

    return update;
  };

  const handleUserSubmit = async (payload: CreateUserDto) => {
    // const ok1 = validateStep1();
    // const ok2 = validateStep2();
    // const ok3 = validateStep3();
    // if (!ok1 || !ok2 || !ok3) return;
    try {
      setSavingUser(true);

      if (userMode === "add") {
        const res = await apiClient.post(
          `${apiClient.URLS.user}/onboard`,
          payload,
          true
        );
        toast.success(res?.data?.message || "User created");
      }

      // EDIT
      if (userMode === "edit") {
        if (!selectedUser?.id) {
          toast.error("Missing selected user id");
          return;
        }

        const updatePayload = convertToUpdateDto(payload);

        const res = await apiClient.patch(
          `${apiClient.URLS.user}/${selectedUser.id}`,
          updatePayload,
          true
        );
        toast.success(res?.data?.message || "User updated");
      }

      setUserFormOpen(false);
      await fetchUsers();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "User save failed");
    } finally {
      setSavingUser(false);
    }
  };
  const totalPages = Math.ceil(total / LIMIT);
  const openConfirmModal = (u: UserEntity) => {
    setSelectedUser(u);
    setConfirmType(u.userStatus === "ACTIVE" ? "DEACTIVATE" : "ACTIVATE");
    setConfirmOpen(true);
  };

  const reactivateUser = async (u: UserEntity) => {
    if (!u) return;

    try {
      setSavingUser(true);
      await apiClient.patch(`${apiClient.URLS.user}/${u.id}/status`, {
        userStatus: "ACTIVE",
      });
      toast.success("User reactivated");
      await fetchUsers();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Activation failed");
    } finally {
      setSavingUser(false);
    }
  };

  const deactivateUser = async (u: UserEntity) => {
    if (!u) return;

    try {
      setSavingUser(true);
      await apiClient.delete(`${apiClient.URLS.user}/${u.id}`);
      toast.success("User deactivated");
      await fetchUsers();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Deactivate failed");
    } finally {
      setSavingUser(false);
    }
  };
  if (saving || loading) {
    return (
      <div className="w-full h-full items-center flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="md:p-6 p-2 md:space-y-6 space-y-3 app-card min-h-screen">
      <div className="app-card rounded-2xl shadow-lg border app-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b app-border">
          <div className="flex items-center gap-2 flex-wrap">
            <TabButton
              active={tab === "users"}
              icon={<Users size={16} />}
              label="Users"
              onClick={() => setTab("users")}
            />
            <TabButton
              active={tab === "designations"}
              icon={<BadgeCheck size={16} />}
              label="Designations"
              onClick={() => setTab("designations")}
            />
          </div>
        </div>

        {tab === "users" ? (
          <div className="md:pt-5 pt-2 md:space-y-4 space-y-2 app-card">
            <div className="rounded-md shadow-2xl md:p-4  p-2 ">
              <TableToolbar
                search={{
                  value: tableSearch,
                  onChange: setTableSearch,
                  placeholder:
                    "Search users by name, email, phone, role, designation...",
                  widthClassName: "min-w-full  rounded-xl",
                  debounceMs: 300,
                }}
                middleSlot={
                  <div className="flex items-center md:gap-2 gap-1">
                    <div className="flex items-center gap-1">
                      <Button
                        className={`md:px-2 px-2 md:py-[7px] py-[5px] rounded-md border ${
                          view === "cards"
                            ? "bg-purple-600 text-white"
                            : "bg-white text-gray-800"
                        }`}
                        onClick={() => setView("cards")}
                        title="Cards view"
                      >
                        <LayoutGrid className="md:w-4 w-4 md:h-4 h-4" />
                      </Button>

                      <Button
                        className={`md:px-2 px-2 md:py-[7px] py-[5px] rounded-md border ${
                          view === "compact"
                            ? "bg-purple-600 text-white"
                            : "bg-white text-gray-800"
                        }`}
                        onClick={() => setView("compact")}
                        title="Compact view"
                      >
                        <Rows className="md:w-4 w-4 md:h-4 h-4" />
                      </Button>
                    </div>
                  </div>
                }
                actionsSlot={
                  <>
                    <div className="flex items-center gap-2">
                      <Button
                        className="bg-linear-to-r from-emerald-500 to-teal-600 text-nowrap text-white md:px-5 px-3 btn-text md:py-2 py-1 rounded-xl  font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                        onClick={openAddUser}
                        disabled={loadingUsers || savingUser}
                      >
                        + Add User
                      </Button>

                      <Button
                        className="bg-linear-to-r from-blue-500 to-indigo-600 text-white md:px-5 md:py-2 py-1 px-3 btn-text  rounded-xl  font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                        onClick={fetchUsers}
                        disabled={loading}
                      >
                        {loading ? "Refreshing..." : "Refresh"}
                      </Button>
                    </div>
                  </>
                }
              />
            </div>

            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center label-text font-medium app-text">
                No users found
              </div>
            ) : (
              <>
                {view === "cards" && (
                  <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        className="app-card rounded-2xl border app-border p-4 md:p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-[2px]"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1 md:space-y-1.5">
                            <p className="font-bold app-text text-sm md:text-base">
                              {u.firstName} {u.lastName}
                            </p>

                            <p className="font-medium app-muted text-[11px] md:text-xs">
                              {u.email}
                            </p>

                            <p className="font-medium app-muted text-[11px] md:text-xs">
                              {u.phone}
                            </p>

                            <div className="flex flex-wrap gap-2 pt-1 md:pt-2">
                              <span className="px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-medium app-card app-text border app-border">
                                {u.systemRole}
                              </span>
                              <span className="px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-medium app-card app-text border app-border">
                                {u.userStatus}
                              </span>

                              {u.employee?.designation?.name && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-medium app-card app-text border app-border">
                                  {u.employee.designation.name}
                                </span>
                              )}

                              {u.agentProfile && (
                                <span className="px-3 py-1 rounded-full text-[10px] md:text-[11px] font-medium border app-border bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                                  Agent
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 self-end sm:self-start">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditUser(u);
                              }}
                              className="p-2 md:p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-full transition-all"
                            >
                              <Pencil size={16} className="md:size-[18px]" />
                            </Button>

                            <div className="flex items-center gap-2">
                              {u.userStatus === "INACTIVE" ? (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openConfirmModal(u);
                                  }}
                                  className="p-2 md:p-2.5 text-emerald-700 bg-emerald-100 hover:bg-emerald-200
      dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 rounded-full transition-all"
                                >
                                  <Check size={16} className="md:size-[18px]" />
                                </Button>
                              ) : (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openConfirmModal(u);
                                  }}
                                  className="p-2 md:p-2.5 text-rose-700 bg-rose-100 hover:bg-rose-200
      dark:bg-rose-500/20 dark:hover:bg-rose-500/30 rounded-full transition-all"
                                >
                                  <Trash2
                                    size={16}
                                    className="md:size-[18px]"
                                  />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {u.agentProfile && (
                          <div className="mt-3 md:mt-4 text-[11px] md:text-xs font-medium app-muted border-t app-border pt-2 md:pt-3">
                            Agent Access:
                            <span className="app-text ml-1">
                              {u.agentProfile.accessLevel}
                            </span>
                            <span className="mx-1.5">•</span>
                            NPN:
                            <span className="app-text ml-1">
                              {u.agentProfile.npn}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {view === "compact" && (
                  <div className="overflow-x-auto rounded-sm border app-border app-card shadow-sm">
                    <table className="min-w-full w-full text-sm app-text border-collapse">
                      <thead className="app-table-head">
                        <tr>
                          <th className="px-4 py-1 text-left font-bold border app-border">
                            Name
                          </th>
                          <th className="px-4 py-1 text-left font-bold border app-border">
                            Email
                          </th>
                          <th className="px-4 py-1 text-left font-bold border app-border">
                            Phone
                          </th>
                          <th className="px-4 py-1 text-center font-bold border app-border">
                            Role
                          </th>
                          <th className="px-4 py-1 text-center font-bold border app-border">
                            Status
                          </th>
                          <th className="px-4 py-1 text-center font-bold border app-border">
                            Designation
                          </th>
                          <th className="px-4 py-1 text-center font-bold border app-border">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="py-16 text-center app-text border app-border font-bold"
                            >
                              No users found
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u.id} className="border-t app-row-hover">
                              <td className="px-4 py-0.5 border app-border font-medium text-nowrap">
                                {u.firstName} {u.lastName}
                              </td>
                              <td className="px-4 py-0.5 border app-border font-medium text-nowrap">
                                {u.email}
                              </td>
                              <td className="px-4 py-0.5 border app-border font-medium text-nowrap">
                                {u.phone}
                              </td>
                              <td className="px-4 py-0.5 border app-border text-center font-medium">
                                {u.systemRole}
                              </td>
                              <td className="px-4 py-0.5 border app-border text-center font-medium">
                                {" "}
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                                    u.userStatus === "ACTIVE"
                                      ? "bg-green-500/15 text-green-700"
                                      : "bg-orange-500/15 text-orange-700"
                                  }`}
                                >
                                  {u.userStatus === "ACTIVE" ? (
                                    <CheckCircle size={14} />
                                  ) : (
                                    <XCircle size={14} />
                                  )}
                                  {u.userStatus === "ACTIVE"
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </td>
                              <td className="px-4 py-0.5 border app-border text-center font-bold">
                                {u.employee?.designation?.name ?? "-"}
                              </td>

                              <td className="px-4 py-0.5 border app-border text-center">
                                <div className="inline-flex items-center gap-2">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditUser(u);
                                    }}
                                    className="p-2 md:p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-full transition-all"
                                    title="Edit"
                                  >
                                    <Pencil
                                      size={16}
                                      className="md:size-[18px]"
                                    />
                                  </Button>

                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openConfirmModal(u);
                                    }}
                                    className={cn(
                                      "p-2 md:p-2.5 rounded-full transition-all",
                                      u.userStatus === "INACTIVE"
                                        ? "text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30"
                                        : "text-rose-700 bg-rose-100 hover:bg-rose-200 dark:bg-rose-500/20 dark:hover:bg-rose-500/30"
                                    )}
                                    title={
                                      u.userStatus === "INACTIVE"
                                        ? "Activate"
                                        : "Delete"
                                    }
                                  >
                                    {u.userStatus === "INACTIVE" ? (
                                      <Check
                                        size={16}
                                        className="md:size-[18px]"
                                      />
                                    ) : (
                                      <Trash2
                                        size={16}
                                        className="md:size-[18px]"
                                      />
                                    )}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
            <div className="">
              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={filteredUsers.length}
                limit={LIMIT}
                onPageChange={setPage}
              />
            </div>
          </div>
        ) : null}

        {confirmOpen && (
          <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <div className="w-full py-2 rounded-md">
              <div
                className={`absolute top-0 left-0 w-full h-1.5 ${
                  confirmType === "DEACTIVATE"
                    ? "bg-orange-500"
                    : "bg-green-500"
                }`}
              ></div>

              <div className="flex justify-center mt-2">
                <div
                  className={`w-16 h-16 flex items-center justify-center rounded-full border-4 app-card shadow-lg ${
                    confirmType === "DEACTIVATE"
                      ? "border-orange-200 shadow-orange-400/30"
                      : "border-green-200 shadow-green-400/30"
                  }`}
                >
                  {confirmType === "DEACTIVATE" ? (
                    <Trash2 className="w-8 h-8 text-orange-600 animate-pulse" />
                  ) : (
                    <Check className="w-8 h-8 text-green-600 animate-bounce" />
                  )}
                </div>
              </div>

              <div className="text-center mt-4 space-y-2">
                <h3 className="text-[12px] md:text-[20px] font-extrabold app-text tracking-tight">
                  {confirmType === "DEACTIVATE"
                    ? "Deactivate Agent?"
                    : "Reactivate Agent?"}
                </h3>

                <p className="text-sm app-text font-medium">
                  {confirmType === "DEACTIVATE"
                    ? "This agent will lose access and go offline."
                    : "Agent will regain access and return to active duty."}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 mt-5">
                <span className="text-xs font-bold text-slate-400">Power</span>
                <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      confirmType === "DEACTIVATE"
                        ? "w-[35%] bg-orange-600"
                        : "w-full bg-green-600"
                    }`}
                  ></div>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {confirmType === "DEACTIVATE" ? "35%" : "100%"}
                </span>
              </div>

              <div className="flex justify-center gap-4 mt-7">
                <Button
                  className="md:px-5 px-3 md:py-2.5 py-1.5 md:text-[14px] text-[12px] rounded-2xl app-card app-text font-bold hover:scale-105 active:scale-95 transition-all"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  className={`md:px-6 px-3 md:py-2.5 py-1.5 md:text-[14px] text-[12px] rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg hover:scale-110 active:scale-95 transition-all ${
                    confirmType === "DEACTIVATE"
                      ? "bg-linear-to-r from-orange-600 to-red-600 shadow-red-400/40"
                      : "bg-linear-to-r from-green-600 to-emerald-600 shadow-green-400/40"
                  }`}
                  onClick={async () => {
                    if (!selectedUser) {
                      toast.error("No user selected");
                      return;
                    }

                    try {
                      if (confirmType === "DEACTIVATE") {
                        await deactivateUser(selectedUser);
                      } else {
                        await reactivateUser(selectedUser);
                      }
                    } catch (err) {
                      toast.error("Action failed");
                    }

                    setConfirmOpen(false);
                  }}
                >
                  {confirmType === "DEACTIVATE" ? (
                    <>
                      <Trash2 className="w-4 h-4" /> Deactivate
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Reactivate
                    </>
                  )}
                </Button>
              </div>

              <div className="pointer-events-none absolute inset-0 opacity-10">
                <Eye className="absolute top-8 left-10 w-6 h-6" />
                <Download className="absolute top-16 right-12 w-5 h-5 app-text animate-ping" />
                <Pencil className="absolute bottom-10 left-16 w-5 h-5 app-text animate-bounce" />
                <Plus className="absolute bottom-16 right-20 w-7 h-7 animate-spin-slow" />
              </div>
            </div>
          </Modal>
        )}

        {tab === "designations" ? (
          <div className="md:pt-5 pt-2 md:space-y-4 space-y-2 app-card">
            <div className="">
              <div>
                <div className="rounded-md shadow-2xl md:p-4  p-2 ">
                  <TableToolbar
                    search={{
                      value: tableSearch,
                      onChange: setTableSearch,
                      placeholder: "Search designation name ,order",
                      widthClassName: "md:w-[360px] w-full rounded-xl",
                      debounceMs: 300,
                    }}
                    middleSlot={
                      <div className="flex items-center md:gap-2 gap-1">
                        <Button
                          className={cn(
                            "md:px-2 px-1 md:py-[7px] py-[5px] rounded-md border",
                            view === "cards"
                              ? "bg-purple-600 text-white"
                              : "bg-white app-text"
                          )}
                          onClick={() => setView("cards")}
                          title="Cards view"
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </Button>

                        <Button
                          className={cn(
                            "md:px-2 px-1 md:py-[7px] py-[5px] rounded-md border",
                            view === "compact"
                              ? "bg-purple-600 text-white"
                              : "bg-white app-text"
                          )}
                          onClick={() => setView("compact")}
                          title="Table view"
                        >
                          <Rows className="w-4 h-4" />
                        </Button>
                      </div>
                    }
                    actionsSlot={
                      <div className="flex items-center gap-2">
                        <Button
                          className="bg-linear-to-r from-emerald-500 to-teal-600 text-white md:px-5 text-nowrap px-3 label-text md:py-2 py-1.5 rounded-xl  font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                          onClick={openAddDesignation}
                          disabled={loading || saving}
                        >
                          + Add Designation
                        </Button>

                        <Button
                          className="bg-linear-to-r from-blue-500 to-indigo-600 text-white md:px-5 px-3 label-text md:py-2 py-1.5 rounded-xl  font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                          onClick={fetchDesignations}
                          disabled={loading}
                        >
                          {loading ? "Refreshing..." : "Refresh"}
                        </Button>
                      </div>
                    }
                  />
                </div>

                {/* Designations Grid */}
                {filteredDesignations.length === 0 ? (
                  <div className="py-12 text-center font-medium label-text app-text">
                    No designations available
                  </div>
                ) : (
                  <>
                    {view === "cards" && (
                      <div className="md:pt-5 pt-2 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 md:gap-4 gap-2">
                        {filteredDesignations
                          .slice()
                          .sort((a, b) => a.levelOrder - b.levelOrder)
                          .map((d) => (
                            <div
                              key={d.id}
                              onClick={() => openModalForDesignation(d)}
                              className="group app-card md:p-4 p-2 rounded-2xl border app-border hover:border-blue-500 hover:shadow-xl transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <p className="md:text-base  font-bold app-text group-hover:text-blue-600 transition">
                                  {d.name}
                                </p>

                                <span className="px-2.5 py-1 text-[10px]  font-bold rounded-full app-card app-text">
                                  Level {d.levelOrder}
                                </span>
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-2">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModalForDesignation(d);
                                  }}
                                  className="text-xs text-slate-500 hover:text-slate-700 transition"
                                >
                                  Manage permissions →
                                </Button>

                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditDesignation(d);
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                                  >
                                    <Pencil size={16} />
                                  </Button>

                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelecteddeleteDesignation(d);
                                      setConfirmdeleteOpen(true);
                                    }}
                                    className="p-2 text-rose-600 hover:bg-rose-100 rounded-full transition disabled:opacity-50"
                                    disabled={saving}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                    {view === "compact" && (
                      <div className="overflow-x-auto rounded-sm border app-border app-card shadow-sm">
                        <table className="min-w-full w-full text-sm app-text border-collapse">
                          <thead className="app-table-head sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-1 text-left font-bold border app-border">
                                Order
                              </th>
                              <th className="px-4 py-1 text-left font-bold border app-border">
                                Name
                              </th>
                              <th className="px-4 py-1 text-center font-bold border app-border">
                                Level
                              </th>
                              <th className="px-4 py-1 text-center font-bold border app-border text-nowrap">
                                Actions
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {filteredDesignations.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="py-12 text-center font-bold border app-border app-text"
                                >
                                  No designations available
                                </td>
                              </tr>
                            ) : (
                              filteredDesignations
                                .slice()
                                .sort((a, b) => a.levelOrder - b.levelOrder)
                                .map((d, i) => (
                                  <tr
                                    key={d.id}
                                    onClick={() => openModalForDesignation(d)}
                                    className="border-t app-row-hover cursor-pointer"
                                  >
                                    <td className="px-4 py-0.5 border app-border font-medium">
                                      {i + 1}
                                    </td>
                                    <td className="px-4 py-0.5 border app-border font-medium text-nowrap">
                                      {d.name}
                                    </td>
                                    <td className="px-4 py-0.5 border app-border text-center font-medium text-nowrap">
                                      Level {d.levelOrder}
                                    </td>

                                    <td className="px-4 py-0.5 border app-border text-center">
                                      <div className="inline-flex items-center gap-2">
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openEditDesignation(d);
                                          }}
                                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-full transition"
                                          title="Edit"
                                        >
                                          <Pencil size={16} />
                                        </Button>

                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelecteddeleteDesignation(d);
                                            setConfirmdeleteOpen(true);
                                          }}
                                          className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-full transition disabled:opacity-50"
                                          title="Delete"
                                          disabled={saving}
                                        >
                                          <Trash2 size={16} />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="">
              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={filteredDesignations.length}
                limit={LIMIT}
                onPageChange={setPage}
              />
            </div>
          </div>
        ) : null}
      </div>
      {confirmdeleteOpen && (
        <Modal
          open={confirmdeleteOpen}
          onClose={() => setConfirmdeleteOpen(false)}
        >
          <div className="w-full py-2 shadow-xl  animate-scaleIn overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>

            <div className="flex justify-center">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
                <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
            </div>

            <div className="text-center mt-4 space-y-1">
              <h3 className="text-xl font-Gordita-Medium app-text">
                Delete Designation?
              </h3>
              <p className="md:text-sm text-[12px] app-muted">
                This action cannot be undone.
              </p>
              <p className="md:text-sm  text-[14px] font-Gorita-Medium ">
                {selecteddeleteDesignation?.name}
              </p>
            </div>

            <div className="flex  justify-center  gap-2 md:gap-4 mt-5">
              <Button
                onClick={() => setConfirmOpen(false)}
                className="md:px-4 px-2  md:py-2 py-1 text-sm app-card app-text font-Gordita-Medium btn-text rounded-xl transition"
              >
                Cancel
              </Button>

              <Button
                onClick={() => {
                  deleteDesignation(selecteddeleteDesignation);
                  setConfirmdeleteOpen(false);
                }}
                className="md:px-4 px-2  md:py-2 py-1 text-sm  bg-rose-600 hover:bg-rose-700 text-white rounded-xl btn-text font-Gordita-Medium transition disabled:opacity-40"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

     
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={
          formMode === "add"
            ? "Add Designation"
            : `Edit — ${selectedDesignation?.name || ""}`
        }
      >
        <div className="md:space-y-4 space-y-2">
          <Field label="Designation Name" required error={errors.name}>
            <TextInput
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Manager"
              leftIcon={<Briefcase size={18} />}
            />
          </Field>

          <Field
            label="Level Order (1 = highest)"
            required
            error={errors.levelOrder}
          >
            <TextInput
              type="number"
              min={1}
              value={form.levelOrder}
              onChange={(e) =>
                setForm((p) => ({ ...p, levelOrder: Number(e.target.value) }))
              }
              placeholder="Enter level order"
              leftIcon={<Layers size={18} />}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              className="md:px-4 px-2 md:py-2 py-1 md:text-[14px] text-[12px] app-text font-medium rounded-xl border"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              className="md:px-4 px-2 md:py-2 py-1 font-medium md:text-[14px] text-[12px] rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
              disabled={saving || !form.name.trim() || form.levelOrder < 1}
              onClick={submitDesignation}
            >
              {saving ? "Saving..." : formMode === "add" ? "Create" : "Update"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Permissions — ${selectedDesignation?.name || ""}`}
      >
        {selectedDesignation && (
          <DesignationPermissionsCrudModalBody
            designation={selectedDesignation}
            onClose={() => setOpen(false)}
          />
        )}
      </Modal>
      <UserOnboardModal
        open={userFormOpen}
        mode={userMode}
        saving={savingUser}
        designations={designations}
        users={users}
        initialUser={selectedUser}
        onClose={() => {
          setUserFormOpen(false);
          resetUserWizard();
        }}
        onSubmit={handleUserSubmit}
      />
    </div>
  );
}
type ResourceRow = {
  id?: string; 
  resource: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  _status?: "new" | "dirty" | "clean" | "deleted";
};

type ResourceApi = { tablename: string };

function DesignationPermissionsCrudModalBody({
  designation,
  onClose,
}: {
  designation: Designation;
  onClose: () => void;
}) {
  const designationId = String(designation?.id || "");
  const [resources, setResources] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [savingAll, setSavingAll] = useState(false);

  // table data
  const [formData, setFormData] = useState<{ permissions: ResourceRow[] }>({
    permissions: [],
  });

  // editor
  const [newResource, setNewResource] = useState<ResourceRow>({
    resource: "",
    view: false,
    create: false,
    edit: false,
    delete: false,
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [resourceSearch, setResourceSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  /** 1) fetch resources */
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res: any = await apiClient.get(
          apiClient.URLS.resources,
          {},
          true
        );
        const list: ResourceApi[] = Array.isArray(res?.body) ? res.body : [];
        setResources(
          list
            .map((x) => x.tablename)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b))
        );
      } catch (e) {
        console.error(e);
        toast.error("Failed to load resources");
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    console.log("designationId", designationId);
    if (!designationId) return;

    const fetchDesignationPermissions = async () => {
      setLoading(true);
      try {
        const res: any = await apiClient.get(
          `${apiClient.URLS.designationPermissions}/${designationId}/permissions`
        );
        const list: ResourceRow[] = Array.isArray(res?.body) ? res.body : [];
        list.sort((a, b) => (a.resource || "").localeCompare(b.resource || ""));

        setFormData({
          permissions: list.map((x) => ({ ...x, _status: "clean" })),
        });
      } catch (e) {
        console.error(e);
        toast.error("Failed to load designation permissions");
        setFormData({ permissions: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchDesignationPermissions();
  }, [designationId]);

  const filteredResourceDropdownOptions = useMemo(() => {
    let list = [...resources];
    if (resourceSearch.trim()) {
      const q = resourceSearch.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.toLowerCase().includes(q) ||
          formatResourceName(r).toLowerCase().includes(q)
      );
    }

    return [
      { label: "Select Resource", value: "" },
      ...list.map((r) => ({ label: formatResourceName(r), value: r })),
    ];
  }, [resources, resourceSearch]);

  /** Filter table */
  const filteredTableRows = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    const rows = formData.permissions.filter((r) => r._status !== "deleted");
    if (!q) return rows;

    return rows.filter(
      (r) =>
        r.resource.toLowerCase().includes(q) ||
        formatResourceName(r.resource).toLowerCase().includes(q)
    );
  }, [formData.permissions, tableSearch]);


  const handleCrudChange = (name: keyof ResourceRow, checked: boolean) => {
    setNewResource((prev) => ({ ...prev, [name]: checked }));
  };

  
  const resetEditor = () => {
    setEditId(null);
    setNewResource({
      resource: "",
      view: false,
      create: false,
      edit: false,
      delete: false,
    });
    setResourceSearch("");
  };

  /** ✅ Add/Update in LOCAL STATE only */
  const handleAddOrUpdateResourceLocal = () => {
    if (!designationId) return toast.error("Missing designation");
    if (!newResource.resource) return toast.error("Please select a resource");

    // prevent duplicates (resource unique)
    const existing = formData.permissions.find(
      (p) =>
        p._status !== "deleted" &&
        p.resource === newResource.resource &&
        p.id !== editId
    );
    if (existing)
      return toast.error("This resource already exists. Edit it instead.");

    // if editing
    if (editId) {
      setFormData((prev) => ({
        permissions: prev.permissions
          .map((p) => {
            if (p.id === editId) {
              const next: ResourceRow = {
                ...p,
                resource: newResource.resource,
                view: !!newResource.view,
                create: !!newResource.create,
                edit: !!newResource.edit,
                delete: !!newResource.delete,
                _status: p._status === "new" ? "new" : "dirty",
              };
              return next;
            }
            return p;
          })
          .sort((a, b) => a.resource.localeCompare(b.resource)),
      }));

      resetEditor();
      return;
    }

    // otherwise add new row locally
    const row: ResourceRow = {
      resource: newResource.resource,
      view: !!newResource.view,
      create: !!newResource.create,
      edit: !!newResource.edit,
      delete: !!newResource.delete,
      _status: "new",
    };

    setFormData((prev) => ({
      permissions: [...prev.permissions, row].sort((a, b) =>
        a.resource.localeCompare(b.resource)
      ),
    }));

    toast.success("Added locally (not saved yet)");
    resetEditor();
  };

  /** Load row into editor */
  const handleEditPermission = (row: ResourceRow) => {
    setEditId(row.id || "__local__" + row.resource); // supports local rows
    setNewResource({
      id: row.id,
      resource: row.resource,
      view: !!row.view,
      create: !!row.create,
      edit: !!row.edit,
      delete: !!row.delete,
    });
  };

  /** Delete locally (mark deleted if server row, remove if new local row) */
  const handleRemovePermissionLocal = (row: ResourceRow) => {
    setFormData((prev) => {
      const next = prev.permissions
        .map((p) => {
          const match =
            (row.id && p.id === row.id) ||
            (!row.id &&
              !p.id &&
              p.resource === row.resource &&
              p._status === "new");

          if (!match) return p;

          // new row not saved → remove completely
          if (!p.id && p._status === "new") return null as any;

          // existing row → mark deleted
          return { ...p, _status: "deleted" as const };
        })
        .filter(Boolean);

      return { permissions: next };
    });

    if (
      editId &&
      (row.id === editId || (!row.id && editId.includes(row.resource)))
    ) {
      resetEditor();
    }

    toast.success("Removed locally (not saved yet)");
  };

  /** Toggle table cell locally */
  const toggleCellLocal = (
    row: ResourceRow,
    action: keyof Pick<ResourceRow, "view" | "create" | "edit" | "delete">
  ) => {
    setFormData((prev) => ({
      permissions: prev.permissions.map((p) => {
        const match =
          (row.id && p.id === row.id) ||
          (!row.id &&
            !p.id &&
            p.resource === row.resource &&
            p._status === "new");

        if (!match) return p;

        const next = { ...p, [action]: !p[action] };
        next._status = next._status === "new" ? "new" : "dirty";
        return next;
      }),
    }));
  };

  /** ✅ Save all changes (bulk) */
  const handleSaveAllPermissions = async () => {
    if (!designationId) return toast.error("Missing designation");
    const rows = formData.permissions;

    const toCreate = rows.filter((r) => r._status === "new");
    const toUpdate = rows.filter((r) => r.id && r._status === "dirty");
    const toDelete = rows.filter((r) => r.id && r._status === "deleted");

    if (
      toCreate.length === 0 &&
      toUpdate.length === 0 &&
      toDelete.length === 0
    ) {
      return toast("No changes to save", { icon: "ℹ️" });
    }

    setSavingAll(true);

    try {
      // 1) create
      for (const r of toCreate) {
        await apiClient.post(
          `${apiClient.URLS.designationPermissions}/${designationId}/permissions`,
          {
            resource: r.resource,
            view: !!r.view,
            create: !!r.create,
            edit: !!r.edit,
            delete: !!r.delete,
          },
          true
        );
      }

      // 2) update
      for (const r of toUpdate) {
        await apiClient.patch(
          `${apiClient.URLS.designationPermissions}/${designationId}/permissions/${r.id}`,
          {
            resource: r.resource,
            view: !!r.view,
            create: !!r.create,
            edit: !!r.edit,
            delete: !!r.delete,
          },
          true
        );
      }

      // 3) delete
      for (const r of toDelete) {
        await apiClient.delete(
          `${apiClient.URLS.designationPermissions}/${designationId}/permissions/${r.id}`,
          {},
          true
        );
      }

      // ✅ refetch latest from server
      const res: any = await apiClient.get(
        `${apiClient.URLS.designationPermissions}/${designationId}/permissions`,
        {},
        true
      );
      const list: ResourceRow[] = Array.isArray(res?.body) ? res.body : [];
      list.sort((a, b) => a.resource.localeCompare(b.resource));

      setFormData({
        permissions: list.map((x) => ({ ...x, _status: "clean" })),
      });

      resetEditor();
      toast.success("Permissions saved successfully");
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.body?.message ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to save permissions";
      toast.error(String(msg));
    } finally {
      setSavingAll(false);
    }
  };

  const pendingChangesCount = useMemo(() => {
    return formData.permissions.filter(
      (r) => r._status && r._status !== "clean"
    ).length;
  }, [formData.permissions]);

  return (
    <div className="md:p-6 p-3 app-card rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] w-full max-w-full border app-border">
      <div className="md:space-y-4 space-y-2">
        {/* header */}
        <div className="flex items-start md:flex-row flex-col justify-between md:gap-3 gap-2">
          <div>
            <h3 className="text-[14px] md:text-[18px] font-medium app-text">
              Designation Permissions
            </h3>
            <p className="text-[10px] md:text-[12px] app-text mt-1">
              Add/Edit resources locally, then save once at the end.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="md:px-2.5 px-1.5 py-1 tex-nowrap rounded-full md:text-[11px] text-[9px] font-medium app-card app-text border app-border">
              {filteredTableRows.length} Resources
            </span>
            <span className="md:px-2.5 px-1.5 py-1 tex-nowrap rounded-full md:text-[11px] text-[9px] font-medium border border-amber-200 bg-amber-50 text-amber-700">
              {pendingChangesCount} pending
            </span>
          </div>
        </div>

        {/* add/edit card */}
        <div className="rounded-xl border app-border overflow-hidden">
          <div className="flex items-center justify-between px-3 md:px-4 md:py-3 py-2 app-card border-b">
            <div>
              <p className="text-[12px] md:text-[14px] font-medium app-text">
                {editId
                  ? "Edit Resource Permission"
                  : "Add Resource Permission"}
              </p>
              <p className="text-[11px] app-text mt-0.5">
                Choose resource → tick permissions → <b>Add Resource</b>.
                Finally click <b>Save Permissions</b>.
              </p>
            </div>

            <Button
              type="button"
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium border app-border app-card app-text hover:app-surface"
              onClick={resetEditor}
              disabled={savingAll}
            >
              Reset
            </Button>
          </div>

          <div className="p-2 md:p-4 space-y-3">
            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-2 gap-1">
              <Field label="Select Resource" required>
                <SingleSelect
                  value={newResource.resource}
                  onChange={(v: any) =>
                    setNewResource((p) => ({ ...p, resource: String(v) }))
                  }
                  options={filteredResourceDropdownOptions}
                  placeholder="Select Resource"
                  placement="auto"
                  searchable
                />
              </Field>
            </div>

            <div className="rounded-xl border app-border app-card p-3">
              <p className="text-[12px] md:text-[13px] font-medium app-text mb-2">
                Select Required Permissions
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 md:gap-2 gap-1">
                {(["view", "create", "edit", "delete"] as const).map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center gap-2 rounded-lg border app-border px-3 py-2 hover:app-surface"
                  >
                    <Checkbox
                      name={perm}
                      checked={Boolean(newResource[perm])}
                      onChange={(e: any) =>
                        handleCrudChange(perm, !!e?.target?.checked)
                      }
                      className="md:h-3.5 h-3 w-3 md:w-3.5"
                    />
                    <span className="md:text-[12px] text-[10px] font-medium app-text">
                      {perm === "view"
                        ? "Read"
                        : perm.charAt(0).toUpperCase() + perm.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Resource button */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={handleAddOrUpdateResourceLocal}
                disabled={!designationId || savingAll}
                className={`md:px-4 py-2 px-3 rounded-lg md:text-[14px] text-[12px] font-medium text-white shadow-sm transition
                  ${
                    !designationId || savingAll
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {editId ? "Update Resource" : "+ Add Resource"}
              </Button>
            </div>
          </div>
        </div>

        {/* search */}
        <div className="rounded-xl border app-card app-border md:p-3 p-2">
          <Field label="Search Added Resources">
            <TextInput
              value={tableSearch}
              onChange={(e: any) => setTableSearch(e.target.value)}
              placeholder="Search in table..."
            />
          </Field>
        </div>

        {/* table */}
        <div className="rounded-xl border app-border overflow-hidden">
          <div className="px-3 md:px-4 md:py-3 py-2 app-card border-b flex items-center justify-between">
            <p className="text-[13px] md:text-[14px] font-medium app-text">
              Permissions Summary
            </p>
            <span className="text-[11px] app-text">
              {loading ? "Loading..." : `${filteredTableRows.length} items`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="app-card border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-[12px] font-medium app-text">
                    Resource
                  </th>
                  {["Create", "Read", "Update", "Delete"].map((h) => (
                    <th
                      key={h}
                      className="text-center py-3 px-4 text-[12px] font-medium app-text"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 md:text-[12px] text-[10px] font-medium app-text">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-[12px] app-text"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredTableRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-[12px] app-text"
                    >
                      No permissions added yet.
                    </td>
                  </tr>
                ) : (
                  filteredTableRows.map((perm) => {
                    const changed =
                      perm._status === "new" ||
                      perm._status === "dirty" ||
                      perm._status === "deleted";

                    return (
                      <tr
                        key={perm.id || perm.resource}
                        className={`border-t hover:app-card ${
                          changed ? "bg-amber-50/40" : ""
                        }`}
                      >
                        <td className="py-3 px-4 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#2563eb] text-[12px] md:text-[13px]">
                              {formatResourceName(perm.resource)}
                            </span>
                            {perm._status === "new" ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                NEW
                              </span>
                            ) : perm._status === "dirty" ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                EDITED
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {(["create", "view", "edit", "delete"] as const).map(
                          (action) => (
                            <td
                              key={`${perm.id || perm.resource}-${action}`}
                              className="md:py-2 py-1 md:px-4 px-2 text-center"
                            >
                              <Button
                                type="button"
                                onClick={() => toggleCellLocal(perm, action)}
                                className={`inline-flex items-center justify-center md:w-8 w-5 h-5 md:h-8 rounded-lg border transition
                                ${
                                  perm[action]
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                                    : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                                }`}
                                title={action}
                                disabled={savingAll}
                              >
                                {perm[action] ? "✓" : "✕"}
                              </Button>
                            </td>
                          )
                        )}

                        <td className="py-2 px-4">
                          <div className="flex justify-center gap-2">
                            <Button
                              type="button"
                              onClick={() => handleEditPermission(perm)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100"
                              title="Edit"
                              disabled={savingAll}
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </Button>

                            <Button
                              type="button"
                              onClick={() => handleRemovePermissionLocal(perm)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100"
                              title="Delete"
                              disabled={savingAll}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ bottom save + close */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            onClick={onClose}
            disabled={savingAll}
            className="md:px-4 md:py-2 py-2 px-3 rounded-lg md:text-[14px] text-[12px] font-medium border app-border app-card app-text hover:app-surface disabled:opacity-60"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={handleSaveAllPermissions}
            disabled={savingAll || pendingChangesCount === 0}
            className={`md:px-5 md:py-2 py-2 px-4 rounded-lg md:text-[14px] text-[12px] font-medium text-white shadow-sm transition
              ${
                savingAll || pendingChangesCount === 0
                  ? "bg-emerald-300 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
          >
            {savingAll ? "Saving..." : "Save Permissions"}
          </Button>
        </div>
      </div>
    </div>
  );
}
