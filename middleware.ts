import { auth } from "@/auth";

export default auth;

// Opcionalmente, se puede añadir un matcher para especificar qué rutas proteger,
// pero la lógica 'authorized' en auth.ts ya maneja esto.
// export const config = {
//   matcher: ["/admin/:path*"],

export const config = {
  matcher: ["/admin/:path*"],
  runtime: "nodejs"
};
// };