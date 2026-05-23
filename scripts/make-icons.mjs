import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'fs'

mkdirSync('public/icons', { recursive: true })

// Music note icon SVG
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#0a0a0f"/>
  <rect width="100" height="100" rx="22" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c5cbf"/>
      <stop offset="100%" style="stop-color:#1db954"/>
    </linearGradient>
  </defs>
  <text x="50" y="68" font-size="54" text-anchor="middle" fill="white">🎵</text>
</svg>`)

for (const size of [192, 512]) {
  await sharp(svg).resize(size, size).png().toFile(`public/icons/${size}.png`)
  console.log(`✅ Generated public/icons/${size}.png`)
}

// OG image 1200x630
const ogSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0d0520"/>
      <stop offset="50%" stop-color="#0a0a0f"/>
      <stop offset="100%" stop-color="#001a0a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="6" fill="#7c5cbf"/>
  <text x="80" y="240" font-family="sans-serif" font-size="90" font-weight="bold" fill="white">🎵 Evanié Music</text>
  <text x="80" y="310" font-family="sans-serif" font-size="36" fill="#b3b3b3">Free music · Podcasts · Learning — No ads, no account</text>
  <rect x="80" y="370" width="400" height="58" rx="29" fill="#1a1a2e"/>
  <text x="105" y="407" font-family="sans-serif" font-size="28" fill="#7c5cbf">music.evanietech.com</text>
</svg>`)

await sharp(ogSvg).resize(1200, 630).png().toFile('public/og-image.png')
console.log('✅ Generated public/og-image.png')
