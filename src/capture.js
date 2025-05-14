import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { DEFAULT_CONFIG } from './cli.js';
import { normalizeUrl, generateFilename } from './utils.js';

export async function takeScreenshot(
  url,
  options = {}
) {
  const {
    outputDir = DEFAULT_CONFIG.outputDir,
    format = DEFAULT_CONFIG.format,
    delay = DEFAULT_CONFIG.delay,
    quality = DEFAULT_CONFIG.quality,
    width = DEFAULT_CONFIG.width,
    height = DEFAULT_CONFIG.height,
    fullPage = DEFAULT_CONFIG.fullPage,
    executablePath = DEFAULT_CONFIG.executablePath
  } = options;

  const currentUrl = normalizeUrl(url);

  console.log(`Prise de capture d'écran de: ${currentUrl}`);
  console.log(`Format: ${format}, Résolution: ${width}x${height}, Page entière: ${fullPage ? 'Oui' : 'Non'}`);

  if (delay > 0) {
    console.log(`Délai avant capture: ${delay}ms`);
  }

  const currentExecutionDir = process.cwd();
  let screenshotsDir;

  if (outputDir === '.') {
    screenshotsDir = currentExecutionDir;
  } else {
    screenshotsDir = path.isAbsolute(outputDir)
      ? outputDir
      : path.join(currentExecutionDir, outputDir);
  }

  console.log(`Dossier de destination: ${screenshotsDir}`);

  if (!fs.existsSync(screenshotsDir)) {
    console.log(`Création du dossier: ${screenshotsDir}`);
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const filename = generateFilename(currentUrl, width, height, format);
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

    console.log(`Navigation vers ${currentUrl}...`);
    await page.goto(currentUrl, { waitUntil: 'networkidle2' });

    if (delay > 0) {
      console.log(`Attente de ${delay}ms avant capture...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const screenshotOptions = {
      path: filePath,
      fullPage: fullPage,
      type: format
    };

    if (format === 'jpeg' || format === 'webp') {
      screenshotOptions.quality = quality;
      console.log(`Qualité d'image: ${quality}%`);
    }

    console.log("Prise de la capture d'écran...");
    await page.screenshot(screenshotOptions);
    await browser.close();

    console.log(`Capture d'écran enregistrée: ${filePath}`);
    return filePath;
  } catch (error) {
    throw new Error(`Erreur lors de la capture d'écran pour ${currentUrl}: ${error.message}`);
  }
}
