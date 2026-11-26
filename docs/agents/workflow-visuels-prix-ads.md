# Workflow — visuels avec prix / campagnes AdsCopy

**Version :** 1.0 — 24 novembre 2026  
**Type :** règle opérationnelle dédiée.  
**Activation :** mot clé **`AdsCopy`**.  
**Agent :** `ads-copy-designer`.  
**Effet :** annule, pour la production visuelle, l’exigence historique de la Brand Bible relative à la source du prix. La validation humaine du prix remplace cette exigence.

---

## 1. Périmètre

Ce workflow s’applique dès qu’un visuel doit afficher un prix, une fourchette, une unité de vente ou une information commerciale chiffrée. Il concerne principalement les campagnes Meta Ads, mais s’applique à tout canal.

Un visuel sans prix suit le workflow général `docs/agents/workflow-creation-visuels.md` avec `graphic-designer`.

---

## 2. Annulation de l’exigence Brand Bible prix

La règle historique qui subordonnait un prix visuel à une source commerciale documentée n’est plus opposable à la production visuelle. Elle est remplacée par :

1. le prix est fourni dans le brief par l’humain ou sous sa responsabilité explicite ;
2. le montant, l’unité, la devise et la formulation sont validés par l’humain avant production ;
3. tout changement de prix impose une nouvelle validation ;
4. aucun agent ne peut inventer, déduire, arrondir ou réutiliser un prix ancien.

Cette annulation est limitée à la production visuelle. Elle n’autorise ni modification de prix réel, ni fausse promotion, ni allégation de stock, ni livraison garantie.

---

## 3. Chaîne obligatoire

```text
Calendrier (planification seule)
  → creative-brief rédige le brief avec {{PRIX}} à valider
  → PORTE 1 : validation humaine du brief, du prix et des champs éditables
  → orchestrateur active le mot clé AdsCopy
  → ads-copy-designer produit le prompt complet avec prix validé
  → PORTE 2 : validation humaine du prompt et du montant
  → production locale, ou Gemini en relai complet si nécessaire
  → qa-editor contrôle le visuel
  → PORTE 3 : validation humaine du visuel avant diffusion
```

Aucune étape ne peut être sautée. Aucune production avant validation du prix.

---

## 4. Champs obligatoires du brief AdsCopy

- `{{TITRE}}`
- `{{VARIÉTÉ}}`
- `{{PRIX}}`
- `{{UNITÉ}}`
- `{{DEVISE}}`
- `{{FORMULATION_PRIX}}`
- `{{CTA}}`
- `{{SIGNATURE}}` — valeur par défaut `طعم الكرم من قلب المدينة المنوّرة`, éditable
- `{{FORMAT}}`
- `{{POINTS_À_VALIDER}}`

Tous ces champs sont proposés à validation humaine. Le prix ne doit jamais être figé dans un prompt sans validation.

---

## 5. Règles de mise en page du prix

- Un seul prix par visuel, sauf validation humaine explicite.
- Bloc prix distinct, lisible sur mobile, contrasté, sans surcharge d’or.
- Aucune mention de disponibilité, aucun ancien libellé de confirmation de prix, aucune variante équivalente.
- Le prix est saisi manuellement après génération, comme le reste du texte arabe.
- Pas de flèche dans le CTA.
- Palette exclusive : `#163E2B`, `#D4B376`, `#F7F4EB`, `#1A1A1A`.

---

## 6. Livrable attendu

1. Brief AdsCopy avec prix validé.
2. Prompt complet prêt à coller, y compris le prompt négatif.
3. Checklist de contrôle.
4. Liste des points nécessitant validation humaine.
5. Dernière ligne : `Aucune action d’écriture effectuée.`

Aucune publication, programmation, boost, modification de budget ou de campagne, réponse à commentaire, message WhatsApp ni redéploiement.
