"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Download, Eye, FileSpreadsheet, LayoutGrid, Pencil, Rows, Trash2 } from "lucide-react";
import apiClient from "@/Utils/apiClient";
import TableToolbar from "@/commonComponents/TableSearchBar";
import CreateDealModal from "./CreateDealModal.tsx";
import Loader from "@/commonComponents/Loader/";
import Pagination from "@/commonComponents/Pagination";
import toast from "react-hot-toast";
import DealViewModal from "./DealViewModal";
import Button from "@/commonComponents/Button";
import Modal from "@/commonComponents/Modal";
import {DealType} from "../../../../src/Utils/constants/ara/constants"
import CSVUploadModal from "../AgentsView/CsvUploadModal";

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
  userId:string;
  agent: any;
  agentName: string;
  status: any;
  createdByName: string;

  socialProvider: any;
  closedDate: any;
  createdAt: string;
  coverageTypes?: string[];
  ffm?: string;
  typeOfWork?: string;
  monthlyIncome?: number;
  documentsNeeded?: string;
  socialProvided?: string;
  customerLanguage?: string;
  notes?: string;
  documents?:string[];
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
type ViewMode = "compact" | "cards";

const AraDealsView = () => {
  const [q, setQ] = useState("");
  // const [from, setFrom] = useState(
  //   toDateOnly(new Date(Date.now() - 19 * 24 * 3600 * 1000))
  // );

  // const [to, setTo] = useState(toDateOnly(new Date()));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("compact");

  const [selecteddeleteDeal, setSelecteddeleteDeal] = useState<any | null>(
    null
  );
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
        { page, limit: LIMIT, search: q || undefined, 
        from: from || undefined,
        to: to || undefined, },
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
  const [uploadProgress, setUploadProgress] = useState(0);
    const [openFileModal, setOpenFileModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const dealFileInputRef = useRef<HTMLInputElement | null>(null);
    const [ isDealsUploading, setIsDealsUploading]=useState(false)

 const fetchAgents = async () => {
  setLoading(true);

  try {
    const res = await apiClient.get(`${apiClient.URLS.user}`, {}, true);

    if (res.body.data && Array.isArray(res.body.data)) {
      // const activeAgents = res.body.data.filter(
      //   (agent: any) => agent?.isActive === true
      // );

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
  }, [page, q, from, to]);

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
  const handleDealFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".csv")) {
    toast.error("Please upload a valid CSV file");
    return;
  }

 setSelectedFile(file);
};

const uploadDealsCsv = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post(
    `${apiClient.URLS.deals}/bulk/csv`,
    formData,
    true,
    "file"
  );
};

const handleDealsCsvUpload = async () => {
  if (!selectedFile) {
    toast.error("Select CSV file to upload");
    return;
  }

  setIsDealsUploading(true);
  setUploadProgress(25);

  try {
    const res = await uploadDealsCsv(selectedFile);
    setUploadProgress(100);

    const { created = 0, failed = 0, failures = [], parseErrors = [] } = res.body || {};

    if (failed > 0 || failures.length > 0) {
      toast.error(`Upload completed with ${failures.length || failed} deal errors`);
      console.table(failures);
    }

    if (created > 0 && failures.length === 0) {
      toast.success(`${created} deals uploaded successfully`);
    }

    await fetchDeals?.();
    setOpenFileModal(false);
  } catch (err) {
    console.error(err);
    toast.error("Bulk deals upload failed");
  } finally {
    setIsDealsUploading(false);
    setSelectedFile(null);
  }
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

      ffm: String(editing.ffm)??"",

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
    userId: editing.agent?.user?.id ?? "",

      notes: editing.notes ?? "",
     
     documents: editing.documents?? [],
    };
  }, [editing]);

 
  const handleSubmit = async (payload: any) => {
    try {
      
      const dto = {
        typeOfCoverage: payload.coverageTypes,
        applicantFirstName: payload.firstName,
        applicantLastName: payload.lastName,
        numberOfApplicants: Number(payload.numberOfApplicants || 0),
        ffm: payload.ffm,

        carrier: payload.career || "",
        typeOfWork: payload.typeOfWork || "",
        monthlyIncome: Number(payload.monthlyIncome || 0),
        documentsNeeded: payload.documentsNeeded || "NONE",
        socialProvider: payload.socialProvided || "",
        customerLanguage: payload.customerLanguage || "",
        closedDate: payload.closedDate
          ? new Date(payload.closedDate).toISOString()
          : null,
        // agentId: String(payload.agentId )|| "",
        userId:String(payload.userId)||"",
       dealType:DealType.ACA,
        notes: payload.notes || "",
        status: payload.status || "OPEN",
       documents: payload.documents||[],
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
        toast.success("deals deleted successfully");
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
          middleSlot={
            <div className="flex items-center md:gap-2 gap-1">
              <div className="flex items-center gap-1">
                <Button
                  className={`md:px-2 px-2 md:py-[7px] py-[6px] rounded-md border ${
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
                  className={`md:px-2 px-2 md:py-[7px] py-[6px] rounded-md border ${
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
             <Button
                              onClick={() => setOpenFileModal(true)}
                              className="flex items-center gap-2 rounded-xl md:px-4 px-2 md:py-2 py-1.5 cursor-pointer text-[12px] md:text-sm text-nowrap bg-indigo-600  font-bold text-white hover:bg-indigo-700"
                            >
                              <FileSpreadsheet className="md:w-4 w-3 md:h-4 h-3" />
                              Import CSV
                            </Button>
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
    bg-indigo-600 text-white text-nowrap
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

        {view === "compact" && (
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
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-16 text-center app-text border app-border "
                    >
                      No deals found
                    </td>
                  </tr>
                ) : (
                  items.map((d, i) => (
                    <tr key={d.id} className="app-row-hover  transition-colors">
                      <td className="px-4 py-1  font-medium border app-border ">
                        {d.dealNo || i + 1}
                      </td>
                      <td className="px-4 py-1 font-medium border app-border ">
                        {d.fullName?.trim() ||
                          `${d.applicantFirstName} ${d.applicantLastName}`}
                      </td>
                      <td className="px-4 py-1 text-center  font-medium border app-border ">
                        {d.numberOfApplicants}
                      </td>
                      <td className="px-4 py-1 border font-medium app-border ">
                        {d.carrier || "-"}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap font-medium border app-border ">
                        {formatDateTime(d.closedDate)}
                      </td>
                      <td className="px-4 py-1 border app-border font-medium ">
                        {d.agent?.user?.firstName || "-"}
                      </td>
                      <td className="px-4 py-1 border app-border font-medium ">
                        {formatDateTime(d.createdAt)}
                      </td>
                      <td className="px-4 py-1 text-center border font-medium app-border ">
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelecteddeleteDeal(d);
                              setConfirmOpen(true);
                            }}
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
        )}
        {view === "cards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4 gap-2 px-1">
            {items.map((d) => (
              <div
                key={d.id}
                className="app-card border app-border rounded-2xl shadow-md md:p-4 p-2 flex flex-col md:gap-2 gap-1 hover:shadow-lg transition"
              >
                <div className="md:text-xs text-[14px] font-bold app-muted">
                  Deal # {d.dealNo}
                </div>

                <div className="md:text-sm text-[12px] font-bold app-text">
                  {d.fullName?.trim() ||
                    `${d.applicantFirstName} ${d.applicantLastName}`}
                </div>

                <div className="md:text-sm text-[12px] font-medium app-muted">
                  Applicants:{" "}
                  <span className="font-semibold">{d.numberOfApplicants}</span>
                </div>

                <div className="md:text-sm text-[12px]  font-mediumapp-muted">
                  Carrier:{" "}
                  <span className="font-semibold">{d.carrier || "-"}</span>
                </div>

                <div className="md:text-xs text-[12px] font-medium app-muted whitespace-nowrap">
                  Closed:{" "}
                  <span className="font-medium">
                    {formatDateTime(d.closedDate)}
                  </span>
                </div>

                <div className="md:text-sm text-[12px] font-medium app-muted">
                  Agent: {d.agent?.user?.firstName || "-"}
                </div>
                <div className="text-xs font-medium app-muted">
                  Created: {formatDateTime(d.createdAt)}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Button
                    className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition"
                    title="Edit"
                    onClick={() => openEdit(d)}
                  >
                    <Pencil size={16} />
                  </Button>

                  <Button
                    className="p-2 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 transition"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelecteddeleteDeal(d);
                      setConfirmOpen(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>

                  <Button
                    className="p-2 rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 transition"
                    title="View"
                    onClick={() => handleView(d)}
                  >
                    <Eye size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
       

        {totalPages>1 && <div className="">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={items.length}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </div>}
      </div>
      <DealViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        deal={selectedDeal}
      />
       {confirmOpen && (
          <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <div className="app-card w-full py-2 rounded-md">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>

              <div className="flex justify-center">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
                  <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
              </div>

              {/* Text */}
              <div className="text-center mt-4 space-y-1">
                <h3 className="md:text-[14px]  text-[12px] app-text font-Gordita-Medium">
                  Confirm Deletion
                </h3>
                <p className="md:text-sm text-[12px] app-muted">
                  Are you sure you want to delete this Deal? This action cannot
                  be undone.
                </p>
              </div>

              <div className="flex justify-center gap-2 md:gap-4 mt-5">
                <Button
                  onClick={() => setConfirmOpen(false)}
                  className="md:px-4 px-2  md:py-2 py-1 text-sm app-card app-text font-Gordita-Medium btn-text rounded-xl transition"
                >
                  Cancel
                </Button>

                <Button
                  onClick={() => {
                    handleDelete(selecteddeleteDeal);
                    setConfirmOpen(false);
                  }}
                  className="md:px-4 px-2  md:py-2 py-1 text-sm  bg-rose-600 hover:bg-rose-700 text-white rounded-xl btn-text font-Gordita-Medium transition disabled:opacity-40"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Modal>
        )}

      <CreateDealModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        agents={agents}
        initialValues={initialValues}
        onSubmit={handleSubmit}
      />
      <CSVUploadModal
  open={openFileModal}
  onClose={() => {
    setOpenFileModal(false);
    setSelectedFile(null);
  }}
  selectedFile={selectedFile}
  onFileSelect={handleDealFileSelect}
  onUpload={handleDealsCsvUpload}
  fileInputRef={dealFileInputRef}
  isLoading={isDealsUploading}
/>

    </div>
  );
};

export default AraDealsView;
