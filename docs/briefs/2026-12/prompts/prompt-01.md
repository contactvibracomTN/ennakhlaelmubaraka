# Prompt de production — Brief [01] — Comptoir n°49

**Statut :** proposition de prompt. Aucune génération, aucune publication.  
**Référence :** `docs/briefs/2026-12/brief-01.md` + `docs/agents/prompt-visuel-mabroum.md` + `docs/agents/palette-officielle.md`.  
**Champs validés par l’humain requis avant génération :** `{{TITRE}}`, `{{VARIÉTÉ}}`, `{{SIGNATURE}}`. Valeurs proposées : `{{TITRE}}` = المتجر رقم 49 في سوق التمور المركزي · `{{VARIÉTÉ}}` = عجوة المدينة · `{{SIGNATURE}}` = طعم الكرم من قلب المدينة المنوّرة, champ éditable.

```text
[RÔLE]
Tu es un directeur artistique pour la boutique النخلة المباركة للتمور الفاخرة à Médine. Tu produis le visuel complet, pas une simple plaque de fond.

[OBJECTIF]
Créer une affiche statique complète pour le feed Instagram, ancrée sur un fait vérifiable : le magasin numéro 49 au marché central des dattes de Médine. Aucun récit familial, aucune ancienneté, aucun faux comptoir, aucun employé simulé. Le plateau est présenté comme une sélection du jour, sans emballage ni poids affiché.

[SOURCE DES TEXTES]
Les seuls mots autorisés sont ceux du brief validé : المتجر رقم 49 — سوق التمور المركزي, المتجر رقم 49 في سوق التمور المركزي, عجوة المدينة et {{SIGNATURE}}. La question de la caption est saisie manuellement : أي صنف من التّمور تبحث عنه هذه الأيام؟ اكتبه لنا في التعليق. Aucun autre texte arabe ne doit être inventé. {{SIGNATURE}} reste éditable et soumis à validation humaine.

[CHARTE — NON NÉGOCIABLE]
Respecter docs/agents/palette-officielle.md. Utiliser uniquement : vert émeraude profond #163E2B, or champagne #D4B376, crème sable doux #F7F4EB, noir profond #1A1A1A. Aucune autre couleur, aucun hex supplémentaire, aucune couleur dérivée, aucun dégradé. Maximum 10 % d’or champagne. Pas de bordure dorée, pas d’icône clipart, pas de saturation artificielle, pas d’effet « luxe » excessif. Typographie : Amiri pour le titre, IBM Plex Sans Arabic pour les informations. Le texte arabe ne doit PAS être généré par l’IA : laisser des zones vides et lisibles pour saisie manuelle.

[FICHIERS À IMPORTER]
Logo officiel : public/images/brand/logo-square.png, importé tel quel, jamais généré, jamais recoloré.
Photo de plateau de dattes réelle : fichier à confirmer par la maison avant production. Aucune image de banque présentée comme la boutique. Si aucune photo autorisée n’est fournie, s’arrêter et demander validation humaine.

[COMPOSITION]
Haut : logo officiel importé, discret, avec zone de respiration ; titre المتجر رقم 49 في سوق التمور المركزي saisi manuellement dans une zone libre d’environ 30 %.
Centre : plateau de dattes réel, plan rapproché, texture visible, lumière naturelle douce, ombres courtes, fond crème mat. Pas de visage, pas de main artificielle, pas de décor orientaliste, pas de monument reconstitué.
Bas : ligne sobre المتجر رقم 49 — سوق التمور المركزي puis une seule action : la question « أي صنف من التّمور تبحث عنه هذه الأيام؟ اكتبه لنا في التعليق. ». Aucun bouton WhatsApp dans ce visuel ; le lien https://wa.me/966596101097 reste en caption si l’objectif le justifie et après validation.
Signature : {{SIGNATURE}} en pied si lisible, sinon en caption uniquement.

[TEXTE À SAISIR MANUELLEMENT APRÈS GÉNÉRATION]
Titre المتجر رقم 49 في سوق التمور المركزي
Ligne d’information المتجر رقم 49 — سوق التمور المركزي
Question أي صنف من التّمور تبحث عنه هذه الأيام؟ اكتبه لنا في التعليق
Signature {{SIGNATURE}}
Aucune ligne de disponibilité, aucun prix, aucun poids, aucune promesse de livraison, aucun superlatif.

[INTERDICTIONS ET PROMPT NÉGATIF]
Pas de texte généré par l’IA, pas de logo inventé, pas d’emballage de marque fictif, pas de faux comptoir ni de faux employé, pas de main artificielle, pas de décor présenté comme un lieu réel de la boutique, pas de Coran ni de chapelet ni de minaret, pas de superlatif non validé (الأفضل / الأجود / أفخر تمور المدينة), pas d’allégation santé, pas de prix, pas de flèche, aucun texte français sur le visuel, aucune mention de stock ni de confirmation de prix en conversation, aucune couleur hors palette officielle.

[FORMAT]
Export 1080×1350, ratio 4:5, recomposé pour ce ratio, jamais étiré depuis un autre format. Zones de sécurité respectées. Haute résolution.

[VALIDATION]
Ne pas lancer la production avant validation humaine de {{TITRE}}, {{VARIÉTÉ}}, {{SIGNATURE}}, de la photo source et du prompt complet. Si la production locale est impossible, Gemini est le relai complet : déposer le prompt validé, générer, télécharger dans docs/creatives/AAAA-MM-JJ/, renommer avec le titre du brief et la mention « Créé par GEMINI ». Le texte arabe final est relu et saisi manuellement.
```

## Contrôle avant validation humaine

- [ ] `{{TITRE}}`, `{{VARIÉTÉ}}`, `{{SIGNATURE}}` validés par l’humain.
- [ ] Photo de plateau réelle autorisée par la maison.
- [ ] Logo importé du fichier officiel, pas généré.
- [ ] Texte arabe saisi manuellement et relu.
- [ ] Aucun prix, poids, stock, livraison, superlatif ou texte IA résiduel.
- [ ] Palette exclusive respectée ; aucun dégradé ni bordure dorée.
- [ ] Seule la question apparaît comme action dans le visuel ; pas de bouton WhatsApp.
- [ ] Format recomposé, non étiré.
- [ ] Proposition seulement : aucune publication, boost ou modification de campagne.

Aucune action d’écriture effectuée.
