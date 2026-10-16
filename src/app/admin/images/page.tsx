import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { guardAdmin } from "../guard";
import { uploadsDir, datesImagesDir, giftsImagesDir, blogImagesDir } from "@/lib/admin/paths";
import { ImagesManager, type ImageSection } from "../components/images-manager";

export const dynamic = "force-dynamic";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|svg)$/i;

function listImages(dir: string, publicRoot: string): ImageSection["images"] {
  try {
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => IMAGE_EXT.test(f))
      .map((f) => {
        let size = 0;
        try {
          size = statSync(join(dir, f)).size;
        } catch {
          /* ignore */
        }
        return { name: f, url: `${publicRoot}/${encodeURIComponent(f)}`, size };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export default async function AdminImagesPage() {
  await guardAdmin();

  const sections: ImageSection[] = [
    {
      title: "Uploads (nouveaux fichiers)",
      hint: "Images ajoutées depuis le panneau — utilisez « copier le chemin » dans les produits/articles.",
      uploadable: false,
      images: listImages(uploadsDir(), "/images/uploads"),
    },
    {
      title: "Dattes",
      hint: "Photos des produits de dattes (catalogue V3).",
      uploadable: false,
      images: listImages(datesImagesDir(), "/images/dates"),
    },
    {
      title: "Cadeaux",
      hint: "Photos des corbeilles et boîtes cadeaux.",
      uploadable: false,
      images: listImages(giftsImagesDir(), "/images/gifts"),
    },
    {
      title: "Blog",
      hint: "Couvertures d'articles et illustrations.",
      uploadable: false,
      images: listImages(blogImagesDir(), "/images/blog"),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-950">Images</h1>
      <p className="text-sm text-neutral-500">
        Importez une nouvelle image (dossier « uploads ») puis collez son chemin dans un produit, un cadeau
        ou un article.
      </p>
      <ImagesManager sections={sections} />
    </div>
  );
}