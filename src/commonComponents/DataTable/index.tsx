import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface TableColumn {
  key: string;
  label: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  isObj?: {
    flag: boolean;
    displayKey?: string;
  };
  thCls?: string;
  tdCls?: string;
}

interface DataTableProps {
  columns: TableColumn[];
  data: any[];
  rootTableCls?: string;
  theadCls?: string;
  tbodyCls?: string;
  rowCls?: string;
}

export default function DataTable({
  columns,
  data,
  rootTableCls,
  theadCls,
  tbodyCls,
  rowCls,
}: DataTableProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar rounded-xl border border-white/10 bg-slate-800/40 backdrop-blur-xl shadow-xl">
      <table
        className={twMerge(
          "w-full table-auto border-collapse",
          rootTableCls
        )}
      >
        {/* TABLE HEAD */}
        <thead
          className={twMerge(
            "bg-slate-900/60 text-slate-300 text-sm",
            theadCls
          )}
        >
          <tr className="divide-x divide-white/10">
            {columns.map((col, index) => (
              <th
                key={`${col.key}-${index}`}
                scope="col"
                onClick={col.onClick}
                className={twMerge(
                  "px-4 py-3 text-left font-semibold tracking-wide whitespace-nowrap",
                  col.onClick &&
                    "cursor-pointer hover:text-white transition-colors",
                  col.thCls
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* TABLE BODY */}
        <tbody
          className={twMerge(
            "divide-y divide-white/5 text-sm text-slate-200",
            tbodyCls
          )}
        >
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-slate-400"
              >
                No records found
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className={twMerge(
                  "divide-x divide-white/5 hover:bg-white/5 transition-colors",
                  rowCls
                )}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={`cell-${col.key}-${colIndex}`}
                    className={twMerge(
                      "px-4 py-3 whitespace-nowrap",
                      col.tdCls
                    )}
                  >
                    {col.isObj?.flag &&
                    col.isObj.displayKey &&
                    item[col.key]
                      ? item[col.key][col.isObj.displayKey] ?? "-"
                      : item[col.key] ?? "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
