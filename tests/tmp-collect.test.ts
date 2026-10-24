import { describe, it } from "vitest";
import { readFileSync } from "node:fs";
import { collectLocalizable } from "@/lib/admin/translate";

describe("collectLocalizable", () => {
  it("collects gift fields", () => {
    const gifts = JSON.parse(readFileSync("src/lib/data/content/gifts.json", "utf8"));
    const item = gifts.find((g: { slug: string }) => g.slug === "royal-stuffed-date-box");
    const refs = collectLocalizable(item);
    console.log(
      refs.map((r) => `${r.path.join(".")} :: ${Object.keys(r.record).join(",")}`).join("\n"),
    );
  });
});
