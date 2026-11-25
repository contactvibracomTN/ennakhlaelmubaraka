# Admin en ligne sur Vercel — écriture GitHub sur la branche `dev`

Date : 24 novembre 2026.

Ce document décrit le mode « admin en ligne » : le panneau reste hébergé sur Vercel,
mais ses enregistrements ne sont plus écrits sur le disque (lecture seule). Ils sont
**committés sur la branche `dev`** via l’API GitHub. La production (`main`) n’est
modifiée que par toi, manuellement, après vérification de la preview.

Sans les variables décrites ci-dessous, rien ne change : `npm run dev` continue à
écrire dans les fichiers locaux comme avant.

---

## 1. Principe

```text
Admin en ligne (preview Vercel, branche dev)
  → clic « Enregistrer »
  → 1 commit atomique sur dev (JSON + état de validation + image)
  → Vercel reconstruit la preview dev (1 à 3 min)
  → tu vérifies la preview
  → git checkout main && git merge dev && git push
  → Vercel reconstruit la production
```

Un seul commit par action : les 8 fichiers de langue d’une traduction FAQ, par
exemple, partent dans le même commit. Le message du commit reprend l’action
(`admin: save — faq`, `admin: upload — /media/uploads/…`) : c’est la trace d’audit
en ligne, puisque `logs/admin-audit.jsonl` n’est pas écrivable sur Vercel.

---

## 2. Configuration à faire une seule fois

### 2.1 Token GitHub

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. **Generate new token** → repository access : sélectionner ce dépôt uniquement.
3. Permissions **Repository permissions → Contents : Read and write**.
4. Ne pas cocher d’autres droits. Copier la valeur une seule fois.

⚠️ Si la branche `dev` est protégée en « pull request only », l’API refusera les
commits directs. Il faut soit autoriser les commits directs sur `dev`, soit créer
les commits via PR (non implémenté). La protection de `main`, elle, peut rester.

### 2.2 Variables Vercel

Projet Vercel → **Settings → Environment Variables**. Ajouter **les environnements
`Preview` ET `Production`** pour les variables d’admin, sinon l’admin de la preview
ne pourra pas se connecter.

| Variable | Valeur | Environnements |
|---|---|---|
| `GITHUB_TOKEN` | token fine-grained | Production + Preview |
| `GITHUB_REPO` | `owner/repo` | Production + Preview |
| `GITHUB_BRANCH` | `dev` | Production + Preview |
| `ADMIN_PASSWORD` | mot de passe de l’admin | Production + Preview |
| `ADMIN_SECRET` | chaîne aléatoire longue, pour signer les cookies | Production + Preview |
| `GOOGLE_TRANSLATE_API_KEY` | clé Google Cloud Translation | Production + Preview |
| `ADMIN_SOURCE_LOCALE` | `ar` | Production + Preview |
| `VERCEL_DEPLOY_HOOK_URL_DEV` | deploy hook Vercel lié à `dev` (optionnel) | Production + Preview |
| `VERCEL_DEV_PREVIEW_URL` | URL de la preview (optionnel, affichée dans l’admin) | Production + Preview |

`GITHUB_TOKEN` ne doit **jamais** être préfixé `NEXT_PUBLIC_`.

Sans `ADMIN_SECRET`, la connexion plante : `getAdminSecret()` essayait d’écrire
dans `.admin/`. Sans `ADMIN_PASSWORD`, aucun mot de passe ne peut être généré de
façon fiable sur du serverless. L’admin affiche désormais un message explicite.

### 2.3 Vercel et la branche `dev`

Le projet Vercel doit être relié au dépôt GitHub et construire les branches non
production en **preview**. Vérifier qu’un commit sur `dev` produit bien une URL de
preview. Le deploy hook est facultatif : les commits seuls déclenchent déjà un
déploiement si l’intégration Git est active.

---

## 3. Utilisation quotidienne

1. Ouvrir **l’URL de preview Vercel de la branche `dev`**, puis `/admin`.
   Ne pas utiliser l’admin de production : il affiche le contenu de `main` jusqu’au merge.
2. Modifier les contenus, traduire, valider les langues, importer des images —
   comme d’habitude.
3. À chaque « Enregistrer », un commit apparaît sur `dev`. L’écran
   **Déploiement → Publication sur la branche dev** affiche le dernier commit.
4. Cliquer « ▶ Déployer la preview dev » si tu veux forcer un nouveau déploiement,
   puis ouvrir le lien de preview et vérifier le rendu.
5. Quand tout est bon, depuis ton poste :

```sh
git checkout dev
git pull origin dev
git checkout main
git merge dev
git push origin main
```

Vercel reconstruit alors la production. Si `main` est protégée, passer par une PR
`dev → main`.

---

## 4. Ce qui est stocké où

| Élément | En ligne (mode GitHub) | En local (sans variables) |
|---|---|---|
| Contenus `src/lib/data/content/*.json` | commit sur `dev` | fichiers locaux |
| Textes `src/messages/*.json` | commit sur `dev` | fichiers locaux |
| États de validation `src/lib/admin/state.json` | commit sur `dev` | fichiers locaux |
| Images `public/images/uploads/*` | commit sur `dev` | fichiers locaux |
| Témoignages | Neon si `DATABASE_URL`, sinon commit | fichier JSON local |
| Journal d’audit | message de commit (pas de fichier) | `logs/admin-audit.jsonl` |
| Sauvegardes | historique git | `.backup/` |
| Statut de déploiement | dernier commit + preview | `logs/deploy.*` |

---

## 5. Limites à connaître

- **Délai** : le site public ne reflète un changement qu’après le build Vercel
  (environ 1 à 3 minutes). C’est normal, pas une erreur. L’admin lui-même peut
  afficher l’ancienne valeur pendant ce temps : n’enchaîne pas deux enregistrements
  identiques en croyant que le premier a échoué.
- **Retour visuel** : le message de confirmation et le commit sont immédiats ;
  seules les données relues depuis le disque attendent le rebuild.
- **Aperçu des images** : une image importée apparaît dans la liste « Images »
  après le rebuild de la preview. Le chemin copié s’affiche immédiatement dans le
  message de confirmation.
- **Deux administrateurs en même temps** : la couche d’écriture relit le dernier
  commit et réessaie une fois en cas de conflit. Si le second enregistrement échoue
  quand même, le message l’indique : il suffit de réessayer.
- **Historique** : pour annuler une modification, faire un `git revert` du commit
  sur `dev`, puis laisser Vercel reconstruire la preview. L’historique git remplace
  les sauvegardes horodatées en ligne.
- **Témoignages** : si `DATABASE_URL` est renseigné, ils restent dans Neon et ne
  passent donc pas par `dev` — la validation se fait directement dans l’admin.

---

## 6. Dépannage

| Message | Cause | Correction |
|---|---|---|
| `Configuration manquante : ADMIN_PASSWORD et ADMIN_SECRET…` | variables absentes de l’environnement Preview | les ajouter dans Vercel, redéployer |
| `GitHub API 401` | token invalide ou révoqué | régénérer le token |
| `GitHub API 403` | token sans droit `Contents: write` ou branche protégée | corriger les permissions / la protection de `dev` |
| `GitHub API 404` | `GITHUB_REPO` mal écrit ou dépôt inaccessible | forme `owner/repo`, vérifier l’accès du token |
| `Écriture GitHub hors contexte d'action` | code appelant une écriture en dehors d’une action admin | réessayer depuis l’admin ; si cela persiste, contacter le développeur |
| `Hook Vercel : réponse …` | deploy hook absent ou invalide | vérifier `VERCEL_DEPLOY_HOOK_URL_DEV` |
| `Aperçu indisponible` sur une image | build Vercel pas encore terminé | attendre la preview suivante |
