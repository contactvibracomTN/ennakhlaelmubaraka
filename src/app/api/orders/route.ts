import { mockCommerceProvider } from "@/lib/data/commerce-provider";
import type { OrderDraft, OrderResult } from "@/types/checkout";

/**
 * Order intake (Blueprint §12). V1: builds the WhatsApp order message and
 * returns the wa.me deep link — nothing is charged (payments stay `demo`).
 * Future: swap the provider or add a webhook without touching the client.
 */
export async function POST(request: Request) {
  let draft: OrderDraft;
  try {
    draft = (await request.json()) as OrderDraft;
  } catch {
    return Response.json(
      {
        ok: false,
        error: "invalid-json",
        orderId: "",
        channel: "checkout",
      } satisfies OrderResult,
      { status: 400 },
    );
  }

  if (
    !draft ||
    !Array.isArray(draft.items) ||
    !draft.customer?.name ||
    !draft.customer?.phone ||
    !draft.orderId
  ) {
    return Response.json(
      {
        ok: false,
        error: "invalid-draft",
        orderId: "",
        channel: "checkout",
      } satisfies OrderResult,
      { status: 400 },
    );
  }

  const result = await mockCommerceProvider.createOrder(draft);
  if (!result.ok) {
    return Response.json(result, { status: 500 });
  }
  return Response.json(result);
}
