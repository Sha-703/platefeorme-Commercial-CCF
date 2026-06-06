// Augmentation de module pour next-auth v5 (beta)
// Le "export {}" est obligatoire pour que ce fichier soit traité comme un module ES
// et que les blocs "declare module" soient des AUGMENTATIONS (et non des remplacements).
export {};

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
