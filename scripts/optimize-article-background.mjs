import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const imageDirectory = path.resolve(scriptDirectory, "../public/images/article-background");

const images = [
  { name: "ward", resize: { height: 1200 } },
  { name: "surgery", resize: { width: 1400 } },
  { name: "corridor", resize: { height: 1200 } },
  { name: "ct", resize: { width: 1400 } },
];

for (const image of images) {
  const source = path.join(imageDirectory, `${image.name}.jpg`);
  const output = path.join(imageDirectory, `${image.name}.webp`);

  await sharp(source)
    .rotate()
    .resize({ ...image.resize, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 76, effort: 5, smartSubsample: true })
    .toFile(output);

  const metadata = await sharp(output).metadata();
  console.log(`${image.name}.webp: ${metadata.width}x${metadata.height}`);
}
