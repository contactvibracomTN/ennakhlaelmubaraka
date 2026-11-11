/**
 * Customer testimonials — the public site only ever sees `published` records.
 *
 * The JSON file is the source of truth for the build. It is written by:
 *  - the public submission server action (when the runtime filesystem is
 *    writable — local / self-hosted), and
 *  - the /admin/testimonials panel (publish, archive, delete, manual entry).
 *
 * On serverless hosts (Vercel) the filesystem is read-only: submissions are
 * emailed to the owner and can be added manually from the admin panel. See
 * RAPPORT-TEMOIGNAGES.md for the production persistence options.
 */
import content from "../content/testimonials.json";
import { parseTestimonials } from "@/lib/data/content-schema";
import type { Testimonial } from "@/types/testimonial";

export const testimonials: Testimonial[] = parseTestimonials(content);
