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
  Download,
  Eye,
  Layers,
  Pencil,
  Plus,
  Trash2,
  Users,
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

type Designation = { id: number; name: string; levelOrder: number };
type Option = { label: string; value: string };

type PermissionMaster = {
  id: number;
  code: string;
  description: string;
};

type Crud = { view: boolean; create: boolean; edit: boolean; delete: boolean };

type ResourceRow = {
  resource: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
};

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

export default function DesignationsPermissionsPage() {
  const [designations, setDesignations] = useState<any[]>([]);
  const [tab, setTab] = useState<"users" | "designations">("users");
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

  const confirmType = "DEACTIVATE";

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [isAgent, setIsAgent] = useState(false);

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
    npm: "",
    yearsOfExperience: 0,
    ahipCertified: false,
    ahipProofUrl: "",
    stateLicensed: false,
    accessLevel: "TRAINING",
    bankAccounts: [],
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
    number | null
  >(null);

  const openEditDesignation = (d: any) => {
    setSelectedDesignationId(Number(d.id));
    setSelectedDesignation(d);
    setForm({ name: d.name ?? "", levelOrder: Number(d.levelOrder ?? 0) });
    setFormMode("edit");
    setFormOpen(true);
  };

  const updateDesignation = async () => {
    if (!selectedDesignationId) {
      toast.error("No designation selected");
      return;
    }

    const id = Number(selectedDesignationId);
    if (!Number.isInteger(id) || id <= 0) {
      toast.error("Invalid designation id");
      return;
    }

    const payload = {
      name: form.name.trim(),
      levelOrder: Number(form.levelOrder),
    };

   
    const res = await apiClient.put(
      `${apiClient.URLS.designation}/${id}`,
      payload,
      true
    );

    setDesignations((prev) =>
      prev
        .map((d) => (Number(d.id) === id ? res.data : d))
        .sort((a, b) => a.levelOrder - b.levelOrder)
    );

    toast.success("Designation updated");
    setFormOpen(false);
  };

  const createDesignation = async () => {
    const e = validateDesignationForm(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        levelOrder: Number(form.levelOrder),
      };

      const res = await apiClient.post(
        apiClient.URLS.designation,
        payload,
        true
      );

      setDesignations((prev) =>
        [...prev, res.data].sort((a, b) => a.levelOrder - b.levelOrder)
      );

      toast.success("Designation created");
      setFormOpen(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Create failed");
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
        "flex items-center gap-2 md:px-4 px-2 md:py-2 py-1 rounded-xl border transition-all text-[12px] md:text-[14px] font-Gordita-Medium",
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

    setEmployee({ designationId: 0, reportsToId: undefined });

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
      npm: "",
      yearsOfExperience: 0,
      ahipCertified: false,
      ahipProofUrl: "",
      stateLicensed: false,
      accessLevel: "TRAINING",
      bankAccounts: [],
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
      password: "", // usually don't edit password here
      phone: u.phone || "",
      profileImage: (u as any)?.profileImage || "",
      systemRole: u.systemRole || "STANDARD",
    });

    setEmployee({
      designationId: u.employee?.designation?.id || 0,
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
        npm: u.agentProfile.npm || "",
        yearsOfExperience: Number(u.agentProfile.yearsOfExperience || 0),
        ahipCertified: !!u.agentProfile.ahipCertified,
        ahipProofUrl: u.agentProfile.ahipProofUrl || "",
        stateLicensed: !!u.agentProfile.stateLicensed,
        accessLevel: u.agentProfile.accessLevel || "TRAINING",
        bankAccounts:
          u.agentProfile.bankAccounts?.map((b) => ({
            id: b.id,
            bankName: b.bankName,
            accountNumber: b.accountNumber,
            ifscNumber: b.ifscNumber,
            accountHolderName: b.accountHolderName,
            isPrimary: b.isPrimary ?? false,
            isVerified: b.isVerified ?? false,
          })) || [],
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
        password: payload.user.password.trim(),

        // ...(payload.user.password?.trim()
        //   ? { password: payload.user.password.trim() }
        //   : {}),
      },
    };

    if (role === "ADMIN") return update;

    if (payload.employee) {
      update.employee = {
        designationId: payload.employee.designationId,
        reportsToId: payload.employee.reportsToId,
      };
    }

    if (payload.addresses?.length) {
      update.addresses = payload.addresses.map((a) => ({
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

    if (payload.agentProfile) {
      update.agentProfile = {
        npm: payload.agentProfile.npm,
        yearsOfExperience: payload.agentProfile.yearsOfExperience,
        ahipCertified: payload.agentProfile.ahipCertified,
        ahipProofUrl: payload.agentProfile.ahipCertified
          ? payload.agentProfile.ahipProofUrl
          : undefined,
        stateLicensed: payload.agentProfile.stateLicensed,
        accessLevel: payload.agentProfile.accessLevel,
        bankAccounts: payload.agentProfile.bankAccounts?.map((b) => ({
          bankName: b.bankName,
          accountNumber: b.accountNumber,
          ifscNumber: b.ifscNumber,
          accountHolderName: b.accountHolderName,
          isPrimary: b.isPrimary ?? false,
          isVerified: b.isVerified ?? false,
        })),
      };
    } else {
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
                  widthClassName: "md:w-[360px] w-full rounded-xl",
                  debounceMs: 300,
                }}
                actionsSlot={
                  <>
                    <div className="flex items-center gap-2">
                      <Button
                        className="bg-linear-to-r from-emerald-500 to-teal-600 text-white md:px-5 px-3 md:text-[16px] text-[12px] md:py-2.5 py-1.5 rounded-xl  font-Gordita-Medium shadow-md hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                        onClick={openAddUser}
                        disabled={loadingUsers || savingUser}
                      >
                        + Add User
                      </Button>

                      <Button
                        className="bg-linear-to-r from-blue-500 to-indigo-600 text-white md:px-5 px-3 md:text-[16px] text-[12px] md:py-2.5 py-1.5 rounded-xl  font-Gordita-Medium shadow-md hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
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
              <div className="py-12 text-center app-text">No users found</div>
            ) : (
              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="app-card rounded-2xl border app-border p-4 md:p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-[2px]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1 md:space-y-1.5">
                        <p className="font-Gordita-Bold app-text text-sm md:text-base">
                          {u.firstName} {u.lastName}
                        </p>

                        <p className="font-Gordita-Medium app-muted text-[11px] md:text-xs">
                          {u.email}
                        </p>

                        <p className="font-Gordita-Medium app-muted text-[11px] md:text-xs">
                          {u.phone}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1 md:pt-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-Gordita-Medium app-card app-text border app-border">
                            {u.systemRole}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-Gordita-Medium app-card app-text border app-border">
                            {u.userStatus}
                          </span>

                          {u.employee?.designation?.name && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-Gordita-Medium app-card app-text border app-border">
                              {u.employee.designation.name}
                            </span>
                          )}

                          {u.agentProfile && (
                            <span className="px-3 py-1 rounded-full text-[10px] md:text-[11px] font-Gordita-Medium border app-border bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
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
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 md:p-2.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 
                 rounded-full opacity-70 cursor-default"
                            >
                              <Check size={16} className="md:size-[18px]" />
                            </Button>
                          ) : (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                deactivateUser(u);
                              }}
                              className="p-2 md:p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 
                 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-full transition-all 
                 disabled:opacity-40"
                              disabled={savingUser}
                            >
                              <Trash2 size={16} className="md:size-[18px]" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {u.agentProfile && (
                      <div className="mt-3 md:mt-4 text-[11px] md:text-xs font-Gordita-Medium app-muted border-t app-border pt-2 md:pt-3">
                        Agent Access:
                        <span className="app-text ml-1">
                          {u.agentProfile.accessLevel}
                        </span>
                        <span className="mx-1.5">•</span>
                        NPN:
                        <span className="app-text ml-1">
                          {u.agentProfile.npm}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
            <div className="relative p-6 w-[92%] max-w-md mx-auto app-card rounded-3xl shadow-2xl border app-border animate-scaleIn overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500"></div>

              <div className="flex justify-center mt-2">
                <div className="w-18 h-18 flex items-center justify-center rounded-full border-4 app-card shadow-lg border-orange-200 shadow-orange-400/30">
                  <Trash2 className="w-8 h-8 text-orange-600 animate-pulse" />
                </div>
              </div>

              <div className="text-center mt-4 space-y-2">
                <h3 className="text-[12px] md:text-[20px] font-extrabold app-text tracking-tight">
                  Deactivate User?
                </h3>
                <p className="text-sm app-text font-Gordita-Medium">
                  This user will lose access and go offline.
                </p>
              </div>

              {/* Progress bar */}
              <div className="flex items-center justify-center gap-2 mt-5">
                <span className="text-xs  font-Gordita-Bold text-slate-400">
                  Power
                </span>
                <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[35%] transition-all duration-700 bg-orange-600"></div>
                </div>
                <span className="text-xs  font-Gordita-Bold text-slate-400">
                  35%
                </span>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 mt-7">
                <Button
                  className="md:px-5 px-3 md:py-2.5 py-1.5 md:text-[14px] text-[12px] rounded-2xl app-card app-text font-Gordita-Medium  font-Gordita-Bold hover:scale-105 active:scale-95 transition-all"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  className="md:px-6 px-3 md:py-2.5 py-1.5 md:text-[14px] text-[12px] rounded-2xl text-white font-Gordita-Medium  font-Gordita-Bold flex items-center gap-2 shadow-lg hover:scale-110 active:scale-95 transition-all bg-linear-to-r from-orange-600 to-red-600 shadow-red-400/40"
                  onClick={() => {
                    deactivateUser(selectedUser as any);
                    setConfirmOpen(false);
                  }}
                >
                  <Trash2 className="w-4 h-4" /> Deactivate
                </Button>
              </div>

              {/* Background decorative icons */}
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
          <div className="pt-5">
            <TableToolbar
              search={{
                value: tableSearch,
                onChange: setTableSearch,
                placeholder: "Search designations...",
                widthClassName: "md:w-[360px] w-full rounded-xl",
                debounceMs: 300,
              }}
              actionsSlot={
                <div className="flex items-center gap-2">
                  <Button
                    className="bg-linear-to-r from-emerald-500 to-teal-600 text-white md:px-5 px-3 md:text-[16px] text-[12px] md:py-2.5 py-1.5 rounded-xl  font-Gordita-Medium shadow-md hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                    onClick={openAddDesignation}
                    disabled={loading || saving}
                  >
                    + Add
                  </Button>

                  <Button
                    className="bg-linear-to-r from-blue-500 to-indigo-600 text-white md:px-5 px-3 md:text-[16px] text-[12px] md:py-2.5 py-1.5 rounded-xl  font-Gordita-Medium shadow-md hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                    onClick={fetchDesignations}
                    disabled={loading}
                  >
                    {loading ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
              }
            />

            {/* Designations Grid */}
            {filteredDesignations.length === 0 ? (
              <div className="py-12 text-center app-text">
                No designations available
              </div>
            ) : (
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
                        <p className="md:text-base  font-Gordita-Bold app-text group-hover:text-blue-600 transition">
                          {d.name}
                        </p>

                        <span className="px-2.5 py-1 text-[10px]  font-Gordita-Bold rounded-full app-card app-text">
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
                              deleteDesignation(d);
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
          </div>
        ) : null}
      </div>

      {/* Add/Edit Designation Modal */}
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
              className="md:px-4 px-2 md:py-2 py-1 md:text-[14px] text-[12px] app-text rounded-xl border"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              className="md:px-4 px-2 md:py-2 py-1 font-Gordita-Medium md:text-[14px] text-[12px] rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
              disabled={saving || !form.name.trim() || form.levelOrder < 1}
              onClick={
                formMode === "add" ? createDesignation : updateDesignation
              }
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

function DesignationPermissionsCrudModalBody({
  designation,
  onClose,
}: {
  designation: Designation;
  onClose: () => void;
}) {
  const [designationOptions, setDesignationOptions] = useState<Option[]>([]);
  const [designationId, setDesignationId] = useState<string>(
    String(designation.id)
  );

  const [allPermissions, setAllPermissions] = useState<PermissionMaster[]>([]);
  const [allowedByCode, setAllowedByCode] = useState<Record<string, boolean>>(
    {}
  );

  const [formData, setFormData] = useState({
    permissions: [] as ResourceRow[],
  });

  const [newResource, setNewResource] = useState<ResourceRow>({
    resource: "",
    view: false,
    create: false,
    edit: false,
    delete: false,
  });

  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [resourceSearch, setResourceSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const res: any = await apiClient.get(
          apiClient.URLS.designation,
          {},
          true
        );
        const list = Array.isArray(res?.body) ? res.body : [];
        
        setDesignationOptions(
          list.map((d: any) => ({ label: d.name, value: String(d.id) }))
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetchDesignations();
  }, []);

  /** fetch permissions master */
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res: any = await apiClient.get(
          apiClient.URLS.permissions,
          {},
          true
        );
        const list = Array.isArray(res?.body) ? res.body : [];
        setAllPermissions(list);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load permissions");
      }
    };
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (!designationId) return;

    const fetchDesignationPermissions = async () => {
      setLoading(true);
      try {
        const res: any = await apiClient.get(
          `${apiClient.URLS.designationPermissions}/${designationId}`,
          {},
          true
        );

        const list: DesignationPermissionApiRow[] = Array.isArray(res?.body)
          ? res.body
          : [];

        const map: Record<string, boolean> = {};
        for (const row of list) {
          const code =
            row?.permission?.code ||
            allPermissions.find((p) => p.id === row.permissionId)?.code;

          if (code) map[code] = !!row.allowed;
        }

        setAllowedByCode(map);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load designation permissions");
        setAllowedByCode({});
      } finally {
        setLoading(false);
      }
    };

    fetchDesignationPermissions();
  }, [designationId, allPermissions]);

  const resourceRowsFromServer = useMemo(() => {
    const grouped: Record<string, ResourceRow> = {};

    for (const p of allPermissions) {
      const parsed = parsePermissionCode(p.code);
      if (!parsed) continue;

      const { resource, action } = parsed;

      if (!grouped[resource]) {
        grouped[resource] = {
          resource,
          view: false,
          create: false,
          edit: false,
          delete: false,
        };
      }

      grouped[resource][action] = !!allowedByCode[p.code];
    }

    return Object.values(grouped).sort((a, b) =>
      a.resource.localeCompare(b.resource)
    );
  }, [allPermissions, allowedByCode]);

  useEffect(() => {
    setFormData({ permissions: resourceRowsFromServer });
  }, [resourceRowsFromServer]);

  const filteredResourceDropdownOptions = useMemo(() => {
    const unique = new Set<string>();
    allPermissions.forEach((p) => {
      const parsed = parsePermissionCode(p.code);
      if (parsed) unique.add(parsed.resource);
    });

    let list = Array.from(unique).sort((a, b) => a.localeCompare(b));

    if (resourceSearch.trim()) {
      const q = resourceSearch.trim().toLowerCase();
      list = list.filter(
        (r) => r.includes(q) || formatResourceName(r).toLowerCase().includes(q)
      );
    }

    return [
      { label: "Select Resource", value: "" },
      ...list.map((r) => ({ label: formatResourceName(r), value: r })),
    ];
  }, [allPermissions, resourceSearch]);

  const filteredTableRows = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return formData.permissions;
    return formData.permissions.filter(
      (r) =>
        formatResourceName(r.resource).toLowerCase().includes(q) ||
        r.resource.toLowerCase().includes(q)
    );
  }, [formData.permissions, tableSearch]);

  const handleCrudChange = ({
    name,
    checked,
  }: {
    name: keyof ResourceRow;
    checked: boolean;
  }) => {
    setNewResource((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAddOrUpdateResource = () => {
    if (!newResource.resource) {
      toast.error("Please select a resource");
      return;
    }

    if (editIndex !== null) {
      const updated = [...formData.permissions];
      updated[editIndex] = newResource;
      setFormData({ permissions: updated });
      setEditIndex(null);
      toast.success("Permission updated successfully");
    } else {
      setFormData((prev) => ({
        permissions: [...prev.permissions, newResource],
      }));
      toast.success("Permission added successfully");
    }

    setNewResource({
      resource: "",
      view: false,
      create: false,
      edit: false,
      delete: false,
    });
    setResourceSearch("");
  };

  const handleEditPermission = (index: number) => {
    setEditIndex(index);
    setNewResource(formData.permissions[index]);
  };

  const handleRemovePermission = (index: number) => {
    const updated = [...formData.permissions];
    updated.splice(index, 1);
    setFormData({ permissions: updated });
    toast.success("Resource removed");
  };

  const toggleCell = (idx: number, action: keyof Crud) => {
    const updated = [...formData.permissions];
    updated[idx] = { ...updated[idx], [action]: !updated[idx][action] };
    setFormData({ permissions: updated });
  };

  const buildSavePayload = () => {
    const allowedByResourceAction = new Map<string, boolean>();

    formData.permissions.forEach((r) => {
      ACTIONS.forEach((action) => {
        allowedByResourceAction.set(`${r.resource}__${action}`, !!r[action]);
      });
    });

    const permissions = allPermissions
      .map((p) => {
        const parsed = parsePermissionCode(p.code);
        if (!parsed) return null;

        const allowed =
          allowedByResourceAction.get(`${parsed.resource}__${parsed.action}`) ??
          false;

        return { permissionId: p.id, allowed };
      })
      .filter(Boolean) as { permissionId: number; allowed: boolean }[];

    return { permissions };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!designationId) {
      toast.error("Select designation");
      return;
    }

    try {
      setSaving(true);
      const payload = buildSavePayload();

      await apiClient.put(
        `${apiClient.URLS.designationPermissions}/${designationId}`,
        payload,
        true
      );

      toast.success("Permissions saved ");
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="md:p-6 p-3 app-card rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] w-full max-w-full border app-border">
      <form onSubmit={handleSubmit} className="md:space-y-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[16px] md:text-[18px] font-Gordita-Medium text-slate-900">
              Designation Permissions
            </h3>
            <p className="text-[11px] md:text-[12px] app-text mt-1">
              Select a designation and configure resource-wise CRUD access.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-Gordita-Medium app-card app-text">
              {filteredTableRows.length} Resources
            </span>
          </div>
        </div>

        <div className="rounded-xl border app-card app-border md:p-3 p-1">
          <Field label="Designation" required>
            <SingleSelect
              value={designationId}
              onChange={(v: any) => setDesignationId(String(v))}
              options={[
                { label: "Select Designation", value: "" },
                ...designationOptions,
              ]}
              placeholder="Select Designation"
              placement="auto"
              searchable
            />
          </Field>
        </div>

        <div className="rounded-xl border app-border overflow-hidden">
          <div className="flex items-center justify-between px-3 md:px-4 md:py-3 py-1 app-card border-b">
            <div>
              <p className="text-[13px] md:text-[14px] font-Gordita-Medium app-text">
                {editIndex !== null
                  ? "Edit Resource Permission"
                  : "Add Resource Permission"}
              </p>
              <p className="text-[11px] app-text mt-0.5">
                Search resource → choose → tick required permissions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="px-3 py-1.5 rounded-lg text-[12px] font-Gordita-Medium border app-border app-card app-text hover:app-surface"
                onClick={() => {
                  setEditIndex(null);
                  setNewResource({
                    resource: "",
                    view: false,
                    create: false,
                    edit: false,
                    delete: false,
                  });
                  setResourceSearch("");
                }}
              >
                Reset
              </Button>
            </div>
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
              <p className="text-[12px] md:text-[13px] font-Gordita-Medium app-text mb-2">
                Select Required Permissions
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 md:gap-2 gap-1">
                {["view", "create", "edit", "delete"].map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center gap-2 rounded-lg border app-border px-3 py-2 hover:app-surface"
                  >
                    <Checkbox
                      name={perm}
                      checked={Boolean(newResource[perm as keyof ResourceRow])}
                      onChange={(e: any) =>
                        handleCrudChange({
                          name: perm as keyof ResourceRow,
                          checked: !!e?.target?.checked,
                        })
                      }
                      className="md:h-3.5 h-3 w-3 md:w-3.5"
                    />
                    <span className="md:text-[12px] text-[10px] font-Gordita-Medium app-text">
                      {perm === "view"
                        ? "Read"
                        : perm.charAt(0).toUpperCase() + perm.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between w-full gap-2">
              <Button
                type="button"
                onClick={() => {
                  setEditIndex(null);
                  setNewResource({
                    resource: "",
                    view: false,
                    create: false,
                    edit: false,
                    delete: false,
                  });
                  setResourceSearch("");
                }}
                className=" md:px-4 py-2  px-2 rounded-lg md:text-[14px] text-[12px] font-Gordita-Medium
                       border app-border app-surface app-text
                       hover:app-surface active:bg-slate-200"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleAddOrUpdateResource}
                disabled={!designationId}
                className={` md:px-4 py-2  font-Gordita-Medium  px-2 rounded-lg md:text-[14px] text-[12px] font-Gordita-Medium text-white
                        shadow-sm transition
                        ${
                          !designationId
                            ? "bg-emerald-300 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-700"
                        }`}
              >
                {editIndex !== null ? "Update Permission" : "Save Resource"}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border app-card app-border md:p-3 p-1">
          <Field label="Search Added Resources">
            <TextInput
              value={tableSearch}
              onChange={(e: any) => setTableSearch(e.target.value)}
              placeholder="Search in table..."
            />
          </Field>
        </div>

        <div className="rounded-xl border app-border overflow-hidden">
          <div className="px-2 md:px-4 md:py-3 py-1 app-card border-b flex items-center justify-between">
            <p className="text-[13px] md:text-[14px] font-Gordita-Medium app-text">
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
                  <th className="text-left py-3 px-4 text-[12px] font-Gordita-Medium app-text">
                    Resource
                  </th>
                  {["Create", "Read", "Update", "Delete"].map((h) => (
                    <th
                      key={h}
                      className="text-center py-3 px-4 text-[12px] font-Gordita-Medium app-text"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 text-[12px] font-Gordita-Medium app-text">
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
                  filteredTableRows.map((perm, idx) => (
                    <tr key={perm.resource} className="border-t hover:app-card">
                      <td className="py-3 px-4 text-left font-Gordita-Medium text-[#2563eb] text-[12px] md:text-[13px]">
                        {formatResourceName(perm.resource)}
                      </td>

                      {["create", "view", "edit", "delete"].map((action) => (
                        <td
                          key={`${perm.resource}-${action}`}
                          className="py-2 px-4 text-center"
                        >
                          <Button
                            type="button"
                            onClick={() =>
                              toggleCell(idx, action as keyof Crud)
                            }
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition
                          ${
                            perm[action as keyof ResourceRow]
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                              : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                          }`}
                            title={action}
                          >
                            {perm[action as keyof ResourceRow] ? "✓" : "✕"}
                          </Button>
                        </td>
                      ))}

                      <td className="py-2 px-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            type="button"
                            onClick={() => handleEditPermission(idx)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg
                                   bg-indigo-50 text-indigo-600 border border-indigo-100
                                   hover:bg-indigo-100"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Button>

                          <Button
                            type="button"
                            onClick={() => handleRemovePermission(idx)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg
                                   bg-rose-50 text-rose-600 border border-rose-100
                                   hover:bg-rose-100"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="md:px-4   md:py-2  font-Gordita-Medium py-1  px-2 rounded-lg md:text-[14px] text-[12px] font-Gordita-Medium
                   border app-border app-card app-text
                   hover:app-surface disabled:opacity-60"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={saving || loading || !designationId}
            className={`md:px-4 md:py-2 py-1  font-Gordita-Medium px-2 rounded-lg md:text-[14px] text-[12px] font-Gordita-Medium text-white shadow-sm
          ${
            saving || loading || !designationId
              ? "bg-violet-300 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-700 active:bg-violet-700"
          }`}
          >
            {saving ? "Saving..." : "Save Permissions"}
          </Button>
        </div>
      </form>
    </div>
  );
}
