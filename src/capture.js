import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { DEFAULT_CONFIG } from './cli.js';
import { normalizeUrl, generateFilename } from './utils.js';

export async function takeScreenshot(
  url,
  outputDir,
  format = DEFAULT_CONFIG.format,
  delay = DEFAULT_CONFIG.delay,
  quality = DEFAULT_CONFIG.quality,
  width = DEFAULT_CONFIG.width,
  height = DEFAULT_CONFIG.height,
  fullPage = DEFAULT_CONFIG.fullPage,
  executablePath = DEFAULT_CONFIG.executablePath
) {
  const validFormats = ['png', 'jpeg', 'webp'];
  const lowerCaseFormat = format.toLowerCase();

  if (!validFormats.includes(lowerCaseFormat)) {
    // Lancer une erreur au lieu de quitter directement
    throw new Error(`Format d'image non supporté : "${format}". Formats valides : png, jpeg, webp.`);
  }

  const currentUrl = normalizeUrl(url); 

  console.log(`Prise de capture d'écran de: ${currentUrl}`);
  console.log(`Format: ${lowerCaseFormat}, Résolution: ${width}x${height}, Page entière: ${fullPage ? 'Oui' : 'Non'}`);

  if (delay > 0) {
    console.log(`Délai avant capture: ${delay}ms`);
  }

  const currentExecutionDir = process.cwd();
  let screenshotsDir;

  if (!outputDir) {
    screenshotsDir = currentExecutionDir;
  } else {
    screenshotsDir = path.isAbsolute(outputDir)
      ? outputDir
      : path.join(currentExecutionDir, outputDir);
  }

  console.log(`Dossier de destination: ${screenshotsDir}`);

  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Utiliser lowerCaseFormat pour générer le nom de fichier
  const filename = generateFilename(currentUrl, width, height, lowerCaseFormat);
  const filePath = path.join(screenshotsDir, filename);

  try {
    const launchOptions = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: executablePath
    };
    console.log(`Utilisation de l'exécutable du navigateur : ${executablePath}`);

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(currentUrl, { waitUntil: 'networkidle2' });

    if (delay > 0) {
      console.log(`Attente de ${delay}ms avant capture...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const screenshotOptions = {
      path: filePath,
      fullPage: fullPage,
      type: lowerCaseFormat
    };

    if (lowerCaseFormat === 'jpeg' || lowerCaseFormat === 'webp') {
      screenshotOptions.quality = quality;
      console.log(`Qualité d'image: ${quality}%`);
    }

    await page.screenshot(screenshotOptions);
    await browser.close();

    console.log(`Capture d'écran enregistrée: ${filePath}`);
    return filePath;
  } catch (error) {
    throw new Error(`Erreur lors de la capture d'écran pour ${currentUrl}: ${error.message}`);
  }
}
