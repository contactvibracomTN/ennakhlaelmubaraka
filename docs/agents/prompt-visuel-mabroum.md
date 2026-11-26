# Prompt — Visuel variété, 3 formats Meta

**Date :** 24 novembre 2026  
**Référence :** `docs/agents/palette-officielle.md` + `docs/agents/brand-bible.md` + `docs/agents/referentiel-marque-ia.md` + `docs/agents/workflow-creation-visuels.md`  
**Usage :** modèle de prompt complet. Le visuel entier doit être décrit, pas seulement une plaque de fond. Aucune production, locale ou externe, sans validation humaine des champs ci-dessous. Aucune publication automatique.

> **Champs éditables par `creative-brief` uniquement :** `{{TITRE}}`, `{{VARIÉTÉ}}`, `{{SOUS_TITRE}}`, `{{ORIGINE}}`, `{{SIGNATURE}}`. Chaque champ est proposé à la validation humaine avant production, y compris avant un appel à Gemini.
>
> **Signature :** valeur par défaut `طعم الكرم من قلب المدينة المنوّرة`. Le champ `{{SIGNATURE}}` doit rester éditable dans tout prompt soumis à validation.
>
> **Prix :** ce modèle concerne les visuels sans prix. Dès qu’un prix apparaît, l’orchestrateur active le mot clé `AdsCopy` et `docs/agents/workflow-visuels-prix-ads.md`.
>
> **Format :** « 1:19:1 » est interprété comme le format Meta standard **1,91:1** (1200×628).

---

## 1. Fichiers du dossier à utiliser

Dossier : `C:\Users\BY 4\Desktop\النّخلة المباركة للتّمور بالمدينة المنوّرة\Contenu\mabroum مبروم-`

Les noms ci-dessous sont des exemples pour Mabroum. Les remplacer par les fichiers réels de la variété `{{VARIÉTÉ}}` après validation humaine.

| Rôle | Fichier exact | Dimensions |
|---|---|---|
| **Photo produit principale** | `مبروم درجة أولى-صور حقيقيّة من متجرنا.jpeg` | 960×1280 |
| Gros plans de texture | `Mabrum dates.jpeg` (554×554), `Mabrum dates 02.jpg` (612×408), `Mabrum dates - 03.jpg` (540×360), `9bcb7d26abed-92734.jpg` (1194×800), `mabroum premium - مبروم فاخر 03.webp` (1024×782) | — |
| Gabarit 1:1 | `Mabroum dattes ad copy.jpg` | 1000×1000 |
| Gabarit 1,91:1 | ancien gabarit historique au nom fautif, non réutilisé | 2112×1104 |
| Gabarit 9:16 | `تمر المبروم الفاخر.jpeg` | 768×1376 |

⚠️ Les anciens noms de gabarits comportaient une faute de variété : ne jamais la reproduire dans le visuel. Utiliser uniquement le nom exact de la variété `{{VARIÉTÉ}}` validée.

---

## 2. Prompt maître — à copier après validation humaine

```text
[RÔLE]
Tu es un directeur artistique pour la boutique النخلة المباركة للتمور الفاخرة à Médine. Tu produis le visuel complet, pas une simple plaque de fond.

[OBJECTIF]
Créer une affiche publicitaire complète pour la variété {{VARIÉTÉ}}, avec le titre {{TITRE}}, dans le langage visuel de la marque : titre en haut, produit réel au centre, information sobre, bouton CTA vert sans flèche, signature {{SIGNATURE}} si le format le permet. Le produit est importé depuis les photos réelles fournies ; aucune preuve commerciale n’est fabriquée.

[SOURCE DES TEXTES]
Les seuls mots autorisés sont ceux de la fiche validée par creative-brief : {{TITRE}}, {{VARIÉTÉ}}, {{SOUS_TITRE}}, {{ORIGINE}}, {{SIGNATURE}} et le CTA canonique. Aucun autre texte arabe ne doit être inventé. {{SIGNATURE}} est un champ éditable soumis à validation humaine.

[CHARTE — NON NÉGOCIABLE]
Respecter docs/agents/palette-officielle.md. Utiliser uniquement les quatre couleurs suivantes : vert émeraude profond #163E2B, or champagne #D4B376, crème sable doux #F7F4EB, noir profond #1A1A1A. Aucune autre couleur, aucun autre hex, aucune couleur dérivée, aucun dégradé. Maximum 10 % d’or champagne. Pas de bordure dorée, pas d’icône clipart, pas de saturation artificielle. Typographie : Amiri pour le titre arabe, IBM Plex Sans Arabic ou Cairo pour les informations validées. Le texte arabe ne doit PAS être généré par l’IA : laisse des zones vides et lisibles pour saisie manuelle ensuite.

[FICHIERS À IMPORTER]
Image principale : la photo réelle validée de {{VARIÉTÉ}}.
Gros plans de texture : les gros plans réels validés.
Gabarits de composition : 1:1, 1,91:1 et 9:16 fournis.
Logo officiel : fichier officiel importé, jamais généré, jamais recoloré.
Ne recopie aucun texte présent dans ces gabarits. Ne reproduis aucune faute historique relevée dans les anciens noms de fichiers.

[COMPOSITION]
Haut : logo officiel importé, puis zone libre d’environ 30 % pour {{TITRE}} en Amiri.
Centre : le produit {{VARIÉTÉ}} occupe 55 à 60 % de la surface, en plan rapproché, peau et texture visibles. Lumière naturelle douce, ombres courtes, fond mat validé, profondeur de champ faible. Aucune main artificielle, aucun décor présenté comme le comptoir de la boutique.
Bas : une seule information validée par creative-brief, puis un seul bouton CTA vert émeraude #163E2B avec texte crème #F7F4EB, sans flèche.
Signature : {{SIGNATURE}} placée sobrement si le format le permet ; sinon en caption uniquement.
Pied : vide pour une diffusion Meta Ads. Pour une publication organique seulement, coordonnées lisibles ; jamais un numéro minuscule.

[TEXTE À SAISIR MANUELLEMENT APRÈS GÉNÉRATION]
Titre : {{TITRE}}
Variété : {{VARIÉTÉ}}
Sous-titre : {{SOUS_TITRE}}
Origine : {{ORIGINE}} — uniquement si prouvée et validée ; sinon supprimer ce champ.
Signature : {{SIGNATURE}}
CTA : أطلبه الآن على الواتساب
Lien en caption uniquement : https://wa.me/966596101097
Aucune ligne de disponibilité, aucune ligne de prix, aucune mention de confirmation de prix dans la conversation.

[INTERDICTIONS ET PROMPT NÉGATIF]
Pas de texte généré par l’IA, pas de logo inventé, pas d’emballage de marque fictif, pas de faux comptoir ni de faux employé, pas de main artificielle, pas de décor présenté comme un lieu réel de la boutique, pas de canapé ni d’ordinateur présenté comme notre intérieur, pas de Coran ni de chapelet ni de minaret, pas de superlatif non validé (الأفضل / الأجود على الإطلاق), pas d’allégation santé, pas de prix dans ce modèle, pas de flèche dans le CTA, aucun texte français sur le visuel, aucune mention de stock ou de prix confirmé en conversation, aucune variante de ces mentions, aucune couleur hors palette officielle.

[FORMAT]
Voir le bloc de format ci-dessous. Respecter les zones de sécurité. Export haute résolution. Un changement de ratio impose une recomposition, jamais un étirement.

[VALIDATION]
Ne pas lancer la production avant validation humaine de {{TITRE}}, {{VARIÉTÉ}}, {{SIGNATURE}} et du prompt complet. Si la production locale est impossible, Gemini est le relai de production complet : déposer le prompt validé, générer, télécharger dans le dossier concerné, renommer avec le titre du brief et la mention « Créé par GEMINI ».
```

---

## 3. Blocs de format — à ajouter après le prompt maître

### 3.1. Carré — 1:1, 1080×1080

```text
[FORMAT 1:1]
Export 1080x1080. Produit {{VARIÉTÉ}} importé, plan de table clair, lumière douce venant de gauche, 30 % d’espace vide en haut pour {{TITRE}} saisi manuellement. Produit centré, légèrement décalé vers le bas. CTA centré dans le tiers inférieur, fond #163E2B, texte #F7F4EB, sans flèche. Logo officiel en haut à gauche, petit. Signature {{SIGNATURE}} en bas si lisible. Aucun texte généré par l’IA. Aucune information de prix ou de disponibilité.
```

### 3.2. Bannière — 1,91:1, 1200×628

```text
[FORMAT 1,91:1]
Export 1200x628. Ne pas étirer le visuel carré : recomposer en paysage. Produit à gauche sur 55 % de la largeur, fond crème #F7F4EB, gros plan sur la texture de {{VARIÉTÉ}}. Zone texte à droite sur 45 %, titre {{TITRE}} en haut, sous-titre {{SOUS_TITRE}} en dessous, CTA en bas à droite de la zone texte. Logo officiel en haut à gauche. Signature {{SIGNATURE}} discrète si lisible. Aucune ligne de prix ni de disponibilité. Pas de bordure dorée, pas de dégradé, pas d’icône camion. Aucun texte généré par l’IA.
```

### 3.3. Vertical — 9:16, 1080×1920

```text
[FORMAT 9:16]
Export 1080x1920. Ne pas recadrer le carré : recomposer. Zone de sécurité de 250 px en haut et en bas. Titre {{TITRE}} en haut, produit {{VARIÉTÉ}} au centre sur 60 % de la hauteur, lumière rasante du haut, fond crème #F7F4EB, ombre courte. Sous-titre {{SOUS_TITRE}} au-dessus du CTA. CTA centré à 80 % de la hauteur, fond #163E2B, texte #F7F4EB, sans flèche. Logo officiel en haut, petit. Signature {{SIGNATURE}} au-dessus du pied si lisible. Aucun décor inventé, aucun texte généré par l’IA, aucune mention de prix ou de stock.
```

---

## 4. Contrôle avant validation humaine

- [ ] `{{TITRE}}`, `{{VARIÉTÉ}}`, `{{SOUS_TITRE}}`, `{{ORIGINE}}` et `{{SIGNATURE}}` ont été proposés par `creative-brief` et validés par l’humain.
- [ ] Le logo est importé du fichier officiel, pas généré.
- [ ] Le texte arabe est saisi manuellement et relu : titre, variété, sous-titre, signature, CTA.
- [ ] Aucune ligne de disponibilité, de prix ou de confirmation de prix n’apparaît sur le visuel.
- [ ] Aucune faute de variété, aucun prix non validé, aucune flèche `←` ni texte français résiduel.
- [ ] Un seul CTA, sans flèche, `#163E2B` / `#F7F4EB`.
- [ ] Aucune couleur hors palette officielle : `#163E2B`, `#D4B376`, `#F7F4EB`, `#1A1A1A`.
- [ ] Aucun emballage, comptoir, employé ou décor présenté comme réel sans preuve.
- [ ] Chaque format a été recomposé, pas étiré.
- [ ] Si Gemini a été utilisé, le fichier porte le titre du brief et la mention `Créé par GEMINI`.
- [ ] Livré comme proposition : aucune publication, boost ou modification de campagne.

---

## 5. Gouvernance

Ce prompt est un modèle. Il ne constitue pas une autorisation de production. Toute production locale ou externe suppose la validation humaine préalable des champs éditables et du prompt complet, conformément à `docs/agents/workflow-creation-visuels.md`.

**Aucune action d’écriture effectuée.**
