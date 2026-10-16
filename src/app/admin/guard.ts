import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";

/** Page-level auth gate (avoids the layout/login redirect loop). */
export async function guardAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}