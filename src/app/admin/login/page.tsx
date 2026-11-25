import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminPassword } from "@/lib/admin/secrets";
import { isGithubMode } from "@/lib/admin/github-writes";
import { LoginForm } from "../components/login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  const { password, generated } = getAdminPassword();
  const missingEnv =
    isGithubMode() &&
    (!process.env.ADMIN_PASSWORD?.trim() || !process.env.ADMIN_SECRET?.trim());

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-emerald-950">
          Panneau d’administration
        </h1>
        <p className="mb-5 text-sm text-neutral-500">
          Gestion des contenus, des traductions et du déploiement du site —
          accès réservé.
        </p>

        {missingEnv ? (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
            Configuration manquante : définissez <code>ADMIN_PASSWORD</code> et{" "}
            <code>ADMIN_SECRET</code> dans l’environnement Vercel (Preview et
            Production), puis redéployez.
          </div>
        ) : null}

        {generated ? (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-semibold">
              Premier lancement — mot de passe généré automatiquement :
            </p>
            <p className="mt-1 select-all rounded bg-white px-2 py-1 font-mono text-base font-bold">
              {password}
            </p>
            <p className="mt-1 text-xs text-amber-700">
              Conservez-le dans un endroit sûr (fichier{" "}
              <code>.admin/password</code> à la racine du projet). Pour le
              changer, définissez <code>ADMIN_PASSWORD</code> dans{" "}
              <code>.env.local</code>.
            </p>
          </div>
        ) : null}

        <LoginForm />
      </div>
    </div>
  );
}
