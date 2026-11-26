# Plan d’intégration Meta — Conversions API, statistiques, ads, créatives et MCP

Statut : proposition. Phase 0 renseignée. Connexion MCP vérifiée le 20 novembre 2026. Aucun code ni variable d’environnement n’a été modifié pour le MCP.

Date : 19 novembre 2026, mis à jour le 20 novembre 2026.

Guide pratique d’utilisation de l’agent : [docs/guide-agent-meta-ads.html](./guide-agent-meta-ads.html)

Guide complet des MCP Meta — installation, outils, usage quotidien, bonnes pratiques : [docs/guide-meta-mcp-complet.html](./guide-meta-mcp-complet.html)

Guide de l’agent contenu quotidien Page/Instagram : [docs/agent-contenu-quotidien.md](./agent-contenu-quotidien.md)

Ce document contient des identifiants publics Meta, mais aucun token ni secret.

## 1. Objectif

Brancher Meta sur le site de manière contrôlée, sans exposer de secret et sans contredire la politique de confidentialité publiée.

Périmètre demandé :

- Conversions API ;
- récupération de statistiques ;
- gestion des publications et créatives ;
- gestion des campagnes ads ;
- automatisation via MCP.

Hors périmètre pour l’instant :

- modification du code applicatif ;
- activation effective d’un envoi de données vers Meta ;
- publication d’une nouvelle version de la politique de confidentialité ;
- achat ou modification de campagnes.

## 2. État actuel du projet

- L’identifiant public du Pixel est `2369842980424778`, défini dans `src/lib/config/site.config.ts`.
- Le Pixel n’est pas injecté directement dans le HTML serveur. Il est piloté via GTM et ne se charge qu’après consentement.
- Le choix de consentement est stocké côté navigateur dans `localStorage`, clé `nakhla.consent.v1`.
- Aucun code du dépôt ne lit de token Meta. Il n’existe aucune variable `META_*` dans `.env.example`, `.env.local` ou `src/`.
- La politique de confidentialité publiée indique que les outils Google et Meta ne se chargent qu’après consentement et qu’aucune donnée n’est envoyée à des annonceurs.
- Le site est déployé sur Vercel. Les secrets de production doivent donc être définis dans Vercel, pas dans un fichier `.env` du dépôt.

Conséquence : prolonger un token existant n’a aujourd’hui aucun effet sur le site.

### Identifiants confirmés

- Pixel et Dataset : `2369842980424778`, même identifiant que celui déjà présent dans le site.
- Compte publicitaire : `nakhla mubaraka`, identifiant `1321318896669263`. Dans les appels Graph API, l’identifiant devra être écrit `act_1321318896669263`.
- Page Facebook : `https://www.facebook.com/AlNakhlahAlMubarakahLitoumour/`. L’ID numérique sera récupéré via l’API, pas saisi à la main.
- Instagram professionnel : `@nakhla_mubaraka`. L’ID Instagram sera récupéré via l’API, pas saisi à la main.

## 3. Principes directeurs

1. **Un token par usage.** Ne jamais utiliser un token unique pour CAPI, statistiques, publications et campagnes.
2. **System User plutôt que token utilisateur.** Un token utilisateur prolongé reste lié à une personne et peut expirer ou casser lors d’un changement de droits. Un token System User peut être non expirant et révocable.
3. **Moins de droits possible.** Chaque token reçoit uniquement les permissions nécessaires à son usage.
4. **Côté serveur uniquement.** Aucun token ne doit être préfixé `NEXT_PUBLIC_` ni apparaître dans un bundle client.
5. **Consentement d’abord.** Aucun événement CAPI ne doit partir si le visiteur n’a pas accepté le suivi.
6. **Politique alignée avant activation.** Toute nouvelle transmission à Meta impose une mise à jour de la politique dans les 8 langues et une validation juridique PDPL/RGPD.

## 4. Architecture des tokens

### 4.1 Tokens recommandés

| Variable | Usage | Droits indicatifs à vérifier lors de la création |
|---|---|---|
| `META_CAPI_TOKEN` | Envoi des événements Conversions API | Token généré depuis Events Manager pour le Pixel/Dataset. System User existant : **Conversions API System User**, ID `61595410858478`, rôle EMPLOYEE |
| `META_ADS_TOKEN` | Statistiques et lecture des campagnes | `ads_read` |
| `META_CAMPAIGN_TOKEN` | Création/modification des campagnes | `ads_management` |
| `META_MCP_TOKEN` | Serveur MCP publicitaire Meta | `ads_mcp_management` seul suffit (aucune dépendance officielle). Ajouter `ads_read` uniquement si besoin de lectures hors MCP. Token System User de rôle **EMPLOYEE** uniquement |
| `META_APP_ID` | App des tokens Marketing API (`NakhlaMkgApp`, `978882541533257`). Le client ID OAuth du MCP est l’app `Ennakhlaelmubaraka`, `2553279325206274`, et reste dans la config OpenCode | Non applicable |
| `META_CONTENT_TOKEN` | Publications Page/Instagram et créatives | `pages_manage_posts`, `instagram_content_publish` selon les canaux |
| `META_WEBHOOK_VERIFY_TOKEN` | Vérification des webhooks, si utilisés | Non applicable |
| `META_APP_SECRET` | Échange de tokens ou signature de requêtes, si nécessaire | Non applicable |

Séparer `META_ADS_TOKEN` et `META_CAMPAIGN_TOKEN` permet d’avoir un accès en lecture seule pour les rapports et un accès en écriture uniquement pour les actions sur les campagnes.

Selon la documentation Meta, la génération d’un token CAPI depuis Events Manager crée automatiquement une app et un System User dédiés, sans App Review ni demande de permissions supplémentaires. Pour la Marketing API, les permissions `ads_read` et `ads_management` restent soumises au niveau d’accès de l’app et au Marketing API Access Tier.

Mise à jour Meta 2026 à prendre en compte :

- Meta recommande désormais les tokens System User **expirant après 60 jours**, avec rotation, plutôt que les tokens permanents.
- Le serveur MCP publicitaire Meta a sa propre permission `ads_mcp_management`. Le token doit appartenir à un System User de rôle **EMPLOYEE** ; un token de rôle **ADMIN** est refusé.
- Pour le MCP, l’OAuth via le client est préférable quand il est disponible : aucun token n’est alors à coller dans le site.

### 4.2 Où stocker chaque variable

| Environnement | Emplacement |
|---|---|
| Développement local | `.env.local`, à la racine du projet |
| Production du site | Vercel → `ennakhlaelmubaraka` → Settings → Environment Variables → Production |
| MCP local | Configuration du client MCP ou gestionnaire de secrets de la machine, jamais un fichier commité |
| Documentation du dépôt | `.env.example`, noms uniquement avec valeurs vides |

Après ajout ou modification dans Vercel, il faut redéployer.

### 4.3 Règles de sécurité

- Ne pas coller de token dans un ticket, un chat, un fichier Markdown ou un message WhatsApp.
- Ne pas committer `.env`, `.env.local`, `.env.*.local` ni un export de secrets.
- Révoquer l’ancien token dès que les nouveaux tokens sont créés. Prolonger la durée d’un token exposé ne supprime pas l’exposition.
- Prévoir une rotation : date de création, propriétaire, date de révocation.
- Ajouter des journaux d’audit côté serveur pour les appels de gestion, sans journaliser le token.
- Limiter les routes de gestion au rôle admin existant.

## 5. Flux de données

### 5.1 Conversions API

Flux prévu :

```text
Visiteur
  → choisit "Accepter" dans le bandeau
  → passe commande via WhatsApp

Boutique
  → confirme la commande

Serveur
  → vérifie que le consentement est présent
  → hache e-mail/téléphone en SHA-256
  → envoie l'événement à Meta avec event_id
  → Meta renvoie un identifiant d'événement
```

Points techniques à respecter :

- utiliser le même Pixel ID que le Pixel navigateur ;
- utiliser un `event_id` stable pour dédupliquer les événements navigateur et serveur ;
- ne jamais envoyer d’e-mail ou de téléphone en clair ;
- transmettre les paramètres requis par Meta pour chaque type d’événement ;
- ne pas envoyer les champs `whatsapp` ou `admin_note` des avis ;
- garder une trace minimale : date, type d’événement, succès/échec, identifiant Meta, sans données personnelles en clair.

Événements à envisager :

- `PageView` ;
- `ViewContent` ;
- `AddToCart` ;
- `InitiateCheckout` ;
- `Purchase`.

Décision : `Purchase` est envoyé lors de la **confirmation par la boutique**, pas à l’envoi du message WhatsApp.

Précision apportée : la confirmation se fait aujourd’hui par un **message WhatsApp manuel** du vendeur.

Constat dans le code : il n’existe pas encore de statut « commande confirmée » ni d’écran admin pour le déclarer. Le checkout prépare un message WhatsApp et s’arrête là. Un message envoyé dans WhatsApp n’est pas visible par le serveur du site.

Conséquence : il faudra créer une action admin « marquer comme confirmée » qui reproduit, dans le site, la confirmation déjà faite dans WhatsApp. Tant que cette action n’existe pas, aucun `Purchase` ne doit être envoyé.

### 5.2 Consentement

Le consentement est aujourd’hui uniquement côté navigateur. Pour le CAPI, il faut le rendre visible côté serveur.

Options possibles :

1. Ajouter le choix de consentement à la requête de commande, avec une valeur lue depuis `localStorage`.
2. Écrire le choix dans un cookie first-party lisible par le serveur.
3. Refuser l’envoi CAPI par défaut tant que le serveur n’a pas de preuve de consentement.

L’option 3 est la plus sûre. L’option 1 est simple mais ne doit pas être considérée comme une preuve juridique forte sans horizon de journalisation adapté.

Décision : **une seule case suffit**. Le bandeau actuel est donc conservé, mais son texte devra mentionner explicitement la mesure d’audience et la publicité Meta. Sans cette précision, un visiteur ne peut pas comprendre qu’il accepte aussi un envoi de données à Meta.

À valider avec le conseil juridique : caractère suffisant d’une case unique au regard du PDPL, du RGPD et de l’ePrivacy.

### 5.3 Statistiques et MCP

Deux modes possibles :

```text
Mode A — MCP local
MCP → Graph API Meta avec son propre token
Le site n'est pas impliqué.
```

```text
Mode B — Pont via le site
MCP → route admin protégée du site → Graph API Meta avec META_ADS_TOKEN
```

Recommandation : commencer par le mode A pour la lecture seule. Le mode B n’est utile que si plusieurs personnes doivent accéder aux mêmes rapports sans configurer chacune leur MCP.

Route envisageable si le mode B est retenu : `GET /api/admin/meta/insights`, avec :

- garde admin existante ;
- filtres bornés : période, compte, niveau ;
- cache de 15 minutes ;
- aucune donnée personnelle dans la réponse ;
- limite de débit ;
- journal d’audit.

### 5.4 Campagnes, publications et créatives

Ces actions modifient des actifs réels. Elles doivent rester derrière une interface admin explicite ou un MCP dédié, avec confirmation avant action.

Séquence recommandée :

1. lecture seule d’abord ;
2. brouillon ou prévisualisation ;
3. publication ou modification effective ;
4. journal d’audit avec acteur, date, objet Meta et résultat.

Ne pas mélanger ce token avec le token CAPI.

Cibles confirmées pour cette phase :

- Page Facebook : `https://www.facebook.com/AlNakhlahAlMubarakahLitoumour/` ;
- Instagram professionnel : `@nakhla_mubaraka`.

Les ID numériques de la Page et du compte Instagram seront récupérés via l’API au moment de la configuration, afin d’éviter toute saisie manuelle hasardeuse.

## 6. Impacts sur la politique de confidentialité

La politique publiée devra être modifiée avant activation du CAPI.

Sections concernées :

- **Données collectées, finalités et bases légales** : ajouter les données d’événement et les identifiants techniques utilisés pour la mesure.
- **Destinataires** : préciser que Meta reçoit des événements de mesure lorsque le consentement est donné.
- **Transferts hors d’Arabie saoudite** : Meta peut traiter hors du Royaume ; préciser le mécanisme de transfert applicable.
- **Témoins, stockage local et mesure d’audience** : distinguer Pixel navigateur et Conversions API serveur.
- **Vos droits** : rappeler le retrait du consentement et ses effets.
- **Sécurité et incidents** : prévoir les incidents liés à un prestataire de mesure.

Points à trancher avec le conseil juridique :

- base légale retenue pour le CAPI ;
- rôle de Meta : responsable conjoint ou sous-traitant selon les services utilisés ;
- nécessité d’un accord de traitement des données ;
- représentant UE/UK : le responsable des affaires juridiques de la société est **établi hors UE/UK**. Il ne peut donc pas être le représentant exigé par l’article 27 RGPD. Le libellé actuel de la politique est conservé : aucun représentant européen n’est publié, et ses coordonnées seront ajoutées si un représentant est requis. Ce point reste à trancher avec le conseil juridique avant toute activation CAPI ;
- information des personnes et durée de conservation des événements.

Aucune modification de politique ne doit être publiée sans validation PDPL + RGPD.

## 7. Phases de travail

### Phase 0 — Décisions

Réponses obtenues le 19 novembre 2026 :

| Sujet | Réponse |
|---|---|
| Pixel / Dataset | Même ID que le site : `2369842980424778` |
| Compte publicitaire | `nakhla mubaraka`, `act_1321318896669263` |
| Page Facebook | `https://www.facebook.com/AlNakhlahAlMubarakahLitoumour/` |
| Instagram | `@nakhla_mubaraka` |
| IDs Page/Instagram | À récupérer via l’API, pas à saisir manuellement |
| Déclencheur `Purchase` | Message WhatsApp manuel de confirmation, à reproduire par une action admin |
| Consentement | Une seule case |
| Représentant UE/UK | Interlocuteur établi hors UE/UK ; texte actuel conservé |
| Administration | Administrateurs Business Manager uniquement |

Tâches techniques reportées aux phases suivantes, sans nouvelle question :

- récupérer les ID numériques de la Page et d’Instagram via l’API ;
- créer l’action admin de confirmation de commande ;
- adapter le texte de l’unique case de consentement ;
- confirmer juridiquement la case unique et l’absence de représentant UE/UK.

Acceptation : Phase 0 terminée.

### Phase 1 — Fondations secrets

Statut au 19 novembre 2026 : les 8 noms vides sont ajoutés dans `.env.example` et `.env.local`. En attente : création des tokens, valeurs dans Vercel, révocation de l’ancien token, redéploiement.

Livrables :

- créer les System Users et les tokens séparés ;
- ajouter les noms vides dans `.env.example` ;
- ajouter les valeurs dans `.env.local` pour le développement ;
- ajouter les valeurs de production dans Vercel ;
- révoquer l’ancien token ;
- redéployer.

Acceptation : aucun secret dans Git ; variables visibles côté serveur uniquement ; ancien token révoqué.

### Phase 2 — Consentement et préparation CAPI

Livrables :

- rendre le choix de consentement disponible au serveur ;
- adapter le texte de l’unique case pour mentionner mesure et publicité Meta ;
- créer l’action admin « commande confirmée » qui déclenchera `Purchase` ;
- fonction de hachage SHA-256 ;
- construction du payload CAPI ;
- gestion de `event_id` ;
- récupération des ID numériques de la Page et d’Instagram via l’API ;
- journal d’audit sans données personnelles en clair.

Acceptation : aucun appel parti sans consentement ; payload conforme aux paramètres Meta ; tests avec données fictives.

### Phase 3 — Mise à jour juridique et publication

Livrables :

- rédaction des changements de politique dans les 8 langues ;
- validation PDPL + RGPD ;
- publication avec nouvelle date ;
- vérification en production.

Acceptation : politique et comportement réel alignés.

### Phase 4 — Activation CAPI

Livrables :

- envoi des événements ;
- vérification dans Events Manager ;
- déduplication navigateur/serveur ;
- surveillance des erreurs.

Acceptation : événements visibles dans Meta, sans doublon, sans donnée en clair.

### Phase 5 — Statistiques et MCP

Livrables :

- token `META_ADS_TOKEN` en lecture seule ;
- soit configuration MCP locale, soit route admin protégée ;
- cache et limites ;
- journal d’audit.

Acceptation : rapports consultables sans exposer le token, aucune donnée personnelle renvoyée.

### Phase 6 — Campagnes et créatives

Livrables :

- tokens séparés ;
- confirmation avant action ;
- journal d’audit ;
- procédure de révocation.

Acceptation : aucune modification de campagne possible sans trace et sans droit dédié.

## 8. Risques principaux

| Risque | Mitigation |
|---|---|
| Token exposé dans le dépôt ou un bundle client | System User, variables serveur, `.env.example` vide, révocation immédiate |
| Envoi CAPI sans consentement | Contrôle serveur, refus par défaut, tests |
| Doubles événements Pixel + CAPI | `event_id` partagé |
| Divergence avec la politique publiée | Mise à jour des 8 langues avant activation et validation juridique |
| Droits trop larges sur les ads | Tokens séparés, lecture seule par défaut |
| Transfert international non documenté | Mécanismes de transfert précisés dans la politique |
| Perte de accès lors d’un changement de personnel | System User plutôt que compte individuel |

## 9. Sources consultées

- [Get started with the Conversions API](https://developers.facebook.com/documentation/ads-commerce/conversions-api/get-started)
- [Marketing API — Authorization](https://developers.facebook.com/docs/marketing-api/overview/authorization)
- [Permissions Reference for Meta Technologies APIs](https://developers.facebook.com/documentation/development/permissions)
- [System Users](https://developers.facebook.com/docs/business-management-apis/system-users)
- [Install Apps, Generate, Refresh and Revoke Tokens](https://developers.facebook.com/docs/marketing-api/businessmanager/systemuser/install-apps-and-generate-tokens)
- [System User Permissions](https://developers.facebook.com/docs/marketing-api/businessmanager/systemuser/permissions)
- [Ads MCP Server — Get started](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-get-started)
- [Connect an MCP client to Meta](https://developers.facebook.com/documentation/mcp/connect-an-mcp-client)

Note : les noms de permissions et les niveaux d’accès Meta évoluent. Les droits indicatifs ci-dessus doivent être confirmés au moment de la création des tokens dans Business Manager.

## Annexe A — Checklist de saisie Vercel

À faire par le propriétaire du compte Meta. Ne pas coller les tokens dans un chat, un ticket ou un fichier du dépôt.

1. Ouvrir **Vercel → projet `ennakhlaelmubaraka` → Settings → Environment Variables**.
2. Ajouter chaque variable ci-dessous avec l’environnement **Production**.
3. Vérifier qu’aucune variable ne commence par `NEXT_PUBLIC_`.
4. Cliquer sur **Save**, puis **Deployments → Redeploy** sur le dernier déploiement.
5. Confirmer le bon fonctionnement, puis révoquer l’ancien token dans Business Manager.

| Variable | Où la générer | Environnement Vercel |
|---|---|---|
| `META_CAPI_TOKEN` | Events Manager → Pixel `2369842980424778` → Settings → Conversions API → Generate access token | Production |
| `META_ADS_TOKEN` | Business Settings → System Users → token avec `ads_read` | Production |
| `META_CAMPAIGN_TOKEN` | Business Settings → System Users → token avec `ads_management` | Production |
| `META_MCP_TOKEN` | System User de rôle EMPLOYEE, token avec `ads_mcp_management` (dépendances : aucune) | Production |
| `META_APP_ID` | `978882541533257` pour les tokens Marketing API ; le client ID OAuth MCP est `2553279325206274` et se configure dans OpenCode, pas dans Vercel | Production |
| `META_CONTENT_TOKEN` | Business Settings → System Users → token avec droits Page/Instagram | Production |
| `META_WEBHOOK_VERIFY_TOKEN` | Chaîne aléatoire locale, uniquement si des webhooks sont utilisés | Production |
| `META_APP_SECRET` | App Dashboard, uniquement si nécessaire | Production |

Note Events Manager 2026 : le lien « Generate access token / Set up manually » a été remplacé dans certaines interfaces par **Configurer une intégration directe** puis **Configurer avec Dataset Quality API**. Choisir cette option génère un token qui sert à la fois aux événements Conversions API et aux métriques de qualité. Le token de Dataset Quality API autorise aussi les tokens générés précédemment. [Doc officielle](https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api#ownership-and-access)

Traduction des tâches Meta dans l’interface française : `ANALYZE` = **Afficher les performances**, `ADVERTISE` = **Gérer les campagnes (publicités)**, `MANAGE` = **Gérer les comptes publicitaires** (accès total). Pour un token de lecture, cocher uniquement **Afficher les performances** en accès partiel.

Dépannage « Aucune autorisation disponible / Assign an app role to the system user » : l’app doit être assignée comme **élément professionnel** depuis la fiche du System User (**Users → System users → utilisateur → Assign assets → Apps → Accès total**), pas seulement depuis l’onglet utilisateurs de l’app. L’onglet « Applications installées » reste vide jusqu’à la création du token. Recharger Business Settings après l’assignation. [Doc officielle](https://developers.facebook.com/docs/marketing-api/businessmanager/systemuser/install-apps-and-generate-tokens)

Pour le développement local, coller les mêmes valeurs dans `.env.local`, qui contient déjà les huit noms vides. Ce fichier est ignoré par Git.

Statut au 19 novembre 2026 : `META_CAPI_TOKEN` renseigné dans Vercel et redéployé. Vérification debugger : App `1186458837276868` (Conversions API Application), type System User, portée `read_ads_dataset_quality` sur le dataset `2369842980424778`, valide, sans expiration. ID Business Manager du System User : `61595410858478` ; ID app-scoped : `122120425965513695`. `META_ADS_TOKEN` renseigné dans Vercel et `.env.local`. Vérification debugger : App `978882541533257` affichée comme **NakhlaMkgApp**, type System User, ID app-scoped `122101923813552681` (`nakhla-ads-read`), portées `ads_read` + `public_profile`, expiration ~60 jours, valide. `META_APP_ID` doit être `978882541533257`. `META_CAMPAIGN_TOKEN` généré et ajouté à Vercel et `.env.local` ; redéploiement volontairement différé. App MCP existante dans le même Business : **Ennakhlaelmubaraka**, ID `2553279325206274`, mode développement, avec le use case « Agent publicitaire » et Facebook Login for Business déjà configurés. Choix retenu pour le MCP : **OAuth** avec l’app `Ennakhlaelmubaraka`. La configuration OpenCode globale a été corrigée pour retirer `oauth: false` et le header `Bearer`. Aucun `META_MCP_TOKEN` ne sera généré ; la variable reste vide. Première tentative OAuth bloquée par `Dynamic Client Registration rejected` : Meta n’accepte pas l’enregistrement dynamique d’OpenCode. Correction appliquée : client ID pré-enregistré `2553279325206274` dans `oauth.client_id`, avec `callback_port: 19876` et `redirect_uri: http://localhost:19876/callback`. Aucun `client_secret` : les serveurs Meta sont des clients publics avec PKCE. Meta a refusé `http://127.0.0.1:19876/callback` avec « HTTPS obligatoire pour toutes les URL de redirection », puis a confirmé que les redirections `http://localhost` sont autorisées automatiquement en mode développement et ne doivent pas être ajoutées dans le champ des URI. Résolution : ne rien enregistrer dans Meta pour `localhost`, et laisser `redirect_uri: http://localhost:19876/callback` uniquement dans OpenCode. Autres valeurs en attente. Ancien token non révoqué. Connexion MCP vérifiée le 20 novembre 2026 avec un appel lecture seule `ads_get_ad_accounts` : le compte cible `nakhla mubaraka` (`act_1321318896669263`) est `ACTIVE`, `is_ads_mcp_enabled: true`, `is_queryable: true`, devise SAR, moyen de paiement présent. Comptes non utilisables : `1566405957927217` (`UNSETTLED`, non interrogeable), `3354695981384838` (`DISABLED`, activité suspecte), `2166851061375076` (`is_ads_mcp_enabled: false`). Le compte `2105241320197670` est actif et interrogeable mais n’est pas la cible retenue.
