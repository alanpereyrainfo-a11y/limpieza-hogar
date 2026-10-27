import { readFile, writeFile, mkdir } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";

const source = await readFile(new URL("../src/assets/mapi-icon.svg", import.meta.url), "utf8");
await mkdir(new URL("../public/icons/", import.meta.url), { recursive: true });

function scaled(svg, scale) {
  return svg.replace(
    '<g id="art">',
    `<g id="art" transform="translate(256 256) scale(${scale}) translate(-256 -256)">`,
  );
}

async function png(svg, size, filename) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    background: "rgba(0,0,0,0)",
  });
  const out = resvg.render().asPng();
  const url = new URL(`../public/${filename}`, import.meta.url);
  await writeFile(url, out);
  console.log(filename, out.length);
}

const any = source;
const apple = scaled(source, 0.9);
const maskable = scaled(source, 0.78);

await writeFile(new URL("../public/favicon.svg", import.meta.url), any);
await png(any, 32, "icons/favicon-32.png");
await png(apple, 180, "icons/apple-touch-icon.png");
await png(any, 192, "icons/icon-192.png");
await png(any, 512, "icons/icon-512.png");
await png(maskable, 192, "icons/maskable-192.png");
await png(maskable, 512, "icons/maskable-512.png");
