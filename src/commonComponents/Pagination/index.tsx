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

  const baseBtn =
    "rounded-lg transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed";

  const numBtn =
    "min-w-[36px] px-3 py-1 text-sm  font-Gordita-Medium";


  return (
 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-sm app-text  font-Gordita-Medium">{showingText}</div>

      <div className="flex flex-wrap items-center gap-2">
        {/* First */}
        <button
          disabled={page === 1}
          onClick={() => onPageChange(1)}
          className={`${baseBtn} app-btn p-2`}
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Prev */}
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`${baseBtn} app-btn flex items-center gap-1 px-3 py-2 text-sm  font-Gordita-Medium`}
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Pages */}
        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-3 py-2 app-muted text-sm">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`${baseBtn} ${numBtn} ${
                p === page ? "app-btn-active" : "app-btn"
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
          className={`${baseBtn} app-btn flex items-center gap-1 px-3 py-2 text-sm  font-Gordita-Medium`}
          title="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last */}
        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => onPageChange(totalPages)}
          className={`${baseBtn} app-btn p-2`}
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
