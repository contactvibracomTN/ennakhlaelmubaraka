# Photos à intégrer

Déposez ici **vos photos originales**. Je les optimise (recadrage carré, JPEG qualité 82,
dimension max 1600 px) puis je les branche dans le catalogue.

Les fichiers déposés ici **ne sont pas versionnés** (voir `.gitignore`) : seules les versions
optimisées, rangées dans `public/images/`, entrent dans le dépôt.

---

## Nommage des fichiers

`<slug>.jpg` pour la 1re photo, puis `<slug>-2.jpg`, `<slug>-3.jpg` pour les suivantes.

### Priorité 1 — produits sans aucune photo

| Fichier(s) à déposer | Produit |
|---|---|
| `mabroom.jpg` (+ `mabroom-2.jpg`, `mabroom-3.jpg`) | Mabroom (dattes) |
| `ajwa-aaliya.jpg` (+ `ajwa-aaliya-2.jpg`, `ajwa-aaliya-3.jpg`) | Ajwa Aaliya (dattes) |

### Priorité 2 — photos incomplètes ou à remplacer

| Fichier(s) à déposer | Produit | Situation actuelle |
|---|---|---|
| `signature-box-2.jpg`, `signature-box-3.jpg` | Coffret Signature | 1 seule photo |
| `ramadan-gift.jpg`, `ramadan-gift-2.jpg`, `ramadan-gift-3.jpg` | Coffret Ramadan | photo = upload brut |
| `white-chocolate-dates.jpg` **ou** `medjool-dark-chocolate.jpg` | — | ces 2 produits partagent la même photo |

### Priorité 3 — optionnel

| Fichier à déposer | Usage |
|---|---|
| `hero.jpg` | Bannière d'accueil (image **large**, ≥ 2560×1440, paysage) |

---

## Format conseillé

- **Carré 1:1**, minimum 1000×1000, idéal **1600×1600** (dattes et coffrets)
- **JPEG** — inutile de convertir en AVIF/WebP, Next.js le fait automatiquement
- Lumière naturelle, fond neutre, produit net et bien cadré
- Un produit par fichier · formats acceptés : JPG, PNG, WEBP, HEIC (je convertis si besoin)
- Pour la galerie : de **vraies vues différentes** (de face, détail, emballage), pas des recadrages

---

## Ce que je fais ensuite

1. Optimisation avec `sharp` → `public/images/dates/` ou `public/images/gifts/`
2. Mise à jour de `src/lib/data/content/dates.json` / `gifts.json`
3. Commit sur la branche `dev` → nouveau Preview Deployment à valider
