/**
 * Founder judgment sheet — renders the six trade-card artworks exactly as
 * the live page draws them (same components, same geometry) into one
 * standalone HTML file. Not part of the build; a lab tool.
 *
 *   npx vite-node scripts/render-trade-art-preview.mts
 */
import { writeFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TradeArt } from "../src/features/company-site/components/trade-art";

/** Mirrors TRADE_CARDS in home.tsx (kept alias-free so vite-node runs cold). */
const NAMED = [
  { name: "Roofing", line: "Storm-season ready. Emergency call-outs answered.", glow: "rgba(90,140,255,0.4)", art: "roofing", tint: "#8fb2ff" },
  { name: "Landscaping", line: "Season-aware. Portfolio-led. Enquiries in spring.", glow: "rgba(65,214,150,0.34)", art: "landscaping", tint: "#5fe0a8" },
  { name: "Driveways", line: "Block paving to resin — kerb appeal that wins the street.", glow: "rgba(255,177,90,0.32)", art: "driveways", tint: "#ffc586" },
  { name: "Solar", line: "Panels, batteries, EV chargers — enquiries with intent.", glow: "rgba(255,210,104,0.3)", art: "solar", tint: "#ffdf8f" },
  { name: "Motor trade", line: "MOTs, servicing, repairs — bays kept full.", glow: "rgba(110,231,255,0.32)", art: "motor", tint: "#8fe8ff" },
] as const;

const cards = [
  ...NAMED.map((c) => ({ ...c, cta: "See it built →" })),
  {
    name: "+ 30 more",
    line: "35 trades researched. TITAN adapts to yours.",
    glow: "rgba(180,139,255,0.36)",
    art: "network" as const,
    tint: "#c9adff",
    cta: "Every trade →",
  },
];

const cardHtml = cards
  .map((c) => {
    const svg = renderToStaticMarkup(
      createElement(TradeArt, { kind: c.art, tint: c.tint }),
    );
    return `<a class="tc" style="background:radial-gradient(130% 95% at 50% 0%, ${c.glow} 0%, transparent 60%), linear-gradient(180deg, rgba(16,23,38,0.92), rgba(7,10,18,0.95))">
      ${svg}
      <p class="tn">${c.name}</p>
      <p class="td">${c.line}</p>
      <p class="go">${c.cta}</p>
    </a>`;
  })
  .join("\n");

const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>TITAN — trade-card artwork, for the founder's judgment</title><style>
  html,body{margin:0;background:#02040a;color:#eef2f8;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif}
  .wrap{max-width:1240px;margin:0 auto;padding:64px 44px}
  h1{font-size:22px;font-weight:700;letter-spacing:0.06em;text-align:center;margin:0 0 6px}
  h1 .a{color:#7fa8ff}
  .sub{text-align:center;color:#93a3b8;font-size:13px;margin:0 0 44px}
  .grid{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
  .tc{width:186px;height:224px;border-radius:16px;border:1px solid rgba(255,255,255,0.08);position:relative;overflow:hidden;padding:16px;display:flex;flex-direction:column;justify-content:flex-end;text-decoration:none;color:inherit;transition:border-color .2s}
  .tc:hover{border-color:rgba(127,168,255,0.4)}
  .tc svg{position:absolute;left:0;right:0;top:0;height:62%;width:100%;opacity:.8;transition:opacity .3s;pointer-events:none}
  .tc:hover svg{opacity:1}
  .tn{font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#fff;margin:0}
  .td{margin:6px 0 0;font-size:11px;line-height:1.45;color:rgba(255,255,255,0.55)}
  .go{margin:8px 0 0;font-size:10.5px;color:#9db9e8}
  .note{margin-top:44px;text-align:center;color:#5d7396;font-size:11.5px;line-height:1.7;max-width:62ch;margin-inline:auto}
</style></head><body><div class="wrap">
  <h1>THE TRADE CARDS, <span class="a">WITH THEIR IMAGERY.</span></h1>
  <p class="sub">Drawn light in the sphere's own language — server-computed SVG, zero image files, zero client JS. Exactly as the live page renders them.</p>
  <div class="grid">${cardHtml}</div>
  <p class="note">Honesty by construction: unmistakably artwork — no photograph, no depiction of any customer's work, nothing that could be mistaken for evidence. If you'd rather have photographic imagery here, these slots take generated photos the day you supply or approve them; the law amendment is the only extra step.</p>
</div></body></html>`;

writeFileSync("/tmp/trade-art-preview.html", html);
console.log("written /tmp/trade-art-preview.html");
