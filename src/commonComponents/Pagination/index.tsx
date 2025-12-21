import { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (p: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}: PaginationProps) {
  const pages = useMemo(() => {
    const out: (number | "...")[] = [];

    out.push(1);

    if (page > 3) out.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      out.push(i);
    }

    if (page < totalPages - 2) out.push("...");

    if (totalPages > 1) out.push(totalPages);

    return out;
  }, [page, totalPages]);

  const showingText = useMemo(() => {
    if (totalItems === 0) return "Showing 0 entries";
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, totalItems);
    return `Showing ${start}-${end} of ${totalItems}`;
  }, [page, totalItems, limit]);

  const btnClass =
    "min-w-[36px] px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center justify-center";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
        {showingText}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(1)}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:hover:bg-slate-800"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium dark:border-slate-700 dark:hover:bg-slate-800"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {pages.map((p, idx) =>
          p === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-3 py-2 text-slate-400 dark:text-slate-500"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`${btnClass} ${
                p === page
                  ? "bg-indigo-600 text-white border-indigo-600 shadow"
                  : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium dark:border-slate-700 dark:hover:bg-slate-800"
          title="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(totalPages)}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:hover:bg-slate-800"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
