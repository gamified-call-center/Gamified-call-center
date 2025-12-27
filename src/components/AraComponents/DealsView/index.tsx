"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import apiClient from "@/Utils/apiClient";
import TableToolbar from "@/commonComponents/TableSearchBar";
import CreateDealModal from "./CreateDealModal.tsx";
import Loader from "@/commonComponents/Loader/";
import Pagination from "@/commonComponents/Pagination";
import toast from "react-hot-toast";
import DealViewModal from "./DealViewModal";
import Button from "@/commonComponents/Button";

type DealRow = {
  id: string | number;
  dealNo: string;

  applicantLastName: string;
  typeOfCoverage: any;

  applicantFirstName: string;
  fullName?: string;
  numberOfApplicants: number;
  career: string;
  carrier: any;
  closedAt: string;
  agentId: string;
  agent: any;
  agentName: string;
  status:any;
  createdByName: string;

  socialProvider: any;
  closedDate: any;
  createdAt: string;
  coverageTypes?: string[];
  ffm?: boolean;
  typeOfWork?: string;
  monthlyIncome?: number;
  documentsNeeded?: string;
  socialProvided?: string;
  customerLanguage?: string;
  notes?: string;
  documents?: {
    documentType: string;
    documentUrl?: string;
  }[];

  
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

const LIMIT = 10;

const AraDealsView = () => {
  const [q, setQ] = useState("");
  // const [from, setFrom] = useState(
  //   toDateOnly(new Date(Date.now() - 19 * 24 * 3600 * 1000))
  // );

  // const [to, setTo] = useState(toDateOnly(new Date()));
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const handleView = (deal: any) => {
    setSelectedDeal(deal);
    setViewOpen(true);
  };

  const [page, setPage] = useState(1);

  const [items, setItems] = useState<DealRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [agents, setAgents] = useState<{ label: string; value: string }[]>([]);

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
      const res: any = await apiClient.get(
        apiClient.URLS.deals,
        { page, limit: LIMIT },
        true
      );

      const list = Array.isArray(res.body.data) ? res.body.data : [];

      setItems(list);
      setTotal(list.meta?.total);
    } catch (e) {
      console.error(e);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filteredItems = useMemo(() => {
    const query = q.toLowerCase().trim();

    return items.filter((d) => {
      const fullName =
        d.fullName?.toLowerCase() ||
        `${d.applicantFirstName} ${d.applicantLastName}`.toLowerCase();

      const matchSearch =
        fullName.includes(query) ||
        d.agent?.user?.firstName?.toLowerCase().includes(query) ||
        d.createdByName?.toLowerCase().includes(query) ||
        d.carrier?.toLowerCase().includes(query);

      const closedDate = d.closedDate ? d.closedDate.split("T")[0] : "";

      const matchDate =
        (!from || closedDate >= from) && (!to || closedDate <= to);

      return matchSearch && matchDate;
    });
  }, [items, q, from, to]);

  const fetchAgents = async () => {
    setLoading(true);

    try {
      const res = await apiClient.get(`${apiClient.URLS.user}/all`, {}, true);

      if (res.body.data && Array.isArray(res.body.data)) {
        const options = res.body.data.map((d: any) => ({
          label: d.firstName,
          value: d.id,
        }));

        setAgents(options);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async (dto: any) => {
    await apiClient.post(apiClient.URLS.deals, dto);
  };

  const updateDeal = async (id: string | number, dto: any) => {
    await apiClient.patch(`${apiClient.URLS.deals}/${id}`, dto);
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
  const exportToCSV = () => {
    const headers = [
      "Deal #",
      "Full Name",
      "Applicants",
      "Carrier",
      "Closed Date",
      "Agent",
      "Created By",
      "Created At",
    ];

    const rows = items.map((d, i) => [
      d.dealNo || i + 1,
      d.fullName?.trim() || `${d.applicantFirstName} ${d.applicantLastName}`,
      d.numberOfApplicants,
      d.carrier || "-",
      formatDateTime(d.closedDate),
      d.agent?.user?.firstName || "-",
      d.createdByName || "-",
      formatDateTime(d.createdAt),
    ]);

    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "deals.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /** ---- edit prefill (map row -> modal form) ---- */
  const initialValues = useMemo<Partial<any> | undefined>(() => {
    if (!editing) return undefined;

    return {
      coverageTypes: editing.typeOfCoverage ?? [],

      firstName: editing.applicantFirstName ?? "",
      lastName: editing.applicantLastName ?? "",

      numberOfApplicants: String(editing.numberOfApplicants ?? ""),

      ffm: editing?.ffm ?? false,

      career: editing.carrier ?? "",
      typeOfWork: editing.typeOfWork ?? "",

      monthlyIncome:
        editing.monthlyIncome !== undefined
          ? String(editing.monthlyIncome)
          : "",

      documentsNeeded: editing.documentsNeeded ?? "",
      socialProvided: editing.socialProvider ?? "",
      customerLanguage: editing.customerLanguage ?? "",
      status: (editing.status ?? "OPEN") as "OPEN" | "CLOSED" | "REJECTED",

      closedDate: editing.closedDate
        ? isoToDateTimeLocal(editing.closedDate)
        : "",

      agentId: editing.agent?.user?.id ?? "",

      notes: editing.notes ?? "",
      documentType: editing.documents?.[0]?.documentType ?? "",
      documentUrl: editing.documents?.[0]?.documentUrl ?? [],
    };
  }, [editing]);

  /** ---- submit (create or update) ---- */
  const handleSubmit = async (payload: any) => {
    try {
      const urls = Array.isArray(payload.documentUrls)
        ? payload.documentUrls
        : [];

      const uploadedDocs = urls.map((url: string) => ({
        documentType: payload.documentType || "",
        documentUrl: url || "",
      }));

      const dto = {
        typeOfCoverage: payload.coverageTypes,
        applicantFirstName: payload.firstName,
        applicantLastName: payload.lastName,
        numberOfApplicants: Number(payload.numberOfApplicants || 0),
        ffm: payload.ffm,

        carrier: payload.career || "",
        typeOfWork: payload.typeOfWork || "",
        monthlyIncome: Number(payload.monthlyIncome || 0),
        documentsNeeded: payload.documentsNeeded || "",
        socialProvider: payload.socialProvided || "",
        customerLanguage: payload.customerLanguage || "",
        closedDate: payload.closedDate
          ? new Date(payload.closedDate).toISOString()
          : null,
        agentId: payload.agentId || "",
        notes: payload.notes || "",
         status: payload.status || "OPEN",
        documents: uploadedDocs,

       

      
      };

      if (mode === "CREATE") {
        await createDeal(dto);
        toast.success("Deal created successfully!");
      } else if (mode === "EDIT" && editing) {
        await updateDeal(editing.id, dto);
        toast.success("Deal updated successfully!");
      }

      setModalOpen(false);
      await fetchDeals();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async (deal: DealRow) => {
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.deals}/${deal.id}`,
        {},
        true
      );
      if (res.status === 200) {
        toast.success("Agent deleted successfully");
      }
      await fetchDeals();
    } catch (e) {
      console.error(e);
      toast.error("something went worong");
    }
  };

  const showingText = useMemo(() => {
    if (total === 0) return "Showing 0 entries";
    const start = (page - 1) * LIMIT + 1;
    const end = Math.min(page * LIMIT, total);
    return `Showing ${start} to ${end} of ${total} entries`;
  }, [page, total]);
  if (loading) {
    return (
      <div className="w-full h-full items-center flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="md:p-4 p-1 app-surface">
      <div className=" rounded-md shadow-2xl md:p-4 p-1 app-card">
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
              <Button
                onClick={exportToCSV}
                className="
    rounded-xl flex items-center gap-2 px-4 py-2 text-sm  font-bold
    bg-emerald-500 text-white
    hover:bg-emerald-600
    dark:bg-emerald-400/90 dark:hover:bg-emerald-400
    transition-colors
  "
              >
                <Download className="w-4 h-4" />
                Excel
              </Button>

              <Button
                onClick={openCreate}
                className="
    rounded-xl px-4 py-2 text-sm  font-bold
    bg-indigo-600 text-white
    hover:bg-indigo-700
    dark:bg-indigo-500 dark:hover:bg-indigo-400
    transition-colors
  "
              >
                + Create New Deal
              </Button>
            </>
          }
        />

        <div className="overflow-x-auto rounded-sm border app-border app-card  shadow-sm">
          <table className="min-w-275 w-full text-sm app-text  border-collapse">
            <thead className="sticky top-0 z-10 app-table-head   ">
              <tr>
                <th className="px-4 py-1 text-left  font-bold border app-border ">
                  Deal #
                </th>
                <th className="px-4 py-1 text-left  font-bold border app-border ">
                  Full Name
                </th>
                <th className="px-4 py-1 text-center  font-bold border app-border ">
                  Applicants
                </th>
                <th className="px-4 py-1 text-left  font-bold border app-border ">
                  Carrier
                </th>
                <th className="px-4 py-1 text-left  font-bold border app-border ">
                  Closed Date
                </th>
                <th className="px-4 py-1 text-left  font-bold border app-border ">
                  Agent
                </th>
                <th className="px-4 py-1 text-left  font-bold border app-border ">
                  Created By
                </th>
                <th className="px-4 py-1 text-center  font-bold border app-border ">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center app-text border app-border "
                  >
                    No deals found
                  </td>
                </tr>
              ) : (
                filteredItems.map((d, i) => (
                  <tr key={d.id} className="app-row-hover  transition-colors">
                    <td className="px-4 py-1  font-medium border app-border ">
                      {d.dealNo || i + 1}
                    </td>
                    <td className="px-4 py-1 border app-border ">
                      {d.fullName?.trim() ||
                        `${d.applicantFirstName} ${d.applicantLastName}`}
                    </td>
                    <td className="px-4 py-1 text-center border app-border ">
                      {d.numberOfApplicants}
                    </td>
                    <td className="px-4 py-1 border app-border ">
                      {d.carrier || "-"}
                    </td>
                    <td className="px-4 py-1 whitespace-nowrap  border app-border ">
                      {formatDateTime(d.closedDate)}
                    </td>
                    <td className="px-4 py-1 border app-border ">
                      {d.agent?.user?.firstName || "-"}
                    </td>
                    <td className="px-4 py-1 border app-border ">
                      {formatDateTime(d.createdAt)}
                    </td>
                    <td className="px-4 py-1 text-center border app-border ">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition"
                          title="Edit"
                          onClick={() => openEdit(d)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 transition"
                          title="Delete"
                          onClick={() => handleDelete(d)}
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Button
                          className="p-2 rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 transition"
                          title="View"
                          onClick={() => handleView(d)}
                        >
                          <Eye size={16} />
                        </Button>
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
      </div>
      <DealViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        deal={selectedDeal}
      />

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
