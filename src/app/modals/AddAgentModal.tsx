"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  ssn: string;
  contact: string;
  designation: string;
  npn: string;
  role: string;
  access: string;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  dob: "",
  ssn: "",
  contact: "",
  designation: "",
  npn: "",
  role: "Agent",
  access: "Training",
};

export default function AddAgentModal({ open, onClose }: Props) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: Partial<FormState> = {};
    if (!form.firstName) newErrors.firstName = "Required";
    if (!form.lastName) newErrors.lastName = "Required";
    if (!form.email.includes("@")) newErrors.email = "Invalid email";
    if (!form.contact) newErrors.contact = "Required";
    if (!form.dob) newErrors.dob = "Required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    // 🔗 SEND TO BACKEND HERE
    console.log("Submitting agent:", form);

    setLoading(false);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[10px] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <UserPlus className="text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Add New Agent</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close add agent modal"
              title="Close"
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <X className="text-slate-400 hover:text-white" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
            {[
              ["First Name", "firstName"],
              ["Last Name", "lastName"],
              ["Email", "email"],
              ["DOB", "dob", "date"],
              ["SSN", "ssn"],
              ["Contact Number", "contact"],
              ["Designation", "designation"],
              ["NPN", "npn"],
            ].map(([label, name, type = "text"]) => (
              <div key={name as string}>
                <label
                  htmlFor="firstName"
                  className="text-sm text-slate-300 mb-1 block"
                >
                  {label}
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-slate-800/60 text-white border border-white/10"
                />
              </div>
            ))}

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="text-sm text-slate-300 mb-1 block"
              >
                Role
              </label>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl bg-slate-800/60 text-white border border-white/10 focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="Agent">Agent</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            {/* Access */}
            {/* <div>
              <label className="text-sm text-slate-300 mb-1 block">
                Access
              </label>
              <select
                name="access"
                value={form.access}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl bg-slate-800/60 text-white border border-white/10 focus:ring-2 focus:ring-blue-500/40"
              >
                <option>Training</option>
                <option>Production</option>
              </select>
            </div> */}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800/60 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Agent"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
