"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/commonComponents/Modal";
import {
  X,
  User,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Copy,
  Mail,
  Phone,
  Shield,
  TrendingUp,
  MessageSquare,
  Tag,
  Eye,
  EyeOff,
  Award,
  Briefcase,
  Globe,
  FileCheck,
  Lock,
} from "lucide-react";
import { toast } from "react-hot-toast";

type DealViewModalProps = {
  open: boolean;
  onClose: () => void;
  deal: any | null;
};

function formatDateTime(dt: string) {
  try {
    const d = new Date(dt);
    return d.toLocaleString(undefined, {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
}

function formatDateOnly(dt: string) {
  try {
    const d = new Date(dt);
    return d.toLocaleDateString(undefined, {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}

function formatCurrency(amount: any) {
  const num = Number(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(isNaN(num) ? 0 : num);
}

const DealViewModal = ({ open, onClose, deal }: DealViewModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!deal && !isVisible) return null;

  const getStatusConfig = (status: string) => {
  const configs: Record<
    string,
    { color: string; bg: string; icon: React.ReactNode; label: string }
  > = {
    OPEN: {
      color: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-100 dark:bg-emerald-500/15",
      icon: <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />,
      label: "Open",
    },
    CLOSED: {
      color: "text-indigo-700 dark:text-indigo-300",
      bg: "bg-indigo-100 dark:bg-indigo-500/15",
      icon: <CheckCircle className="w-4 h-4 text-indigo-700 dark:text-indigo-300" />,
      label: "Closed",
    },
    PENDING: {
      color: "text-amber-800 dark:text-amber-300",
      bg: "bg-amber-100 dark:bg-amber-500/15",
      icon: <Clock className="w-4 h-4 text-amber-800 dark:text-amber-300" />,
      label: "Pending",
    },
    CANCELLED: {
      color: "text-rose-700 dark:text-rose-300",
      bg: "bg-rose-100 dark:bg-rose-500/15",
      icon: <AlertCircle className="w-4 h-4 text-rose-700 dark:text-rose-300" />,
      label: "Cancelled",
    },
  };

  return configs[status?.toUpperCase()] || configs.OPEN;
};


 const getAgentStatusConfig = (status: string) => {
  const configs: Record<string, { color: string; bg: string; label: string }> = {
    ACTIVE: {
      color: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-100 dark:bg-emerald-500/15",
      label: "Active",
    },
    INACTIVE: {
      color: "text-slate-700 dark:text-slate-300",
      bg: "bg-slate-100 dark:bg-slate-500/15",
      label: "Inactive",
    },
  };

  return configs[status?.toUpperCase()] || configs.ACTIVE;
};

  const statusConfig = getStatusConfig(deal?.status);
  const agentStatusConfig = getAgentStatusConfig(deal?.agent?.user?.userStatus);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "applicants",
      label: "Applicants",
      icon: <Users className="w-4 h-4" />,
    },
    { id: "agent", label: "Agent", icon: <User className="w-4 h-4" /> },
  ];

  const stats = [
  {
    label: "Monthly Income",
    value: formatCurrency(deal?.monthlyIncome),
    icon: <DollarSign className="w-5 h-5 text-white" />,
    color: "from-emerald-500 to-teal-500",
    chipBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    tooltip: "Estimated monthly income",
  },
  {
    label: "Applicants",
    value: deal?.numberOfApplicants || 0,
    icon: <Users className="w-5 h-5 text-white" />,
    color: "from-blue-500 to-cyan-500",
    chipBg: "bg-blue-500/10 dark:bg-blue-400/10",
    tooltip: "Total number of applicants",
  },
  {
    label: "Coverage Types",
    value: Array.isArray(deal?.typeOfCoverage) ? deal.typeOfCoverage.length : 0,
    icon: <Shield className="w-5 h-5 text-white" />,
    color: "from-purple-500 to-pink-500",
    chipBg: "bg-purple-500/10 dark:bg-purple-400/10",
    tooltip: "Types of coverage included",
  },
  {
    label: "Years Experience",
    value: deal?.agent?.yearsOfExperience || 0,
    icon: <Award className="w-5 h-5 text-white" />,
    color: "from-amber-500 to-orange-500",
    chipBg: "bg-amber-500/10 dark:bg-amber-400/10",
    tooltip: "Agent's years of experience",
  },
];


  const renderOverview = () => (
  <div className="space-y-6 animate-fadeIn app-surface">
    {/* Header Section */}
    <div className="rounded-2xl p-6 shadow-sm app-card ">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>

            <div
              className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full ${statusConfig.bg} border-4 border-white dark:border-slate-800 flex items-center justify-center`}
            >
              {statusConfig.icon}
            </div>
          </div>

          <div>
            <h2 className="text-2xl  font-Gordita-Bold app-text">
              {`${deal?.applicantFirstName || ""} ${
                deal?.applicantLastName || ""
              }`.trim() || "Unnamed Deal"}
            </h2>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-sm  font-Gordita-Bold ${statusConfig.bg} ${statusConfig.color}`}
              >
                {statusConfig.label}
              </span>

              <span className="text-sm app-muted">
                Deal ID: {deal?.id?.slice(0, 8)}...
              </span>

              {deal?.ffm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 text-xs  font-Gordita-Bold rounded-full">
                  FFM
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(deal?.id, "Deal ID")}
            className="p-2 rounded-lg transition-colors relative group app-btn-action"
            title="Copy Deal ID"
          >
            <Copy className="w-5 h-5 app-text app-border" />
            {copiedField === "Deal ID" && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-emerald-500 app-text text-xs rounded whitespace-nowrap ">
                Copied!
              </div>
            )}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors  app-border app-text"
            title="Close"
          >
            <X className="w-5 h-5 app-text" />
          </button>
        </div>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group app-card"
          style={{ animationDelay: `${index * 100}ms` }}
          title={stat.tooltip}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl bg-linear-to-br ${stat.color} bg-opacity-10`}>
              <div className={`text-white bg-linear-to-br ${stat.color} p-2 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>

          <div className="text-2xl  font-Gordita-Bold app-text">{stat.value}</div>
          <div className="text-sm app-muted mt-1">{stat.label}</div>
        </div>
      ))}
    </div>

    {/* Details Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Deal Information Card */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl p-6 shadow-lg app-card">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Tag className="w-5 h-5 text-blue-600 dark:text-blue-200" />
            </div>
            <h3 className=" font-Gordita-Bold app-text">Deal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: "Carrier",
                value: deal?.carrier || "Not specified",
                icon: <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-200" />,
              },
              {
                label: "Type of Work",
                value: deal?.typeOfWork || "Not specified",
                icon: <Briefcase className="w-4 h-4 text-slate-600 dark:text-slate-200" />,
              },
              {
                label: "Coverage Types",
                value:
                  Array.isArray(deal?.typeOfCoverage) && deal.typeOfCoverage.length > 0
                    ? deal.typeOfCoverage.map((type: string) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200 rounded text-xs mr-1 mb-1 inline-block"
                        >
                          {type}
                        </span>
                      ))
                    : "Not specified",
                icon: <Shield className="w-4 h-4 text-slate-600 dark:text-slate-200" />,
                fullWidth: true,
              },
              {
                label: "FFM Status",
                value: deal?.ffm ? "Yes" : "No",
                icon: deal?.ffm ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                ) : (
                  <X className="w-4 h-4 text-rose-600 dark:text-rose-300" />
                ),
              },
              {
                label: "Documents Needed",
                value: deal?.documentsNeeded || "None",
                icon: <FileText className="w-4 h-4 text-slate-600 dark:text-slate-200" />,
              },
              {
                label: "Customer Language",
                value: deal?.customerLanguage || "English",
                icon: <Globe className="w-4 h-4 text-slate-600 dark:text-slate-200" />,
              },
              {
                label: "Social Provider",
                value: deal?.socialProvider || "Not specified",
                icon: <User className="w-4 h-4 text-slate-600 dark:text-slate-200" />,
              },
            ].map((item, index) => (
              <div
                key={item.label}
                className={`${item.fullWidth ? "col-span-1 md:col-span-2" : ""} p-3 rounded-xl transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-slate-600`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/60 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/25 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-sm  font-Gordita-Medium app-muted">{item.label}</span>
                </div>

                <div className="text-sm  font-Gordita-Medium app-text pl-12">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        {deal?.notes ? (
          <div className="rounded-2xl p-6 shadow-lg border app-border app-card">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 app-surface rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-200" />
              </div>
              <h3 className=" font-Gordita-Bold app-text">Notes</h3>
            </div>

            <div className="p-4 rounded-xl border app-card app-card">
              <p className="app-text leading-relaxed opacity-90">{deal.notes}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-6 shadow-sm app-card ">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 app-card rounded-lg">
                <MessageSquare className="w-5 h-5 text-slate-400 dark:text-slate-300" />
              </div>
              <h3 className=" font-Gordita-Bold app-muted">Notes</h3>
            </div>
            <p className="app-muted italic">No notes added for this deal</p>
          </div>
        )}
      </div>

      {/* Right Column - Timeline & Agent */}
      <div className="space-y-6">
        {/* Timeline Card */}
        <div className="rounded-2xl p-6 shadow-lg app-card">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-200" />
            </div>
            <h3 className=" font-Gordita-Bold app-text">Timeline</h3>
          </div>

          <div className="space-y-4 relative before:absolute before:left-7 before:top-8 before:bottom-8 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
            {[
              {
                event: "Deal Created",
                date: formatDateTime(deal?.createdAt),
                color: "bg-blue-500",
                icon: <Clock className="w-4 h-4 text-white" />,
              },
              {
                event: "Close Date",
                date: deal?.closedDate ? formatDateOnly(deal.closedDate) : "Not set",
                color: deal?.closedDate ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600",
                icon: deal?.closedDate ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <Clock className="w-4 h-4 text-white" />
                ),
              },
            ].map((item) => (
              <div key={item.event} className="flex items-start gap-4 relative z-10 group">
                <div
                  className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center shrink-0 shadow-lg transform group-hover:scale-110 transition-transform`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className=" font-Gordita-Medium app-text group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                    {item.event}
                  </h4>
                  <p className="text-sm app-muted group-hover:opacity-90 transition-colors">
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Information Card */}
        {deal?.agent && (
          <div className="rounded-2xl p-6 shadow-lg app-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <User className="w-5 h-5 text-emerald-600 dark:text-emerald-200" />
                </div>
                <h3 className=" font-Gordita-Bold app-text">Assigned Agent</h3>
              </div>

              <span
                className={`px-2 py-1 text-xs  font-Gordita-Bold rounded-full ${agentStatusConfig.bg} ${agentStatusConfig.color}`}
              >
                {agentStatusConfig.label}
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 mb-4 bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg">
                <span className=" app-text  font-Gordita-Bold text-lg">
                  {deal.agent.user?.firstName?.charAt(0)}
                  {deal.agent.user?.lastName?.charAt(0)}
                </span>
              </div>

              <div className="flex-1">
                <h4 className=" font-Gordita-Bold app-heading text-gray-600">
                  {deal.agent.user?.firstName} {deal.agent.user?.lastName}
                </h4>
                <p className="text-sm app-muted">Primary Agent</p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 rounded">
                    NPM: {deal.agent.npm}
                  </span>

                  {deal.agent.ahipCertified && (
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 rounded">
                      AHIP Certified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <Mail className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                <span className="text-sm app-text truncate opacity-90">
                  {deal.agent.user?.email}
                </span>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <Phone className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                <span className="text-sm app-text opacity-90">{deal.agent.user?.phone}</span>
              </div>

              <div className="flex items-center justify-between p-2">
                <span className="text-sm app-muted">Experience</span>
                <span className=" font-Gordita-Medium app-text">{deal.agent.yearsOfExperience} years</span>
              </div>

              <div className="flex items-center justify-between p-2">
                <span className="text-sm app-muted">Access Level</span>
                <span className=" font-Gordita-Medium app-text">{deal.agent.accessLevel}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);


  const renderTabContent = () => {
    switch (activeTab) {
      case "applicants":
        return (
          <div className="animate-fadeIn">
            <div className="app-card rounded-2xl p-8 shadow-lg app-border">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-2xl  font-Gordita-Bold app-text">
                  {deal?.numberOfApplicants || 0} Applicants
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  Total number of applicants in this deal
                </p>

                <div className="max-w-md mx-auto app-card rounded-xl p-6 borderapp-border">
                {deal.agent.stateLicenseNumber && <div className="flex items-center justify-between mb-4">
                    <span className="text-sm  font-Gordita-Medium app-text">
                      stateLicenseNumber
                    </span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm  font-Gordita-Medium rounded-full">
                      {deal.agent.stateLicenseNumber}
                    </span>
                  </div>}
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="app-text">
                        Name
                      </span>
                      <span className=" font-Gordita-Medium app-text">
                        {deal?.applicantFirstName} {deal?.applicantLastName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="app-text">
                        Coverage Type
                      </span>
                      <span className=" font-Gordita-Medium app-text">
                        {Array.isArray(deal?.typeOfCoverage)
                          ? deal.typeOfCoverage[0]
                          : "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "agent":
  return (
    <div className="animate-fadeIn app-surface">
      {deal?.agent ? (
        <div className="app-card rounded-2xl p-6 shadow-lg border app-border">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg">
                <span className="app-inverse  font-Gordita-Bold text-xl">
                  {deal.agent.user?.firstName?.charAt(0)}
                  {deal.agent.user?.lastName?.charAt(0)}
                </span>
              </div>

              <div>
                <h2 className="text-2xl  font-Gordita-Bold app-text">
                  {deal.agent.user?.firstName} {deal.agent.user?.lastName}
                </h2>

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-sm  font-Gordita-Bold ${agentStatusConfig.bg} ${agentStatusConfig.color}`}
                  >
                    {agentStatusConfig.label}
                  </span>

                  <span className="text-sm app-text">NPM: {deal.agent.npm}</span>

                  {deal.agent.ahipCertified && (
                    <span className="px-2 py-1 text-xs  font-Gordita-Bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200">
                      AHIP Certified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="app-card rounded-xl p-6 border app-border">
                <h3 className=" font-Gordita-Bold app-text mb-4">
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 app-text" />
                    <div>
                      <p className="text-sm app-muted">Email</p>
                      <p className=" font-Gordita-Medium app-text">
                        {deal.agent.user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 app-text" />
                    <div>
                      <p className="text-sm app-muted">Phone</p>
                      <p className=" font-Gordita-Medium app-text">
                        {deal.agent.user?.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-6 border app-border app-card">
                <h3 className=" font-Gordita-Bold app-text mb-4">
                  Professional Details
                </h3>

                <div className="space-y-3">
                  {[
                    {
                      label: "Years of Experience",
                      value: `${deal.agent.yearsOfExperience} years`,
                    },
                    {
                      label: "Access Level",
                      value: deal.agent.accessLevel,
                    },
                    {
                      label: "State Licensed",
                      value: deal.agent.stateLicensed ? "Yes" : "No",
                    },
                    {
                      label: "Active Since",
                      value: formatDateOnly(deal.agent.createdAt),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm app-muted">{item.label}</span>
                      <span className=" font-Gordita-Medium app-text">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl p-6 border app-border app-card">
                <h3 className=" font-Gordita-Bold app-text mb-4">
                  System Information
                </h3>

                <div className="space-y-3">
                  {[
                    {
                      label: "User ID",
                      raw: deal.agent.user?.id,
                      value: deal.agent.user?.id?.slice(0, 8) + "...",
                    },
                    {
                      label: "System Role",
                      raw: deal.agent.user?.systemRole,
                      value: deal.agent.user?.systemRole,
                    },
                    {
                      label: "Date of Birth",
                      raw: deal.agent.user?.dob,
                      value: formatDateOnly(deal.agent.user?.dob),
                    },
                    {
                      label: "Agent ID",
                      raw: deal.agent.id,
                      value: deal.agent.id?.slice(0, 8) + "...",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between group"
                    >
                      <span className="text-sm app-muted">{item.label}</span>

                      <button
                        onClick={() => copyToClipboard(item.raw ?? item.value, item.label)}
                        className=" font-Gordita-Medium app-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                        title="Copy"
                      >
                        {item.value}
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 app-text" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg  font-Gordita-Bold app-text">No Agent Assigned</h3>
          <p className="app-muted mt-2">
            This deal doesn't have an assigned agent yet
          </p>
        </div>
      )}
    </div>
  );


      default:
        return renderOverview();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      showCloseIcon={false}
      overlayClassName="bg-black/50 backdrop-blur-sm"
      bodyClassName="p-0 md:h-[650px] h-[600px] rounded-[6px] md:rounded-[10px] app-card"
      className="animate-fade-in "
    >
      <div className="flex flex-col h-full">
        {/* Tab Navigation */}
        <div className="flex items-center justify-between p-6 border-b app-border  app-card sticky top-0 z-100">
          <div className="flex items-center gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                    : "app-text"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === "applicants" && deal?.numberOfApplicants > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/30 rounded-full">
                    {deal.numberOfApplicants}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .wrap-break-word {
          word-wrap: break-word;
          word-break: break-word;
        }
      `}</style>
    </Modal>
  );
};

export default DealViewModal;
