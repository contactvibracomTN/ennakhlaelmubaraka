import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { readDeployStatus, readDeployLogTail } from "@/lib/admin/deploy";

export const dynamic = "force-dynamic";

/** Polled by the deploy panel while a deploy is running. */
export async function GET(): Promise<Response> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    status: readDeployStatus(),
    log: readDeployLogTail(6000),
  });
}