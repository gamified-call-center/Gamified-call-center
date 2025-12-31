export type UserEntity = {
  id: string;
  firstName: string;
  lastName: string;
  dob: string | Date;
  email: string;
  phone: string;
   password:string;
  systemRole: "ADMIN" | "STANDARD";
  userStatus: "ACTIVE" | "INACTIVE";
  employee?: {
    id: string;
    designation?: { id: number; name: string; levelOrder: number };
    reportsTo?: { id: string; user?: { firstName: string; lastName: string } };
  };
 agentProfile?: {
  id: string;
  npn: string;
  yearsOfExperience: number;
  ahipCertified: boolean;
  ahipProofUrl?: string;
  stateLicenseNumber?: string;
  stateLicensed: boolean;
  accessLevel: "TRAINING" | "ALL_ACCESS" | "ALL_ACCESS";
   apps: string[];
  
};

  addresses?: Array<{
    id?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    locality?: string;
    landmark?: string;
    isDefault?: boolean;
  }>;
  createdAt?: string;
};

export type CreateUserCoreDto = {
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD
  email: string;
  password: string;
  phone: string;
  profileImage?: string;
  systemRole?: "ADMIN" | "STANDARD";
};

export type CreateEmployeeDto = {
  designationId: any;
  reportsToId?: string;
};

export type CreateAddressDto = {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  locality?: string;
  landmark?: string;
  isDefault?: boolean;
};

export type CreateAgentProfileDto = {
  npn: string;
  yearsOfExperience: number;
  ahipCertified: boolean;
  ahipProofUrl?: string;
  stateLicensed: boolean;
  stateLicenseNumber?:string;
  accessLevel: "TRAINING" | "ALL_ACCESS";
   apps: string[];
  
};

export type CreateUserDto = {
  user: CreateUserCoreDto;
  employee?: CreateEmployeeDto;
  addresses?: (CreateAddressDto & { id?: string; delete?: boolean })[];
  agentProfile?: CreateAgentProfileDto;
};
export type UpdateUserCoreDto = Partial<{
  firstName: string;
  lastName: string;
  dob: string; 
  email: string;
  password: string;
  phone: string;
  profileImage?: string;
  systemRole?: "ADMIN" | "STANDARD";
  userStatus?: "ACTIVE" | "INACTIVE";
}>;

export type UpdateEmployeeDto = Partial<{
  designationId: any;
  reportsToId?: string;
}>;

export type UpdateAddressDto = Partial<{
  id?: string;          // ✅ needed for update/delete
  delete?: boolean;     // ✅ needed for delete
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  locality?: string;
  landmark?: string;
  isDefault?: boolean;
}>;

export type UpdateAgentProfileDto = Partial<{
  npn: string;
  yearsOfExperience: number;
  ahipCertified: boolean;
  ahipProofUrl?: string;
  stateLicensed: boolean;
  accessLevel: "TRAINING" | "ALL_ACCESS";
  isActive?: boolean;
   apps: string[];

}>;

export type UpdateUserDto = Partial<{
  user: UpdateUserCoreDto;
  employee: UpdateEmployeeDto;
  addresses: UpdateAddressDto[];
  agentProfile: UpdateAgentProfileDto;
}>;
// types/designation-permissions.ts
export type CrudKey = "view" | "create" | "edit" | "delete";

export type ResourceMasterRow = {
  tablename: string;
};

export type DesignationPermissionRow = {
  id: string;
  resource: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;

  // backend might also return designation or designationId depending on your serializer
  designation?: any;
};

export type CreateDesignationPermissionDto = {
  resource: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
};

export type UpdateDesignationPermissionDto = Partial<CreateDesignationPermissionDto>;

export type StateLicenseDto = {
  state?: string;
  documentUrl?: string;
};

export type JobApplication = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;

  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;

  npn?: string;
  email: string;
  phoneNumber: string;

  aboutYou?: string;
  yearsOfExperience?: number;
  carrier?: string;

  ahipCertified: boolean;
  ahipProofUrl?: string;

  stateLicenseNumber?: string;
  stateLicenses: StateLicenseDto[];

  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;

  identityDocumentUrl?: string;
  commissionAssignmentUrl?: string;
  enoCertificateUrl?: string;

  createdAt: string;
};
export function getFileNameFromUrl(url: string) {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").pop();
    return last || "download";
  } catch {
    const last = url.split("?")[0].split("/").pop();
    return last || "download";
  }
}

export function isPdf(url: string) {
  return url.toLowerCase().includes(".pdf");
}

export function isImage(url: string) {
  return /\.(png|jpg|jpeg|webp|gif|bmp|svg)$/i.test(url.split("?")[0]);
}

/**
 * Works well for public URLs / S3 signed URLs
 */
export async function forceDownload(url: string, fileName?: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = fileName || getFileNameFromUrl(url);
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(blobUrl);
}
