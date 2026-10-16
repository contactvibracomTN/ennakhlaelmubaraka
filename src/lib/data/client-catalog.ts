import { dateProducts } from "./datasets/dates";
import { giftProducts } from "./datasets/gifts";
import type { Product } from "@/types/product";

/**
 * Client-side catalog lookup for the cart drawer.
 *
 * The drawer is global (mounté dans le layout) et doit résoudre les lignes
 * du panier (nom, image, prix) sans aller-retour serveur. On importe ici les
 * MÊMES datasets que le serveur pré-rend (source de vérité unique) : le chunk
 * est partagé et mis en cache par le navigateur entre toutes les pages.
 */
const CATALOG = new Map<string, Product>();
for (const product of dateProducts) CATALOG.set(product.id, product);
for (const product of giftProducts) CATALOG.set(product.id, product);

export function getCatalogProduct(productId: string): Product | undefined {
  return CATALOG.get(productId);
}