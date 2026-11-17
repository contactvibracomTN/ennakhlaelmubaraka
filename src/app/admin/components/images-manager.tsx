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
  const [pending, setPending] = useState<{ url: string; name: string } | null>(null);
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(null);

  const upload = async (file: File) => {
    setBanner(null);
    setBusy(true);
    // Show the selected file immediately, before the server round-trip.
    const objectUrl = URL.createObjectURL(file);
    setPending({ url: objectUrl, name: file.name });
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
    } catch {
      setBanner({
        ok: false,
        message: "Téléversement impossible — vérifiez la taille (10 Mo max) et réessayez.",
      });
    } finally {
      setBusy(false);
      setPending(null);
      URL.revokeObjectURL(objectUrl);
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
          JPG, PNG, WebP, GIF ou SVG — 10 Mo max. Le nom est nettoyé et horodaté automatiquement.
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60">
          {busy ? "Envoi…" : "Choisir un fichier"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
        </label>
        <span className="ml-3 text-[11px] text-neutral-400">
          Le chemin public (ex. <code>/media/uploads/1727…-photo.jpg</code>) apparaît ci-dessous —
          cliquez « copier » pour l’utiliser dans un produit ou un article.
        </span>
        {pending ? (
          <div className="mt-3 max-w-xl rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pending.url}
              alt=""
              className="h-80 w-full rounded-lg border border-emerald-100 bg-white object-contain"
            />
            <p className="mt-2 text-xs font-semibold text-emerald-800">Envoi en cours…</p>
            <p className="truncate text-[11px] text-neutral-500" title={pending.name}>
              {pending.name}
            </p>
          </div>
        ) : null}
      </section>

      {sections.map((sec) => (
        <section key={sec.title} className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-800">{sec.title}</h2>
          <p className="mb-3 text-xs text-neutral-500">{sec.hint}</p>
          {sec.images.length === 0 ? (
            <p className="text-sm text-neutral-400">Aucune image dans ce dossier.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sec.images.map((img) => (
                <figure
                  key={img.name}
                  className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
                >
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-neutral-50"
                    title="Ouvrir en grand"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.name}
                      className="h-80 w-full object-contain"
                      loading="lazy"
                    />
                  </a>
                  <figcaption className="space-y-1 p-3">
                    <p className="truncate text-[11px] text-neutral-600" title={img.name}>
                      {img.name}
                    </p>
                    <p className="break-all text-[10px] text-neutral-400">
                      {(img.size / 1024).toFixed(0)} Ko — {img.url}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button kind="secondary" onClick={() => void copy(img.url)}>
                        Copier le chemin
                      </Button>
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                      >
                        Voir en grand
                      </a>
                    </div>
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
