import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { DEFAULT_CONFIG } from './cli.js';
import { normalizeUrl, generateFilename } from './utils.js';

export async function takeScreenshot(
  url,
  options = {},
) {
  const {
    outputDir = DEFAULT_CONFIG.outputDir,
    format = DEFAULT_CONFIG.format,
    delay = DEFAULT_CONFIG.delay,
    quality = DEFAULT_CONFIG.quality,
    width = DEFAULT_CONFIG.width,
    height = DEFAULT_CONFIG.height,
    fullPage = DEFAULT_CONFIG.fullPage,
    executablePath = DEFAULT_CONFIG.executablePath,
    timeout = DEFAULT_CONFIG.timeout,
    waitUntil = DEFAULT_CONFIG.waitUntil,
  } = options;

  let currentUrl;
  try {
    currentUrl = normalizeUrl(url);
  } catch (error) {
    throw new Error(`Validation URL échouée: ${error.message}`);
  }

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

  let browser;
  try {
    const launchOptions = {
      headless: true,
      // AVERTISSEMENT: Ces flags désactivent certaines protections de sécurité.
      // Utilisez-les uniquement dans des environnements de confiance (conteneurs, CI/CD).
      // Pour un usage en production, configurez un environnement avec les permissions appropriées.
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    // N'ajouter executablePath que s'il est défini
    if (executablePath) {
      launchOptions.executablePath = executablePath;
      console.log(`Utilisation de l'exécutable du navigateur : ${executablePath}`);
    } else {
      console.log('Utilisation du Chromium intégré à Puppeteer');
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setViewport({ width, height });

    console.log(`Navigation vers ${currentUrl}...`);
    try {
      await page.goto(currentUrl, {
        waitUntil: waitUntil,
        timeout: timeout,
      });
    } catch (navError) {
      if (navError.name === 'TimeoutError') {
        throw new Error(`Timeout dépassé (${timeout}ms) lors du chargement de ${currentUrl}`);
      }
      throw new Error(`Erreur de navigation vers ${currentUrl}: ${navError.message}`);
    }

    if (delay > 0) {
      console.log(`Attente de ${delay}ms avant capture...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const screenshotOptions = {
      path: filePath,
      fullPage: fullPage,
      type: format,
    };

    if (format === 'jpeg' || format === 'webp') {
      screenshotOptions.quality = quality;
      console.log(`Qualité d'image: ${quality}%`);
    }

    console.log("Prise de la capture d'écran...");
    await page.screenshot(screenshotOptions);

    console.log(`Capture d'écran enregistrée: ${filePath}`);
    return filePath;
  } catch (error) {
    throw new Error(`Erreur lors de la capture d'écran pour ${currentUrl}: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
