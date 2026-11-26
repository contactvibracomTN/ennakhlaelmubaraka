# Workflow — création de visuels et rédaction des briefs

**Version :** 2.0 — 24 novembre 2026  
**Type :** règle opérationnelle.  
**Audience :** agent principal, `creative-brief`, `graphic-designer`, `ads-copy-designer`, `qa-editor`, orchestrateur humain.  
**Effet :** il prime sur tout ancien processus de création visuelle contradictoire.

---

## 1. Décisions humaines intégrées

1. **Palette exclusive** : seules les couleurs de `docs/agents/palette-officielle.md` sont autorisées. Aucun autre hex, aucune autre palette.
2. **Signature** : `طعم الكرم من قلب المدينة المنوّرة`, exposée sous la forme éditable `{{SIGNATURE}}` et soumise à validation humaine.
3. **Prix** : l’exigence historique de la Brand Bible relative à la source du prix est annulée pour la production visuelle. Les visuels avec prix relèvent du workflow `docs/agents/workflow-visuels-prix-ads.md` et de l’agent `ads-copy-designer`, activé par le mot clé **`AdsCopy`**.
4. **Calendrier** : planning uniquement. Il ne contient aucun brief créatif, aucune caption ni aucun prompt.
5. **Gemini** : relai de production complet en cas d’impossibilité locale, après validation humaine du prompt.
6. **Blocage du 3 décembre levé** : aucune production ne doit reprendre l’ancien processus ; le nouveau workflow s’applique.

---

## 2. Hiérarchie des sources

| Rang | Source | Rôle exact |
|---:|---|---|
| 1 | `docs/agents/palette-officielle.md` | Couleurs exclusives, décision humaine. |
| 2 | `docs/agents/brand-bible.md` | Identité, ton, interdictions, gouvernance. Autorité de marque, jamais modifiable sans autorisation explicite. |
| 3 | `docs/agents/referentiel-marque-ia.md` | Synthèse opérationnelle et état du projet. |
| 4 | Le présent workflow | Processus, responsabilités, portes de validation. |
| 5 | `docs/agents/workflow-visuels-prix-ads.md` | Processus dédié dès qu’un prix apparaît dans le visuel. |
| 6 | Brief validé par `creative-brief` | Seuls mots autorisés dans le visuel. |
| 7 | `docs/calendrier-editorial-decembre-2026.md` | Planning uniquement : date, canal, format, thème, responsable, statut, courte accroche ou lien vers le brief. |
| 8 | Anciens prompts, anciens visuels, sorties Gemini | Inspiration historique, jamais preuve ni autorisation. |

Dès qu’une source de rang inférieur contredit une source de rang supérieur, l’agent s’arrête et demande validation humaine.

---

## 3. Responsabilités

### 3.1. `creative-brief` — propriétaire des briefs

- Consulte le calendrier, repère les contenus planifiés et rédige les briefs un par un.
- Chaque brief contient : angle éditorial détaillé, message clé, CTA, persona, ton, consignes visuelles, références, mots-clés SEO ou contraintes techniques.
- Propose les champs éditables `{{TITRE}}`, `{{VARIÉTÉ}}`, `{{SIGNATURE}}` et, si nécessaire, `{{PRIX}}`.
- Envoie les briefs à validation humaine, corrige selon le retour, puis transmet les briefs validés à l’orchestrateur.
- Ne modifie aucun fichier et ne produit aucun visuel.

### 3.2. `graphic-designer` — visuels sans prix

- Reçoit le brief validé sans prix.
- Produit un brief de design et un prompt complet permettant de créer le visuel en entier.
- N’utilise que la palette officielle.
- Ne publie pas, ne booste pas et ne lance aucune production sans validation humaine.

### 3.3. `ads-copy-designer` — visuels avec prix

- Activé par le mot clé **`AdsCopy`** lorsque le brief contient un prix.
- Applique `docs/agents/workflow-visuels-prix-ads.md`.
- Fait valider le montant et la formulation du prix avant production.
- Ne publie pas et ne modifie aucune campagne.

### 3.4. `qa-editor` — dernier contrôle

- Relit le visuel proposé et sa caption.
- Vérifie la palette exclusive, l’absence de texte IA résiduel, de superlatif non validé et d’écart de marque.
- Ne modifie aucun fichier et ne publie rien.

### 3.5. Humain — autorité finale

Valide successivement : le brief et ses champs éditables, le prompt, le visuel final, puis la diffusion. Pour un visuel avec prix, le montant est validé en plus avant production.

---

## 4. Pipeline obligatoire

```text
Calendrier (planification seule)
  → creative-brief rédige un brief par publication
  → PORTE 1 : validation humaine du brief, de {{TITRE}}, {{VARIÉTÉ}}, {{SIGNATURE}}
  → orchestrateur choisit la production :
       sans prix → graphic-designer
       avec prix → AdsCopy → ads-copy-designer
  → PORTE 2 : validation humaine du prompt et du prix le cas échéant
  → production locale, ou Gemini en relai complet si nécessaire
  → qa-editor contrôle final
  → PORTE 3 : validation humaine du visuel avant diffusion
```

Aucune étape ne peut être sautée. Aucune publication n’est automatique.

---

## 5. Palette et texte

- Palette exclusive : `#163E2B`, `#D4B376`, `#F7F4EB`, `#1A1A1A`. Aucun autre hex, aucun dégradé, aucune couleur dérivée.
- Logo officiel importé tel quel, jamais généré, redessiné ou recoloré.
- Texte arabe saisi manuellement ; aucun texte généré par IA ne doit rester dans le visuel final.
- Signature `{{SIGNATURE}}` : valeur par défaut `طعم الكرم من قلب المدينة المنوّرة`, éditable et validée par l’humain.
- CTA canonique : `أطلبه الآن على الواتساب`, un seul par visuel, sans flèche, vers `https://wa.me/966596101097`.

---

## 6. Expressions supprimées des visuels sans prix

Dans les visuels sans prix, prompts visuels et maquettes, il est interdit d’insérer l’ancienne mention de disponibilité, l’ancienne mention de prix confirmé en conversation, l’ancienne ligne combinée, ou toute variante équivalente.

Pour les visuels `AdsCopy`, le prix est autorisé uniquement selon `docs/agents/workflow-visuels-prix-ads.md`, avec validation humaine explicite, et sans les anciennes mentions ci-dessus.

---

## 7. Exigence de prompt détaillé

Un prompt conforme décrit au minimum :

1. le rôle et l’objectif ;
2. les champs validés `{{TITRE}}`, `{{VARIÉTÉ}}`, `{{SIGNATURE}}` et, pour AdsCopy, `{{PRIX}}` ;
3. la palette exclusive, sans hex supplémentaire ;
4. les fichiers réels à importer, y compris le logo officiel ;
5. la composition zone par zone ;
6. le texte saisi manuellement après génération ;
7. le CTA canonique, sans flèche ;
8. les interdictions et le prompt négatif ;
9. chaque format avec recomposition, jamais étirement ;
10. la checklist de contrôle avant validation humaine.

Le modèle de référence est `docs/agents/prompt-visuel-mabroum.md`.

---

## 8. Formats et composition

| Usage | Format |
|---|---|
| Feed / carrousel Instagram | 1080×1350 |
| Story / Reel | 1080×1920 |
| Carrousel Facebook | 1080×1080 |
| Bannière Meta | 1200×628 |
| Carrousel | 6 slides maximum sans validation humaine supplémentaire |

Produit réel au centre, information sobre, un seul CTA dans le tiers inférieur. Maximum 10 % d’accent or champagne. Pas de dégradé, bordure dorée, icône clipart ou effet « luxe » excessif.

---

## 9. Gemini — relai de production complet

En cas d’impossibilité de produire le visuel en local :

1. le prompt validé est déposé dans Gemini ;
2. Gemini génère le visuel avec pleine fonctionnalité, sans limitation de rôle ;
3. le visuel est téléchargé dans `docs/creatives/AAAA-MM-JJ/` ;
4. le fichier est renommé avec le titre du brief et la mention `Créé par GEMINI` ;
5. `qa-editor` contrôle le résultat avant validation humaine finale.

Aucun appel à Gemini avant validation humaine du prompt. Le texte arabe final doit être relu et saisi/validé manuellement.

---

## 10. Invalidité des anciens processus

Sont non opposables :

- l’idée que le calendrier contienne un brief créatif ou impose une typographie ou une palette ;
- l’idée qu’un prompt de fond suffise à produire un visuel fini ;
- l’idée que Gemini soit limité au fond, à la lumière et au ratio ;
- l’utilisation de couleurs autres que `docs/agents/palette-officielle.md` ;
- l’insertion d’une ancienne mention de disponibilité ou de prix confirmé en conversation ;
- la réutilisation de l’ancien visuel `visuel-02` ou du lot historique du 24 novembre 2026, tous deux supprimés : aucune production ne peut s’y référer ;
- toute génération directe hors du pipeline ci-dessus.

---

## 11. Enregistrement

Ce document, la palette officielle, les deux workflows et le calendrier sont enregistrés dans `instructions` de `.opencode/opencode.jsonc`. Le calendrier reste un plan éditorial, jamais une autorité de design.

**Toute proposition produite sous ce workflow se termine par : `Aucune action d’écriture effectuée.`**
