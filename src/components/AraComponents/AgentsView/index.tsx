"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import TableToolbar from "@/commonComponents/TableSearchBar";
import {
  Download,
  Pencil,
  Trash2,
  Key,
  Mail,
  Phone,
  User,
  Lock,
  UserPlus,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  Calendar,
  Check,
  Plus,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import apiClient from "@/Utils/apiClient";
import Modal from "@/commonComponents/Modal";

import { TextInput } from "@/commonComponents/form/TextInput";
import { Field } from "@/commonComponents/form/Field";
import { MultiSelect } from "@/commonComponents/form/MultiSelect";
import { SingleSelect } from "@/commonComponents/form/SingleSelect";

import {
  DEFAULT_APPS_OPTIONS,
  DEFAULT_ACCESS_OPTIONS,
} from "../../../../src/Utils/constants/ara/constants";
import toast from "react-hot-toast";

export type AgentRole = "Agent" | "Admin" | "SuperAdmin";
// export type AgentAccess = "Training" | "Production" | "QA";
import Papa from "papaparse";
import CSVUploadModal from "./CsvUploadModal";
import Pagination from "@/commonComponents/Pagination";
import Loader from "@/commonComponents/Loader";
import Drawer from "@/commonComponents/Drawers";
import Button from "@/commonComponents/Button";
import { CsvUserRow } from "./helper";
export type AgentAccess = "Training" | "FullAccess";

const accessLevelMap: Record<AgentAccess, "TRAINING" | "ALL_ACCESS"> = {
  Training: "TRAINING",
  FullAccess: "ALL_ACCESS",
};

type AgentsRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employee: {
    designation: { name: string; id: string };
    id:string;

  };
  agentProfile: {
    id:string;
    npn: string;
  yearsOfExperience: number;
  ahipCertified: boolean;
  chaseExt: string;

  chaseDataUsername: string;
  chaseDataPassword: string;

  healthSherpaUsername: string;
  healthSherpaPassword: string;

  myMfgUsername: string;
  myMfgPassword: string;

  ffmUsername: string;

  apps: string[];
  accessLevel: string;
  isActive: boolean;
  stateLicensed: boolean;
  stateLicenseNumber?: string;
  
  };
  userStatus: string;
  password: string;
};

const normalizePhone = (v: string) => v.replace(/[^\d+]/g, "");
const normalizeSSN = (v: string) => v.replace(/[^\d]/g, "").slice(0, 9);

export type AgentForm = {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  ssn: string;
  phone: string;
  password: string;

  designation: string;
  npn: string;

  chaseExt: string;
  reportsTo: string;
  chaseDataUsername: string;
  chaseDataPassword: string;
  yearsOfExperience: number | "";
  ahipCertified: boolean;
  stateLicensed: boolean;

  healthSherpaUsername: string;
  healthSherpaPassword: string;

  myMfgUsername: string;
  myMfgPassword: string;

  ffmUsername: string;
  forwarding: string;

  payStructure: string;

  role: AgentRole | "";
  access: AgentAccess | "";
  apps: string[];
};

const emptyForm = (): AgentForm => ({
  firstName: "",
  lastName: "",
  email: "",
  dob: "",
  ssn: "",
  phone: "",

  designation: "",
  reportsTo: "",
  npn: "",
  password: "",
  yearsOfExperience: "",
  ahipCertified: false,
  stateLicensed: false,

  chaseExt: "",
  chaseDataUsername: "",
  chaseDataPassword: "",

  healthSherpaUsername: "",
  healthSherpaPassword: "",

  myMfgUsername: "",
  myMfgPassword: "",

  ffmUsername: "",
  forwarding: "",

  payStructure: "",

  role: "",
  access: "",
  apps: [],
});

export default function AcaAgentsView() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<AgentsRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const LIMIT = 10;
  type SortKey = "firstName" | "lastName" | "email" | "role" | "userStatus";

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showPassword, setShowPassword] = useState(false);

  const [OpenModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<AgentsRow | null>(null);
  const [designationOptions, setDesignationOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [reportsToOptions, setReportsToOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [form, setForm] = useState<AgentForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = Boolean(editing?.id);

  const [isAgentsLoading, setIsAgentsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openFileModal, setOpenFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [total, setTotal] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"ACTIVATE" | "DEACTIVATE">(
    "DEACTIVATE"
  );
  const [selectedAgent, setSelectedAgent] = useState<AgentsRow | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [updating, setUpdating] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(
        apiClient.URLS.user,
        { page, limit: LIMIT },
        true
      );
      if (res?.status) {
        const body = res?.body ?? res;

        const list = body?.data?.items || body?.items || body?.data || [];
        const totalCount =
          body?.data?.total || body?.meta?.total || list.length;
        setItems(Array.isArray(list) ? list : []);
        setTotal(totalCount);
        toast.success("Agents fetched successfully");
      }
    } catch (e) {
      console.error(e);
      setItems([]);
      setTotal(0);
      toast.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [page, q]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setOpenModal(true);
  };
  const sortData = (key: SortKey, order: "asc" | "desc") => {
    setSortKey(key);
    setSortOrder(order);
  };
  const filteredItems = useMemo(() => {
    if (!q.trim()) return items;
    const query = q.toLowerCase();

    return items.filter((a) => {
      const f = a.firstName?.toLowerCase() || "";
      const l = a.lastName?.toLowerCase() || "";
      return f.includes(query) || l.includes(query);
    });
  }, [items, q]);

  const sortedItems = useMemo(() => {
    if (!sortKey) return filteredItems;

    return [...filteredItems].sort((a, b) => {
      const aVal = (a[sortKey as keyof AgentsRow] ?? "")
        .toString()
        .toLowerCase();
      const bVal = (b[sortKey as keyof AgentsRow] ?? "")
        .toString()
        .toLowerCase();

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortKey, sortOrder]);

  const openEdit = (agent: any) => {
    setEditing(agent);
    setErrors({});

    setForm({
      firstName: agent.firstName || "",
      lastName: agent.lastName || "",
      email: agent.email || "",
      dob: agent.dob || "",
      ssn: agent.ssn || "",
      phone: agent.phone || "",
      password: agent.password || "",

      designation: agent.employee?.designation?.id ?? "",
      reportsTo: agent.employee?.id ?? "",

      npn: agent.agentProfile?.npn || "",
      yearsOfExperience: agent.agentProfile?.yearsOfExperience ?? "",
      ahipCertified: Boolean(agent.agentProfile?.ahipCertified),
      stateLicensed: Boolean(agent.agentProfile?.stateLicensed),
      access: agent.agentProfile?.accessLevel || "",

      chaseExt: agent.chaseExt || "",
      chaseDataUsername: agent?.agentProfile?.chaseDataUsername || "",
      chaseDataPassword: agent?.agentProfile?.chaseDataPassword || "",
      healthSherpaUsername: agent?.agentProfile?.healthSherpaUsername || "",
      healthSherpaPassword: agent?.agentProfile?.healthSherpaPassword || "",
      myMfgUsername: agent?.agentProfile?.myMfgUsername || "",
      myMfgPassword: agent?.agentProfile?.myMfgPassword || "",
      ffmUsername: agent?.agentProfile?.ffmUsername || "",
      forwarding: agent?.agentProfile?.forwarding || "",
      payStructure: agent.payStructure || "",
      role: agent.systemRole || "",
      apps: agent?.agentProfile?.apps || [],
    });

    setOpenModal(true);
  };

  const isDirty = useMemo(() => {
    const snap = isEditMode ? { ...emptyForm(), ...form } : form;

    if (!isEditMode) {
      const base = emptyForm();
      for (const k of Object.keys(base) as (keyof AgentForm)[]) {
        const a = base[k];
        const b = snap[k];
        if (Array.isArray(a) && Array.isArray(b)) {
          if (a.join("|") !== b.join("|")) return true;
        } else if (String(a ?? "") !== String(b ?? "")) return true;
      }
      return false;
    }

    return true;
  }, [form, isEditMode]);

  const update = <K extends keyof AgentForm>(key: K, value: AgentForm[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key as string]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";

    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = "Enter valid email";
    if (!form.password) e.password = "password is required";

    // if (!form.dob) e.dob = "DOB is required";

    if (form.phone && normalizePhone(form.phone).length < 8) {
      e.phone = "Enter valid contact number";
    }

    if (!form.designation) e.role = "designation is required";
    if (!form.reportsTo) e.reportsTo = "Reportsto is required";
    if (!form.access) e.access = "Access is required";
    if (!form.apps || form.apps.length === 0)
      e.apps = "Select at least one app";

    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const exportToCSV = (items: AgentsRow[]) => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Designation",
      "Access",
      "Status",
    ];

    const rows = items.map((a) => [
      a.firstName,
      a.lastName,
      a.email,
      a.phone ?? "-",
      a.employee?.designation?.name ?? "-",
      a.agentProfile?.accessLevel ?? "-",
      a.agentProfile?.isActive === true
        ? "Active "
        : a.agentProfile?.isActive === false
        ? "In-Active"
        : "-",
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "agents.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const res = await apiClient.get(apiClient.URLS.designation, {}, true);

        if (res.body && Array.isArray(res.body)) {
          const options = res.body.map((d: any) => ({
            label: d.name,
            value: d.id,
          }));
          setDesignationOptions(options);
        }
      } catch (err) {
        console.error("Failed to fetch designations", err);
      }
    };

    fetchDesignations();
  }, []);

  useEffect(() => {
    if (!form.designation) {
      setReportsToOptions([]);
      return;
    }

    const fetchReportsTo = async () => {
      try {
        const res = await apiClient.get(
          `${apiClient.URLS.employee}/report-to/${form.designation}`,
          {},
          true
        );

        if (Array.isArray(res.body)) {
          const options = res.body.map((emp: any) => ({
            label: emp.designation, // DISPLAY
            value: String(emp.id), // SEND
          }));

          setReportsToOptions(options);
        }
      } catch (err) {
        console.error("Failed to fetch reports-to employees", err);
      }
    };

    fetchReportsTo();
  }, [form.designation]);

  const handlePasswordChange = (
    field: "password" | "confirmPassword",
    value: string
  ) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitPassword = async () => {
    if (!selectedAgent?.id) return;

    // if (!passwordForm.password || !passwordForm.confirmPassword) {
    //   toast.error("Both fields are required ❌");
    //   return;
    // }

    // if (passwordForm.password !== passwordForm.confirmPassword) {
    //   toast.error("Passwords do not match ❌");
    //   return;
    // }

    const dto = {
      newPassword: passwordForm.password,
      confirmNewPassword: passwordForm.confirmPassword,
    };

    try {
      setUpdating(true);
      const res = await apiClient.patch(
        `${apiClient.URLS.user}/admin/${selectedAgent.id}/password`,
        dto,

        true
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("Password updated successfully 🔐");
      }

      setPasswordModalOpen(false);
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      user: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: normalizePhone(form.phone),
        dob: form.dob,
        password: form.password,
      },

      employee: {
        designationId: form.designation || null,
        reportsToId: form.reportsTo || null,
      },

      agentProfile: {
        npn: form.npn || "",
        yearsOfExperience: Number(form.yearsOfExperience || 0),
        ahipCertified: Boolean(form.ahipCertified),
        stateLicensed: Boolean(form.stateLicensed),
        accessLevel: form.access === "FullAccess" ? "ALL_ACCESS" : "TRAINING",
        chaseExt:form.chaseExt,
        chaseDataUsername:form.chaseDataUsername,
        chaseDataPassword:form.chaseDataPassword,
        healthSherpaUsername:form.healthSherpaUsername,
        healthSherpaPassword:form.healthSherpaPassword,
        myMfgUsername:form.myMfgUsername,
        myMfgPassword:form.myMfgPassword,
        ffmUsername:form.ffmUsername,
       apps: form.apps?.length ? form.apps : [],
      },
    };

    try {
      setSaving(true);
      let res;

      if (isEditMode && editing) {
        res = await apiClient.patch(
          `${apiClient.URLS.user}/${editing.id}`,
          payload,
          true
        );
      } else {
        res = await apiClient.post(
          `${apiClient.URLS.user}/onboard`,
          payload,
          true
        );
      }

      setOpenModal(false);
      if (res.status === 200 || res.status === 201) {
        toast.success(
          isEditMode && editing
            ? "Agent updated successfully!"
            : "Agent created successfully!"
        );
      }
      setEditing(null);
      setForm(emptyForm());
      await fetchAgents();
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong while saving agent.");
    } finally {
      setSaving(false);
    }
  };
  const openDeactivate = (agent: AgentsRow) => {
    setSelectedAgent(agent);
    setConfirmType("DEACTIVATE");
    setConfirmOpen(true);
  };

  const openActivate = (agent: AgentsRow) => {
    setSelectedAgent(agent);
    setConfirmType("ACTIVATE");
    setConfirmOpen(true);
  };

  const deactivateAgent = async () => {
    if (!selectedAgent) return;

    try {
      await apiClient.patch(
        `${apiClient.URLS.agent}/${selectedAgent.agentProfile?.id}`,
        { isActive: false },
        true
      );

      toast.success("Agent deactivated");
      setConfirmOpen(false);
      await fetchAgents();
    } catch (e) {
      toast.error("Failed to deactivate agent");
    }
  };

  const reactivateAgent = async () => {
    if (!selectedAgent) return;

    try {
      await apiClient.patch(
        `${apiClient.URLS.agent}/${selectedAgent.agentProfile?.id}`,
        { isActive: true },
        true
      );

      toast.success("Agent reactivated");
      setConfirmOpen(false);
      await fetchAgents();
    } catch (e) {
      toast.error("Failed to reactivate agent");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".csv")) {
    toast.error("Please upload a CSV file");
    return;
  }

  setSelectedFile(file);
};

const uploadCsvFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post(
    `${apiClient.URLS.user}/bulk-onboard`,
    formData,
    true,
    "file" 
  );
};

const handleUpload = async () => {
  if (!selectedFile) {
    toast.error("Select CSV file");
    return;
  }

  setIsAgentsLoading(true);
  setUploadProgress(20);

  try {
    const res = await uploadCsvFile(selectedFile);

    setUploadProgress(100);

    const { success = [], failed = [] } = res.body || {};

    if (failed.length) {
      toast.error(`Uploaded with ${failed.length} errors`);
      console.table(failed); // show failed rows
    } else {
      toast.success(`${success.length} users onboarded successfully`);
    }

    await fetchAgents?.();
    setOpenFileModal(false);
  } catch (e) {
    console.error(e);
    toast.error("Bulk upload failed");
  } finally {
    setIsAgentsLoading(false);
    setSelectedFile(null);
  }
};


  const totalPages = Math.ceil(total / LIMIT);
  if (loading || isAgentsLoading) {
    return (
      <div className="w-full h-full items-center flex justify-center">
        <Loader />
      </div>
    );
  }
  const SortableTh = ({
    label,
    column,
    className = "",
  }: {
    label: string;
    column: SortKey;
    className?: string;
  }) => {
    const active = sortKey === column;

    return (
      <th
        className={`px-4 md:py-1 py-1 text-left border app-border ${className}`}
      >
        <div className="flex items-center gap-1 group">
          <span className=" font-bold app-table-head text-nowrap app-border ">
            {label}
          </span>

          <div className="flex flex-row opacity-0 group-hover:opacity-100 transition">
            <ArrowUp
              size={16}
              className={`cursor-pointer ${
                active && sortOrder === "asc" ? "text-blue-600" : "app-border"
              }`}
              onClick={() => sortData(column, "asc")}
            />

            <ArrowDown
              size={16}
              className={`cursor-pointer ${
                active && sortOrder === "desc" ? "text-blue-600" : "app-border"
              }`}
              onClick={() => sortData(column, "desc")}
            />
          </div>
        </div>
      </th>
    );
  };

  return (
    <>
      <div className="w-full   mx-auto space-y-6">
        <div className=" rounded-md shadow-2xl p-4 app-card">
          <TableToolbar
            search={{
              value: q,
              onChange: (v: any) => setQ(v),
              placeholder: "Search...",
              debounceMs: 350,
            }}
            actionsSlot={
              <>
                <Button
                  onClick={() => setOpenFileModal(true)}
                  className="flex items-center gap-2 rounded-xl md:px-4 px-2 md:py-2 py-1.5 cursor-pointer text-[12px] md:text-sm text-nowrap bg-indigo-600  font-bold text-white hover:bg-indigo-700"
                >
                  <FileSpreadsheet className="md:w-4 w-3 md:h-4 h-3" />
                  Import CSV
                </Button>
                <Button
                  className="flex items-center gap-2 rounded-xl md:px-4 px-2 md:py-2 py-1.5 cursor-pointer  text-[12px] md:text-sm bg-[#80d26e]  font-bold text-white hover:bg-emerald-600"
                  onClick={() => exportToCSV(items)}
                >
                  <Download className="md:w-4 w-3 md:h-4 h-3" />
                  Excel
                </Button>

                <Button
                  onClick={openCreate}
                  className="rounded-xl bg-[#477891] text-nowrap cursor-pointer md:px-4 px-2 md:py-2 py-1.5 text-[12px] md:text-sm  font-bold text-white hover:bg-[#3d677c]"
                >
                  + Add New Agent
                </Button>
              </>
            }
          />

          <div className="overflow-auto   rounded-md shadow-2xl border app-border app-card">
            <table className="w-full text-sm border app-border ">
              <thead className="app-table-head">
                <tr>
                  <SortableTh label="First Name" column="firstName" />
                  <SortableTh label="Last Name" column="lastName" />
                  <SortableTh
                    label="Email"
                    column="email"
                    className="px-6 py-2 min-w-62.5"
                  />
                  <SortableTh label="Role" column="role" />
                  <SortableTh label="Status" column="userStatus" />
                  <th className="px-4 py-1 border app-border text-nowrap  font-medium ">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center app-text  font-bold"
                    >
                      No Agents found
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((a) => (
                    <tr key={a.id} className="border-t app-text">
                      <td className="px-3 md:py-1 py-1  font-medium  text-nowrap border app-border">
                        {a.firstName}
                      </td>
                      <td className="px-3 md:py-1 py-1  font-medium text-nowrap border app-border ">
                        {a.lastName}
                      </td>
                      <td className="px-6 md:py-1 py-1  font-medium text-nowrap border app-border ">
                        {a.email}
                      </td>
                      <td className="px-3 md:py-1 py-1 border text-nowrap app-border  font-medium ">
                        {a?.employee?.designation?.name ?? "-"}
                      </td>

                      <td className="px-4 py-1 border text-nowrap app-border  whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs  font-bold transition ${
                            a.agentProfile?.isActive
                              ? "bg-green-500/15 text-green-700"
                              : "bg-orange-500/15 text-orange-700"
                          }`}
                        >
                          {a?.agentProfile?.isActive ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          {a?.agentProfile?.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-1 border app-border text-nowrap  font-medium ">
                        <div className="flex justify-center items-center gap-3">
                          <Button
                            className="p-2.5 rounded-lg bg-indigo-600/10 text-indigo-700 hover:bg-indigo-600  hover:text-white transition"
                            title="Edit"
                            onClick={() => openEdit(a)}
                          >
                            <Pencil size={15} />
                          </Button>

                          <Button
                            className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500 hover:text-white transition"
                            title="Reset / View Password"
                            onClick={() => {
                              setSelectedAgent(a);
                              setPasswordModalOpen(true);
                            }}
                          >
                            <Key size={15} />
                          </Button>

                          {a?.agentProfile?.isActive ? (
                            <Button
                              className="p-2.5 rounded-lg bg-red-500/10 text-red-700 hover:bg-red-500 hover:text-white transition"
                              title="Deactivate"
                              onClick={() => openDeactivate(a)}
                            >
                              <Trash2 size={15} />
                            </Button>
                          ) : (
                            <Button
                              className="p-2.5 rounded-lg bg-green-600/10 text-green-700 hover:bg-green-600 hover:text-white transition"
                              title="Activate"
                              onClick={() => openActivate(a)}
                            >
                              <Check size={15} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={items.length}
              limit={LIMIT}
              onPageChange={setPage}
            />
          </div>
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

                  <p className="text-sm app-text  font-medium">
                    {confirmType === "DEACTIVATE"
                      ? "This agent will lose access and go offline."
                      : "Agent will regain access and return to active duty."}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 mt-5">
                  <span className="text-xs  font-bold text-slate-400">
                    Power
                  </span>
                  <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${
                        confirmType === "DEACTIVATE"
                          ? "w-[35%] bg-orange-600"
                          : "w-full bg-green-600"
                      }`}
                    ></div>
                  </div>
                  <span className="text-xs  font-bold text-slate-400">
                    {confirmType === "DEACTIVATE" ? "35%" : "100%"}
                  </span>
                </div>

                <div className="flex justify-center gap-4 mt-7">
                  <Button
                    className="md:px-5 px-3 md:py-2.5 py-1.5 md:text-[14px] text-[12px] rounded-2xl app-card app-text  font-bold hover:scale-105 active:scale-95 transition-all"
                    onClick={() => setConfirmOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    className={`md:px-6 px-3 md:py-2.5 py-1.5 md:text-[14px] text-[12px] rounded-2xl text-white  font-bold flex items-center gap-2 shadow-lg hover:scale-110 active:scale-95 transition-all ${
                      confirmType === "DEACTIVATE"
                        ? "bg-linear-to-r from-orange-600 to-red-600 shadow-red-400/40"
                        : "bg-linear-to-r from-green-600 to-emerald-600 shadow-green-400/40"
                    }`}
                    onClick={
                      confirmType === "DEACTIVATE"
                        ? deactivateAgent
                        : reactivateAgent
                    }
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

          {passwordModalOpen && (
            <Modal
              open={passwordModalOpen}
              onClose={() => {
                setPasswordForm({ password: "", confirmPassword: "" });
                setPasswordModalOpen(false);
              }}
              title="Reset Password"
              className="app-text"
            >
              <div className="space-y-4 p-2 mt-2 app-card">
                <Field label="Password" required>
                  <TextInput
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.password}
                    onChange={(e) =>
                      handlePasswordChange("password", e.target.value)
                    }
                    placeholder="Password"
                    leftIcon={<Lock size={16} />}
                  />
                </Field>

                <Field label="Confirm Password" required>
                  <TextInput
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm Password"
                    leftIcon={<Lock size={16} />}
                  />
                </Field>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center gap-2 text-indigo-600 dark:text-white  font-bold hover:scale-105 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPassword ? "Hide Password" : "Show Password"}
                  </Button>
                </div>
              </div>

              <div className="flex items-end justify-end gap-3 pt-4">
                <Button
                  className="px-4 py-2 rounded-lg app-btn   font-medium  app-btn:hover"
                  onClick={() => {
                    setPasswordForm({ password: "", confirmPassword: "" });
                    setPasswordModalOpen(false);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-5 py-2 rounded-lg shadow-lg transition duration-200 ease-in-out  disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={submitPassword}
                >
                  update
                </Button>
              </div>
            </Modal>
          )}

          <Drawer
            open={OpenModal}
            handleDrawerToggle={() => setOpenModal(false)}
            panelCls="w-[95%] md:w-[80%] lg:w-[calc(82%-190px)] overflow-x-hidden app-card shadow-xl z-[9999999]"
            panelInnerCls="app-surface md:px-8 px-3 py-6"
            overLayCls="bg-slate-900/40  backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 app-text font-bold text-lg">
                {isEditMode ? (
                  <Pencil size={16} className=" text-purple-600" />
                ) : (
                  <UserPlus size={16} className=" text-purple-600" />
                )}
                <span
                  className="flex items-center gap-2 font-bold text-lg
    bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600
    bg-clip-text text-transparent"
                >
                  {isEditMode ? "Edit Agent" : "Add New Agent"}
                </span>
              </div>
            </div>

            <div className="mb-6 text-sm font-medium app-text">
              {isEditMode
                ? "Update agent details and save changes."
                : "Fill details to create a new agent."}
            </div>

            <div className="flex flex-col md:gap-3 gap-2 border app-border shadow-sm rounded-md md:p-4 p-2 md:mb-6 mb-3 app-btn-action ">
              <h2
                className="font-bold text-[12px] md:text-[16px] tracking-wide 
  app-text flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-2 mt-2">
                <Field label="First Name" required error={errors.firstName}>
                  <TextInput
                    value={form.firstName}
                    onChange={(e: any) => update("firstName", e.target.value)}
                    placeholder="First Name"
                    leftIcon={<User size={16} />}
                    error={!!errors.firstName}
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="Last Name" required error={errors.lastName}>
                  <TextInput
                    value={form.lastName}
                    onChange={(e: any) => update("lastName", e.target.value)}
                    placeholder="Last Name"
                    leftIcon={<User size={16} />}
                    error={!!errors.lastName}
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="Email" required error={errors.email}>
                  <TextInput
                    type="email"
                    value={form.email}
                    onChange={(e: any) => update("email", e.target.value)}
                    placeholder="Login Username"
                    leftIcon={<Mail size={16} />}
                    error={!!errors.email}
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="Password" required>
                  <TextInput
                    type="password"
                    value={form.password}
                    onChange={(e: any) => update("password", e.target.value)}
                    placeholder="Password"
                    leftIcon={<Lock size={16} />}
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="DOB" required error={errors.dob}>
                  <TextInput
                    type="date"
                    value={form.dob}
                    onChange={(e: any) => update("dob", e.target.value)}
                    placeholder="Select DOB"
                    leftIcon={<Calendar size={16} />}
                    error={!!errors.dob}
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="SSN">
                  <TextInput
                    value={form.ssn}
                    onChange={(e: any) =>
                      update("ssn", normalizeSSN(e.target.value))
                    }
                    placeholder="SSN"
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="Contact Number" error={errors.phone}>
                  <TextInput
                    value={form.phone}
                    onChange={(e: any) =>
                      update("phone", normalizePhone(e.target.value))
                    }
                    placeholder="Contact Number"
                    leftIcon={<Phone size={16} />}
                    error={!!errors.phone}
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>
              </div>
            </div>

            <div className="flex flex-col md:gap-3 gap-2 app-border border-gray-200 shadow-sm rounded-md md:p-4 p-2 md:mb-6 mb-3 app-btn-action">
              <h2 className="font-bold text-[12px] md:text-[16px] tracking-wide app-text flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>Work
                Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <Field label="Designation" required error={errors.designation}>
                  <SingleSelect
                    value={form.designation}
                    onChange={(v: any) => update("designation", v as any)}
                    options={designationOptions}
                    placeholder="Select Designation"
                    placement="auto"
                    searchable
                  />
                </Field>

                <Field label="Reports To" required error={errors.reportsTo}>
                  <SingleSelect
                    value={form.reportsTo}
                    onChange={(v: any) => update("reportsTo", v as any)}
                    options={reportsToOptions}
                    placeholder="Select Manager"
                    placement="auto"
                    searchable
                  />
                </Field>

                <Field label="NPN">
                  <TextInput
                    value={form.npn}
                    onChange={(e: any) => update("npn", e.target.value)}
                    placeholder="NPN"
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="Chase Ext.">
                  <TextInput
                    value={form.chaseExt}
                    onChange={(e: any) => update("chaseExt", e.target.value)}
                    placeholder="Chase Ext."
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>
              </div>
            </div>

            <div className="flex flex-col md:gap-3 gap-2 border app-border shadow-sm rounded-md md:p-4 p-2 md:mb-6 mb-3 app-btn-action">
              <h2
                className="font-bold text-[12px] md:text-[16px] tracking-wide 
  text-indigo-700 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                Login Credentials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <Field label="Chase Data Username">
                  <TextInput
                    value={form.chaseDataUsername}
                    onChange={(e: any) =>
                      update("chaseDataUsername", e.target.value)
                    }
                    placeholder="Chase Data Login"
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="Chase Data Password">
                  <TextInput
                    type="password"
                    value={form.chaseDataPassword}
                    onChange={(e: any) =>
                      update("chaseDataPassword", e.target.value)
                    }
                    placeholder="Chase Data Password"
                    leftIcon={<Lock size={16} />}
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="HealthSherpa Username">
                  <TextInput
                    value={form.healthSherpaUsername}
                    onChange={(e: any) =>
                      update("healthSherpaUsername", e.target.value)
                    }
                    placeholder="HealthSherpa Login"
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="HealthSherpa Password">
                  <TextInput
                    type="password"
                    value={form.healthSherpaPassword}
                    onChange={(e: any) =>
                      update("healthSherpaPassword", e.target.value)
                    }
                    placeholder="HealthSherpa Password"
                    leftIcon={<Lock size={16} />}
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="MyMFG Username">
                  <TextInput
                    value={form.myMfgUsername}
                    onChange={(e: any) =>
                      update("myMfgUsername", e.target.value)
                    }
                    placeholder="MyMFG Username"
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="MyMFG Password">
                  <TextInput
                    type="password"
                    value={form.myMfgPassword}
                    onChange={(e: any) =>
                      update("myMfgPassword", e.target.value)
                    }
                    placeholder="MyMFG Password"
                    leftIcon={<Lock size={16} />}
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="FFM Username">
                  <TextInput
                    value={form.ffmUsername}
                    onChange={(e: any) => update("ffmUsername", e.target.value)}
                    placeholder="FFM Username"
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>
              </div>
            </div>

            <div className="flex flex-col md:gap-3 gap-2 border app-border shadow-sm rounded-md md:p-4 p-2 md:mb-6 mb-3 app-btn-action">
              <h2
                className="font-bold text-[12px] md:text-[16px] tracking-wide 
  app-text flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                Other Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <Field label="Forwarding">
                  <TextInput
                    value={form.forwarding}
                    onChange={(e: any) => update("forwarding", e.target.value)}
                    placeholder="Forwarding"
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>

                <Field label="Pay Structure">
                  <TextInput
                    value={form.payStructure}
                    onChange={(e: any) =>
                      update("payStructure", e.target.value)
                    }
                    placeholder="Pay Structure"
                    containerClassName="md:py-[6px] py-1"
                  />
                </Field>
              </div>
            </div>

            <div className="flex flex-col md:gap-3 gap-2 border app-border shadow-sm rounded-md md:p-4 p-2 md:mb-6 mb-3 app-btn-action">
              <h2
                className="font-bold text-[12px] md:text-[16px] tracking-wide 
  app-text flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                Access & Apps
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <Field label="Access" required error={errors.access}>
                  <SingleSelect
                    value={form.access}
                    onChange={(v: any) => update("access", v as any)}
                    options={DEFAULT_ACCESS_OPTIONS}
                    placeholder="Training"
                    placement="auto"
                  />
                </Field>

                <Field label="Apps" required error={errors.apps}>
                  <MultiSelect
                    values={form.apps}
                    onChange={(v: any) => update("apps", v)}
                    options={DEFAULT_APPS_OPTIONS}
                    placeholder="Select"
                    placement="auto"
                    error={!!errors.apps}
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 mb-2 md:mb-4 flex justify-end gap-3">
              <Button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-5 py-2 rounded-lg shadow-sm transition duration-200 ease-in-out cursor-pointer "
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </Button>

              <Button
                className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-5 py-2 rounded-lg shadow-lg transition duration-200 ease-in-out  disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={saving}
              >
                {isEditMode ? "Update" : "Submit"}
              </Button>
            </div>
          </Drawer>

          <CSVUploadModal
            open={openFileModal}
            onClose={() => {
              setOpenFileModal(false);
              setSelectedFile(null);
            }}
            selectedFile={selectedFile}
            onFileSelect={handleFileUpload}
            onUpload={handleUpload}
            fileInputRef={fileInputRef}
            isLoading={isAgentsLoading}
          />
        </div>
      </div>
    </>
  );
}
