import "next-auth";

declare module "next-auth" {
  interface User {
    role?: "OWNER" | "STAFF" | "CUSTOMER";
  }

  interface Session {
    user: {
      id: string;
      role: "OWNER" | "STAFF" | "CUSTOMER";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "OWNER" | "STAFF" | "CUSTOMER";
  }
}
