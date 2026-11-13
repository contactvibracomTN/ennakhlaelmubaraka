/**
 * Testimonials store.
 *
 * Production uses Neon Postgres (`DATABASE_URL`, pooled connection). When the
 * variable is absent the JSON file remains the local fallback, so development
 * and self-hosted installs keep working without a database.
 *
 * Privacy: public reads only select public columns. `whatsapp` and
 * `admin_note` never leave the admin path.
 */
import { neon } from "@neondatabase/serverless";
import {
  readTestimonials as readFileTestimonials,
  saveTestimonials as saveFileTestimonials,
} from "@/lib/admin/store";
import { validateTestimonial } from "@/lib/data/content-schema";
import {
  toPublicTestimonial,
  type PublicTestimonial,
  type Testimonial,
  type TestimonialStatus,
} from "@/types/testimonial";

export interface AppendResult {
  ok: boolean;
  error?: string;
}

type Sql = ReturnType<typeof neon>;

let client: Sql | null = null;

function getSql(): Sql | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!client) client = neon(url);
  return client;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

interface TestimonialRow {
  id: string;
  name: string;
  whatsapp: string;
  job: string | null;
  nationality: string | null;
  message: string;
  rating: number;
  locale: string;
  status: string;
  source: string;
  created_at: string | Date;
  updated_at: string | Date | null;
  published_at: string | Date | null;
  published_text: Record<string, string> | null;
  admin_note: string | null;
  sort_order: number | null;
}

interface PublicTestimonialRow {
  id: string;
  name: string;
  job: string | null;
  nationality: string | null;
  message: string;
  rating: number;
  locale: string;
  created_at: string | Date;
  published_at: string | Date | null;
  published_text: Record<string, string> | null;
  sort_order: number | null;
}

function iso(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function mapRow(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    whatsapp: row.whatsapp,
    job: row.job ?? undefined,
    nationality: row.nationality ?? undefined,
    message: row.message,
    rating: row.rating as Testimonial["rating"],
    locale: row.locale,
    status: row.status as TestimonialStatus,
    source: row.source as Testimonial["source"],
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    updatedAt: iso(row.updated_at),
    publishedAt: iso(row.published_at),
    publishedText: row.published_text ?? undefined,
    adminNote: row.admin_note ?? undefined,
    order: row.sort_order ?? undefined,
  };
}

function mapPublicRow(row: PublicTestimonialRow): PublicTestimonial {
  return {
    id: row.id,
    name: row.name,
    job: row.job ?? undefined,
    nationality: row.nationality ?? undefined,
    message: row.message,
    rating: row.rating as PublicTestimonial["rating"],
    locale: row.locale,
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    publishedAt: iso(row.published_at),
    publishedText: row.published_text ?? undefined,
    order: row.sort_order ?? undefined,
  };
}

function filePublished(): PublicTestimonial[] {
  return readFileTestimonials()
    .filter((item) => item.status === "published")
    .map(toPublicTestimonial);
}

/** All records, including WhatsApp numbers and internal notes — admin only. */
export async function readTestimonials(): Promise<Testimonial[]> {
  const sql = getSql();
  if (!sql) return readFileTestimonials();

  const rows = (await sql`
    select id, name, whatsapp, job, nationality, message, rating, locale,
           status, source, created_at, updated_at, published_at,
           published_text, admin_note, sort_order
    from public.testimonials
    order by created_at desc
  `) as TestimonialRow[];

  return rows.map((row) => validateTestimonial(mapRow(row)));
}

/** Published records with public columns only — safe for the homepage. */
export async function readPublishedTestimonials(): Promise<PublicTestimonial[]> {
  const sql = getSql();
  if (!sql) return filePublished();

  try {
    const rows = (await sql`
      select id, name, job, nationality, message, rating, locale,
             created_at, published_at, published_text, sort_order
      from public.testimonials
      where status = 'published'
      order by sort_order asc nulls last, published_at desc nulls last, created_at desc
    `) as PublicTestimonialRow[];

    return rows.map(mapPublicRow);
  } catch (err) {
    console.error("[testimonials] public read failed; falling back to local JSON", err);
    return filePublished();
  }
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const sql = getSql();
  if (!sql) return readFileTestimonials().find((item) => item.id === id) ?? null;

  const rows = (await sql`
    select id, name, whatsapp, job, nationality, message, rating, locale,
           status, source, created_at, updated_at, published_at,
           published_text, admin_note, sort_order
    from public.testimonials
    where id = ${id}
    limit 1
  `) as TestimonialRow[];

  return rows[0] ? validateTestimonial(mapRow(rows[0])) : null;
}

export async function countTestimonials(): Promise<number> {
  const sql = getSql();
  if (!sql) return readFileTestimonials().length;

  try {
    const rows = (await sql`select count(*)::int as count from public.testimonials`) as Array<{
      count: number;
    }>;
    return rows[0]?.count ?? 0;
  } catch (err) {
    console.error("[testimonials] count failed; falling back to local JSON", err);
    return readFileTestimonials().length;
  }
}

export async function countPendingTestimonials(): Promise<number> {
  const sql = getSql();
  if (!sql) return readFileTestimonials().filter((item) => item.status === "pending").length;

  try {
    const rows = (await sql`
      select count(*)::int as count
      from public.testimonials
      where status = 'pending'
    `) as Array<{ count: number }>;
    return rows[0]?.count ?? 0;
  } catch (err) {
    console.error("[testimonials] pending count failed; falling back to local JSON", err);
    return readFileTestimonials().filter((item) => item.status === "pending").length;
  }
}

/** Create or update one record. */
export async function upsertTestimonial(t: Testimonial): Promise<void> {
  const sql = getSql();
  if (!sql) {
    const all = readFileTestimonials();
    const index = all.findIndex((item) => item.id === t.id);
    if (index >= 0) all[index] = t;
    else all.push(t);
    saveFileTestimonials(all);
    return;
  }

  await sql`
    insert into public.testimonials (
      id, name, whatsapp, job, nationality, message, rating, locale,
      status, source, created_at, updated_at, published_at, published_text,
      admin_note, sort_order
    ) values (
      ${t.id}, ${t.name}, ${t.whatsapp}, ${t.job ?? null}, ${t.nationality ?? null},
      ${t.message}, ${t.rating}, ${t.locale}, ${t.status}, ${t.source},
      ${t.createdAt}, ${t.updatedAt ?? null}, ${t.publishedAt ?? null},
      ${JSON.stringify(t.publishedText ?? {})}::jsonb,
      ${t.adminNote ?? null}, ${t.order ?? null}
    )
    on conflict (id) do update set
      name = excluded.name,
      whatsapp = excluded.whatsapp,
      job = excluded.job,
      nationality = excluded.nationality,
      message = excluded.message,
      rating = excluded.rating,
      locale = excluded.locale,
      status = excluded.status,
      source = excluded.source,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      published_at = excluded.published_at,
      published_text = excluded.published_text,
      admin_note = excluded.admin_note,
      sort_order = excluded.sort_order
  `;
}

/** Append a record from the public form. Never throws: returns a readable error. */
export async function appendTestimonial(t: Testimonial): Promise<AppendResult> {
  try {
    await upsertTestimonial(t);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function setTestimonialStatus(
  ids: string[],
  status: TestimonialStatus,
): Promise<void> {
  if (ids.length === 0) return;

  const sql = getSql();
  if (!sql) {
    const now = new Date().toISOString();
    saveFileTestimonials(
      readFileTestimonials().map((item) => {
        if (!ids.includes(item.id)) return item;
        return {
          ...item,
          status,
          updatedAt: now,
          publishedAt: status === "published" ? item.publishedAt ?? now : item.publishedAt,
        };
      }),
    );
    return;
  }

  const now = new Date().toISOString();
  await sql`
    update public.testimonials
    set status = ${status},
        updated_at = ${now},
        published_at = case
          when ${status} = 'published' then coalesce(published_at, ${now})
          else published_at
        end
    where id = any(${ids})
  `;
}

export async function deleteTestimonials(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const sql = getSql();
  if (!sql) {
    saveFileTestimonials(readFileTestimonials().filter((item) => !ids.includes(item.id)));
    return;
  }

  await sql`delete from public.testimonials where id = any(${ids})`;
}
