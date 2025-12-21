"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import apiClient from "@/Utils/apiClient";
import TableToolbar from "@/commonComponents/TableSearchBar";
import CreateDealModal from "./CreateDealModal.tsx";

type DealRow = {
    id: string | number;
    dealNo: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    applicantsCount: number;
    career: string;
    closedAt: string;
    agentId: string;
    agentName: string;
    createdByName: string;
    createdAt: string;
    coverageTypes?: string[];
    ffm?: string;
    typeOfWork?: string;
    monthlyIncome?: number;
    documentsNeeded?: string;
    socialProvided?: string;
    customerLanguage?: string;
    notes?: string;
};

type ListResponse = {
    items: DealRow[];
    total: number;
    page: number;
    limit: number;
};

type SelectOption = { label: string; value: string; disabled?: boolean };

/** ========= Helpers ========= */
const pad2 = (n: number) => String(n).padStart(2, "0");

function formatDateTime(dt: string) {
    const d = new Date(dt);
    return d.toLocaleString(undefined, {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function toDateOnly(d: Date) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function isoToDateTimeLocal(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
        d.getDate()
    )}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** ========= Pagination (single-file) ========= */
function Pagination({
    page,
    totalPages,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
}) {
    const pages = useMemo(() => {
        // Show: Prev [1] 2 3 4 5 ... last Next (like your screenshot)
        const out: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) out.push(i);
            return out;
        }

        const left = Math.max(1, page - 2);
        const right = Math.min(totalPages, page + 2);

        out.push(1);

        if (left > 2) out.push("...");

        for (let i = left; i <= right; i++) {
            if (i !== 1 && i !== totalPages) out.push(i);
        }

        if (right < totalPages - 1) out.push("...");

        out.push(totalPages);
        return out;
    }, [page, totalPages]);

    return (
        <div className="flex items-center justify-end gap-1">
            <button
                className="rounded-lg border px-3 py-1.5 text-sm  hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700  dark:hover:bg-slate-800"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                Previous
            </button>

            {pages.map((p, idx) =>
                p === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-slate-400">
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={[
                            "min-w-8.5 rounded-lg border px-3 py-1.5 text-sm",
                            p === page
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : " hover:bg-slate-50 dark:border-slate-700  dark:hover:bg-slate-800",
                        ].join(" ")}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                className="rounded-lg border px-3 py-1.5 text-sm  hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700  dark:hover:bg-slate-800"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </button>
        </div>
    );
}

const LIMIT = 10;

const AraDealsView = () => {
    const [q, setQ] = useState("");
    const [from, setFrom] = useState(toDateOnly(new Date(Date.now() - 19 * 24 * 3600 * 1000)));
    const [to, setTo] = useState(toDateOnly(new Date()));

    const [page, setPage] = useState(1);

    const [items, setItems] = useState<DealRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [agents, setAgents] = useState<SelectOption[]>([
        { label: "Select Agent", value: "" },
    ]);

    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState<"CREATE" | "EDIT">("CREATE");
    const [editing, setEditing] = useState<DealRow | null>(null);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(total / LIMIT)),
        [total]
    );

    /** ---- API calls (swap endpoints to yours) ---- */
    const fetchDeals = async () => {
        setLoading(true);
        try {
            // ✅ change endpoint to your backend
            // Example expected: { items, total, page, limit }
            const res = await apiClient.get("/deals", {
                params: { page, limit: LIMIT, q: q.trim(), from, to },
            });
            const data: ListResponse = res.data;
            setItems(data.items || []);
            setTotal(data.total || 0);
        } catch (e) {
            console.error(e);
            setItems([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchAgents = async () => {
        try {
            const res = await apiClient.get("/agents", { params: { limit: 200 } });
            const list = (res.data?.items ?? res.data ?? []) as any[];
            const mapped: SelectOption[] = [
                { label: "Select Agent", value: "" },
                ...list.map((a) => ({
                    label: a.fullName || a.name || a.username || `Agent ${a.id}`,
                    value: String(a.id),
                })),
            ];
            setAgents(mapped);
        } catch (e) {
            console.error("Agents fetch failed", e);
        }
    };

    const createDeal = async (dto: any) => {
        await apiClient.post("/deals", dto);
    };

    const updateDeal = async (id: string | number, dto: any) => {
        await apiClient.put(`/deals/${id}`, dto);
    };

    const removeDeal = async (id: string | number) => {
        await apiClient.delete(`/deals/${id}`);
    };

    /** ---- initial loads ---- */
    useEffect(() => {
        fetchAgents();
    }, []);

    // refetch whenever page changes
    useEffect(() => {
        fetchDeals();
    }, [page]);

    useEffect(() => {
        setPage(1);
    }, [from, to, q]);

    useEffect(() => {
        fetchDeals();
    }, [from, to, q]);

    /** ---- open modal actions ---- */
    const openCreate = () => {
        setMode("CREATE");
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (deal: DealRow) => {
        setMode("EDIT");
        setEditing(deal);
        setModalOpen(true);
    };

    /** ---- edit prefill (map row -> modal form) ---- */
    const initialValues = useMemo(() => {
        if (!editing) return undefined;

        return {
            coverageTypes: editing.coverageTypes ?? [],
            firstName: editing.firstName ?? "",
            lastName: editing.lastName ?? "",
            numberOfApplicants: String(editing.applicantsCount ?? ""),
            ffm: editing.ffm ?? "",
            career: editing.career ?? "",
            typeOfWork: editing.typeOfWork ?? "",
            monthlyIncome: editing.monthlyIncome ? String(editing.monthlyIncome) : "",
            documentsNeeded: editing.documentsNeeded ?? "",
            socialProvided: editing.socialProvided ?? "",
            customerLanguage: editing.customerLanguage ?? "",
            closedDate: editing.closedAt ? isoToDateTimeLocal(editing.closedAt) : "",
            agentId: editing.agentId ? String(editing.agentId) : "",
            notes: editing.notes ?? "",
            files: [],
        };
    }, [editing]);

    /** ---- submit (create or update) ---- */
    const handleSubmit = async (payload: any) => {
        // Map modal form -> API DTO (adjust to your backend)
        const dto = {
            coverageTypes: payload.coverageTypes,
            firstName: payload.firstName,
            lastName: payload.lastName,
            applicantsCount: Number(payload.numberOfApplicants || 0),
            ffm: payload.ffm,
            career: payload.career,
            typeOfWork: payload.typeOfWork,
            monthlyIncome: Number(payload.monthlyIncome || 0),
            documentsNeeded: payload.documentsNeeded,
            socialProvided: payload.socialProvided,
            customerLanguage: payload.customerLanguage,
            closedAt: payload.closedDate ? new Date(payload.closedDate).toISOString() : null,
            agentId: payload.agentId,
            notes: payload.notes,
        };

        // 🔥 Files: usually upload separately (S3 / signed URL) then send URLs in dto
        // payload.files -> handle later

        if (mode === "CREATE") {
            await createDeal(dto);
        } else if (mode === "EDIT" && editing) {
            await updateDeal(editing.id, dto);
        }

        setModalOpen(false);
        await fetchDeals(); // ✅ refresh list after modal closes
    };

    const handleDelete = async (deal: DealRow) => {
        const ok = window.confirm(`Delete deal #${deal.dealNo}?`);
        if (!ok) return;
        await removeDeal(deal.id);
        await fetchDeals();
    };

    const showingText = useMemo(() => {
        if (total === 0) return "Showing 0 entries";
        const start = (page - 1) * LIMIT + 1;
        const end = Math.min(page * LIMIT, total);
        return `Showing ${start} to ${end} of ${total} entries`;
    }, [page, total]);

    return (
        <div className="p-4">
            <div className="mb-3 flex items-center gap-2 text-slate-700 ">
                <span className="font-semibold">DEALS</span>
            </div>

            <TableToolbar
                search={{
                    value: q,
                    onChange: (v: any) => setQ(v),
                    placeholder: "Search...",
                    debounceMs: 350,
                }}
                dateRange={{
                    value: { from, to },
                    onChange: (r: any) => {
                        setFrom(r.from);
                        setTo(r.to);
                    },
                }}
                actionsSlot={
                    <>
                        <button className="rounded-xl bg--200 px-4 py-2 text-sm bg-[#80d26e] font-semibold text-white hover:bg-emerald-600">
                            Excel
                        </button>
                        <button
                            onClick={openCreate}
                            className="rounded-xl bg-[#477891] px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            + Create New Deal
                        </button>
                    </>
                }
            />

            {/* Table */}
            <div className="overflow-hidden rounded-md shadow-2xl  min-h-full  border bg-white">
                <div className="overflow-auto">
                    <table className="min-w-275 min-h-100 w-full text-sm">
                        <thead className="bg-slate-50  dark:bg-gray-300 ">
                            <tr>
                                <th className="px-4 py-3 text-left">Deal #</th>
                                <th className="px-4 py-3 text-left">Full Name</th>
                                <th className="px-4 py-3 text-left"># Applicants</th>
                                <th className="px-4 py-3 text-left">Career</th>
                                <th className="px-4 py-3 text-left">Closed Date</th>
                                <th className="px-4 py-3 text-left">Agent</th>
                                <th className="px-4 py-3 text-left">Created By</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                                        No deals found
                                    </td>
                                </tr>
                            ) : (
                                items.map((d) => (
                                    <tr key={d.id} className="border-t dark:border-slate-800">
                                        <td className="px-4 py-3">{d.dealNo}</td>
                                        <td className="px-4 py-3">
                                            {(d.fullName && d.fullName.trim()) || `${d.firstName} ${d.lastName}`}
                                        </td>
                                        <td className="px-4 py-3">{d.applicantsCount}</td>
                                        <td className="px-4 py-3">{d.career}</td>
                                        <td className="px-4 py-3">{formatDateTime(d.closedAt)}</td>
                                        <td className="px-4 py-3">{d.agentName}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{d.createdByName}</div>
                                            <div className="text-xs text-slate-500">{formatDateTime(d.createdAt)}</div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    className="rounded-md bg-indigo-600 p-2 text-white hover:bg-indigo-700"
                                                    title="Edit"
                                                    onClick={() => openEdit(d)}
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    className="rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600"
                                                    title="Delete"
                                                    onClick={() => handleDelete(d)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                                <button
                                                    className="rounded-md bg-cyan-500 p-2 text-white hover:bg-cyan-600"
                                                    title="View"
                                                    onClick={() => {
                                                        // You can route to details page later
                                                        alert(`View deal ${d.dealNo}`);
                                                    }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm  dark:border-slate-800  md:flex-row md:items-center md:justify-between">
                    <div>{showingText}</div>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            </div>

            {/* Modal (Create/Edit) */}
            <CreateDealModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                mode={mode}
                agents={agents}
                initialValues={initialValues}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default AraDealsView;
