---
description: Analyse quotidienne Page/Instagram/Ads et prépare des angles, briefs et prompts conformes au workflow visuel. Lecture seule.
---

Analyse quotidienne orientée performance pour **nakhla mubaraka**. Périmètre : $ARGUMENTS (par défaut : les 7 derniers jours complets).

Cibles fixes :

- compte publicitaire : `1321318896669263`
- Page Facebook : `1237934092745712`
- Instagram : `17841432161316016`

## Règles absolues

1. **Lecture seule, préparer et recommander uniquement.** N’appelle aucun outil qui crée, modifie, publie, programme, booste, répond à un commentaire, envoie un message, génère un visuel, change un budget ou redéploie quoi que ce soit sans validation humaine explicite et préalable.
2. Ne demande jamais et n’affiche jamais un token, un secret, un App Secret ou une variable `META_*`.
3. Si `meta-content` indique `token_present: false`, arrête-toi et dis exactement : « Le token META_CONTENT_TOKEN manque. Crée le System User nakhla-content puis redémarre OpenCode. »
4. Si `meta-whatsapp` n’est pas connecté, ignore-le sans erreur et poursuis avec les autres sources.
5. Réponds en français. Les textes publicitaires proposés peuvent être en arabe, avec leur traduction française.
6. Palette exclusive : `#163E2B`, `#D4B376`, `#F7F4EB`, `#1A1A1A` uniquement. Aucun autre hex, aucune couleur dérivée, aucun dégradé, aucune consigne de palette historique.
7. Signature : champ éditable `{{SIGNATURE}}`, valeur par défaut `طعم الكرم من قلب المدينة المنوّرة`, soumis à validation humaine. Toute ancienne signature suspendue est supprimée.
8. Le calendrier `docs/calendrier-editorial-decembre-2026.md` est un planning seul : ni brief, ni caption, ni prompt, ni prix, ni palette, ni fait commercial. Renvoie, si besoin, vers `docs/briefs/2026-12/brief-XX.md`.
9. Aucune ancienne mention de disponibilité ni de confirmation de prix, aucun badge de récolte non validé, aucun superlatif non prouvé, aucune formule de livraison chiffrée et aucune fourchette de prix. Se référer à `docs/agents/referentiel-marque-ia.md` pour la liste historique des formulations retirées. Dès qu’un prix est envisagé, active `AdsCopy` et demande validation humaine du montant avant production.

## Étapes

1. Avec `meta-ads`, récupère les campagnes actives, leurs annonces, les créatives et les métriques disponibles sur la période. Identifie les 3 créatives publicitaires les plus efficaces et leurs angles.
2. Avec `meta-content`, récupère :
   - les publications récentes de la Page, leurs compteurs et leurs insights ;
   - les commentaires publics de ces publications ;
   - les médias Instagram récents, leurs likes/commentaires et leurs insights ;
   - les commentaires Instagram ;
   - les insights du compte Instagram si disponibles.
3. Si `meta-whatsapp` est connecté et que des signaux WhatsApp sont pertinents pour la période, ajoute-les comme contexte secondaire. Ne jamais envoyer de message.
4. Croise les sources et produis un tableau « gagnants » :
   - support, produit, angle, preuve chiffrée, signal communautaire, pourquoi ça performe ;
   - sépare clairement « performance publicitaire » et « engagement organique ».
5. Déduis les **3 angles marketing** les plus prometteurs et transmets-les à `creative-brief`, qui rédige un brief par publication. Pour chacun, le brief précise : objectif, cible, produit, promesse, preuve, objection à lever, CTA, format recommandé, textes arabe + français, hashtags, KPI de test. `{{TITRE}}`, `{{VARIÉTÉ}}` et `{{SIGNATURE}}` sont proposés à validation humaine.
6. Après validation humaine des textes, transmets le dossier à `graphic-designer` pour un **prompt complet et ultra détaillé**, sur le modèle de `docs/agents/prompt-visuel-mabroum.md` : rôle, objectif, palette exclusive, fichiers réels à importer, composition zone par zone, texte saisi manuellement, interdictions, prompt négatif, chaque format recomposé, checklist. Le prompt décrit le visuel entier, pas une plaque de fond, et ne contient aucune mention de disponibilité ni de prix confirmé en conversation.
7. **Ne produis aucun visuel directement.** Toute production locale ou externe attend la validation humaine du prompt. Si un prix apparaît, active `AdsCopy` et transmets à `ads-copy-designer` pour validation humaine du montant avant production. Gemini est un relai de production complet après validation humaine du prompt, sans limitation au fond, à la lumière ni au ratio ; les fichiers générés sont téléchargés sous `docs/creatives/AAAA-MM-JJ/` et renommés avec le titre du brief et la mention `Créé par GEMINI`. Le flux reste `graphic-designer → qa-editor → validation humaine`.
8. Recommande 2 à 3 créatives ou produits à booster, avec la raison, le signal qui justifie la recommandation et une proposition de budget ou de durée. Présente cela comme une **proposition**, sans l’appliquer ni modifier quoi que ce soit.
9. Si une métrique Meta n’est pas disponible, dis « non disponible » au lieu de l’estimer.
10. Termine par une ligne : « Aucune action d’écriture effectuée. »
