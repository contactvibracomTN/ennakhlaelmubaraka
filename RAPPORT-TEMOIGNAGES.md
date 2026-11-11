# Rapport — Section « Témoignages clients »

> Branche : `dev` uniquement. Aucun déploiement ni commit sur `main`.
> Date : 11 novembre 2026.

## 1. Objectif

Ajouter sur la page d'accueil une section multilingue **« آراء عملائنا » / Avis clients** présentant les avis de clients du magasin et des clients en ligne, avec un formulaire d'ajout d'avis en accordéon. Les soumissions doivent :

1. envoyer une copie par e-mail à `nakhla.mubaraka26@gmail.com` ;
2. créer un témoignage consultable dans un nouvel espace d'administration (publication, archivage, suppression, etc.).

## 2. Ce qui a été livré

### 2.1 Section publique (page d'accueil)

- Nouvelle section `Testimonials` insérée **avant** `StoryBand`, dans `src/app/[locale]/page.tsx`.
- Design aligné sur la charte : fond ivoire, titres `font-arabic-display`, filet doré, cartes blanches, étoiles dorées.
- Affiche uniquement les témoignages au statut **`published`** (les `pending` et `archived` restent privés).
- Note moyenne + nombre d'avis, tri par `order` puis date de publication.
- État vide propre (aucun faux avis inventé) : invitation à être le premier à partager son expérience.
- Données structurées JSON-LD (`Store` + `AggregateRating` + `Review`) générées **uniquement** s'il existe au moins un avis publié.
- CTA **« أضف تقييم » / « Ajouter un avis »** en bas de section, qui ouvre le formulaire en accordéon (fermeture, `aria-expanded`, `inert` quand replié).

### 2.2 Formulaire

Champs demandés, tous présents :

| Champ | Obligatoire | Remarque |
|---|---|---|
| الإسم / Nom | oui | 2–80 caractères |
| رقم الواتساب / WhatsApp | oui | 8–20 caractères, format téléphone |
| العمل / المهنة / Profession | non | 80 caractères max |
| الجنسيّة / Nationalité | non | 60 caractères max |
| رسالتك / Message | oui | 10–1000 caractères |
| التقييم / Note | oui | 1 = ضعيف/faible · 5 = ممتاز/excellent |

- Étoiles interactives + libellé localisé de la note sélectionnée.
- Piège anti-robot (honeypot), contrôle de délai minimal, limitation de fréquence par IP (mémoire du processus), validation Zod côté serveur.
- Message de succès localisé + bouton « envoyer un autre avis ».
- Note de confidentialité : le numéro WhatsApp ne sera jamais affiché publiquement.

### 2.3 Espace admin (`/admin/testimonials`)

- Nouvel onglet **« Témoignages »** dans la navigation, avec compteur des avis en attente.
- Carte de synthèse sur le tableau de bord admin.
- Liste filtrable (Tous / En attente / Publiés / Archivés) + recherche (nom, métier, nationalité, message, WhatsApp).
- Actions **unitaire et en masse** :
  - Publier / Dépublier (remise en attente) ;
  - Archiver / Restaurer ;
  - Supprimer (confirmation) ;
  - Voir / Modifier.
- Éditeur complet : nom, WhatsApp, profession, nationalité, message, note, langue d'origine, statut, source, ordre d'affichage, note interne.
- **Texte public par langue** (8 langues) : permet de reformuler/traduire un avis avant publication ; si vide, le message original est utilisé.
- Lien WhatsApp cliquable **uniquement dans l'admin** (jamais rendu côté public).
- Bandeau d'avertissement sur la limite d'écriture Vercel (voir §4).

## 3. Modèle de données et confidentialité

Type `Testimonial` (`src/types/testimonial.ts`) :

- `id`, `name`, `whatsapp`, `job`, `nationality`, `message`, `rating` (1–5), `locale`, `status` (`pending` / `published` / `archived`), `source` (`website` / `in-store` / `import`), `createdAt`, `updatedAt`, `publishedAt`, `publishedText` (par locale), `adminNote`, `order`.

Règles de confidentialité :

- **Le numéro WhatsApp et la note interne ne quittent jamais l'admin.** Le composant public ne reçoit qu'un view-model (`PublicTestimonial`) sans ces champs.
- Aucune donnée personnelle n'est committée : le dépôt `contactvibracomTN/ennakhlaelmubaraka` est **public**. Le fichier `testimonials.json` livré est vide (`[]`) et ne contient aucun avis réel.
- Le JSON-LD n'expose que le nom de l'auteur, la note, le texte public et la date de publication (pas de WhatsApp, pas de note interne).

## 4. Flux d'envoi : local vs Vercel

Le système de fichiers de Vercel est **en lecture seule** : une soumission ne peut pas écrire dans `src/lib/data/content/testimonials.json` en production.

Comportement implémenté :

| Environnement | Écriture JSON | E-mail | Résultat |
|---|---|---|---|
| Local / serveur inscriptible | ✅ | ✅ | Avis `pending` créé + e-mail |
| Vercel (SMTP configuré) | ❌ (`EROFS`) | ✅ | E-mail = source durable ; l'admin ressaisit l'avis |
| Vercel (SMTP absent/échec) | ❌ | ❌ | Message d'erreur honnête (aucune perte silencieuse) |

- L'e-mail contient **tous** les champs (dont WhatsApp) + l'ID + la date, avec un rappel « ne pas publier le numéro ».
- En cas d'échec SMTP, repli sur `logs/testimonials-email.jsonl` (si le FS est inscriptible).
- Le destinataire peut être changé via `TESTIMONIALS_EMAIL` (sinon `siteConfig.email` = `nakhla.mubaraka26@gmail.com`).

## 5. Localisation

- Nouveau namespace `testimonials` dans les 8 fichiers `src/messages/{ar,en,fr,tr,ur,ms,bn,id}.json`.
- **Parité stricte** : 410 feuilles par locale, 0 clé manquante / 0 clé en trop (vérifié ; le garde-fou `checkCompleteness()` du déploiement reste vert).
- Pluriel ICU pour `countLabel` (règles arabes, anglaises, etc.).
- Direction RTL héritée de la locale (`ar`, `ur`) : le formulaire et les cartes utilisent des classes logiques (`ms-`, `me-`, `start-`, `end-`).

## 6. Anti-spam et sécurité

- Honeypot `website` (succès silencieux pour les robots).
- Délai minimal de 2 s entre l'ouverture et l'envoi.
- Limitation en mémoire : 5 envois / 10 min / IP (best effort, par instance).
- Validation Zod stricte côté serveur (le client ne fait que de l'UX).
- Aucune route publique d'administration : `/admin/*` est protégé par `guardAdmin()` (cookie HMAC).
- Les actions admin sont journalisées (`audit`) et déclenchent `revalidatePath("/", "layout")` pour rafraîchir le site après publication.

## 7. Mode d'emploi admin

1. Se connecter à `/admin`.
2. Ouvrir **Témoignages**.
3. Les avis reçus par le formulaire apparaissent en **En attente** (en local) ou arrivent par e-mail (Vercel).
4. Cliquer sur **Voir / Modifier** pour corriger, traduire (texte public par langue), puis **Publier**.
5. **Archiver** conserve l'avis sans l'afficher ; **Supprimer** est définitif (une sauvegarde est créée dans `.backup/` avant chaque écriture).
6. Pour un avis reçu en boutique : **Nouveau témoignage**, choisir la source « Client en boutique », saisir le texte, publier.

## 8. Déploiement

- Tout le travail est sur la branche **`dev`** (partie de `main` + commits de la fonctionnalité).
- Ne pas fusionner sur `main` avant validation.
- Sur Vercel, ajouter si besoin `TESTIMONIALS_EMAIL` (sinon l'adresse par défaut est utilisée) et vérifier que les variables SMTP existent déjà (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `ORDER_FROM`).
- Le site étant statique, les avis publiés apparaissent **après un nouveau build/déploiement** (comportement identique au reste du contenu éditorial).

## 9. Limite connue et recommandation production

La seule limite réelle est la persistance automatique sur Vercel. Trois options, par ordre de simplicité :

1. **Rester sur le flux e-mail + saisie manuelle** (zéro infrastructure). C'est ce qui est livré : l'e-mail est la source durable, l'admin crée l'avis en 30 secondes. Recommandé pour démarrer.
2. **Base managée** (Vercel Postgres / Neon / Supabase) : table `testimonials`, l'action publique insère une ligne `pending`, l'admin lit/écrit via la même table. C'est la solution propre si le volume d'avis devient important.
3. **KV / Upstash Redis** : plus léger qu'une base, suffisant pour des avis (clé `testimonials` = JSON). Attention à la limite de taille et aux sauvegardes.

Le code est structuré pour faciliter l'option 2 : toute la persistance passe par `readTestimonials()` / `saveTestimonials()` (`src/lib/admin/store.ts`) et par `appendTestimonial()` (`src/lib/testimonials/service.ts`). Il suffira de remplacer ces fonctions par des appels à la base.

## 10. Vérifications effectuées

- `npm run lint` : 0 erreur (1 avertissement préexistant dans `src/app/api/orders/notify/route.ts`).
- `npx tsc --noEmit` : 0 erreur.
- `npm run check:images` : OK (6 fichiers de contenu).
- `npm run build` : succès, route `/admin/testimonials` générée en dynamique.
- Rendu de la section vérifié sur les 8 locales (`/ar`, `/en`, `/fr`, `/tr`, `/ur`, `/ms`, `/bn`, `/id`) : section + CTA présents.
- Test de bout en bout du service : validation Zod OK, écriture JSON OK, e-mail SMTP OK (`ok: true`).
- Page admin vérifiée avec session HMAC : l'avis de test apparaît avec les filtres et actions.
- Actions admin testées de bout en bout (via une route temporaire supprimée après le test) : dépublier → `pending`, publier → `published`, supprimer → 0 enregistrement ; toutes ont répondu `{ ok: true }`.
- Aucune fuite du numéro WhatsApp dans le HTML public (vérifié).

## 11. Fichiers principaux

**Ajoutés**

- `src/types/testimonial.ts`
- `src/lib/data/datasets/testimonials.ts`
- `src/lib/data/content/testimonials.json` (vide)
- `src/lib/testimonials/email.ts`
- `src/lib/testimonials/service.ts`
- `src/lib/actions/testimonials.ts`
- `src/components/home/testimonials.tsx`
- `src/components/home/testimonial-form.tsx`
- `src/app/admin/testimonials/page.tsx`
- `src/app/admin/components/testimonials-manager.tsx`

**Modifiés**

- `src/lib/data/content-schema.ts` (schémas + parseurs)
- `src/lib/data/index.ts` (export du dataset)
- `src/lib/admin/paths.ts` (chemin du JSON)
- `src/lib/admin/store.ts` (lecture/écriture + sauvegardes + snapshot)
- `src/app/admin/actions.ts` (3 actions : save / statut / suppression)
- `src/app/admin/layout.tsx` (onglet + compteur)
- `src/app/admin/page.tsx` (carte de synthèse)
- `src/app/[locale]/page.tsx` (insertion de la section)
- `src/messages/*.json` (namespace `testimonials`, 8 langues)

## 12. Décisions clés

1. **Aucun faux avis** n'a été ajouté : la section démarre en état vide, avec le CTA. La crédibilité passe avant le remplissage.
2. **Pas de persistance GitHub** : le dépôt est public, donc les données personnelles (WhatsApp, nationalité) ne doivent jamais y être committées.
3. **E-mail = canal durable** sur Vercel, avec repli JSONL en local. L'admin peut toujours ressaisir un avis.
4. **Publication explicite** : un avis n'est visible qu'après passage en `published`. Rien n'est publié automatiquement.
5. **WhatsApp privé** : jamais rendu public, jamais dans le JSON-LD, uniquement dans l'admin.
6. **Traduction optionnelle par langue** : l'admin peut publier le texte original ou une version reformulée/traduite, sans écraser la version du client.
7. **Parité i18n stricte** : les 8 langues ont exactement les mêmes clés, ce qui préserve le garde-fou de déploiement existant.
8. **Branche `dev` uniquement** : validation avant toute fusion sur `main`.
