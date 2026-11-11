import { guardAdmin } from "../guard";
import { readTestimonials } from "@/lib/admin/store";
import { TestimonialsManager } from "../components/testimonials-manager";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  await guardAdmin();
  const items = readTestimonials();
  return <TestimonialsManager items={items} />;
}
