import { readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { uploadsDir } from "@/lib/admin/paths";

/**
 * Dynamic upload server.
 *
 * `next start` builds a static manifest for `public/`; a file written by the
 * admin *after* the build is not in that manifest, so `/images/uploads/<new>`
 * returns 404 until the next deploy. The admin therefore showed a broken
 * preview right after an upload. This route reads the uploads folder from disk
 * on every request, so a fresh upload is visible immediately (admin preview and
 * public product page alike).
 *
 * Files are written with a timestamped, sanitized name by `uploadImageAction`,
 * so a long immutable cache is safe.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  // `[name]` is one path segment; reject traversal just in case.
  if (!name || name !== basename(name) || name.includes("..") || name.includes("\0")) {
    return new Response("Not found", { status: 404 });
  }

  const mime = MIME[extname(name).toLowerCase()];
  if (!mime) return new Response("Not found", { status: 404 });

  try {
    const file = await readFile(join(uploadsDir(), name));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
