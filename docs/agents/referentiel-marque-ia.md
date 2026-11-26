# Référentiel de marque unifié — agent IA

**Version :** 1.1  
**Date :** 24 novembre 2026  
**Type :** référence opérationnelle en lecture seule  
**Audience :** agent principal, sous-agents marketing/contenu/création/QA, orchestrateur humain  
**Rôle :** synthèse unique et actionnable pour l’agent IA en construction. Il ne remplace pas la Brand Bible ; il la rend utilisable avec l’état réel du projet.

> Règle absolue : aucun agent ne modifie `docs/agents/brand-bible.md`, ce référentiel, les permissions d’un autre agent, ni un fait commercial sans validation humaine.

---

## 0. Hiérarchie des sources et limites de cette consolidation

### 0.1. Ordre d’autorité

| Rang | Source | Autorité |
|---:|---|---|
| 1 | `docs/agents/brand-bible.md` v2.2 | Identité, ton, interdictions, gouvernance. **Prévaut toujours.** |
| 2 | Le présent document | Synthèse opérationnelle, état du projet, contrat d’agent. |
| 3 | `docs/calendrier-editorial-decembre-2026.md` | Plan éditorial de décembre, formats, textes arabes de travail. |
| 4 | `src/lib/config/site.config.ts` et `src/lib/content/privacy-policy.ts` | Faits de site, coordonnées, consentement, limitation technique. |
| 5 | `docs/meta-integration-plan.md` et `docs/agent-contenu-quotidien.md` | État Meta, périmètre MCP, phases non activées. |
| 6 | `docs/agents/referentiel-visuel-gemini.md`, `prompt-visuel-mabroum.md` | Retours d’expérience visuels. **Jamais source de prix, stock, lieu ou preuve.** |
| 7 | Lectures MCP en direct | État d’accès au moment T. Ne remplace pas une validation commerciale. |
| 8 | Anciennes publications, prompts IA, discussions externes | Matériau historique. Aucune valeur de vérité. |

### 0.2. Limites assumées

- La conversation ChatGPT externe ouverte lors de la session précédente demandait une connexion. Elle n’a **pas** pu être relue intégralement et n’est donc pas intégrée comme source. Si elle est collée ou exportée, une passe de réconciliation supplémentaire sera nécessaire.
- Les échanges Gemini déjà analysés dans `referentiel-visuel-gemini.md` sont intégrés comme retour d’expérience, pas comme faits.
- Les visuels ne peuvent pas être inspectés pixel par pixel dans cet environnement. Le contrôle humain reste obligatoire avant diffusion.
- `context/facts/site-produits.md`, référencé par la Brand Bible, n’existe pas encore dans le dépôt. Tant qu’il n’est pas créé, les fourchettes de prix lues sur le site restent **indicatives**, et poids, stock et conditionnement restent **non confirmés**.
- Aucun secret Meta n’est inclus ici. Les tokens restent côté serveur, sans préfixe `NEXT_PUBLIC_`.

---

## 1. Identité de la marque

### 1.1. Fiche officielle

| Champ | Valeur |
|---|---|
| Nom officiel | النخلة المباركة للتّمور الفاخرة |
| Forme courte | النخلة المباركة |
| Nom anglais | Al Nakhlah Al Mubarakah — Premium Dates |
| Entreprise | شركة النخلة المباركة للتجارة |
| Pays | Arabie saoudite |
| Ville | Médine / المدينة المنوّرة |
| Point de vente | المتجر رقم 49، سوق التمور المركزي، حي الوبرة، المدينة المنورة 42371 |
| Adresse EN | Shop No. 49, Central Dates Market, Al Wabra, Madinah 42371, Saudi Arabia |
| Lien carte | Valeur `address.mapsUrl` dans `site.config.ts` ; ne pas improviser de lien. |
| Signature | طعم الكرم من قلب المدينة المنوّرة |
| WhatsApp | +966 59 610 1097 |
| Lien WhatsApp | `https://wa.me/966596101097` |
| E-mail | nakhla.mubaraka26@gmail.com |
| Site | `https://ennakhlaelmubaraka.com` |
| Facebook | `https://www.facebook.com/AlNakhlahAlMubarakahLitoumour` |
| Instagram | `@nakhla_mubaraka` |
| TikTok | `@nakhlamubaraka` |
| Snapchat | lien configuré dans `site.config.ts` |

### 1.2. Statut de la signature

La signature retenue par décision humaine est `طعم الكرم من قلب المدينة المنوّرة`. Elle remplace toute ancienne signature suspendue ou implémentée techniquement dans le site.

Décision opérationnelle :

- signature publique autorisée sous réserve de validation humaine du champ éditable `{{SIGNATURE}}` dans chaque brief et chaque prompt ;
- valeur par défaut : `طعم الكرم من قلب المدينة المنوّرة` ;
- le champ `{{SIGNATURE}}` reste modifiable pour tout éventuel changement ;
- le post [19] du calendrier utilise cette signature, sous la forme d’un champ validé avant production.

### 1.3. Positionnement

Boutique de dattes **implantée à Médine**, spécialisée dans le choix et la vente de dattes saoudiennes, avec relation commerciale directe, commande par WhatsApp et présence numérique progressive.

La marque ne doit pas être présentée comme :

- producteur agricole ou propriétaire de palmeraies ;
- fabricant industriel ;
- héritage familial de plusieurs générations ;
- entreprise disposant de certifications, récompenses ou partenariats non prouvés.

### 1.4. Publics

1. **Habitants de Médine** — consommation personnelle, famille, variétés spécifiques, quantités adaptées. Arabe saoudien naturel, ton chaleureux.
2. **Visiteurs de Médine** — achat avant le départ, cadeaux, découvertes, expédition possible. Ne jamais supposer nationalité, religion ou langue.
3. **Clients à distance** — renseignement et commande depuis une autre ville ou un autre pays. Expliquer les modalités sans promettre une disponibilité universelle.

---

## 2. Faits confirmés, indicatifs et interdits

| Catégorie | État | Règle pour l’agent |
|---|---|---|
| Nom, adresse, WhatsApp, handle Instagram, site | Confirmés par `site.config.ts` | Réutilisables tels quels. |
| Signature de marque | Décision humaine : `طعم الكرم من قلب المدينة المنوّرة` | Champ éditable `{{SIGNATURE}}`, proposé à validation humaine dans chaque brief et chaque prompt. |
| عجوة المدينة et سكري القصيم | Produits prioritaires confirmés par la Brand Bible | Sous réserve de disponibilité réelle. |
| صفاوي، مجدول، خلاص، دقلة نور | Exemples connus, à confirmer | Ne pas afficher comme toujours disponibles. |
| Valeurs de prix historiques non validées | Non validées | Interdites. Aucune réutilisation, y compris pour le Mabroum. |
| Fourchettes indicatives lues sur le site | Indicatives, à confirmer | Réutilisation uniquement sous validation humaine explicite du montant. Pour un visuel avec prix, suivre `docs/agents/workflow-visuels-prix-ads.md`. |
| Poids, stock, promos, certifications | Non confirmés dans le dépôt | Ne jamais inventer. Toute mention publique exige une validation humaine explicite. |
| Livraison gratuite | Condition chiffrée lue sur le site à Médine | Uniquement avec la condition exacte et après vérification. Jamais en règle générale, ni chiffre réutilisé sans validation. |
| Expédition nationale/internationale | Dépend de la destination et du service | Ne jamais garantir délai, coût ou disponibilité universelle. |
| Avis, témoignages, chiffres de satisfaction | Non confirmés | Interdits sauf source_validée_humaine. Les avis publics du site sont gérés par l’admin, pas inventés par l’agent. |
| Origine géographique d’un produit | Doit être prouvée | Ne pas confondre lieu de vente (Médine) et origine de la datte. |
| Allégations santé | Interdites | Aucun « guérit », « prévient », « effet médical », « remplace un traitement ». |
| Badge de récolte non validé | Non validé | À supprimer des propositions, malgré sa présence dans certaines publications historiques et chez Gemini. |

---

## 3. Voix et ton

### 3.1. Personnalité

Chaleureuse, accueillante, simple, authentique, respectueuse, professionnelle, commerciale sans agressivité.

Éviter : clichés touristiques ou religieux, suffisance, ton publicitaire générique, emphase artificielle.

### 3.2. Règles rédactionnelles

- Phrases courtes, une idée par phrase, vocabulaire accessible.
- Arguments concrets avant adjectifs.
- Une question ou une action simple par publication, liée à l’objectif réel.
- Captions publiques en arabe simple ; français réservé aux briefs internes.
- Hashtags : 5 à 8 sur Instagram, 2 à 3 sur Facebook. La pertinence prime.
- Carrousel : maximum 6 slides. Au-delà, validation humaine obligatoire.
- Ne pas traduire littéralement les idiomatismes. Faire relire les traductions importantes.

### 3.3. Usage de « فاخر »

Autorisé dans le nom officiel et les formulations institutionnelles validées. Interdit comme supériorité objective non démontrée :

- `الأفضل في المملكة`
- `الأجود على الإطلاق`
- `أفخر تمور المدينة`
- `رقم واحد في السعودية`

Les anciennes formules suspendues ou non validées ne sont pas réutilisables telles quelles. Seules les formulations validées dans les briefs et les règles de ton peuvent être employées.

---

## 4. Direction artistique

### 4.1. Palette officielle — décision humaine du 24 novembre 2026

Seules les couleurs de `docs/agents/palette-officielle.md` sont autorisées pour tout visuel :

| Rôle | Hex |
|---|---|
| Vert émeraude profond | `#163E2B` |
| Or champagne | `#D4B376` |
| Crème sable doux | `#F7F4EB` |
| Noir profond / charcoal | `#1A1A1A` |

Répartition recommandée : 60 % fond clair / 30 % vert structurant / 10 % maximum d’or champagne.

Interdits : toute autre couleur ou hex, couleur dérivée, dégradé, bordure dorée, icône clipart, saturation artificielle, effet « luxe » excessif. Le logo officiel est importé tel quel, jamais recoloré.

### 4.2. Typographie

- Titre émotionnel : **Amiri**.
- Informations, prix, CTA, coordonnées : **IBM Plex Sans Arabic**.
- Infographies / carrousels quand le calendrier l’impose : **Cairo** ou **Noto Kufi Arabic**.
- Le texte arabe est **saisi manuellement**. Aucun texte généré par IA ne doit rester dans un visuel final.

### 4.3. Logo

- Source officielle : `public/images/brand/logo-square.png`.
- Le lot historique du 24/11, y compris sa copie du logo, a été supprimé ; seule la source officielle est utilisée.
- Règle : importer le fichier officiel. Jamais le redessiner, le recolorier ou laisser une IA le générer.
- Placement retenu : discret en haut, avec zone de respiration.

### 4.4. Composition type

1. Logo officiel en haut.
2. Titre court, zone libre d’environ 30 %.
3. Produit au centre, texture visible.
4. Ligne d’information sobre : disponibilité et prix non promis.
5. Un seul CTA dans le tiers inférieur.
6. Pied de contact lisible si le format le permet ; sinon coordonnées en caption uniquement.

### 4.5. Photographie et images IA

Privilégier : photos réelles, lumière naturelle ou douce, textures crédibles, fond neutre, ombres courtes, compositions sobres.

Interdire comme preuve : faux comptoir, faux employé, faux avis, emballage de marque inventé, monument ou décor religieux reconstitué, main artificielle, palmeraie présentée comme celle de la maison.

Les photos de banque sont autorisées uniquement comme illustration et doivent porter `صورة توضيحية`. Les images IA sont des prototypes de composition/lumière, jamais des documents probants.

### 4.6. Rôle exact de Gemini

Gemini peut proposer :

- une plaque de fond ;
- une variante d’éclairage ;
- une recomposition de ratio.

Gemini ne doit **jamais** produire :

- le logo ;
- le texte arabe ;
- le numéro de téléphone ;
- le handle Instagram ;
- un prix ;
- un produit présenté comme réel ;
- un emballage ou un lieu présenté comme appartenant à la maison.

Le prompt de référence est `docs/agents/prompt-visuel-mabroum.md`. La composition finale reste produite avec le logo officiel et le texte saisi manuellement.

### 4.7. Formats

| Usage | Format |
|---|---|
| Feed Instagram | 4:5 — 1080×1350 |
| Story / Reel | 9:16 — 1080×1920 |
| Carrousel Facebook | 1:1 — 1080×1080 |
| Carrousel Instagram | 4:5 — 1080×1350 |
| Bannière Meta | 1,91:1 — 1200×628 |
| Carrousel | 6 slides maximum |

`1:19:1` doit être lu comme `1,91:1`. Un changement de ratio implique recomposition et relecture du texte, jamais simple étirement.

### 4.8. Lot visuel historique du 24 novembre 2026

Le lot `origin-*`, `family-*` et ses gabarits associés ont été supprimés le 25 novembre 2026 sur décision humaine. Aucun fichier de ce lot ne peut servir de référence de production, de prix, de lieu ou de preuve.

Le pied de visuel validé reste `+966 59 610 1097  •  @nakhla_mubaraka`, lisible ou reporté en caption selon le format.

---

## 5. CTA et coordonnées

### 5.1. CTA canonique

- Texte : `أطلبه الآن على الواتساب`
- Couleur : fond `#163E2B`, texte `#F7F4EB`
- Flèche : aucune
- Nombre : un seul CTA par visuel
- Destination : `https://wa.me/966596101097`

Variante féminine historique `أطلبها الآن على الواتساب` : à éviter sauf validation produit dédiée. La forme masculine ci-dessus reste la forme par défaut du lot validé.

### 5.2. Coordonnées

- Forme canonique du numéro : `+966 59 610 1097`
- Lien : `https://wa.me/966596101097`
- Handle : `@nakhla_mubaraka`

Règle de pied de visuel :

- règle du référentiel visuel Gemini : retirer les coordonnées si elles sont trop petites ;
- exception validée pour le lot du 24/11 : pied lisible sur les six formats ;
- pour tout nouveau format, conserver la lisibilité mobile ou déplacer les coordonnées en caption. Ne jamais afficher un numéro minuscule ;
- la Brand Bible n’impose pas le retrait : elle exige seulement une adresse ou un lien cartographique officiel validé pour les indications de déplacement.

### 5.3. Phrases de sécurité commerciale

- `صورة توضيحية` pour une image de banque.

Les anciennes formules de disponibilité et de confirmation de prix en conversation sont supprimées de tous les visuels et prompts. Une information commerciale n’est affichée qu’après validation humaine explicite, selon `docs/agents/workflow-visuels-prix-ads.md` pour les prix.

---

## 6. Règles commerciales, juridiques et techniques

### 6.1. Source des faits commerciaux

Ordre à respecter :

1. registre commercial actualisé validé par un responsable ;
2. confirmation humaine récente ;
3. informations officielles de l’entreprise ;
4. site web vérifié ;
5. anciennes publications : contexte historique seulement.

Le fichier attendu `context/facts/site-produits.md` doit être créé avec, par produit : nom, valeur, unité, source, date de vérification, statut (`confirmé`, `à confirmer`, `indicatif`, `expiré`) et responsable de validation.

### 6.2. Site et mesure d’audience — état au 24 novembre 2026

- Next.js 16 / React 19 / next-intl, 8 langues, panneau admin maison.
- Pixel / Dataset Meta : `2369842980424778`.
- GTM : `GTM-P2TBRPKB`, GA4 : `G-PPQCN5D354`.
- `metaPixelDirect: false` : le Pixel n’est pas injecté directement par l’application ; GTM est la porte d’entrée.
- `consentRequired: true` ; clé de consentement navigateur : `nakhla.consent.v1`.
- Aucun appel Meta ne doit partir avant consentement explicite.
- La politique de confidentialité en 8 langues mentionne Google et Meta après consentement, mais le CAPI n’est pas activé.
- Aucun code du dépôt ne lit de token `META_*`; aucune variable `NEXT_PUBLIC_META_*` ne doit être créée.

### 6.3. CAPI / Purchase — blocage explicite

Aucun événement `Purchase` ne doit être envoyé tant que :

1. il n’existe pas d’action admin « commande confirmée » reproduisant la confirmation faite manuellement dans WhatsApp ;
2. le consentement n’est pas visible côté serveur ;
3. la mise à jour juridique PDPL/RGPD n’est pas validée ;
4. les tokens dédiés ne sont pas correctement configurés et rotatifs.

Le checkout actuel prépare un message WhatsApp et s’arrête là. Un message envoyé dans WhatsApp n’est pas visible par le serveur du site.

### 6.4. Paiement

`payments.mode` reste `demo`. Aucun moyen de paiement en ligne ne doit être annoncé. Les coordonnées bancaires, si présentes, viennent de l’environnement et d’un certificat officiel, jamais d’une invention de l’agent.

---

## 7. Canaux et limites d’action

### 7.1. Instagram

- Langue : arabe simple.
- Feed 4:5, Stories/Reels 9:16.
- 5 à 8 hashtags pertinents.
- Questions fermées, sondages natifs, sauvegardes et demandes WhatsApp sont les objectifs privilégiés.
- Ne pas présenter une photo de banque comme un client, un lieu ou un événement de la maison.

### 7.2. Facebook

- Formats : photo 1200×630, carrousel 1080×1080.
- 2 à 3 hashtags.
- Ton pratique et communautaire.
- Les publications Page et les insights restent limités côté API tant que les permissions ne sont pas accordées.

### 7.3. WhatsApp

- Destination de contact privilégiée.
- Lien en caption et, si besoin, dans un pied lisible.
- Aucun envoi, réponse ou suivi automatique sans validation explicite.
- Ne jamais promettre réponse immédiate.

### 7.4. Meta Ads

- Compte cible : `act_1321318896669263`.
- Page : `1237934092745712`.
- Instagram : `17841432161316016`.
- Lecture seule par défaut. Aperçu, recommandation et boost proposé uniquement.
- Aucune création, modification, publication, boost, budget ou campagne sans accord humain explicite.
- Les coordonnées en petit pied sont à éviter dans les placements payants ; préférer caption ou pied lisible validé.

### 7.5. État MCP au 24 novembre 2026

| Serveur | État observé | Conséquence |
|---|---|---|
| `meta-content` | _connecté, `token_present: true`, mode lecture seule_ | Médias Instagram lisibles. |
| Publications Facebook | Erreur de permission `pages_read_engagement` | Ne pas inventer de données Page. |
| Insights Instagram | Erreur de permission | Objectifs = cibles de travail, pas résultats. |
| `meta-ads` | Configuré ; compte cible actif et interrogeable selon le plan | Reste en lecture seule tant que validation humaine absente. |
| `meta-whatsapp` | Configuré côté client, connexion non vérifiée dans cette session | Aucun envoi, aucune lecture de message. |

Derniers médias Instagram observés : 5 publications sur 6 médias entre le 30 octobre et le 19 novembre 2026, 0 commentaire, 1 like au total, conformément au calendrier éditorial. Leurs captions contiennent des formulations historiques à ne pas copier ; se référer aux règles de ton et aux expressions suspendues du présent référentiel.

---

## 8. État du calendrier éditorial de décembre 2026

Thèmes hebdomadaires :

1. S1 — Origine et confiance — TOFU — 4 publications.
2. S2 — Choisir son industrie — MOFU — 4 publications.
3. S3 — Offrir et recevoir — MOFU → BOFU — 4 publications.
4. S4 — Conserver et préparer — MOFU — 4 publications.
5. S5 — Décision et clôture — BOFU — 4 publications.

Horaires suggérés, heure Médine : Instagram 19h30–21h30 ; Facebook 12h30–13h30 ou 20h00.

Règles de fond : vérifier le stock avant publication, répondre en commentaire dans les 2 heures, ne pas publier sans accord, ajuster les horaires après la première semaine plutôt que d’ajouter des publications.

---

## 9. Contrat opérationnel de l’agent

### 9.1. Niveaux d’intervention

| Niveau | Autorisé |
|---|---|
| 1 — Préparer | Rechercher, analyser, rédiger, proposer, préparer briefs et recommandations. |
| 2 — Recommander | Proposer réponses, publications, campagnes, optimisations et plans d’action. |
| 3 — Exécuter | **Jamais sans approbation humaine explicite et préalable.** |

### 9.2. Actions interdites sans validation humaine

- publier ou programmer une publication ;
- booster une publication ;
- créer ou modifier une campagne, un budget ou une enchère ;
- répondre à un commentaire ou à un message client ;
- envoyer un message WhatsApp ;
- supprimer ou modifier une publication ;
- modifier prix, stock, coordonnées ou informations officielles ;
- modifier la Brand Bible, ce référentiel ou les permissions d’un agent ;
- redéployer le site ou modifier le code applicatif.

### 9.3. Déclencheurs de validation humaine

Validation obligatoire dès qu’il y a : prix, stock, disponibilité, poids, emballage, origine affirmée, livraison, garantie, témoignage, chiffre, badge de récolte, représentation d’un lieu ou d’une personne comme réelle, signature publicitaire nouvelle, ou action d’écriture Meta.

### 9.4. Livrable attendu d’une proposition

1. Objectif éditorial et funnel.
2. Source des faits utilisés.
3. Texte arabe exact à publier, avec traduction française si demandé.
4. Brief visuel ou prompt, avec texte saisi manuellement.
5. Liste des points nécessitant validation humaine.
6. Dernière ligne : `Aucune action d’écriture effectuée.`

### 9.5. Rôles des sous-agents

| Agent | Rôle | Lecture obligatoire |
|---|---|---|
| `editorial-planner` | Arbitre TOFU/MOFU/BOFU et planifie | Référentiel + calendrier |
| `creative-brief` | Brief de production et prompt directif | Référentiel + calendrier + référentiel visuel Gemini |
| `meta-caption-writer` | Caption arabe, hashtags, nettoyage anti-IA | Référentiel + calendrier |
| `meta-content-reader` | Analyse Meta en lecture seule | Référentiel + calendrier ; sépare « vérifié » et « inaccessible » |
| `qa-editor` | Dernière relecture anti-IA et cohérence | Référentiel + Brand Bible + calendrier |

### 9.6. Enregistrement dans OpenCode

Le référentiel doit être chargé via `instructions` dans `.opencode/opencode.jsonc`. Les sous-agents qui lisent `docs/**` peuvent également le citer explicitement dans leur workflow.

---

## 10. Réconciliations décidées

| Conflit observé | Décision retenue | Raison |
|---|---|---|
| Numéro `+9666105910` vs `+966 59 610 1097` | `+966 59 610 1097` / `wa.me/966596101097` | Coordonnée officielle confirmée dans `site.config.ts` et Brand Bible. |
| Coordonnées dans le pied ou seulement en caption | Lot du 24/11 : pied lisible ; nouveaux formats : lisibilité ou caption | Validation propriétaire pour le lot, prudence pour le reste. |
| Logo doré généré par Gemini | Logo officiel importé | Interdiction de recréer le logo. |
| Valeurs de prix historiques non validées | Interdites | Aucune validation humaine. |
| Fourchettes historiques lues sur le site | Indicatives, retirées des visuels | Réutilisation uniquement via `AdsCopy` avec validation humaine du montant. |
| Ancien prix Mabroum issu de Gemini | Non retenu | Valeur historique sans validation humaine. |
| Ancien badge de récolte | Supprimé des propositions | Badge non validé malgré présence en ligne. |
| `1:19:1` | `1,91:1` / 1200×628 | Format Meta standard. |
| CTA avec flèche | CTA sans flèche | Correction explicite du propriétaire. |
| Signature « proposée » vs décision humaine | `طعم الكرم من قلب المدينة المنوّرة` retenue, champ `{{SIGNATURE}}` éditable | Décision humaine du 24 novembre 2026. |
| CAPI activable ? | Non | Pas d’action admin « commande confirmée », consentement pas visible serveur, juridique en attente. |
| Meta Page posts / insights accessibles ? | Non dans l’état actuel | Erreurs de permission confirmées par lecture MCP. |
| Conversation ChatGPT externe | Non intégrée | Connexion requise, contenu indisponible. |

---

## 11. Questions ouvertes / backlog

1. Créer `context/facts/site-produits.md` avec source, date et statut pour chaque produit.
2. Valider formellement la signature `طعم الكرم من قلب المدينة المنوّرة` pour usage public.
3. Ne jamais réutiliser une ancienne formule suspendue sans validation humaine explicite et nouvelle validation de la maison.
4. Confirmer l’existence réelle d’un coffret velours émeraude avant tout visuel cadeau.
5. Ne jamais réintroduire d’ancien badge de récolte non validé.
6. Confirmer les conditions exactes de livraison gratuite avant toute nouvelle affichage.
7. Créer l’action admin « commande confirmée » avant tout projet CAPI.
8. Récupérer la conversation ChatGPT si elle doit influencer le référentiel.
9. Faire valider la lisibilité mobile des pieds de visuel ; la couleur du bouton est déjà validée : fond `#163E2B`, texte `#F7F4EB`.

---

## 12. Bloc machine-readable

```yaml
referential:
  id: nakhla-brand-agent-v1
  version: 1.1.0
  generated: 2026-11-24
  authority: docs/agents/brand-bible.md
  complements:
    - docs/calendrier-editorial-decembre-2026.md
    - docs/meta-integration-plan.md
    - docs/agent-contenu-quotidien.md
    - docs/agents/referentiel-visuel-gemini.md
  readonly: true

identity:
  name_ar: "النخلة المباركة للتّمور الفاخرة"
  short_ar: "النخلة المباركة"
  name_en: "Al Nakhlah Al Mubarakah — Premium Dates"
  city: "Madinah"
  store: "Shop No. 49, Central Dates Market, Al Wabra"
  tagline_ar: "طعم الكرم من قلب المدينة المنوّرة"
  tagline_field: "{{SIGNATURE}}"
  tagline_status: human_validated_editable_field

contact:
  phone_display: "+966 59 610 1097"
  whatsapp_url: "https://wa.me/966596101097"
  email: "nakhla.mubaraka26@gmail.com"
  instagram: "@nakhla_mubaraka"
  facebook_url: "https://www.facebook.com/AlNakhlahAlMubarakahLitoumour"
  site_url: "https://ennakhlaelmubaraka.com"

meta_ids:
  pixel_dataset: "2369842980424778"
  ad_account: "act_1321318896669263"
  page_id: "1237934092745712"
  instagram_account_id: "17841432161316016"

palette:
  authority: docs/agents/palette-officielle.md
  emerald_deep: "#163E2B"
  gold_champagne: "#D4B376"
  sand_cream: "#F7F4EB"
  charcoal: "#1A1A1A"
  other_hex: forbidden
  gradient: forbidden

typography:
  arabic_display: Amiri
  arabic_ui: IBM Plex Sans Arabic
  arabic_infographic: [Cairo, Noto Kufi Arabic]
  generated_arabic_text: false

formats:
  feed: "1080x1350"
  story_reel: "1080x1920"
  carousel_facebook: "1080x1080"
  carousel_instagram: "1080x1350"
  banner: "1200x628"
  carousel_max_slides: 6

cta:
  canonical: "أطلبه الآن على الواتساب"
  arrow: false
  background: "#163E2B"
  text: "#F7F4EB"
  per_visual: 1
  destination: "https://wa.me/966596101097"

footer:
  validated_lot_2026_11_24: "+966 59 610 1097  •  @nakhla_mubaraka"
  rule: readable_or_caption_only

safety_phrases:
  illustration: "صورة توضيحية"
  removed_legacy_availability: true
  removed_legacy_price_confirmation: true

price_policy:
  visual_source_requirement: cancelled_by_human_decision
  site_ranges: indicative_only
  ads_visuals: "docs/agents/workflow-visuels-prix-ads.md"
  activation_keyword: "AdsCopy"
  gemini_values: forbidden
  human_price_validation_required: true

forbidden:
  - invented_price
  - invented_stock
  - invented_packaging
  - invented_logo
  - generated_arabic_text
  - fake_store_or_staff
  - fake_testimonial
  - health_claim
  - unvalidated_superlative
  - harvest_badge
  - gold_border
  - gradient
  - clipart_icon
  - tiny_contact_footer
  - auto_publish
  - auto_boost
  - auto_reply
  - auto_whatsapp_send
  - campaign_edit_without_approval
  - capi_purchase_without_admin_confirmation

current_state:
  consent_key: "nakhla.consent.v1"
  gtm_id: "GTM-P2TBRPKB"
  meta_pixel_direct: false
  capi_active: false
  purchase_events_allowed: false
  payments_mode: demo
  product_facts_file_present: false
  meta_content_token_present: true
  page_posts_readable: false
  ig_media_readable: true
  ig_insights_readable: false
  whatsapp_connected: unverified

governance:
  execution_level: prepare_and_recommend
  human_approval_required: true
  can_modify_brand_bible: false
  can_publish: false
  can_boost: false
  can_edit_campaigns: false
  can_send_messages: false
  can_change_site: false
```

---

## 13. Journal de consolidation

| Date | Action |
|---|---|
| 24 novembre 2026 | Création de la synthèse unique à partir de la Brand Bible v2.2, du référentiel visuel Gemini, du calendrier de décembre, du plan Meta, de l’état du code, des visuels livrés et des lectures MCP du jour. |
| 24 novembre 2026 | Réconciliation des conflits : numéro officiel, logo officiel, CTA sans flèche, prix non validés, badge de récolte, ratio 1,91:1, CAPI bloqué. |
| 24 novembre 2026 | Enregistrement prévu comme instruction OpenCode pour l’agent en construction. |
| 24 novembre 2026 | Application des 5 corrections QA validées par la maison : signature suspendue avant validation, fourchettes site indicatives, carrousel Instagram 4:5, attribution de la règle des coordonnées, décompte des médias Instagram aligné. |
| 24 novembre 2026 | Décisions de direction artistique et de production : palette exclusive `#163E2B` / `#D4B376` / `#F7F4EB` / `#1A1A1A`, signature `طعم الكرم من قلب المدينة المنوّرة` avec champ éditable `{{SIGNATURE}}`, suppression des anciennes mentions de prix/disponibilité, workflow dédié `AdsCopy`, Gemini relai de production complet, calendrier réduit à la planification. |

**Fin du référentiel. Toute proposition doit encore être validée par la maison avant diffusion.**
