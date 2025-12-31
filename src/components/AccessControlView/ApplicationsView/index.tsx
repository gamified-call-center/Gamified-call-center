"use client";

import React, { useEffect, useMemo, useState } from "react";
import apiClient from "@/Utils/apiClient";
import { JobApplication } from "../helper";
import ApplicationDetailsModal from "./ApplicationDetailsModal";
import {
  Eye,
  LayoutGrid,
  Rows,
  FileText,
  DivideCircle,
  Trash2,
} from "lucide-react";
import Button from "@/commonComponents/Button";
import TableToolbar from "@/commonComponents/TableSearchBar";
import { cn } from "@/Utils/common/cn";
import Loader from "@/commonComponents/Loader";
import Pagination from "@/commonComponents/Pagination";
import { Checkbox } from "@/commonComponents/form/Checkbox";
import toast from "react-hot-toast";
import Modal from "@/commonComponents/Modal";

type ViewMode = "compact" | "cards";

export default function ApplicationsView() {
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [view, setView] = useState<ViewMode>("compact");
  const [tableSearch, setTableSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;
  const [confirmdeleteOpen, setConfirmdeleteOpen] = useState(false);
  const [deleteQueue, setDeleteQueue] = useState<string[]>([]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.adminapplications}`,
        { page, limit: LIMIT },
        true
      );
      const data = Array.isArray(res?.body.data)
        ? res.body.data
        : Array.isArray(res)
        ? res
        : [];
      const totalCount = res?.body?.meta?.total || data.length;
      setApps(data);
      setTotal(totalCount);
    } catch (e) {
      console.error("Failed to fetch applications", e);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((a) => a.id));
    }
    setAllSelected(!allSelected);
  };

  const handleSingleDelete = (id: string) => {
    setDeleteQueue([id]);
    setConfirmdeleteOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setDeleteQueue(selectedIds);
    setConfirmdeleteOpen(true);
  };
  const handleDeleteConfirm = async () => {
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.adminapplications}/bulk`,
        { ids: deleteQueue },
        true
      );

      setSelectedIds([]);
      setAllSelected(false);
      setConfirmdeleteOpen(false);
      toast.success(
        `Deleted ${deleteQueue.length} application${
          deleteQueue.length > 1 ? "s" : ""
        }`
      );
      await fetchApplications();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const sorted = useMemo(() => {
    return [...apps].sort((a, b) =>
      (b.createdAt || "").localeCompare(a.createdAt || "")
    );
  }, [apps]);

  const filtered = useMemo(() => {
    return sorted.filter((a) => {
      const searchMatch =
        tableSearch === "" ||
        [a.firstName, a.lastName, a.email, a.phoneNumber]
          .join(" ")
          .toLowerCase()
          .includes(tableSearch.toLowerCase());

      const dateMatch =
        (!from || new Date(a.createdAt) >= new Date(from)) &&
        (!to || new Date(a.createdAt) <= new Date(to));

      return searchMatch && dateMatch;
    });
  }, [sorted, tableSearch, from, to]);
  const totalPages = Math.ceil(total / LIMIT);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="md:p-4 p-2">
      <div>
        <div>
          <div className="text-xl font-bold app-text">Applications</div>
          <div className="text-sm text-gray-500 font-medium">
            Total: {filtered.length}
          </div>
        </div>

        <TableToolbar
          search={{
            value: tableSearch,
            onChange: setTableSearch,
            placeholder: "Search users by name, email, phone...",
            widthClassName: "min-w-full rounded-xl",
            debounceMs: 300,
          }}
          dateRange={{
            value: { from, to },
            onChange: (r) => {
              setFrom(r.from);
              setTo(r.to);
            },
          }}
          middleSlot={
            <div className="flex items-center gap-2">
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
            <Button
              onClick={fetchApplications}
              className="bg-linear-to-r from-blue-500 to-indigo-600 text-white md:px-5 md:py-2 py-1 px-3 rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
            >
              Refresh
            </Button>
          }
        />
      </div>
      {selectedIds.length > 0 && (
        <div className="flex justify-end m-2 mr-2">
          <Button
            onClick={handleBulkDeleteClick}
            disabled={selectedIds.length === 0}
            className="md:px-3 px-2 font-medium py-1 bg-red-600 text-white rounded-xl flex items-center gap-2 disabled:opacity-40"
          >
            <Trash2 size={16} /> Delete Selected
          </Button>
        </div>
      )}

      {view === "compact" && (
        <div className="overflow-x-auto rounded-sm border app-border app-card shadow-sm">
          <table className="min-w-full w-full text-sm app-text border-collapse">
            <thead className="app-table-head">
              <tr>
                <th className="px-4 py-1 text-center border app-border">
                  <Checkbox checked={allSelected} onChange={toggleSelectAll} />
                </th>
                <th className="px-4 py-1 text-left font-bold text-nowrap border app-border">
                  Name
                </th>
                <th className="px-4 py-1 text-left font-bold text-nowrap border app-border">
                  Email
                </th>
                <th className="px-4 py-1 text-left font-bold text-nowrap border app-border">
                  Phone
                </th>
                <th className="px-4 py-1 text-center font-bold text-nowrap border app-border">
                  State
                </th>
                <th className="px-4 py-1 text-center font-bold text-nowrap border app-border">
                  Ahip Certified
                </th>
                <th className="px-4 py-1 text-center font-bold border  text-nowrap app-border">
                  Created
                </th>
                <th className="px-4 py-1 text-center font-bold border text-nowrap app-border">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center app-card">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-10 h-10 app-muted" />
                      <span className="app-text font-bold">
                        No applications found
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t hover:bg-app-surface transition"
                  >
                    <td className="px-4 py-2 border app-border text-center">
                      <Checkbox
                        checked={selectedIds.includes(a.id)}
                        onChange={() => toggleSelect(a.id)}
                      />
                    </td>

                    <td className="px-4 py-0.5 border app-border text-nowrap font-medium">
                      {a.firstName} {a.lastName}
                    </td>
                    <td className="px-4 py-0.5 border app-border text-nowrap text-blue-700 break-all">
                      {a.email}
                    </td>
                    <td className="px-4 py-0.5 border app-border text-nowrap text-emerald-700">
                      {a.phoneNumber}
                    </td>
                    <td className="px-4 py-0.5 border app-border text-nowrap text-center font-bold text-purple-700">
                      {a.state}
                    </td>
                    <td className="px-4 py-0.5 border app-border text-nowrap text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          a.ahipCertified
                            ? "bg-green-500/15 text-green-700"
                            : "bg-orange-500/15 text-orange-700"
                        }`}
                      >
                        {a.ahipCertified ? "Certified" : "Not Certified"}
                      </span>
                    </td>
                    <td className="px-4 py-0.5 border app-border text-nowrap text-center app-text text-xs font-bold">
                      {new Date(a.createdAt).toDateString()}
                    </td>
                    <td className="px-4 py-0.5 border app-border text-center">
                      <div className="flex items-center md:gap-2 gap-1">
                        <Button
                          onClick={() => setSelected(a)}
                          className="md:p-2 p-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-800 transition-all shadow-md"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          onClick={() => handleSingleDelete(a.id)}
                          className="md:p-2 p-1 rounded-full bg-red-500/10 text-red-700 hover:text-red-500 shadow-md"
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

      {view === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-4 gap-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center md:py-20 py-10 text-center ">
              <FileText className="h-16 w-16 md:mb-4 mb-2 app-muted" />
              <h3 className="md:text-lg text-[16px] font-semibold app-text">
                No Applications
              </h3>
              <p className="md:mt-2 mt-1 md:text-sm text-[10px] font-medium app-muted">
                There are no applications to display at the moment.
              </p>
            </div>
          ) : (
            filtered.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border app-border app-surface md:p-5 p-3 shadow hover:shadow-lg transition duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-end justify-end ">
                    <Checkbox
                      checked={selectedIds.includes(a.id)}
                      onChange={() => toggleSelect(a.id)}
                    />
                  </div>
                  <div className="md:text-lg text-[14px] font-bold app-text">
                    {a.firstName} {a.lastName}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      a.ahipCertified
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {a.ahipCertified ? "Certified" : "Not Certified"}
                  </span>
                </div>

                {/* Details */}
                <div className="md:space-y-2 space-y-1  md:text-[14px] text-[12px] label-text app-muted font-medium">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-500" />
                    <span className="truncate">{a.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Rows className="w-4 h-4 text-emerald-500" />
                    <span>{a.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-purple-500" />
                    <span>{a.state}</span>
                  </div>
                  <div className="flex items-center gap-2 md:text-[14px] text-[12px] app-muted font-medium">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{new Date(a.createdAt).toDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center md:gap-2 gap-1 mt-2">
                  <Button
                    onClick={() => setSelected(a)}
                    className="md:p-2 p-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-800 transition-all shadow-md"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    onClick={() => handleSingleDelete(a.id)}
                    className="md:p-2 p-1 rounded-full bg-red-500/10 text-red-700 hover:bg-red-800 shadow-md"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      <div className="">
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered?.length}
          limit={LIMIT}
          onPageChange={setPage}
        />
      </div>
      {confirmdeleteOpen && (
        <Modal
          open={confirmdeleteOpen}
          onClose={() => setConfirmdeleteOpen(false)}
        >
          <div className="w-full py-2 shadow-xl animate-scaleIn overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>

            <div className="flex justify-center">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
                <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
            </div>

            <div className="text-center mt-4 space-y-1">
              <h3 className="text-xl font-Gordita-Medium app-text">
                Delete Application{deleteQueue.length > 1 ? "s?" : "?"}
              </h3>
              <p className="md:text-sm text-[12px] app-muted">
                {deleteQueue.length > 1
                  ? `${deleteQueue.length} applications will be permanently deleted.`
                  : "This application will be permanently deleted."}
              </p>
              <p className="md:text-sm text-[12px] app-muted">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-center gap-2 md:gap-4 mt-5">
              <Button
                onClick={() => setConfirmdeleteOpen(false)}
                className="md:px-4 px-2 md:py-2 py-1 text-sm app-card btn-text font-medium flex items-center md:gap-2 gap-1 app-text font-Gordita-Medium rounded-xl"
              >
                Cancel
              </Button>

              <Button
                onClick={handleDeleteConfirm}
                className="md:px-4 px-2 md:py-2 py-1  btn-text  flex items-center md:gap-2 gap-1 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition"
              >
                <Trash2 size={16} /> Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <ApplicationDetailsModal
        open={!!selected}
        onClose={() => setSelected(null)}
        application={selected}
      />
    </div>
  );
}
