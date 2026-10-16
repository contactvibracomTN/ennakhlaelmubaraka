import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { guardAdmin } from "../guard";
import { backupDir } from "@/lib/admin/paths";
import { listBackupFiles, fileSize } from "@/lib/admin/store";
import { BackupsManager, type BackupFile, type SnapshotGroup } from "../components/backups-manager";

export const dynamic = "force-dynamic";

export default async function AdminBackupsPage() {
  await guardAdmin();

  // individual timestamped backups at the root of .backup
  const files: BackupFile[] = listBackupFiles().map((name) => ({
    name,
    display: name,
    size: fileSize(join(backupDir(), name)),
  }));

  // snapshot folders (deploy-…, before-deploy-…)
  let folders: string[] = [];
  try {
    if (existsSync(backupDir())) {
      folders = readdirSync(backupDir()).filter((entry) => {
        try {
          return statSync(join(backupDir(), entry)).isDirectory();
        } catch {
          return false;
        }
      });
    }
  } catch {
    folders = [];
  }

  const snapshots: SnapshotGroup[] = folders
    .map((folder) => {
      let names: string[] = [];
      try {
        names = readdirSync(join(backupDir(), folder)).filter((f) => f.endsWith(".json"));
      } catch {
        names = [];
      }
      const mapped: BackupFile[] = names.map((n) => ({
        name: `${folder}/${n}`,
        display: n,
        size: fileSize(join(backupDir(), folder, n)),
      }));
      return { folder, files: mapped };
    })
    .sort((a, b) => b.folder.localeCompare(a.folder));

  const total = files.length + snapshots.reduce((n, s) => n + s.files.length, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-950">Sauvegardes</h1>
      <p className="text-sm text-neutral-500">
        Le projet n’utilise pas git : chaque enregistrement et chaque déploiement créent des copies horodatées
        dans <code>.backup/</code> ({total} fichier(s) au total). La sauvegarde la plus récente renvoie à
        l’état le plus proche.
      </p>
      <BackupsManager snapshots={snapshots} files={files} />
    </div>
  );
}