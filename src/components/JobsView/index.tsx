"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Calendar,
  Phone,
  MapPin,
  Building2,
  FileText,
  BadgeCheck,
  Landmark,
  CreditCard,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";

// ✅ Use your existing components
import { Field } from "@/commonComponents/form/Field";
import { TextInput } from "@/commonComponents/form/TextInput";
import { SingleSelect } from "@/commonComponents/form/SingleSelect";
import FileInput from "@/commonComponents/FileInput";
import Button from "@/commonComponents/Button";
import AboutUsStep from "./AboutUsStep";
import apiClient from "@/Utils/apiClient";
import WizardStepper from "./WizardStepper";
import { Textarea } from "@/commonComponents/form/Textarea";
import { MultiSelect } from "@/commonComponents/form/MultiSelect";
import { stateOptions } from "./helper";
import Modal from "@/commonComponents/Modal";
import Loader from "@/commonComponents/Loader";
import { Checkbox } from "@/commonComponents/form/Checkbox";

type Option = { label: string; value: string | any };
type StateLicenseFile = {
  id: string;
  state: string;
  documentUrl: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;

  dob: string;
  phone: string;
  npn: string;

  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;

  aboutYou: string;
  yearsOfExperience: string;
  carrier: string[];
  ahipCertified: boolean;
  ahipProofUrl: string;

  stateLicenseNo: string;
  stateLicense: string[];
  stateLicenses: StateLicenseFile[];

  bankName: string;
  accountHolderName: string;
  accountNumber: string;

  driversLicenseOrPassportUrl: string;
  assignmentOfCommissionUrl: string;
  enoCertificateUrl: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const normalizePhone = (v: string) => v.replace(/[^\d]/g, "").slice(0, 15);

const STEPS = [
  {
    key: "profile",
    title: "Create Profile",
    subtitle: "Basic details & address",
  },
  { key: "welcome", title: "Welcome", subtitle: "Experience & licenses" },
  { key: "about", title: "About Us", subtitle: "Know who we are" },
  { key: "bank", title: "Bank Details", subtitle: "Payout & documents" },
] as const;

export default function JobApplicationWizard() {
  const [step, setStep] = useState(0);

  const [loading, setLoading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",

    dob: "",
    phone: "",
    npn: "",

    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",

    aboutYou: "",
    yearsOfExperience: "",
    carrier: [],
    ahipCertified: false,
    ahipProofUrl: "",

    stateLicenseNo: "",
    stateLicense: [],
    stateLicenses: [],
    bankName: "",
    accountHolderName: "",
    accountNumber: "",

    driversLicenseOrPassportUrl: "",
    assignmentOfCommissionUrl: "",
    enoCertificateUrl: "",
  });

  const [errors, setErrors] = useState<Errors>({});

    const carrierOptions: Option[] = useMemo(
    () => [
       { label: "AMBETTER", value: "AMBETTER" },
  { label: "AETNA", value: "AETNA" },
  { label: "BCBS", value: "BCBS" },
  { label: "CARESOURCE", value: "CARESOURCE" },
  { label: "CIGNA", value: "CIGNA" },
  { label: "MOLINA", value: "MOLINA" },
  { label: "OSCAR", value: "OSCAR" },
  { label: "UNITED HEALTHCARE", value: "UNITED HEALTHCARE" },
  { label: "FLORIDA BLUE", value: "FLORIDA BLUE" },
  { label: "HEALTH FIRST", value: "HEALTH FIRST" },
  { label: "UNIV OF UTHA", value: "UNIV OF UTHA" },
  { label: "MEDICA", value: "CARESOURCE" },
  { label: "PRIORITY HEALTH", value: "PRIORITY HEALTH" },
  { label: "FIRST CHOICE", value: "FIRST CHOICE" },
  { label: "ANTHEM", value: "ANTHEM" },
  { label: "INSTIL", value: "INSTIL" },
  { label: "WELLPOINT", value: "WELLPOINT" },
  { label: "AMERITAS", value: "AMERITAS" },
  { label: "AMERIHEALTH", value: "AMERIHEALTH" },
  { label: "ALLINTHEALTH", value: "ALLINTHEALTH" },
    ],
    []
  );

  const AHIP_OPTIONS = [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ] as const;

  //   const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
  //     setForm((p) => ({ ...p, [key]: value }));
  //     setErrors((p) => ({ ...p, [key]: undefined }));
  //   };
  const update = (field: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const updateStateLicenseFile = (state: string, url: string) => {
    setForm((prev) => {
      const exists = prev.stateLicenses.find((s) => s.state === state);
      if (exists) {
        return {
          ...prev,
          stateLicenses: prev.stateLicenses.map((s) =>
            s.state === state ? { ...s, documentUrl: url } : s
          ),
        };
      }

      return {
        ...prev,
        stateLicenses: [
          ...prev.stateLicenses,
          {
            id: String(prev.stateLicenses.length + 1),
            state,
            documentUrl: url,
          },
        ],
      };
    });
  };

  const validateStep = (s: number) => {
    const e: Errors = {};

    if (s === 0) {
      if (!form.firstName.trim()) e.firstName = "First name is required";
      if (!form.lastName.trim()) e.lastName = "Last name is required";
      if (!form.email.trim()) e.email = "Email is required";

      if (!form.dob) e.dob = "DOB is required";
      if (!form.phone.trim()) e.phone = "Phone is required";
      if (form.npn) e.npn = "NPN is required ";

      if (!form.address1.trim()) e.address1 = "Address is required";
      if (!form.city.trim()) e.city = "City is required";
      if (!form.state.trim()) e.state = "State is required";
      if (!form.zip.trim()) e.zip = "ZIP is required";

      // documents optional (keep optional)
    }

    if (s === 1) {
      if (!form.yearsOfExperience.trim()) e.yearsOfExperience = "Required";
      if (!form.carrier) e.carrier = "Carrier required";
      if (form.ahipCertified && !form.ahipProofUrl) {
        e.ahipProofUrl = "Upload AHIP proof";
      }

      if (!form.stateLicenseNo.trim()) e.stateLicenseNo = "Required";
      if (!form.stateLicense) e.stateLicense = "Required";
    }

    if (s === 3) {
      if (!form.bankName.trim()) e.bankName = "Bank name required";
      if (!form.accountHolderName.trim())
        e.accountHolderName = "Account holder required";
      if (!form.accountNumber.trim())
        e.accountNumber = "Account number required";

      if (!form.driversLicenseOrPassportUrl)
        e.driversLicenseOrPassportUrl = "Required";
      if (!form.assignmentOfCommissionUrl)
        e.assignmentOfCommissionUrl = "Required";
      if (!form.enoCertificateUrl) e.enoCertificateUrl = "Required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((p) => Math.min(p + 1, STEPS.length - 1));
  };

  const back = () => setStep((p) => Math.max(p - 1, 0));

  const onSubmit = async () => {
    if (!validateStep(3)) return;
    setLoading(true);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      dateOfBirth: form.dob,
      address1: form.address1,
      address2: form.address2,
      city: form.city,
      state: form.state,
      zip: form.zip,
      npn: form.npn,
      email: form.email,
      phoneNumber: form.phone,
      aboutYou: form.aboutYou,
      yearsOfExperience: Number(form.yearsOfExperience || 0),
      carrier: form.carrier[0] || null,
      ahipCertified: form.ahipCertified,
      ahipProofUrl: form.ahipCertified ? form.ahipProofUrl : null,
      stateLicenseNumber: form.stateLicenseNo,
      stateLicenses: form.stateLicenses,
      bankName: form.bankName,
      accountHolderName: form.accountHolderName,
      accountNumber: form.accountNumber,
      identityDocumentUrl: form.driversLicenseOrPassportUrl,
      commissionAssignmentUrl: form.assignmentOfCommissionUrl,
      enoCertificateUrl: form.enoCertificateUrl,
    };

    try {
      const res = await apiClient.post(
        apiClient.URLS.applications,
        payload,
        true
      );
      if (res.status === 200 || res.status == 201) {
        toast.success("Application submitted successfully!");
        setSuccessModalOpen(true);
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          dob: "",
          phone: "",
          npn: "",
          address1: "",
          address2: "",
          city: "",
          state: "",
          zip: "",
          aboutYou: "",
          yearsOfExperience: "",
          carrier: [],
          ahipCertified: false,
          ahipProofUrl: "",
          stateLicenseNo: "",
          stateLicense: [],
          stateLicenses: [],
          bankName: "",
          accountHolderName: "",
          accountNumber: "",
          driversLicenseOrPassportUrl: "",
          assignmentOfCommissionUrl: "",
          enoCertificateUrl: "",
        });
        setStep(0);
      }
    } catch {
      toast.error("Failed to submit. Try again.");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="w-full h-full items-center flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-scroll ">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl  bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-900 to-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white/80 text-sm">JOB APPLICATION</p>
                <h1 className="text-white text-xl font-semibold mt-1">
                  Application for Insurance Agent Position (Medicare Specialist)
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle2 size={16} />
                <span>Secure Application</span>
              </div>
            </div>
          </div>

          <WizardStepper steps={STEPS as any} activeStep={step} />

          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                {step === 0 && (
                  <section className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Create Profile
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        Fill your personal details and address.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-2 mt-2">
                      <Field
                        label="First Name"
                        required
                        error={errors.firstName}
                      >
                        <TextInput
                          value={form.firstName}
                          type="text"
                          onChange={(e: any) =>
                            update("firstName", e.target.value)
                          }
                          placeholder="First Name"
                          leftIcon={<User size={16} />}
                          error={!!errors.firstName}
                          containerClassName="md:py-[6px] py-1"
                        />
                      </Field>

                      <Field label="Last Name" required error={errors.lastName}>
                        <TextInput
                          value={form.lastName}
                          type="text"
                          onChange={(e: any) =>
                            update("lastName", e.target.value)
                          }
                          placeholder="Last Name"
                          leftIcon={<User size={16} />}
                          error={!!errors.lastName}
                          containerClassName="md:py-[6px] py-1"
                        />
                      </Field>

                      <Field label="Email" required error={errors.email}>
                        <TextInput
                          type="email"
                          value={form.email}
                          onChange={(e: any) => update("email", e.target.value)}
                          placeholder="Login Username"
                          leftIcon={<Mail size={16} />}
                          error={!!errors.email}
                          containerClassName="md:py-[6px] py-1"
                        />
                      </Field>

                      <Field label="DOB" required error={errors.dob}>
                        <TextInput
                          type="date"
                          value={form.dob}
                          onChange={(e: any) => update("dob", e.target.value)}
                          placeholder="Select DOB"
                          leftIcon={<Calendar size={16} />}
                          error={!!errors.dob}
                          containerClassName="md:py-[6px] py-1"
                        />
                      </Field>

                      <Field
                        label="Contact Number"
                        required
                        error={errors.phone}
                      >
                        <TextInput
                          value={form.phone}
                          onChange={(e: any) =>
                            update("phone", normalizePhone(e.target.value))
                          }
                          placeholder="Contact Number"
                          leftIcon={<Phone size={16} />}
                          error={!!errors.phone}
                          containerClassName="md:py-[6px] py-1"
                        />
                      </Field>

                      <Field label="Address 1" required error={errors.address1}>
                        <TextInput
                          type="text"
                          value={form.address1}
                          onChange={(e: any) =>
                            update("address1", e.target.value)
                          }
                          placeholder="Address line 1"
                          leftIcon={<MapPin size={16} />}
                          error={!!errors.address1}
                          containerClassName="md:py-[6px] py-1"
                        />
                      </Field>

                      <Field label="Address 2" error={errors.address2}>
                        <TextInput
                          value={form.address2}
                          type="text"
                          onChange={(e: any) =>
                            update("address2", e.target.value)
                          }
                          placeholder="Address line 2"
                          leftIcon={<MapPin size={16} />}
                          error={!!errors.address2}
                          containerClassName="md:py-[6px] py-1"
                        />
                      </Field>

                      <Field label="City" required error={errors.city}>
                        <TextInput
                          value={form.city}
                          type="text"
                          onChange={(e: any) => update("city", e.target.value)}
                          placeholder="City"
                          leftIcon={<Building2 size={16} />}
                          error={!!errors.city}
                          containerClassName="md:py-[6px] py-1"
                        />
                      </Field>

                      <Field label="State" required error={errors.state}>
                        <SingleSelect
                          value={form.state}
                          onChange={(v: any) => update("state", v as any)}
                          options={stateOptions}
                          placeholder="Select State"
                          placement="auto"
                          searchable
                        />
                      </Field>

                      <Field label="Zip" required error={errors.zip}>
                        <TextInput
                          value={form.zip}
                          type="number"
                          onChange={(e: any) => update("zip", e.target.value)}
                          placeholder="Zip"
                          leftIcon={<BadgeCheck size={16} />}
                          error={!!errors.zip}
                          containerClassName="md:py-[6px] py-1"
                        />
                      </Field>
                      <Field label="NPN" required error={errors.npn}>
                        <TextInput
                          value={form.npn}
                          onChange={(e: any) =>
                            update("npn", e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="NPN"
                          type="number"
                          leftIcon={<BadgeCheck size={16} />}
                          error={!!errors.npn}
                          containerClassName="md:py-[6px] py-1"
                        />
                      </Field>
                    </div>
                  </section>
                )}

                {step === 1 && (
                  <section className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Welcome
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        Tell us about your experience and upload license proofs.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <Field label="About You" required error={errors.aboutYou}>
                        <Textarea
                          value={form.aboutYou}
                          onChange={(e: any) =>
                            update("aboutYou", e.target.value)
                          }
                          placeholder="Briefly describe your background…"
                          containerClassName="md:py-[6px] py-1"
                          className="w-full"
                        />
                      </Field>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field
                          label="Years of Experience"
                          required
                          error={errors.yearsOfExperience}
                        >
                          <TextInput
                            value={form.yearsOfExperience}
                            onChange={(e: any) =>
                              update(
                                "yearsOfExperience",
                                e.target.value.replace(/[^\d]/g, "").slice(0, 2)
                              )
                            }
                            placeholder="Eg: 5"
                            leftIcon={<BadgeCheck size={16} />}
                            error={!!errors.yearsOfExperience}
                            containerClassName="md:py-[6px] py-1"
                          />
                        </Field>

                        <Field label="Carrier" required error={errors.carrier}>
                          <MultiSelect
                            values={form.carrier as any}
                            onChange={(v: any) => update("carrier", v as any)}
                            options={carrierOptions as any}
                            placeholder="Select Carrier"
                            placement="auto"
                          />
                        </Field>

                        <Field
                          label="AHIP Certified"
                          required
                          error={errors.ahipCertified}
                        >
                          <Checkbox
                            label="Yes, I am AHIP Certified"
                            checked={form.ahipCertified}
                            onChange={(e) => {
                              update("ahipCertified", e.target.checked);
                              if (!e.target.checked) update("ahipProofUrl", "");
                            }}
                            className="mt-1"
                          />
                        </Field>

                        {/* ✅ Proof only when true */}
                        {form.ahipCertified && (
                          <Field
                            label="AHIP Proof"
                            required
                            error={errors.ahipProofUrl}
                          >
                            <FileInput
                              type="file"
                              folderName="job-applications"
                              initialFileUrl={form.ahipProofUrl}
                              requiredClass="app-border"
                              onFileChange={(url: string) => {
                                update("ahipProofUrl", url as any);
                                toast.success("AHIP proof uploaded!");
                              }}
                            />
                          </Field>
                        )}

                        <Field
                          label="State License No."
                          required
                          error={errors.stateLicenseNo}
                        >
                          <TextInput
                            value={form.stateLicenseNo}
                            onChange={(e: any) =>
                              update("stateLicenseNo", e.target.value)
                            }
                            placeholder="Enter license number"
                            leftIcon={<BadgeCheck size={16} />}
                            error={!!errors.stateLicenseNo}
                            containerClassName="md:py-[6px] py-1"
                          />
                        </Field>

                        <Field
                          label="State License"
                          required
                          error={errors.stateLicense}
                        >
                          <MultiSelect
                            values={form.stateLicense}
                            onChange={(v: string[]) =>
                              update("stateLicense", v)
                            }
                            options={stateOptions}
                            placeholder="Select State"
                            placement="auto"
                          />
                        </Field>

                        {/* Dynamic File Inputs for each selected state */}
                        {form.stateLicense.map((state, idx) => (
                          <Field
                            key={state}
                            label={`State License Proof (${state})`}
                            required
                          >
                            <FileInput
                              type="file"
                              folderName="job-applications"
                              initialFileUrl={
                                form.stateLicenses.find(
                                  (s) => s.state === state
                                )?.documentUrl
                              }
                              requiredClass="app-border"
                              onFileChange={(url: string) => {
                                updateStateLicenseFile(state, url);
                                toast.success(`${state} license uploaded!`);
                              }}
                            />
                          </Field>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {step === 2 && <AboutUsStep />}

                {step === 3 && (
                  <section className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Bank Details
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        Provide payout details and upload required documents.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Field label="Bank Name" required error={errors.bankName}>
                        <TextInput
                          value={form.bankName}
                          onChange={(e: any) =>
                            update("bankName", e.target.value)
                          }
                          placeholder="Bank Name"
                          leftIcon={<Landmark size={16} />}
                          error={!!errors.bankName}
                          containerClassName="md:py-[6px] py-1"
                        />
                      </Field>

                      <Field
                        label="Account Holder Name"
                        required
                        error={errors.accountHolderName}
                      >
                        <TextInput
                          value={form.accountHolderName}
                          onChange={(e: any) =>
                            update("accountHolderName", e.target.value)
                          }
                          placeholder="Account Holder Name"
                          leftIcon={<User size={16} />}
                          error={!!errors.accountHolderName}
                          containerClassName="md:py-[6px] py-1"
                        />
                      </Field>

                      <Field
                        label="Account Number"
                        required
                        error={errors.accountNumber}
                      >
                        <TextInput
                          value={form.accountNumber}
                          onChange={(e: any) =>
                            update(
                              "accountNumber",
                              e.target.value.replace(/[^\d]/g, "").slice(0, 20)
                            )
                          }
                          placeholder="Account Number"
                          leftIcon={<CreditCard size={16} />}
                          error={!!errors.accountNumber}
                          containerClassName="md:py-[6px] py-1"
                        />
                      </Field>

                      <div className="hidden md:block" />

                      <Field
                        label="Drivers license/Passport"
                        required
                        error={errors.driversLicenseOrPassportUrl}
                      >
                        <FileInput
                          type="file"
                          folderName="job-applications"
                          initialFileUrl={form.driversLicenseOrPassportUrl}
                          requiredClass="app-border"
                          onFileChange={(url: string) => {
                            update("driversLicenseOrPassportUrl", url as any);
                            toast.success("Document uploaded!");
                          }}
                        />
                      </Field>

                      <Field
                        label="Assignment of Commission"
                        required
                        error={errors.assignmentOfCommissionUrl}
                      >
                        <FileInput
                          type="file"
                          folderName="job-applications"
                          initialFileUrl={form.assignmentOfCommissionUrl}
                          requiredClass="app-border"
                          onFileChange={(url: string) => {
                            update("assignmentOfCommissionUrl", url as any);
                            toast.success("Document uploaded!");
                          }}
                        />
                      </Field>

                      <Field
                        label="ENO Certificate"
                        required
                        error={errors.enoCertificateUrl}
                      >
                        <FileInput
                          type="file"
                          folderName="job-applications"
                          initialFileUrl={form.enoCertificateUrl}
                          requiredClass="app-border"
                          onFileChange={(url: string) => {
                            update("enoCertificateUrl", url as any);
                            toast.success("Document uploaded!");
                          }}
                        />
                      </Field>

                      <div className="rounded-2xl border bg-slate-50 p-4 flex items-center gap-3">
                        <UploadCloud className="text-slate-600" size={20} />
                        <div className="text-sm">
                          <p className="font-semibold text-slate-900">Tip</p>
                          <p className="text-slate-600">
                            Upload clear images/PDFs to avoid rejection.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Footer actions */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="flex items-center gap-2 font-medium md:text-[14px] text-[12px]"
                variant="outline"
              >
                <ChevronLeft size={16} />
                Back
              </Button>

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={next}
                  className="flex font-medium md:text-[14px] text-[12px] items-center gap-2"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={onSubmit}
                  className="flex rounded-md text-white  items-center  px-2 md:px-4 py-2 md:py-2 btn-text font-medium bg-green-300 cursor-not-allowed gap-2"
                  disabled={loading}
                >
                  {loading ? "Submitting ..." : "Submit"}
                  <CheckCircle2 size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
        {successModalOpen && (
          <Modal
            open={successModalOpen}
            onClose={() => setSuccessModalOpen(false)}
          >
            <div className="p-6 text-center space-y-4">
              <CheckCircle2 size={48} className="mx-auto text-green-500" />
              <h3 className="text-xl font-semibold text-slate-900">
                Submitted Successfully
              </h3>
              <p className="text-sm text-slate-600">
                Your application has been submitted successfully, we will
                contact you soon.
              </p>
              <Button
                onClick={() => setSuccessModalOpen(false)}
                className="bg-teal-600 text-white"
              >
                Close
              </Button>
            </div>
          </Modal>
        )}

        <p className="text-center text-xs text-slate-500 mt-6">
          © {new Date().getFullYear()} Think Insurance First
        </p>
      </div>
    </div>
  );
}
