# Prompt de production — Brief [02] — Quatre valeurs

**Statut :** proposition de prompt. Aucune génération, aucune publication.  
**Référence :** `docs/briefs/2026-12/brief-02.md` + `docs/agents/prompt-visuel-mabroum.md` + `docs/agents/palette-officielle.md`.  
**Champs validés par l’humain requis avant génération :** `{{TITRE}}`, `{{SIGNATURE}}`. Valeurs proposées : `{{TITRE}}` = أربع قيم نؤمن بها · `{{VARIÉTÉ}}` = néant, contenu institutionnel · `{{SIGNATURE}}` = طعم الكرم من قلب المدينة المنوّرة, champ éditable.

```text
[RÔLE]
Tu es un directeur artistique pour la boutique النخلة المباركة للتمور الفاخرة à Médine. Tu produis le visuel complet, pas une simple plaque de fond.

[OBJECTIF]
Créer une publication photo paysage pour Facebook présentant quatre façons simples de travailler avec la boutique. Aucune histoire familiale, aucune ancienneté institutionnelle, aucune certification, aucun superlatif. Ton pratique et communautaire.

[SOURCE DES TEXTES]
Les seuls mots autorisés sont ceux du brief validé : متجر لتجارة التمور في قلب سوق التمور المركزي بالمدينة المنورة, نختار الأصناف بأنفسنا، ويسعدنا مساعدتكم عبر واتساب للاستفسار عن الأنواع والكميات, أي من هذه القيم الأربع أقرب إليك؟ قولها لنا في تعليق, puis les quatre blocs 01 أصناف منتقاة / 02 أفكار هدايا للزوار / 03 خدمة عبر واتساب / 04 وضوح في التعامل et le nom officiel النخلة المباركة للتّمور الفاخرة. Signature {{SIGNATURE}} si le pied reste lisible, sinon en caption. Aucun autre texte arabe ne doit être inventé.

[CHARTE — NON NÉGOCIABLE]
Respecter docs/agents/palette-officielle.md. Utiliser uniquement : vert émeraude profond #163E2B, or champagne #D4B376, crème sable doux #F7F4EB, noir profond #1A1A1A. Aucune autre couleur, aucun hex supplémentaire, aucune couleur dérivée, aucun dégradé. Maximum 10 % d’or champagne. Pas de bordure dorée, pas d’icône clipart, pas d’ombre portée artificielle. Typographie : Cairo ou Noto Kufi Arabic pour les quatre blocs, Amiri pour le titre si présent. Le texte arabe ne doit PAS être généré par l’IA : laisser des zones vides et lisibles pour saisie manuelle.

[FICHIERS À IMPORTER]
Logo officiel : public/images/brand/logo-square.png, importé tel quel, jamais généré ni recoloré.
Aucune photo de produit n’est imposée : visuel institutionnel sobre. Si une photo réelle est ajoutée, elle doit être autorisée par la maison et non présentée comme une preuve de lieu ou d’employé.

[COMPOSITION]
Haut : logo officiel discret, titre أربع قيم نؤمن بها saisi manuellement.
Centre : grille 2×2, numéros 01 à 04, marges régulières, une idée par bloc, fond crème dominant, structure vert émeraude, accent or champagne discret. Pas d’icône, pas d’image générée, pas de décor.
Bas : nom officiel النخلة المباركة للتّمور الفاخرة ; signature {{SIGNATURE}} uniquement si lisible. Une seule action : la question « أي من هذه القيم الأربع أقرب إليك؟ قولها لنا في تعليق. ». Aucun bouton, aucune flèche.

[TEXTE À SAISIR MANUELLEMENT APRÈS GÉNÉRATION]
Titre أربع قيم نؤمن بها
Blocs 01 أصناف منتقاة / 02 أفكار هدايا للزوار / 03 خدمة عبر واتساب / 04 وضوح في التعامل
Nom officiel النخلة المباركة للتّمور الفاخرة
Signature {{SIGNATURE}}
Aucune ligne de disponibilité, aucun prix, aucune garantie de rapidité, aucun superlatif.

[INTERDICTIONS ET PROMPT NÉGATIF]
Pas de texte généré par l’IA, pas de logo inventé, pas d’histoire familiale ni d’ancienneté, pas de certification, pas de faux employé, pas de faux comptoir, pas de décor religieux, pas de superlatif non validé (الأفضل / الأجود على الإطلاق / أفخر تمور المدينة), pas d’allégation santé, pas de prix, pas de formule de livraison chiffrée, pas de flèche, aucun texte français sur le visuel, aucune couleur hors palette officielle.

[FORMAT]
Export 1200×628, ratio 1,91:1, composition paysage dédiée ; ne pas étirer un visuel 4:5. Zones de sécurité respectées. Haute résolution.

[VALIDATION]
Ne pas lancer la production avant validation humaine de {{TITRE}}, {{SIGNATURE}}, des quatre valeurs telles qu’elles figurent sur le site et du prompt complet. Si la production locale est impossible, Gemini est le relai complet : déposer le prompt validé, générer, télécharger dans docs/creatives/AAAA-MM-JJ/, renommer avec le titre du brief et la mention « Créé par GEMINI ». Le texte arabe final est relu et saisi manuellement.
```

## Contrôle avant validation humaine

- [ ] `{{TITRE}}` et `{{SIGNATURE}}` validés par l’humain.
- [ ] Quatre valeurs confirmées telles qu’elles figurent sur le site.
- [ ] Logo importé du fichier officiel, pas généré.
- [ ] Texte arabe saisi manuellement et relu.
- [ ] Aucun prix, garantie de rapidité, certification, superlatif ou texte IA résiduel.
- [ ] Palette exclusive respectée ; aucun dégradé ni bordure dorée.
- [ ] Composition paysage dédiée, non étirée.
- [ ] Proposition seulement : aucune publication, boost ou modification de campagne.

Aucune action d’écriture effectuée.
