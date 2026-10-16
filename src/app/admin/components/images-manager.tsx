"use client";

/** Standalone image browser/uploader for the /admin panel. */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImageAction } from "@/app/admin/actions";
import { Button, StatusBanner } from "./fields";

export interface ImageSection {
  title: string;
  hint: string;
  uploadable: boolean;
  images: Array<{ name: string; url: string; size: number }>;
}

export function ImagesManager({ sections }: { sections: ImageSection[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(null);

  const upload = async (file: File) => {
    setBanner(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadImageAction(fd);
      if (res.ok) {
        setBanner({ ok: true, message: `Image publiée : ${res.path}` });
        router.refresh();
      } else {
        setBanner({ ok: false, message: res.error });
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setBanner({ ok: true, message: `Chemin copié : ${url}` });
    } catch {
      setBanner({ ok: false, message: "Copie impossible sur ce navigateur." });
    }
  };

  return (
    <div className="space-y-6">
      {banner ? <StatusBanner ok={banner.ok} message={banner.message} /> : null}

      <section className="rounded-xl border border-emerald-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-emerald-900">
          📤 Nouvelle image (dossier « uploads »)
        </h2>
        <p className="mb-3 text-xs text-neutral-500">
          JPG, PNG, WebP, GIF ou SVG — 8 Mo max. Le nom est nettoyé et horodaté automatiquement.
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60">
          {busy ? "Envoi…" : "Choisir un fichier"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
        </label>
        <span className="ml-3 text-[11px] text-neutral-400">
          Le chemin public (ex. <code>/images/uploads/1727…-photo.jpg</code>) apparaît ci-dessous — cliquez
          « copier » pour l’utiliser dans un produit ou un article.
        </span>
      </section>

      {sections.map((sec) => (
        <section key={sec.title} className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-800">{sec.title}</h2>
          <p className="mb-3 text-xs text-neutral-500">{sec.hint}</p>
          {sec.images.length === 0 ? (
            <p className="text-sm text-neutral-400">Aucune image dans ce dossier.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {sec.images.map((img) => (
                <figure key={img.name} className="overflow-hidden rounded-lg border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} className="h-28 w-full object-cover" />
                  <figcaption className="space-y-1 p-2">
                    <p className="truncate text-[11px] text-neutral-600" title={img.name}>
                      {img.name}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {(img.size / 1024).toFixed(0)} Ko — {img.url}
                    </p>
                    <Button kind="secondary" onClick={() => void copy(img.url)}>
                      Copier le chemin
                    </Button>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}