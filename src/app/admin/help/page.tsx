import { guardAdmin } from "../guard";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "1. Créer ou modifier un contenu",
    body: "Ouvrez « Dattes », « Cadeaux », « Catégories » ou « Articles ». Remplissez les champs, puis cliquez sur « 💾 Enregistrer ». L'enregistrement crée une sauvegarde horodatée dans .backup/. À ce stade, le site public n'a encore rien changé.",
  },
  {
    title: "2. Rédiger en une seule langue (l'arabe)",
    body: "Chaque produit/article a ses textes sur 8 onglets (العربية, English, Français, Türkçe, اردو, Melayu, বাংলা, Bahasa Indonesia). On rédige dans la langue source — en principe l'arabe — et les autres versions sont générées automatiquement à l'étape suivante.",
  },
  {
    title: "3. « ✨ Traduire automatiquement »",
    body: "Le bouton doré traduit l'élément entier vers les 7 autres langues via Google Cloud Translate. Le bouton est grisé sans clé API : ajoutez GOOGLE_TRANSLATE_API_KEY dans .env.local puis redémarrez le serveur. Chaque version traduite porte la pastille « machine » : elle doit être relue par un humain.",
  },
  {
    title: "4. Valider chaque langue",
    body: "Sous chaque champ localisé, une pastille par langue indique l'état : vert = validé, orange = traduction machine à relire, rouge = absent. Cliquez « valider » sur une version pour la certifier. Une version machine n'est jamais comptée comme validée — il faut cliquer explicitement.",
  },
  {
    title: "5. « ▶ Déployer »",
    body: "Une fois tout validé, la porte de complétude passe au vert et le bouton « Déployer » (page Déploiement ou accueil) devient actif. Le déploiement vérifie le code (npm run check), prend un instantané before-deploy, recompile et redémarre le serveur. Le site est indisponible 1 à 3 minutes, puis rafraîchissez la page.",
  },
];

const FAQ = [
  {
    q: "Le site public ne montre pas mes modifications — pourquoi ?",
    a: "Les enregistrements restent dans les fichiers de contenu ; ils ne sont publiés qu'après un « Déployer » (étape 5). Vérifiez aussi que le statut de contenu n'est pas « draft » (brouillon) si le contenu n'apparaît pas sur les listes publiques.",
  },
  {
    q: "J'ai fait une erreur, comment revenir en arrière ?",
    a: "Page « Sauvegardes » : choisissez un instantané before-deploy ou un fichier horodaté et cliquez « Restaurer », puis redéployez. Il n'y a pas de git dans ce projet — les sauvegardes horodatées en tiennent lieu.",
  },
  {
    q: "Les pastilles restent oranges même après avoir enregistré. Que faire ?",
    a: "Une version « machine » doit être validée par un clic sur « valider » dans l'onglet de la langue concernée. L'enregistrement seul ne valide pas une traduction automatique.",
  },
  {
    q: "Puis-je changer la langue source ?",
    a: "Par défaut c'est l'arabe. La langue source est toujours considérée « rédigée ». Le changement se fait dans le fichier src/lib/admin/state.json (sourceLocale) — demandez à un développeur si nécessaire.",
  },
  {
    q: "Où sont stockées les données ?",
    a: "Contenus : src/lib/data/content/*.json. Textes de page : src/messages/*.json. État de validation : src/lib/admin/state.json. Journal : logs/admin-audit.jsonl. Sauvegardes : .backup/. Secrets : .admin/.",
  },
];

export default async function AdminHelpPage() {
  await guardAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-950">Guide utilisateur</h1>
      <p className="text-sm text-neutral-500">
        Ce panneau vous permet de gérer vous-même les contenus et textes du site en 5 étapes. Une version plus
        détaillée est disponible dans le fichier <code>GUIDE-ADMIN.md</code> à la racine du projet.
      </p>

      <section className="space-y-3">
        {STEPS.map((s) => (
          <div key={s.title} className="rounded-xl border border-emerald-200 bg-white p-4">
            <h2 className="mb-1 text-sm font-bold text-emerald-900">{s.title}</h2>
            <p className="text-sm leading-relaxed text-neutral-600">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800">
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-neutral-800">{f.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-800">
          Traduction automatique : configuration requise
        </h2>
        <div className="text-sm leading-relaxed text-neutral-600">
          <p>
            Les boutons « ✨ Traduire » appellent Google Cloud Translation (clé API seule). Sans clé, ils restent
            désactivés. Créez une clé dans la console Google Cloud (Cloud Translation API → « Clés API »), puis
            ajoutez-la dans le fichier <code>.env.local</code> à la racine :
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-3 text-[12px] text-emerald-100">
            GOOGLE_TRANSLATE_API_KEY=votre_cle
          </pre>
          <p className="mt-2">
            Puis redémarrez le serveur. Les 7 versions restent des brouillons « machine » tant qu’elles ne sont
            pas validées par un humain.
          </p>
        </div>
      </section>
    </div>
  );
}