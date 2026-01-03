import "next-auth";

declare module "next-auth" {
  interface Session {
    token?: string;
    user?: {
      id?: string;
      email?: string;
      designation: string;
      name?: string;
    };
  }
}
