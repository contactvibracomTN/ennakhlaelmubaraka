# Réduire le poids du projet et libérer le stockage Vercel

## 1. Diagnostic : les 10 Go ne sont pas le poids du dépôt

La limite de **10 Go** du plan Hobby Vercel concerne le **Deployment Storage** :
le stockage des sorties de build et des bundles de fonctions conservés pour chaque
déploiement. Ce n'est pas la taille du dépôt Git, ni `node_modules`, ni `.next`.

Ordres de grandeur mesurés localement :

| Élément | Taille | Envoyé à Vercel ? |
|---|---:|---|
| `public/` (images du site) | ~9 Mo après optimisation | Oui |
| Sortie de build `.next` (hors cache/dev) | ~320 Mo | Oui, via le build Vercel |
| `.next/` complet local | ~1,5 Go | Non (dossier ignoré par Vercel) |
| `node_modules/` | ~480 Mo | Non (réinstallé par Vercel) |
| `.git/` | ~485 Mo | Non (ignoré par Vercel) |

Chaque déploiement conservé pèse donc de l'ordre de **300 à 330 Mo**. Le plafond
de 10 Go peut être atteint avec une trentaine d'anciens déploiements encore
conservés (ou plusieurs projets Vercel). La suppression des anciens déploiements
est donc l'action principale ; l'allègement du dépôt est un gain complémentaire.

## 2. Actions déjà réalisées dans le dépôt

- **18 images non référencées supprimées** : 1,33 Mo.
- **Photo PNG de 2,79 Mo convertie en JPEG** (`premium-assortment__3.jpg`) :
  référence mise à jour dans `src/lib/data/content/gifts.json`.
- **87 images réencodées** sans changer leurs dimensions :
  JPEG qualité 82 (mozjpeg), PNG palette, WebP qualité 82.
- Résultat : `public/images` passe de **19,23 Mo / 143 fichiers** à
  **9,06 Mo / 125 fichiers**, soit environ **10 Mo de moins par déploiement**.
- Ajout de `.vercelignore` pour exclure explicitement `.git`, `.next`,
  `node_modules`, `.backup`, `logs`, `.admin`, `.vercel`, les fichiers d'environnement
  et les artefacts locaux lors d'un déploiement via la CLI Vercel.
- `npm run check` et `npm run build` passent ; les pages et images ont été
  vérifiées en production locale (`/fr`, `/fr/gifts`, `/fr/guide`, `/fr/guide/khidri`,
  images directes et `/_next/image`).

## 3. Actions à faire dans le tableau de bord Vercel

1. Ouvrir **Vercel → Team → Usage → Deployment Storage** et vérifier la
   répartition par projet.
2. Dans le projet concerné : **Deployments**, puis supprimer les anciens
   déploiements (surtout les previews et les anciennes productions).
   Garder la production actuelle et éventuellement une ou deux versions de
   rollback.
3. Dans **Project → Settings → Build and Deployment → Deployment Retention**,
   définir une durée de conservation courte pour les previews et la production.
4. Vérifier aussi **Functions Storage** dans Usage, ainsi que les autres projets
   du compte : un ancien projet peut consommer le quota.
5. Si le compteur ne baisse pas après suppression, il peut s'agir de stockage
   orphelin : contacter le support Vercel avec l'ID du projet et l'ID de l'équipe.

## 4. Points optionnels

- **Historique Git** : `.git` contient encore d'anciennes images et séquences
  `frame_*.png`. Une réécriture d'historique (`git filter-repo`) réduirait le
  clone, mais elle réécrit les commits et impose un `force-push`. Elle n'est
  **pas nécessaire** pour le quota Vercel et n'a pas été effectuée.
- **Futurs uploads** : les photos ajoutées via l'admin sont actuellement copiées
  telles quelles dans `public/images/uploads`. Il est recommandé de les
  compresser avant le commit (ou d'ajouter plus tard une optimisation `sharp`
  dans l'action d'upload) pour éviter de regonfler le dépôt.
- **Déploiements en double** : préférer l'intégration Git à des déploiements CLI
  répétés depuis le même commit, afin de ne pas accumuler des sorties identiques.
