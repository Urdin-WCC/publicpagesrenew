// Este archivo re-exporta funciones de auth-server.ts y auth-client.ts
// para mantener compatibilidad con el código existente

// Re-exportar desde auth-server.ts
export {
  authOptions,
  getServerSession,
  getCurrentUserRole,
  withRoleProtection,
  auth
} from "./auth-server";

// Re-exportar desde auth-client.ts
export {
  useCurrentUserRole,
  checkUserRole,
  useSession,
  signIn,
  signOut
} from "./auth-client";