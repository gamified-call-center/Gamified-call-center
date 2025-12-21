"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import TableToolbar from "@/commonComponents/TableSearchBar";
import {
  Download,
  Users,
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
  DEFAULT_ROLE_OPTIONS,
} from "../../../../src/Utils/constants/ara/constants";
import toast from "react-hot-toast";

export type AgentRole = "Agent" | "Admin" | "SuperAdmin";
export type AgentAccess = "Training" | "Production" | "QA";
import Papa from "papaparse";
import { FaFileCsv, FaUpload } from "react-icons/fa";
import CSVUploadModal from "./CsvUploadModal";
import Pagination from "@/commonComponents/Pagination";
import Loader from "@/commonComponents/Loader";

type AgentsRow = {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  designation?: string;
  contactNumber?: string;
  access?: string;
  status?: "Active" | "In-Active";
};

const normalizePhone = (v: string) => v.replace(/[^\d+]/g, "");
const normalizeSSN = (v: string) => v.replace(/[^\d]/g, "").slice(0, 9);

export type AgentForm = {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  ssn: string;
  contactNumber: string;

  designation: string;
  npn: string;

  chaseExt: string;
  chaseDataUsername: string;
  chaseDataPassword: string;

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
  contactNumber: "",

  designation: "",
  npn: "",

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
  type SortKey = "firstName" | "lastName" | "email" | "role" | "status";

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [OpenModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<AgentsRow | null>(null);

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

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(
        "/agents",
        { page, limit: LIMIT, q: q.trim() },
        true
      );
      const body = res?.body ?? res;

      const list = body?.data?.items || body?.items || body?.data || [];
      const totalCount = body?.data?.total || body?.total || list.length;
      setItems(Array.isArray(list) ? list : []);
      setTotal(totalCount);
    } catch (e) {
      console.error(e);
      setItems([]);
      setTotal(0);
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
  const sortedItems = useMemo(() => {
    if (!sortKey) return items;

    return [...items].sort((a, b) => {
      const aVal = (a[sortKey] ?? "").toString().toLowerCase();
      const bVal = (b[sortKey] ?? "").toString().toLowerCase();

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [items, sortKey, sortOrder]);

  const openEdit = (agent: any) => {
    setEditing(agent);
    setErrors({});

    setForm({
      firstName: agent.firstName || "",
      lastName: agent.lastName || "",
      email: agent.email || "",
      dob: agent.dob || "",
      ssn: agent.ssn || "",
      contactNumber: agent.contactNumber || "",
      designation: agent.designation || "",
      npn: agent.npn || "",
      chaseExt: agent.chaseExt || "",
      chaseDataUsername: agent.chaseDataUsername || "",
      chaseDataPassword: agent.chaseDataPassword || "",
      healthSherpaUsername: agent.healthSherpaUsername || "",
      healthSherpaPassword: agent.healthSherpaPassword || "",
      myMfgUsername: agent.myMfgUsername || "",
      myMfgPassword: agent.myMfgPassword || "",
      ffmUsername: agent.ffmUsername || "",
      forwarding: agent.forwarding || "",
      payStructure: agent.payStructure || "",
      role: agent.role || "",
      access: agent.access || "",
      apps: agent.apps || [],
    });

    setOpenModal(true);
  };

  //   const openEdit = async (agent: AgentsRow) => {
  //     setEditing(agent);
  //     setErrors({});

  //     try {

  //       setForm((p) => ({
  //         ...p,
  //         firstName: agent.firstName || "",
  //         lastName: agent.lastName || "",
  //         email: agent.email || "",
  //         role: (agent.role as any) || "",
  //       }));
  //     } catch (e) {
  //       console.error(e);

  //       setForm((p) => ({
  //         ...p,
  //         firstName: agent.firstName || "",
  //         lastName: agent.lastName || "",
  //         email: agent.email || "",
  //         role: (agent.role as any) || "",
  //       }));
  //     }

  //     setOpenModal(true);
  //   };

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

    if (!form.dob) e.dob = "DOB is required";

    if (form.contactNumber && normalizePhone(form.contactNumber).length < 8) {
      e.contactNumber = "Enter valid contact number";
    }

    if (!form.role) e.role = "Role is required";
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
      a.contactNumber ?? "-",
      a.designation ?? "-",
      a.access ?? "-",
      a.status === "Active"
        ? "Active ✅"
        : a.status === "In-Active"
        ? "In-Active ❌"
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

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: AgentForm = {
      ...form,
      ssn: normalizeSSN(form.ssn),
      contactNumber: normalizePhone(form.contactNumber),
    };

    try {
      setSaving(true);
      let res;

      if (isEditMode && editing) {
        res = await apiClient.patch(`/agents/${editing.id}`, payload, true);
      } else {
        res = await apiClient.post(`/agents`, payload, true);
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

  const handleDelete = async (agent: AgentsRow) => {
    try {
      const res = await apiClient.delete(`/agents/${agent.id}`, {}, true);
      if (res.status === 200) {
        toast.success("Agent deleted successfully");
      }
      await fetchAgents();
    } catch (e) {
      console.error(e);
      toast.error("something went worong");
    }
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setSelectedFile(file);
  };
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsAgentsLoading(true);
    setUploadProgress(0);

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20;
        });
      }, 400);

      const formattedData = await parseCSV(selectedFile);

      await sendDataToBackend(formattedData);

      setTimeout(() => {
        setUploadProgress(100);
        setTimeout(() => {
          setOpenFileModal(false); // if you use modal
        }, 800);
      }, 500);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing CSV file");
    } finally {
      setIsAgentsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const parseCSV = (file: File): Promise<AgentForm[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          try {
            const formattedData: AgentForm[] = result.data.map((row: any) => ({
              firstName: row.firstName || "-",
              lastName: row.lastName || "-",
              email: row.email || "-",
              dob: row.dob || "",
              ssn: row.ssn || "-",
              contactNumber: row.contactNumber || "-",
              designation: row.designation || "-",
              npn: row.npn || "-",

              chaseExt: row.chaseExt || "-",
              chaseDataUsername: row.chaseDataUsername || "-",
              chaseDataPassword: row.chaseDataPassword || "-",

              healthSherpaUsername: row.healthSherpaUsername || "-",
              healthSherpaPassword: row.healthSherpaPassword || "-",

              myMfgUsername: row.myMfgUsername || "-",
              myMfgPassword: row.myMfgPassword || "-",

              ffmUsername: row.ffmUsername || "-",
              forwarding: row.forwarding || "-",
              payStructure: row.payStructure || "-",

              role: row.role || "-",
              access: row.access || "-",
              apps: row.apps
                ? row.apps.split("|").map((a: string) => a.trim())
                : [],
            }));

            resolve(formattedData);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => reject(error),
      });
    });
  };
  const sendDataToBackend = async (data: AgentForm[]) => {
    try {
      if (!data.length) {
        toast.error("No valid data found in CSV");
        return;
      }

      const response = await apiClient.post(
        "/agents/bulk",
        { agents: data },
        true
      );

      if (response?.data) {
        toast.success("Agents added successfully");
        await fetchAgents();
      }
    } catch (error) {
      console.error("Error uploading agents:", error);
      toast.error("Failed to upload agents");
      throw error;
    }
  };
  const totalPages = Math.ceil(total / LIMIT);
  if (loading || isAgentsLoading) {
    return (
      <div className="w-full h-full items-center flex justify-center">
        <Loader showLabel label="Loading agents..." />
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
    <th className={`px-4 py-3 text-left border border-gray-300 ${className}`}>
      <div className="flex items-center gap-1 group">
        <span className="font-semibold">{label}</span>

        <div className="flex flex-row opacity-0 group-hover:opacity-100 transition">
          <ArrowUp
            size={16}
            className={`cursor-pointer ${
              active && sortOrder === "asc"
                ? "text-blue-600"
                : "text-gray-400 hover:text-black"
            }`}
            onClick={() => sortData(column, "asc")}
          />

          <ArrowDown
            size={16}
            className={`cursor-pointer ${
              active && sortOrder === "desc"
                ? "text-blue-600"
                : "text-gray-400 hover:text-black"
            }`}
            onClick={() => sortData(column, "desc")}
          />
        </div>
      </div>
    </th>
  );
};

  

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-2  text-slate-700">
        <Users className="h-4 w-4 text-slate-600" />
        <span className="font-semibold">Agents</span>
      </div>
      <div className="overflow-hidden rounded-md shadow-2xl p-4 bg-white">
        <TableToolbar
          search={{
            value: q,
            onChange: (v: any) => setQ(v),
            placeholder: "Search...",
            debounceMs: 350,
          }}
          actionsSlot={
            <>
              <button
                onClick={() => setOpenFileModal(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 cursor-pointer  text-sm bg-indigo-600 font-semibold text-white hover:bg-indigo-700"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Import CSV
              </button>
              <button
                className="flex items-center gap-2 rounded-xl px-4 py-2 cursor-pointer  text-sm bg-[#80d26e] font-semibold text-white hover:bg-emerald-600"
                onClick={() => exportToCSV(items)}
              >
                <Download className="w-4 h-4" />
                Excel
              </button>

              <button
                onClick={openCreate}
                className="rounded-xl bg-[#477891] cursor-pointer  px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d677c]"
              >
                + Add New Agent
              </button>
            </>
          }
        />

        <div className="overflow-auto   rounded-md shadow-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <SortableTh label="First Name" column="firstName" />
                <SortableTh label="Last Name" column="lastName" />
                <SortableTh label="Email" column="email"  className="px-6 py-3 min-w-62.5" />
                <SortableTh label="Role" column="role" />
                <SortableTh label="Status" column="status" />
                <th className="px-4 py-3 text-center border border-gray-300 ">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-black font-bold"
                  >
                    No Agents found
                  </td>
                </tr>
              ) : (
                sortedItems.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-3 py-3 font-medium border border-gray-300 ">{a.firstName}</td>
                    <td className="px-3 py-3 font-mediumborder border-gray-300 ">{a.lastName}</td>
                    <td className="px-6 py-3 font-medium border border-gray-300 ">{a.email}</td>
                    <td className="px-3 py-3 border border-gray-300 font-medium ">{a.role ?? "-"}</td>
                    <td className="px-3 py-3 border border-gray-300 ">
                      {a.status ? (
                        <span
                          className={`px-2 py-1 rounded-full text-white text-sm font-semibold ${
                            a.status === "Active"
                              ? "bg-green-500"
                              : "bg-[#ff7f41]"
                          }`}
                        >
                          {a.status}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-4 py-3 border border-gray-300 font-medium ">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="rounded-md bg-indigo-600 p-2 text-white hover:bg-indigo-700"
                          title="Edit"
                          onClick={() => openEdit(a)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="rounded-md bg-yellow-500 p-2 text-white hover:bg-yellow-600"
                          title="Reset / View Password"
                          onClick={() => {}}
                        >
                          <Key size={16} />
                        </button>

                        <button
                          className="rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600"
                          title="Delete"
                          onClick={() => handleDelete(a)}
                        >
                          <Trash2 size={16} />
                        </button>
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

        <Modal
          open={OpenModal}
          onClose={() => setOpenModal(false)}
          title={
            <div className="flex items-center gap-2 font-bold">
              {isEditMode ? <Pencil size={18} /> : <UserPlus size={18} />}
              <span>{isEditMode ? "Edit Agent" : "Add New Agent"}</span>
            </div>
          }
          subtitle={
            isEditMode
              ? "Update agent details and save changes."
              : "Fill details to create a new agent."
          }
          size="xl"
          closeOnOverlayClick={false}
          closeOnEsc={true}
          shouldConfirmClose={isDirty}
          secondaryAction={{
            label: "Cancel",
            onClick: () => setOpenModal(false),
          }}
          primaryAction={{
            label: isEditMode ? "Update" : "Submit",
            onClick: handleSubmit,
            loading: saving,
          }}
          bodyClassName="py-5"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="First Name" required error={errors.firstName}>
              <TextInput
                value={form.firstName}
                onChange={(e: any) => update("firstName", e.target.value)}
                placeholder="First Name"
                leftIcon={<User size={18} />}
                error={!!errors.firstName}
              />
            </Field>

            <Field label="Last Name" required error={errors.lastName}>
              <TextInput
                value={form.lastName}
                onChange={(e: any) => update("lastName", e.target.value)}
                placeholder="Last Name"
                leftIcon={<User size={18} />}
                error={!!errors.lastName}
              />
            </Field>

            <Field label="Email" required error={errors.email}>
              <TextInput
                type="email"
                value={form.email}
                onChange={(e: any) => update("email", e.target.value)}
                placeholder="Login Username"
                leftIcon={<Mail size={18} />}
                error={!!errors.email}
              />
            </Field>

            <Field label="DOB" required error={errors.dob}>
              <TextInput
                type="date"
                value={form.dob}
                onChange={(e: any) => update("dob", e.target.value)}
                placeholder="Select dob"
                leftIcon={<Calendar size={18} />}
                error={!!errors.dob}
              />
            </Field>

            <Field label="SSN">
              <TextInput
                value={form.ssn}
                onChange={(e: any) =>
                  update("ssn", normalizeSSN(e.target.value))
                }
                placeholder="SSN"
              />
            </Field>

            <Field label="Contact Number" error={errors.contactNumber}>
              <TextInput
                value={form.contactNumber}
                onChange={(e: any) =>
                  update("contactNumber", normalizePhone(e.target.value))
                }
                placeholder="Contact Number"
                leftIcon={<Phone size={18} />}
                error={!!errors.contactNumber}
              />
            </Field>

            <Field label="Designation">
              <TextInput
                value={form.designation}
                onChange={(e: any) => update("designation", e.target.value)}
                placeholder="Designation"
              />
            </Field>

            <Field label="NPN">
              <TextInput
                value={form.npn}
                onChange={(e: any) => update("npn", e.target.value)}
                placeholder="NPN"
              />
            </Field>

            <Field label="Chase Ext.">
              <TextInput
                value={form.chaseExt}
                onChange={(e: any) => update("chaseExt", e.target.value)}
                placeholder="Chase Ext."
              />
            </Field>

            <Field label="Chase Data Username">
              <TextInput
                value={form.chaseDataUsername}
                onChange={(e: any) =>
                  update("chaseDataUsername", e.target.value)
                }
                placeholder="Chase Data Login"
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
                leftIcon={<Lock size={18} />}
              />
            </Field>

            <Field label="HealthSherpa Username">
              <TextInput
                value={form.healthSherpaUsername}
                onChange={(e: any) =>
                  update("healthSherpaUsername", e.target.value)
                }
                placeholder="Healthsherpa Login"
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
                leftIcon={<Lock size={18} />}
              />
            </Field>

            <Field label="MyMFG Username">
              <TextInput
                value={form.myMfgUsername}
                onChange={(e: any) => update("myMfgUsername", e.target.value)}
                placeholder="MyMFG Username"
              />
            </Field>

            <Field label="MyMFG Password">
              <TextInput
                type="password"
                value={form.myMfgPassword}
                onChange={(e: any) => update("myMfgPassword", e.target.value)}
                placeholder="MyMFG Password"
                leftIcon={<Lock size={18} />}
              />
            </Field>

            <Field label="FFM Username">
              <TextInput
                value={form.ffmUsername}
                onChange={(e: any) => update("ffmUsername", e.target.value)}
                placeholder="FFM Username"
              />
            </Field>

            <Field label="Forwarding">
              <TextInput
                value={form.forwarding}
                onChange={(e: any) => update("forwarding", e.target.value)}
                placeholder="Forwarding"
              />
            </Field>

            <Field label="Pay Structure">
              <TextInput
                value={form.payStructure}
                onChange={(e: any) => update("payStructure", e.target.value)}
                placeholder="Pay Structure"
              />
            </Field>

            <Field label="Role" required error={errors.role}>
              <SingleSelect
                value={form.role}
                onChange={(v: any) => update("role", v as any)}
                options={DEFAULT_ROLE_OPTIONS}
                placeholder="Agent"
                placement="auto"
              />
            </Field>

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
        </Modal>
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
  );
}
