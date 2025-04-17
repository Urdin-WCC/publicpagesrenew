import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

/**
 * Admin layout component
 *
 * This layout is used for all admin pages.
 * It includes the admin sidebar and header.
 * It also protects the admin routes by checking if the user is authenticated.
 *
 * @param children - The page content
 * @returns The admin layout component
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
