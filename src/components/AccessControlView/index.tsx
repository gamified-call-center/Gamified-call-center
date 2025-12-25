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
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] =
    useState<Designation | null>(null);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const res: any = await apiClient.get(
        apiClient.URLS.designation,
        {},
        true
      );
      const list = Array.isArray(res?.body) ? res.body : [];
      setDesignations(list);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load designations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const openModalForDesignation = (d: Designation) => {
    setSelectedDesignation(d);
    setOpen(true);
  };

  return (
    <div className="md:p-6 p-2 md:space-y-6 space-y-3 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <h2 className="md:text-xl text-[18px] font-Gordita-Bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Designations
          </h2>

          <button
            className="bg-linear-to-r from-blue-500 to-indigo-600 text-white md:px-5 px-3 md:text-[16px] text-[12px] md:py-2.5 py-1.5 rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
            onClick={fetchDesignations}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="md:py-12 py-6 text-center text-slate-500 animate-pulse">
            Loading designations...
          </div>
        ) : designations.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No designations available
          </div>
        ) : (
          <div className="md:pt-5 pt-2 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 md:gap-4 gap-2">
            {designations
              .slice()
              .sort((a, b) => a.levelOrder - b.levelOrder)
              .map((d) => (
                <div
                  key={d.id}
                  onClick={() => openModalForDesignation(d)}
                  className="group cursor-pointer bg-white md:p-4 p-2 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <p className="md:text-base font-semibold text-slate-800 group-hover:text-blue-600 transition">
                      {d.name}
                    </p>

                    <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition">
                      Level {d.levelOrder}
                    </span>
                  </div>

                  <p className="mt-3 md:text-xs text-[12px] text-slate-400 group-hover:text-slate-600 transition">
                    Manage permissions →
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Permissions — ${selectedDesignation?.name || ""}`}
      >
        {selectedDesignation ? (
          <DesignationPermissionsCrudModalBody
            designation={selectedDesignation}
            onClose={() => setOpen(false)}
          />
        ) : null}
      </Modal>
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
        console.log(list)
        setDesignationOptions(
          list.map((d: any) => ({ label: d.name, value: String(d.id) }))
        );
      } catch (e) {
        console.error(e);
      }
    }
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
    <div className="md:p-6 p-3 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] w-full max-w-full border border-slate-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[16px] md:text-[18px] font-Gordita-Medium text-slate-900">
              Designation Permissions
            </h3>
            <p className="text-[11px] md:text-[12px] text-slate-500 mt-1">
              Select a designation and configure resource-wise CRUD access.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-Gordita-Medium bg-slate-100 text-slate-700">
              {filteredTableRows.length} Resources
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
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

        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-3 md:px-4 py-3 bg-slate-50 border-b">
            <div>
              <p className="text-[13px] md:text-[14px] font-Gordita-Medium text-slate-800">
                {editIndex !== null
                  ? "Edit Resource Permission"
                  : "Add Resource Permission"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Search resource → choose → tick required permissions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-[12px] font-Gordita-Medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
              </button>
            </div>
          </div>

          <div className="p-3 md:p-4 space-y-3">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
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

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[12px] md:text-[13px] font-Gordita-Medium text-slate-800 mb-2">
                Select Required Permissions
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {["view", "create", "edit", "delete"].map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
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
                    <span className="text-[12px] font-Gordita-Medium text-slate-700">
                      {perm === "view"
                        ? "Read"
                        : perm.charAt(0).toUpperCase() + perm.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between w-full gap-2">
              <button
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
                       border border-slate-200 bg-slate-100 text-slate-700
                       hover:bg-slate-200 active:bg-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddOrUpdateResource}
                disabled={!designationId}
                className={` md:px-4 py-2 font-medium  px-2 rounded-lg md:text-[14px] text-[12px] font-Gordita-Medium text-white
                        shadow-sm transition
                        ${
                          !designationId
                            ? "bg-emerald-300 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-700"
                        }`}
              >
                {editIndex !== null ? "Update Permission" : "Save Resource"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <Field label="Search Added Resources">
            <TextInput
              value={tableSearch}
              onChange={(e: any) => setTableSearch(e.target.value)}
              placeholder="Search in table..."
            />
          </Field>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-3 md:px-4 py-3 bg-slate-50 border-b flex items-center justify-between">
            <p className="text-[13px] md:text-[14px] font-Gordita-Medium text-slate-800">
              Permissions Summary
            </p>
            <span className="text-[11px] text-slate-500">
              {loading ? "Loading..." : `${filteredTableRows.length} items`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-white border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-[12px] font-Gordita-Medium text-slate-600">
                    Resource
                  </th>
                  {["Create", "Read", "Update", "Delete"].map((h) => (
                    <th
                      key={h}
                      className="text-center py-3 px-4 text-[12px] font-Gordita-Medium text-slate-600"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 text-[12px] font-Gordita-Medium text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-[12px] text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredTableRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-[12px] text-slate-500"
                    >
                      No permissions added yet.
                    </td>
                  </tr>
                ) : (
                  filteredTableRows.map((perm, idx) => (
                    <tr
                      key={perm.resource}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 text-left font-Gordita-Medium text-[#2563eb] text-[12px] md:text-[13px]">
                        {formatResourceName(perm.resource)}
                      </td>

                      {["create", "view", "edit", "delete"].map((action) => (
                        <td
                          key={`${perm.resource}-${action}`}
                          className="py-2 px-4 text-center"
                        >
                          <button
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
                          </button>
                        </td>
                      ))}

                      <td className="py-2 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditPermission(idx)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg
                                   bg-indigo-50 text-indigo-600 border border-indigo-100
                                   hover:bg-indigo-100"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemovePermission(idx)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg
                                   bg-rose-50 text-rose-600 border border-rose-100
                                   hover:bg-rose-100"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
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
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="md:px-4 py-2 font-medium  px-2 rounded-lg md:text-[14px] text-[12px] font-Gordita-Medium
                   border border-slate-200 bg-white text-slate-700
                   hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || loading || !designationId}
            className={`md:px-4 py-2 font-medium px-2 rounded-lg md:text-[14px] text-[12px] font-Gordita-Medium text-white shadow-sm
          ${
            saving || loading || !designationId
              ? "bg-violet-300 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-700 active:bg-violet-700"
          }`}
          >
            {saving ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </form>
    </div>
  );
}
