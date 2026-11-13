import { guardAdmin } from "../guard";
import { readTestimonials } from "@/lib/testimonials/store";
import { TestimonialsManager } from "../components/testimonials-manager";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  await guardAdmin();
  const items = await readTestimonials();
  return <TestimonialsManager items={items} />;
}
