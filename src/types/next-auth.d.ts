import "next-auth";

declare module "next-auth" {
  interface Session {
    token?: string;
    user?: {
      id?: string;
      email?: string;
      systemRole?: string;
      firstName?: string;
      lastName?: string;
    };
  }
}
