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
  bankAccounts?: Array<{
    id?: string;
    bankName: string;
    accountNumber: string;
    ifscNumber: string;
    isPrimary?: boolean;
    accountHolderName: string;
    isVerified?: boolean;
  }>;
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
  bankAccounts?: Array<{
    bankName: string;
    accountNumber: string;
    ifscNumber: string;
    accountHolderName: string;
    isPrimary?: boolean;   // optional, default can be false
    isVerified?: boolean;  // optional, default can be false
  }>;
};

export type CreateUserDto = {
  user: CreateUserCoreDto;
  employee?: CreateEmployeeDto;
  addresses?: CreateAddressDto[];
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
export type BankAccountDto = {
  id?: string; 
  bankName: string;
  accountNumber: string;
  ifscNumber: string;
  accountHolderName: string;
  isPrimary?: boolean;
  isVerified?: boolean;
};

export type UpdateAgentProfileDto = Partial<{
  npn: string;
  yearsOfExperience: number;
  ahipCertified: boolean;
  ahipProofUrl?: string;
  stateLicensed: boolean;
  accessLevel: "TRAINING" | "ALL_ACCESS";
  isActive?: boolean;
  bankAccounts?: BankAccountDto[];
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

