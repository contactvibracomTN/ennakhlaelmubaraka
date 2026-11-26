# Tableau de validation — briefs décembre 2026

**Rôle :** point de consultation, d’édition et de validation des 20 briefs. Ce fichier est un outil de pilotage humain, pas une autorité de marque. Les sources d’autorité restent `docs/agents/palette-officielle.md`, `docs/agents/brand-bible.md`, `docs/agents/referentiel-marque-ia.md` et `docs/agents/workflow-creation-visuels.md`.

**État au 25 novembre 2026 :** `[01]` et `[02]` sont sélectionnés comme **test de production** ; `[03]` à `[20]` sont en **standby** jusqu’à validation par ce processus.

## Outil local — accès et source vivante

Un tableau de bord HTML remplace la saisie manuelle des cases dans ce fichier.

1. Dans un terminal, à la racine du projet, lancer : `node scripts/brief-validation-server.mjs`
2. Ouvrir `http://127.0.0.1:4321` dans le navigateur.
3. Arrêter le serveur avec `Ctrl+C` dans le terminal.

Le serveur écoute uniquement sur `127.0.0.1`, sans secret ni appel réseau. Il lit et écrit les fichiers `brief-XX.md` et `validation-state.json`. Avant chaque modification d’un brief, une copie `.bak` est créée.

**Source vivante des validations :** `docs/briefs/2026-12/validation-state.json`, piloté par l’outil HTML. Le tableau Markdown ci-dessous est conservé comme miroir historique : ne pas cocher ses cases. En cas d’écart, l’outil HTML prévaut.

Statuts calculés par l’outil :

| Statut | Condition |
|---|---|
| À préparer | Une des cases T, C ou P n’est pas cochée |
| Prêt pour prompt | T, C et P sont cochés, mais aucun `prompt-XX.md` n’existe |
| À valider | Le prompt existe et la case Pr n’est pas cochée |
| Validé | Les quatre cases sont cochées |
| À revérifier | Le brief ou le prompt a été modifié depuis sa validation ; la case concernée est décochée |

Au premier lancement attendu : **2 à valider** (`[01]`, `[02]`), **18 en attente**, **0 validé**.

---

## 1. Processus en trois étapes

1. **Consulter** — ouvrir `http://127.0.0.1:4321` et lire la carte du brief, ou ouvrir le `.md` via le bouton VSCode. Lire « Texte public proposé », « Champs éditables soumis à validation » et « Points à valider par l’humain ». Le calendrier ne contient aucun texte public.
2. **Éditer** — modifier le fichier `brief-XX.md` dans le champ Markdown de l’outil HTML, puis cliquer sur « Enregistrer », ou modifier directement dans VSCode. Conserver `{{SIGNATURE}}` sous forme éditable (valeur par défaut `طعم الكرم من قلب المدينة المنوّرة`) et la dernière ligne `Aucune action d’écriture effectuée.`. Si un prix apparaît, arrêter et appliquer `AdsCopy` selon `docs/agents/workflow-visuels-prix-ads.md`. Toute modification réinitialise les cases du brief concerné.
3. **Valider** — cocher les quatre cases dans l’outil HTML uniquement. Le passage à « Validé » est fait par l’humain uniquement. L’agent ne coche aucune case. La production du prompt vient ensuite ; la génération du visuel exige la case **Pr** cochée par l’humain.

Légende des cases : **T** = texte arabe validé · **C** = champs `{{TITRE}}`, `{{VARIÉTÉ}}`, `{{SIGNATURE}}` validés · **P** = photo source autorisée ou « néant » validé · **Pr** = prompt complet validé avant génération.

---

## 2. Tableau des 20 briefs

| ID | Accroche | Canal · format | Statut | T | C | P | Pr | Brief |
|---|---|---|---|:-:|:-:|:-:|:-:|---|
| 01 | Le comptoir n°49 | IG · feed 4:5 | **TEST — prompt à valider** | [x] | [ ] | [ ] | [ ] | [brief-01.md](brief-01.md) |
| 02 | Quatre valeurs, une boutique | FB · photo 1200×630 | **TEST — prompt à valider** | [x] | [ ] | [ ] | [ ] | [brief-02.md](brief-02.md) |
| 03 | Commencer par trois variétés | IG · carrousel 4 | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-03.md](brief-03.md) |
| 04 | Quelle variété pour recevoir ? | FB · question + visuel | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-04.md](brief-04.md) |
| 05 | Deux ajwa, un choix | IG · Reel 22 s | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-05.md](brief-05.md) |
| 06 | La variété Ambera en gros plan | FB · photo | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-06.md](brief-06.md) |
| 07 | Cristaux naturels sur Sukkari humide | IG · statique 4:5 | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-07.md](brief-07.md) |
| 08 | Trois repères de choix | FB · carrousel 3 | STANDBY · risque prix | [ ] | [ ] | [ ] | [ ] | [brief-08.md](brief-08.md) |
| 09 | Une boîte en vingt secondes | IG · Reel 18 s | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-09.md](brief-09.md) |
| 10 | Chocolat au pistache pour la table | FB · photo | STANDBY · risque prix | [ ] | [ ] | [ ] | [ ] | [brief-10.md](brief-10.md) |
| 11 | Cinq idées cadeaux | IG · carrousel 6 max. | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-11.md](brief-11.md) |
| 12 | Nommez cette boîte | FB · photo + question | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-12.md](brief-12.md) |
| 13 | Trois réflexes de conservation | IG · Reel 20 s | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-13.md](brief-13.md) |
| 14 | Conserver en trois étapes | FB · infographie | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-14.md](brief-14.md) |
| 15 | Mabroum, texture et format | IG · statique 4:5 | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-15.md](brief-15.md) |
| 16 | Le nom du coffret révélé | FB · photo | STANDBY · risque prix | [ ] | [ ] | [ ] | [ ] | [brief-16.md](brief-16.md) |
| 17 | Le produit du mois | IG · Stories sondage | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-17.md](brief-17.md) |
| 18 | Où acheter, comment demander | FB · photo | STANDBY · risque livraison | [ ] | [ ] | [ ] | [ ] | [brief-18.md](brief-18.md) |
| 19 | Une table de Médine | IG · Reel 15 s | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-19.md](brief-19.md) |
| 20 | Résultat du sondage | FB · photo | STANDBY | [ ] | [ ] | [ ] | [ ] | [brief-20.md](brief-20.md) |

**Prompts de test déposés :** [prompt-01.md](prompts/prompt-01.md) et [prompt-02.md](prompts/prompt-02.md). Aucun visuel n’est généré avant validation de la case **Pr**.

---

## 3. Règle de passage en production

Une ligne ne devient « VALIDÉ » que lorsque T, C, P et Pr sont cochés par l’humain. Le passage en production ne signifie pas publication : la diffusion, la programmation et le boost restent soumis à une validation explicite séparée, conformément à `docs/agents/brand-bible.md` §12.

Aucune action d’écriture effectuée.
