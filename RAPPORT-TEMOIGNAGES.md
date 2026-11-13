# Rapport — Section « Témoignages clients »

> Dernière mise à jour : 13 novembre 2026 (migration de la persistance vers Neon Postgres).
> Déploiement : Vercel (`main`), avec `DATABASE_URL` configurée pour Production, Preview et Development.

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
- Bandeau d'information sur le stockage Neon (voir §4).

## 3. Modèle de données et confidentialité

Type `Testimonial` (`src/types/testimonial.ts`) :

- `id`, `name`, `whatsapp`, `job`, `nationality`, `countryCode`, `message`, `rating` (1–5), `locale`, `status` (`pending` / `published` / `archived`), `source` (`website` / `in-store` / `import`), `createdAt`, `updatedAt`, `publishedAt`, `publishedText` (par locale), `adminNote`, `order`.
- `countryCode` est un code ISO 3166-1 alpha-2 (`SA`, `FR`, `ID`…). Il alimente le drapeau affiché sur la carte publique. Le nom du pays est traduit à l'affichage avec `Intl.DisplayNames`, dans les 8 langues du site ; `nationality` reste un texte libre facultatif qui, s'il est renseigné, est affiché à la place du nom du pays.

Règles de confidentialité :

- **Le numéro WhatsApp et la note interne ne quittent jamais l'admin.** La requête publique ne sélectionne que les colonnes publiques (`id`, `name`, `job`, `nationality`, `country_code`, `message`, `rating`, `locale`, `created_at`, `published_at`, `published_text`, `sort_order`) ; `whatsapp` et `admin_note` ne sont jamais lus par la page d'accueil.
- Le composant public ne reçoit qu'un view-model (`PublicTestimonial`) sans ces champs.
- Aucune donnée personnelle n'est committée : le dépôt est **public**. Le fichier `testimonials.json` livré est vide (`[]`) et ne contient aucun avis réel ; la production utilise Neon.
- Le JSON-LD n'expose que le nom de l'auteur, la note, le texte public et la date de publication (pas de WhatsApp, pas de note interne).

## 4. Flux d'envoi : Neon en production, JSON en repli local

La persistance de production est **Neon Postgres** (intégration Vercel Marketplace, région `eu-central-1`, base `ennakhla-testimonials`). L'application utilise la chaîne **poolée** `DATABASE_URL` et le pilote `@neondatabase/serverless`.

La table `public.testimonials` est créée par `scripts/sql/testimonials.sql`. Elle contient les colonnes du type `Testimonial` : `id`, `name`, `whatsapp`, `job`, `nationality`, `country_code`, `message`, `rating`, `locale`, `status`, `source`, `created_at`, `updated_at`, `published_at`, `published_text` (jsonb), `admin_note`, `sort_order`. Le script inclut un `alter table … add column if not exists country_code` idempotent pour les bases déjà créées.

Comportement implémenté :

| Environnement | Écriture | Source durable | Résultat |
|---|---|---|---|
| Local avec `DATABASE_URL` | Neon | Neon | Avis `pending` créé, visible dans `/admin/testimonials` |
| Local sans `DATABASE_URL` | JSON | JSON | Avis `pending` créé + e-mail |
| Vercel avec `DATABASE_URL` | Neon | Neon | Avis `pending` visible dans l'admin, sans ressaisie |
| Vercel sans `DATABASE_URL` | ❌ (`EROFS`) | E-mail | Repli e-mail ; l'admin peut ressaisir l'avis |

- Le store (`src/lib/testimonials/store.ts`) bascule automatiquement sur le fichier JSON si `DATABASE_URL` est absent. Le fichier reste donc utilisable pour le développement local et les installations sans base.
- Les lectures publiques ne sélectionnent que les colonnes publiques et filtrent `status = 'published'`.
- Les lectures admin sélectionnent toutes les colonnes (WhatsApp et note interne compris).
- L'e-mail contient **tous** les champs (dont WhatsApp) + l'ID + la date, avec un rappel « ne pas publier le numéro ». Il reste un canal de secours, pas la source de vérité.
- En cas d'échec SMTP, repli sur `logs/testimonials-email.jsonl` (si le FS est inscriptible).
- Le destinataire peut être changé via `TESTIMONIALS_EMAIL` (sinon `siteConfig.email` = `nakhla.mubaraka26@gmail.com`).
- Après publication/dépublication/suppression, les actions admin appellent `revalidatePath("/", "layout")` et `revalidatePath("/[locale]", "page")` pour rafraîchir la page d'accueil statique sans redéploiement complet.

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
- Les actions admin sont journalisées (`audit`) et déclenchent `revalidatePath("/", "layout")` + `revalidatePath("/[locale]", "page")` pour rafraîchir la page d'accueil après publication.

## 7. Mode d'emploi admin

1. Se connecter à `/admin`.
2. Ouvrir **Témoignages**.
3. Les avis reçus par le formulaire apparaissent automatiquement en **En attente** dans la liste (Neon en production, JSON en local).
4. Cliquer sur **Voir / Modifier** pour corriger, traduire (texte public par langue), puis **Publier**.
5. **Archiver** conserve l'avis sans l'afficher ; **Supprimer** est définitif. En local, une sauvegarde JSON est créée dans `.backup/` avant chaque écriture ; en production, la durabilité repose sur Neon (sauvegardes Neon/Vercel).
6. Pour un avis reçu en boutique : **Nouveau témoignage**, choisir la source « Client en boutique », saisir le texte, publier.

## 8. Déploiement

- Créer la table une fois avec `scripts/sql/testimonials.sql` dans l'éditeur SQL Neon.
- Dans Vercel, vérifier que `DATABASE_URL` (chaîne **poolée**, avec `sslmode=require`) est définie pour **Production**, **Preview** et **Development**. Après modification d'une variable, relancer un déploiement.
- Ajouter si besoin `TESTIMONIALS_EMAIL` (sinon l'adresse par défaut est utilisée) et vérifier que les variables SMTP existent déjà (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `ORDER_FROM`).
- La page d'accueil est statique : après publication, `revalidatePath` invalide la page et le prochain visiteur voit l'avis sans redéploiement complet. En cas de doute, redéployer.

## 9. Persistance en production

La persistance automatique est assurée par **Neon Postgres**. L'action publique insère une ligne `pending`, l'admin lit et modifie la même table. Les avis n'ont plus besoin d'être ressaisis après réception de l'e-mail.

- Le repli JSON local reste disponible quand `DATABASE_URL` est absent.
- Les sauvegardes fichier existantes (`.backup/`) ne couvrent que le contenu JSON local ; la base Neon doit être sauvegardée via les mécanismes Neon/Vercel.
- Le code de persistance est centralisé dans `src/lib/testimonials/store.ts` (`readTestimonials`, `readPublishedTestimonials`, `getTestimonialById`, `upsertTestimonial`, `setTestimonialStatus`, `deleteTestimonials`, `appendTestimonial`).

## 10. Vérifications effectuées

- `npm run lint` : 0 erreur (1 avertissement préexistant dans `src/app/api/orders/notify/route.ts`).
- `npm run typecheck` : 0 erreur.
- `npm run check` : lint + typecheck + images OK.
- `npm run build` : succès, 586 pages statiques générées.
- Test réel du store Neon : `appendTestimonial` → `getTestimonialById` → `countPendingTestimonials` → `setTestimonialStatus("published")` → `readPublishedTestimonials` → `readTestimonials` → `deleteTestimonials` ; toutes les assertions OK, base revenue à 0.
- Test SQL direct : insertion, jsonb `published_text`, mise à jour du statut, `published_at`, suppression ; OK.
- Test navigateur de bout en bout sur `/fr` : formulaire public soumis → ligne `pending` dans Neon → publication → l'avis apparaît sur la page d'accueil → suppression → l'avis disparaît.
- Aucune fuite du numéro WhatsApp dans le texte public (vérifié) ; `admin_note` et `whatsapp` ne sont pas sélectionnés par la requête publique.

## 11. Fichiers principaux

**Ajoutés**

- `src/types/testimonial.ts`
- `src/lib/testimonials/store.ts` (Neon + repli JSON)
- `src/lib/data/content/testimonials.json` (vide, repli local)
- `src/lib/testimonials/email.ts`
- `src/lib/testimonials/service.ts`
- `src/lib/actions/testimonials.ts`
- `src/components/home/testimonials.tsx`
- `src/components/home/testimonial-form.tsx`
- `src/app/admin/testimonials/page.tsx`
- `src/app/admin/components/testimonials-manager.tsx`
- `scripts/sql/testimonials.sql` (schéma Neon)

**Modifiés**

- `src/lib/data/content-schema.ts` (schémas + parseurs)
- `src/lib/data/index.ts` (suppression de l'export du dataset JSON)
- `src/lib/admin/paths.ts` (chemin du JSON de repli)
- `src/lib/admin/store.ts` (lecture/écriture JSON de repli + sauvegardes + snapshot)
- `src/app/admin/actions.ts` (3 actions : save / statut / suppression)
- `src/app/admin/layout.tsx` (onglet + compteur)
- `src/app/admin/page.tsx` (carte de synthèse)
- `src/app/[locale]/page.tsx` (insertion de la section)
- `src/messages/*.json` (namespace `testimonials`, 8 langues)
- `package.json` / `package-lock.json` (`@neondatabase/serverless`)

**Supprimé**

- `src/lib/data/datasets/testimonials.ts` (le dataset statique n'est plus la source publique)

## 12. Décisions clés

1. **Aucun faux avis** n'a été ajouté : la section démarre en état vide, avec le CTA. La crédibilité passe avant le remplissage.
2. **Pas de persistance GitHub** : le dépôt est public, donc les données personnelles (WhatsApp, nationalité) ne doivent jamais y être committées.
3. **Neon = source de vérité en production** ; l'e-mail est un backup et le JSON local un repli de développement.
4. **Publication explicite** : un avis n'est visible qu'après passage en `published`. Rien n'est publié automatiquement.
5. **WhatsApp privé** : jamais rendu public, jamais dans le JSON-LD, uniquement dans l'admin.
6. **Traduction optionnelle par langue** : l'admin peut publier le texte original ou une version reformulée/traduite, sans écraser la version du client.
7. **Parité i18n stricte** : les 8 langues ont exactement les mêmes clés, ce qui préserve le garde-fou de déploiement existant.
8. **Pas de PII dans le dépôt public** : la base Neon et les variables Vercel portent les données de production, jamais Git.
