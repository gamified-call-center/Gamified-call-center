// components/DealsTable.tsx
import React, { useState } from "react";

interface Deal {
  id: string;
  firstName: string;
  lastName: string;
  applicants: number;
  career: string;
  closedDate: string;
  agent: string;
  createdBy: string;
  coverageType: string;
  FFm: string;
  typeOfWork: string;
  monthlyIncome: string;
  documentsNeeded: string;
  socialProvided: string;
  customerLanguage: string;
  notes: string;
  dealDocuments: string;
}

interface DealsTableProps {
  deals: Deal[];
}

const DealsTable: React.FC<DealsTableProps> = ({ deals }) => {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedDeal(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 bg-[#0B0F1A] min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Deals</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-[10px] divide-y divide-white/10">
          <thead className="bg-slate-900/50">
            <tr>
              {["Deal #", "Full Name", "#Applicants", "Career", "Closed Date", "Agent", "Created By", "Actions"].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-slate-400">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr
                key={deal.id}
                className="hover:bg-slate-900/40 transition-all duration-200 rounded-xl"
              >
                <td className="px-4 py-3 text-white">{deal.id}</td>
                <td className="px-4 py-3 text-white">{deal.firstName} {deal.lastName}</td>
                <td className="px-4 py-3 text-white">{deal.applicants}</td>
                <td className="px-4 py-3 text-white">{deal.career}</td>
                <td className="px-4 py-3 text-white">{deal.closedDate}</td>
                <td className="px-4 py-3 text-white">{deal.agent}</td>
                <td className="px-4 py-3 text-white">{deal.createdBy}</td>
                <td className="px-4 py-3 space-x-2">
                  <button className="text-blue-400 hover:text-blue-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
                    Edit
                  </button>
                  <button className="text-red-400 hover:text-red-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
                    Delete
                  </button>
                  <button
                    className="text-emerald-400 hover:text-emerald-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                    onClick={() => handleViewDeal(deal)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && selectedDeal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xl z-50 p-4">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-[10px] w-full max-w-3xl p-6 overflow-y-auto max-h-[80vh] relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              onClick={handleCloseModal}
            >
              ✖
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Deal #{selectedDeal.id}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-white"><strong>Coverage Type:</strong> {selectedDeal.coverageType}</div>
              <div className="text-white"><strong>First Name:</strong> {selectedDeal.firstName}</div>
              <div className="text-white"><strong>Last Name:</strong> {selectedDeal.lastName}</div>
              <div className="text-white"><strong>#Applicants:</strong> {selectedDeal.applicants}</div>
              <div className="text-white"><strong>FFm:</strong> {selectedDeal.FFm}</div>

              <div>
                <label htmlFor="career" className="block text-sm font-medium mb-1 text-slate-400">
                  Career
                </label>
                <select
                  id="career"
                  value={selectedDeal.career}
                  className="w-full border border-blue-500/30 bg-slate-900/50 text-white p-2 rounded-xl backdrop-blur-xl"
                >
                  <option>{selectedDeal.career}</option>
                </select>
              </div>

              <div>
                <label htmlFor="typeOfWork" className="block text-sm font-medium mb-1 text-slate-400">
                  Type of Work
                </label>
                <select
                  id="typeOfWork"
                  value={selectedDeal.typeOfWork}
                  className="w-full border border-blue-500/30 bg-slate-900/50 text-white p-2 rounded-xl backdrop-blur-xl"
                >
                  <option>{selectedDeal.typeOfWork}</option>
                </select>
              </div>

              <div className="text-white"><strong>Monthly Income:</strong> {selectedDeal.monthlyIncome}</div>

              <div>
                <label htmlFor="documentsNeeded" className="block text-sm font-medium mb-1 text-slate-400">
                  Documents Needed
                </label>
                <select
                  id="documentsNeeded"
                  value={selectedDeal.documentsNeeded}
                  className="w-full border border-blue-500/30 bg-slate-900/50 text-white p-2 rounded-xl backdrop-blur-xl"
                >
                  <option>{selectedDeal.documentsNeeded}</option>
                </select>
              </div>

              <div>
                <label htmlFor="socialProvided" className="block text-sm font-medium mb-1 text-slate-400">
                  Social Provided
                </label>
                <select
                  id="socialProvided"
                  value={selectedDeal.socialProvided}
                  className="w-full border border-blue-500/30 bg-slate-900/50 text-white p-2 rounded-xl backdrop-blur-xl"
                >
                  <option>{selectedDeal.socialProvided}</option>
                </select>
              </div>

              <div>
                <label htmlFor="customerLanguage" className="block text-sm font-medium mb-1 text-slate-400">
                  Customer Language
                </label>
                <select
                  id="customerLanguage"
                  value={selectedDeal.customerLanguage}
                  className="w-full border border-blue-500/30 bg-slate-900/50 text-white p-2 rounded-xl backdrop-blur-xl"
                >
                  <option>{selectedDeal.customerLanguage}</option>
                </select>
              </div>

              <div className="text-white"><strong>Closed Date:</strong> {selectedDeal.closedDate}</div>
              <div className="text-white"><strong>Agent:</strong> {selectedDeal.agent}</div>
              <div className="md:col-span-2 text-white"><strong>Notes:</strong> {selectedDeal.notes}</div>
              <div className="md:col-span-2 text-white"><strong>Deal Documents:</strong> {selectedDeal.dealDocuments}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealsTable;
