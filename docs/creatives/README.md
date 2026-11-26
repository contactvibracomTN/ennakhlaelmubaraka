# Visuels statiques — règles du dossier

Ce dossier reçoit les propositions de visuels produites sous le contrôle de l’agent `graphic-designer`, selon `docs/agents/workflow-creation-visuels.md`.

> Les anciens fichiers `template-slide.html`, `visuel-02` et le lot historique du 24 novembre 2026 ont été supprimés le 25 novembre 2026 sur décision humaine. L’ancien flux de génération directe via `/meta-daily` n’est plus opposable : le calendrier est un planning seul et seule la production conforme décrite ci-dessous est autorisée.

## Processus conforme

1. `creative-brief` rédige un brief par publication, révise les textes et propose `{{TITRE}}`, `{{VARIÉTÉ}}` et `{{SIGNATURE}}` (valeur par défaut `طعم الكرم من قلب المدينة المنوّرة`, champ éditable).
2. L’humain valide les textes et les trois champs éditables.
3. Sans prix : `graphic-designer` produit un brief et un prompt complet, sur le modèle de `docs/agents/prompt-visuel-mabroum.md`. Avec prix : `AdsCopy` active `ads-copy-designer` selon `docs/agents/workflow-visuels-prix-ads.md`, et l’humain valide le montant avant production.
4. L’humain valide le prompt avant toute production locale ou externe, y compris Gemini.
5. Gemini est un relai de production complet après validation humaine du prompt, sans limitation au fond, à la lumière ni au ratio. Le texte arabe final est relu et saisi/validé manuellement. Les fichiers générés sont téléchargés ici et renommés avec le titre du brief et la mention `Créé par GEMINI`.
6. Le visuel est produit comme proposition, contrôlé par `qa-editor`, puis validé par l’humain avant diffusion.

## Règles de fond

1. Sources de vérité : `docs/agents/brand-bible.md`, `docs/agents/referentiel-marque-ia.md`, `docs/agents/palette-officielle.md` et `docs/agents/workflow-creation-visuels.md`. Le calendrier `docs/calendrier-editorial-decembre-2026.md` est un planning seul : ni brief, ni caption, ni prompt, ni prix, ni palette, ni fait commercial. Renvoi utile vers `docs/briefs/2026-12/brief-XX.md`.
2. Palette exclusive : `#163E2B`, `#D4B376`, `#F7F4EB`, `#1A1A1A` uniquement. Aucun autre hex, aucune couleur dérivée, aucun dégradé, aucune consigne de palette historique.
3. Signature : `{{SIGNATURE}}`, valeur par défaut `طعم الكرم من قلب المدينة المنوّرة`, champ éditable soumis à validation humaine. Toute ancienne signature suspendue est supprimée.
4. Ne jamais inventer prix, stock, garantie, allégation santé, emballage, preuve ou coordonnée. Aucune fourchette de prix. Dès qu’un prix apparaît, appliquer le point 3 du processus.
5. Logo officiel importé ; texte arabe saisi manuellement ; un seul CTA canonique sans flèche.
6. Aucune mention de disponibilité ni de prix confirmé en conversation dans un visuel. Aucune ancienne mention de disponibilité ni de confirmation de prix, aucun badge de récolte non validé, aucun superlatif non prouvé, aucune formule de livraison chiffrée et aucune fourchette de prix. Se référer à `docs/agents/referentiel-marque-ia.md` pour la liste historique des formulations retirées.
7. Formats : 1080×1080, 1080×1350, 1080×1920, 1200×628. Maximum 6 slides de carrousel sans validation humaine.
8. Gouvernance : préparer et recommander uniquement. Aucune publication, programmation, boost, modification de campagne ou de budget, réponse à commentaire, message WhatsApp, génération de visuel ou redéploiement sans validation humaine explicite et préalable.

Aucune action d’écriture effectuée.

## Nommage suggéré

```text
docs/creatives/AAAA-MM-JJ/angle-01-01x01-proposition.png
docs/creatives/AAAA-MM-JJ/angle-01-04x05-proposition.png
docs/creatives/AAAA-MM-JJ/angle-01-banniere-proposition.png
docs/creatives/AAAA-MM-JJ/titre-du-brief-Cree-par-GEMINI-04x05.png
```

L’ancien visuel `visuel-02` et le lot historique du 24 novembre 2026 ont été supprimés : aucune production ne peut s’y référer. Seule la nouvelle production conforme est autorisée.

Aucune action d’écriture effectuée.
