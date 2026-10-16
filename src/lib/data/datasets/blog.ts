/**
 * Blog dataset (Plan §4.1) — V1 editorial.
 *
 * ⚠️ EDITORIAL CONTENT NOW LIVES IN `./content/posts.json`, edited through the
 * /admin panel (titles, excerpts, sections, machine translation, validation).
 * This module only re-validates and re-exports that JSON.
 *
 * Editorial context preserved from the original dataset:
 * - Hub « دليل شراء التمور لرمضان » — pilier Ramadan (Plan §3.1). Rédigé en
 *   AR (priorité SEO saoudienne, validé par le propriétaire) + EN (repli requis
 *   par `LocalizedText` / `pick()`), puis en FR (passe 2). Les autres locales
 *   (id/bn/ms/tr/ur) replient sur EN automatiquement.
 * - Faits alignés sur le catalogue réel (datasets dates.ts / gifts.ts) et la
 *   config (shop n°49, سوق التمور المركزي — المدينة المنورة, WhatsApp).
 * - Références islamiques (hadiths) : « affrar » (iftar) rapporté par Abou
 *   Dawoud & At-Tirmidhi ; « sept dattes Ajwa » rapporté par Boukhari &
 *   Mouslim (muttafaq 'alayh). À faire valider par le propriétaire.
 * - contentStatus: "draft" — publication visée déc. 2026 (pic Ramadan 2027).
 */

import content from "../content/posts.json";
import { parseBlogPosts } from "@/lib/data/content-schema";

export const blogPosts = parseBlogPosts(content);