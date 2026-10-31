# النخلة المباركة — Al Nakhlah Al Mubarakah

Boutique de dattes premium · 8 langues · Next.js 16 (App Router) + next-intl.

## Stack

- Next.js 16 / React 19 / TypeScript
- next-intl (ar, fr, en, …)
- Tailwind CSS 4
- Contenu éditable en JSON + panneau d'administration maison

## Démarrage

```bash
npm install
npm run dev        # http://localhost:3000 → redirige vers /ar
```

## Scripts

| Commande            | Rôle                                                       |
| ------------------- | ---------------------------------------------------------- |
| `npm run dev`       | Serveur de développement                                   |
| `npm run build`     | Build de production (rendu statique, ~650 pages)           |
| `npm run check`     | ESLint + TypeScript                                        |
| `npm run lint`      | ESLint seul                                                |
| `npm run typecheck` | `tsc --noEmit` seul                                        |

## Structure

- `src/app/[locale]/` — pages publiques (8 langues)
- `src/app/admin/` — panneau d'administration (auth par variables d'env)
- `src/lib/data/content/*.json` — contenus éditables (dattes, cadeaux, catégories, articles)
- `src/messages/*.json` — textes d'interface par langue
- `resources/` — données sources & crédits photos (hors runtime)
- `scripts/deploy/` — pipeline de déploiement utilisé par l'admin

## Variables d'environnement

Voir `.env.example`. En production elles sont définies côté Vercel :
`NEXT_PUBLIC_BANK_*`, `ADMIN_PASSWORD`, `ADMIN_SECRET`, `GOOGLE_TRANSLATE_API_KEY`,
`ADMIN_SOURCE_LOCALE`. **Aucun secret n'est versionné.**

## Déploiement

Push sur `main` → rebuild automatique Vercel.
Production : https://ennakhlaelmubaraka.com (et `www` → redirection vers l'apex)

## Analytics

GTM `GTM-P2TBRPKB` comme point d'entrée unique : GA4 `G-PPQCN5D354` et
Meta Pixel `2369842980424778` sont à piloter depuis le conteneur, sans injection
directe par l'application.
