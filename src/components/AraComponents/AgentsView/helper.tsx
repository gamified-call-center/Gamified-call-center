export interface CsvUserRow {
  firstName?: string;
  lastName?: string;
  email?: string;
  dob?: string;
  ssn?: string;
  phone?: string;

  designation?: string;
  reportsTo?: string;

  npn?: string;
  password?: string;

  chaseExt?: string;
  chaseDataUsername?: string;
  chaseDataPassword?: string;

  healthSherpaUsername?: string;
  healthSherpaPassword?: string;

  yearsOfExperience?: string;
  ahipCertified?: string;     // keep as string in CSV
  stateLicensed?: string;     // keep as string in CSV

  myMfgUsername?: string;
  myMfgPassword?: string;

  ffmUsername?: string;
  forwarding?: string;
  payStructure?: string;

  role?: string;
  access?: string;

  apps?: string; // "a|b|c"
}
