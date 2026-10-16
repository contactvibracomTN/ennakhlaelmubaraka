import type { SVGProps } from "react";

/**
 * Social network glyphs (official mark paths, reused from the deployed
 * v2.1 site — the only brand asset that must never be redrawn is the
 * logo JPEG; these network glyphs are standard shapes).
 */

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.6 21.5v-7.6h2.6l.5-3h-3.1V8.8c0-.9.4-1.5 1.7-1.5h1.5V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.2H8v3h2.4v7.6h3.2Z" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2.1a10 10 0 0 1 3.5.6c1.1.4 2 .9 2.9 1.9s1.5 1.8 1.9 2.9c.4 1.1.6 2.3.6 3.5s-.2 2.4-.6 3.5c-.4 1.1-.9 2-1.9 2.9s-1.8 1.5-2.9 1.9c-1.1.4-2.3.6-3.5.6s-2.4-.2-3.5-.6c-1.1-.4-2-.9-2.9-1.9s-1.5-1.8-1.9-2.9c-.4-1.1-.6-2.3-.6-3.5s.2-2.4.6-3.5c.4-1.1.9-2 1.9-2.9s1.8-1.5 2.9-1.9c1.1-.4 2.3-.6 3.5-.6Zm0 3.7A6.2 6.2 0 1 0 18.2 12 6.2 6.2 0 0 0 12 5.8Zm0 10.2A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm6.5-11.9a1.5 1.5 0 1 0 1.5 1.5 1.5 1.5 0 0 0-1.5-1.5Z" />
    </svg>
  );
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.6 3c.2 1.7 1.2 3 3.1 3.4v3a6.5 6.5 0 0 1-3.1-.9v5.3a6.6 6.6 0 1 1-6.6-6.6c.3 0 .7 0 1 .1v3.1a3.5 3.5 0 1 0 2.4 3.3V3h3.2Z" />
    </svg>
  );
}

export function SnapchatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2.8c2.9 0 5.2 2.1 5.8 5.4.2 1.2.2 2.3.2 2.9 0 .5-.4.9-.9.9-.2 0-.4 0-.5-.1l.3 1.2c.4 1.1-1.1 2.6-3.3 3l-.5 1.7c0 .1-.2.3-.5.3h-1.7c-.3 0-.6-.1-.6-.3l-.5-1.7c-2.2-.4-3.6-1.9-3.3-3l.3-1.2c-.3.1-.5.1-.8.1-.5 0-.9-.4-.9-.9 0-.6 0-1.7.2-2.9C6.8 4.9 9.1 2.8 12 2.8Zm.1 2a4 4 0 0 0-4.7 4.8c.2.9.2 1.8.2 2.4 0 .1 0 .2-.1.3l-.6 2.3c.6.3 1.6.6 2.7.8l.5-2.1 1.8 2.6 1.7-2.6.5 2.1c1.1-.2 2.1-.5 2.8-.8l-.6-2.3c-.1-.1-.1-.2-.1-.3 0-.6 0-1.5.2-2.4a4 4 0 0 0-4.3-4.8Z" />
    </svg>
  );
}
