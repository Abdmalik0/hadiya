import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
const assetsDir = path.resolve('assets');
const androidResDir = path.resolve('android/app/src/main/res');

[publicDir, assetsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Full fidelity Halaba City FC SVG Icon (Shield & Emblem)
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#2a0306" />
      <stop offset="60%" stop-color="#140102" />
      <stop offset="100%" stop-color="#0a0a0a" />
    </radialGradient>
    <linearGradient id="shieldRed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f02029" />
      <stop offset="45%" stop-color="#c80815" />
      <stop offset="100%" stop-color="#880007" />
    </linearGradient>
    <linearGradient id="shieldRim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff6b6b" />
      <stop offset="50%" stop-color="#c80815" />
      <stop offset="100%" stop-color="#550005" />
    </linearGradient>
    <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffd857" />
      <stop offset="40%" stop-color="#f5b800" />
      <stop offset="70%" stop-color="#e09e00" />
      <stop offset="100%" stop-color="#ffd857" />
    </linearGradient>
    <linearGradient id="ribbonGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#088c3a" />
      <stop offset="50%" stop-color="#056b2b" />
      <stop offset="100%" stop-color="#02431a" />
    </linearGradient>
    <radialGradient id="chiliGlow" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ff4538" />
      <stop offset="60%" stop-color="#d30909" />
      <stop offset="100%" stop-color="#7a0000" />
    </radialGradient>
    <linearGradient id="gloss" x1="0%" y1="0%" x2="100%" y2="80%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Deep dark luxury rounded canvas -->
  <rect width="512" height="512" rx="104" fill="url(#bgGlow)" />

  <g transform="translate(6, -6)">
    <!-- Shield Outer Shadow -->
    <path
      d="M 140 40 Q 250 65 360 40 C 430 70 470 190 420 350 C 380 435 290 495 250 515 C 210 495 120 435 80 350 C 30 190 70 70 140 40 Z"
      fill="#000000"
      opacity="0.6"
      transform="translate(0, 10)"
    />

    <!-- Main Scarlet Red Shield -->
    <path
      d="M 140 40 Q 250 65 360 40 C 430 70 470 190 420 350 C 380 435 290 495 250 515 C 210 495 120 435 80 350 C 30 190 70 70 140 40 Z"
      fill="url(#shieldRed)"
      stroke="url(#shieldRim)"
      stroke-width="7"
    />

    <!-- Specular Gloss -->
    <path
      d="M 145 48 Q 250 70 355 48 C 410 80 440 180 410 280 C 330 240 200 160 145 48 Z"
      fill="url(#gloss)"
    />

    <!-- White Inner Field -->
    <path
      d="M 140 200 Q 250 205 360 200 C 400 280 380 375 250 430 C 120 375 100 280 140 200 Z"
      fill="#ffffff"
    />

    <!-- HALABA Header -->
    <text
      x="250"
      y="112"
      text-anchor="middle"
      fill="#ffffff"
      font-family="system-ui, -apple-system, sans-serif"
      font-weight="900"
      font-size="44"
      letter-spacing="4"
    >HALABA</text>
    <text
      x="250"
      y="156"
      text-anchor="middle"
      fill="#ffffff"
      font-family="system-ui, -apple-system, sans-serif"
      font-weight="900"
      font-size="38"
      letter-spacing="5"
    >CITY FC</text>

    <!-- 1966 Year Badge -->
    <rect x="200" y="172" width="100" height="26" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <text
      x="250"
      y="192"
      text-anchor="middle"
      fill="#111827"
      font-family="system-ui, -apple-system, sans-serif"
      font-weight="900"
      font-size="20"
      letter-spacing="2"
    >1966</text>

    <!-- Traditional Conical Hat -->
    <path d="M 230 268 C 232 230 240 215 250 215 C 260 215 268 230 270 268 Z" fill="#e2ca9b" stroke="#a67c3b" stroke-width="2" />
    <path d="M 232 258 Q 250 261 268 258 L 269 266 Q 250 269 231 266 Z" fill="#e6007e" />
    <ellipse cx="250" cy="273" rx="44" ry="12" fill="#ecd8b3" stroke="#b08a4c" stroke-width="2" />

    <!-- Berbere Peppers -->
    <path d="M 240 218 C 215 220 185 245 188 285 C 190 325 210 365 235 375 C 220 365 210 330 212 285 C 214 248 230 228 240 218 Z" fill="url(#chiliGlow)" stroke="#990000" stroke-width="1.5" />
    <path d="M 260 218 C 285 220 315 245 312 285 C 310 325 290 365 265 375 C 280 365 290 330 288 285 C 286 248 270 228 260 218 Z" fill="url(#chiliGlow)" stroke="#990000" stroke-width="1.5" />

    <!-- Soccer Ball -->
    <circle cx="250" cy="370" r="32" fill="#ffffff" stroke="#1f2937" stroke-width="2.5" />
    <polygon points="250,358 261,366 257,380 243,380 239,366" fill="#111827" />
    <line x1="250" y1="358" x2="250" y2="342" stroke="#1f2937" stroke-width="2" />
    <line x1="261" y1="366" x2="276" y2="360" stroke="#1f2937" stroke-width="2" />
    <line x1="257" y1="380" x2="272" y2="392" stroke="#1f2937" stroke-width="2" />
    <line x1="243" y1="380" x2="228" y2="392" stroke="#1f2937" stroke-width="2" />
    <line x1="239" y1="366" x2="224" y2="360" stroke="#1f2937" stroke-width="2" />

    <!-- Emerald Green Ribbon Banner -->
    <path
      d="M 85 405 Q 250 490 415 405 L 415 445 Q 250 535 85 445 Z"
      fill="url(#ribbonGreen)"
      stroke="url(#goldTrim)"
      stroke-width="4"
    />
    <text
      x="250"
      y="456"
      text-anchor="middle"
      fill="#ffffff"
      font-family="'Noto Sans Ethiopic', system-ui, sans-serif"
      font-weight="bold"
      font-size="25"
      letter-spacing="2"
    >ሀላባ ከተማ እግርኳስ ክለብ</text>
  </g>
</svg>`;

// Circular Maskable Icon
const svgCircular = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGlowRound" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#2a0306" />
      <stop offset="60%" stop-color="#140102" />
      <stop offset="100%" stop-color="#0a0a0a" />
    </radialGradient>
  </defs>
  <circle cx="256" cy="256" r="256" fill="url(#bgGlowRound)" />
  <g transform="translate(56, 56) scale(0.78)">
    ${svgIcon.replace(/<\/?svg[^>]*>/g, '').replace(/<rect width="512"[^>]*\/>/, '')}
  </g>
</svg>`;

// Transparent Foreground for Android Adaptive Icons
const svgForeground = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <g transform="translate(68, 68) scale(0.73)">
    ${svgIcon.replace(/<\/?svg[^>]*>/g, '').replace(/<rect width="512"[^>]*\/>/, '')}
  </g>
</svg>`;

// High-Res Splash Screen (2732x2732)
const svgSplash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732" width="2732" height="2732">
  <defs>
    <radialGradient id="splashGlow" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#2d0508" />
      <stop offset="50%" stop-color="#120103" />
      <stop offset="100%" stop-color="#050505" />
    </radialGradient>
  </defs>
  <rect width="2732" height="2732" fill="url(#splashGlow)" />
  <g transform="translate(866, 750) scale(1.95)">
    ${svgIcon.replace(/<\/?svg[^>]*>/g, '').replace(/<rect width="512"[^>]*\/>/, '')}
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);

async function generateAllIcons() {
  console.log('Generating high-resolution PWA, Capacitor, and Android launcher icons...');
  const iconBuffer = Buffer.from(svgIcon);
  const circularBuffer = Buffer.from(svgCircular);
  const foregroundBuffer = Buffer.from(svgForeground);
  const splashBuffer = Buffer.from(svgSplash);

  // 1. Root /assets/ (for Capacitor Assets CLI: npx @capacitor/assets generate --android)
  await sharp(iconBuffer).resize(1024, 1024).png().toFile(path.join(assetsDir, 'icon.png'));
  await sharp(iconBuffer).resize(1024, 1024).png().toFile(path.join(assetsDir, 'icon-only.png'));
  await sharp(foregroundBuffer).resize(1024, 1024).png().toFile(path.join(assetsDir, 'icon-foreground.png'));
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: '#0a0a0a' },
  }).png().toFile(path.join(assetsDir, 'icon-background.png'));
  await sharp(iconBuffer).resize(1024, 1024).png().toFile(path.join(assetsDir, 'logo.png'));
  await sharp(splashBuffer).resize(2732, 2732).png().toFile(path.join(assetsDir, 'splash.png'));

  // 2. Public PWA Icons
  await sharp(iconBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(iconBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(circularBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  await sharp(iconBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(iconBuffer).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.png'));

  // 3. Android Mipmap Icons directly in android/app/src/main/res/
  const densities = [
    { name: 'mdpi', size: 48, fgSize: 108 },
    { name: 'hdpi', size: 72, fgSize: 162 },
    { name: 'xhdpi', size: 96, fgSize: 216 },
    { name: 'xxhdpi', size: 144, fgSize: 324 },
    { name: 'xxxhdpi', size: 192, fgSize: 432 },
  ];

  for (const { name, size, fgSize } of densities) {
    const targetDir = path.join(androidResDir, `mipmap-${name}`);
    if (fs.existsSync(targetDir)) {
      await sharp(iconBuffer).resize(size, size).png().toFile(path.join(targetDir, 'ic_launcher.png'));
      await sharp(circularBuffer).resize(size, size).png().toFile(path.join(targetDir, 'ic_launcher_round.png'));
      await sharp(foregroundBuffer).resize(fgSize, fgSize).png().toFile(path.join(targetDir, 'ic_launcher_foreground.png'));
      console.log(`Updated Android mipmap-${name} launcher icons (${size}x${size}, fg: ${fgSize}x${fgSize})`);
    }
  }

  console.log('Official Halaba City FC icons generated across public/, assets/, and android/res/!');
}

generateAllIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
