# Guide d'utilisation du panneau d'administration

> Document destiné au propriétaire du projet (non technique). Le panneau permet de
> modifier vous-même les produits, catégories, articles, fiches du guide des dattes,
> questions fréquentes et textes du site, de les traduire automatiquement et de les
> publier.

---

## 1. Accéder au panneau

1. Ouvrez l'adresse du site : `https://<votre-domaine>/admin` (en local : `http://localhost:3000/admin`).
2. Saisissez le **mot de passe d'administration**.

> **Première utilisation** : si aucun mot de passe n'existe encore, le panneau en
> génère un automatiquement et l'affiche à l'écran de connexion. Notez-le dans un
> endroit sûr. Il est stocké dans le projet (dossier `.admin/`).
> Pour le changer, modifiez la variable `ADMIN_PASSWORD` dans `.env.local` puis
> redémarrez le serveur.

---

## 2. Le principe en 5 étapes

Chaque contenu du site suit le même cycle de travail :

| Étape | Action | Où |
|---|---|---|
| 1 | **Créer ou modifier** un contenu (produit, article, fiche du guide, texte…) | Écrans « Dattes », « Cadeaux », « Catégories », « Articles », « Guide des dattes », « Textes », « FAQ » |
| 2 | **Rédiger en arabe** (langue source) | Onglets de langue dans chaque écran |
| 3 | **Traduire automatiquement** vers les 7 autres langues | Bouton doré « ✨ Traduire automatiquement » |
| 4 | **Valider chaque langue** par un humain | Pastilles de validation sous chaque champ |
| 5 | **Déployer** (publier) | Bouton « ▶ Déployer » (écran « Déploiement ») |

> ⚠️ **Rien n'apparaît sur le site public tant qu'un déploiement n'a pas eu lieu.**

---

## 3. Gérer les produits et articles

### Dattes et Cadeaux
- **Liste** : colonne de gauche → « Dattes » ou « Cadeaux ». Cliquez sur un produit pour l'éditer
  ou sur « + Nouveau produit ».
- **Édition** : tous les champs sont en français ; les textes sont saisis **par langue**
  (copie arabe, traductions machine dans les autres langues).
- **Prix, poids, images** : prix en riyal saoudien (SAR), options de poids ajoutables,
  images via le bouton « + » (importer depuis l'écran « Images »).
- **Étiquettes** : le statut « demo » affiche les prix comme exemples indicatifs.
  - Sans statut « validated »/« published », le produit n'apparaît pas sur les listes publiques.

### Catégories
- Un seul écran : les catégories des dattes et des cadeaux, avec leur titre et leur résumé
  dans chaque langue. Réordonner = saisir un numéro dans « ordre ».

### Articles de blog
- Les articles sont composés de **sections**, elles-mêmes de **blocs** :
  paragraphe, liste, citation, tableau, appel à l'action (CTA WhatsApp).
- Chaque bloc se traduit et se valide comme le reste.
- La FAQ d'un article se gère au bas de la page de l'article.

### Guide des dattes
- Écran « Guide des dattes » : **19 fiches** qui présentent les variétés (histoire,
  goût, points forts, nutrition, photo). C'est du contenu **éditorial** : le guide
  n'affiche **aucun prix**.
- Chaque fiche se remplit comme un article : titre, phrase d'accroche, origine,
  introduction, goût, points forts, frise historique, nutrition, liens utiles.
  Écrivez en arabe, cliquez « ✨ Traduire automatiquement », relisez le français et
  l'anglais, puis validez les langues.
- Section « 8. Boutique » : si la variété est **vendue sur le site**, choisissez le
  produit lié. Un bouton vers la boutique et un bouton **WhatsApp** (message déjà
  pré-rempli avec le nom du produit) apparaissent alors sur la fiche. Laissez
  « Pas vendu sur le site » pour les variétés qui ne sont pas en vente.
- Le texte du bouton boutique se personnalise par langue (« اطلبها الآن »,
  « تذوّقها الآن », « احصل عليها الآن »…). Laissez vide pour le texte par défaut.
- Les fiches du guide **ne bloquent pas la porte de déploiement** : elles peuvent
  être complétées progressivement sans empêcher de publier le reste du site.

### FAQ du site
- Écran « FAQ » : une question/réponse est ajoutée **pour les 8 langues d'un coup** ;
  vous la rédigez en arabe puis cliquez « ✨ Traduire » pour remplir les autres.

### Textes du site
- Écran « Textes » : affichettes, héros, navigation, sections, pied de page…
- Choisissez une **section** (ex. `hero`), modifiez une clé par langue, ou traduisez
  toute la section d'un clic.
- Une console JSON (bouton `{}`) permet de coller un bloc entier si vous y êtes à l'aise.

---

## 4. La traduction automatique (Google Cloud Translate)

- Les boutons « ✨ Traduire » appellent Google Cloud Translation et remplissent les
  7 autres langues en **brouillons machine**.
- **Sans clé API, ces boutons sont désactivés** (message explicite dans le panneau).
- Pour les activer, il faut créer une clé (une seule fois) :
  1. Console Google Cloud → activer « Cloud Translation API » ;
  2. « Identifiants » → « Créer des identifiants » → « Clé API » ;
  3. Copier la clé dans le fichier `.env.local` du projet :
     `GOOGLE_TRANSLATE_API_KEY=votre_cle`
  4. Redémarrer le serveur.
- Les **noms réels des produits** (glossaire) ne sont jamais traduits n'importe comment :
  le système retraduit en priorité les noms officiels du catalogue.

---

## 5. La validation par langue

Sous chaque champ localisé, une **pastille** indique l'état de la langue :

- 🟢 **Validé** — relu et approuvé par un humain.
- 🟠 **Machine** — traduction automatique **à relire** : elle n'est PAS comptée comme
  validée tant que vous n'avez pas cliqué « valider ».
- 🔴 **Absent** — aucun texte.

> Cliquez « valider » sur une version que vous avez vérifiée : c'est elle qui
> débloque le déploiement. Une traduction machine laissée sans validation bloque
> la publication (c'est voulu — pariez sur la qualité).

---

## 6. Déployer (publier)

L'écran « Déploiement » affiche la **porte de complétude** :
- 🟢 **Tout est validé** → cliquez « ▶ Déployer ».
- 🔴 **Incomplet** → la porte liste ce qui manque (langues à valider, clés de textes
  absentes, FAQ inégale). Complétez puis revenez.

Le déploiement : vérifie le code → prend un **instantané de sauvegarde**
(`.backup/before-deploy-…`) → recompile le site → redémarre le serveur.

> Le site est **brièvement indisponible** (1 à 3 minutes) pendant la recompilation.
> Rafraîchissez la page ensuite : les changements sont en ligne.
> Il existe un bouton « forcer » (journalisé) réservé aux cas urgents — utilisez-le
> avec parcimonie.

---

## 7. Les sauvegardes et la restauration

Le projet **n'utilise pas git** : la protection repose sur des **copies horodatées**
dans le dossier `.backup/` du projet.

- **À chaque enregistrement** : copie horodatée des fichiers de contenu.
- **À chaque déploiement** : instantané complet `before-deploy-…`.
- Écran « Sauvegardes » : choisissez un instantané ou un fichier et cliquez
  « ↔ Restaurer », puis **relancez un déploiement** pour appliquer au site public.

> Durée de conservation : 40 sauvegardes par fichier (les plus anciennes sont
> supprimées automatiquement).

---

## 8. Le journal d'audit

L'écran « Journal » liste tout ce qui a été fait sur le panneau (qui, quoi, quand) :
connexions, enregistrements, suppressions, traductions, validations, déploiements,
restaurations. Il est enregistré dans `logs/admin-audit.jsonl`.

---

## 9. Les images

L'écran « Images » :
- **Importer** une nouvelle image (dossier « uploads », **10 Mo max** : JPG, PNG,
  WebP, GIF ou SVG) → « copier le chemin » ;
- Coller ce chemin dans un produit, un cadeau ou un article (champ d'image).
- Les photos existantes des dattes, cadeaux et articles y sont visibles et leur
  chemin prêt à copier.

---

## 10. Questions fréquentes

**« Mes modifications n'apparaissent pas sur le site. »**
Enregistrer ne publie rien : faites un déploiement (étape 6). Vérifiez aussi que le
statut du contenu n'est pas « draft » (brouillon) ou « demo » sans validation.

**« Les pastilles restent oranges même après enregistrement. »**
Les versions « machine » doivent être validées par un clic explicite (« valider »)
dans l'onglet de la langue concernée. C'est volontaire.

**« J'ai fait une erreur, comment revenir en arrière ? »**
Écran « Sauvegardes » → restaurer l'instantané d'avant le déploiement → redéployer.

**« Le bouton Traduire est grisé. »**
Clé API Google manquante — voir section 4.

**« Où sont stockées les données ? »**
Contenus : `src/lib/data/content/*.json` · Textes : `src/messages/*.json` ·
État de validation : `src/lib/admin/state.json` · Journal : `logs/admin-audit.jsonl` ·
Sauvegardes : `.backup/` · Secrets : `.admin/` (et `.env.local`).

---

*Panneau d'administration nakhla-v3 — pour toute question technique, contactez le développeur.*