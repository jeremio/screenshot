#!/usr/bin/env node
// Traitement des arguments avec options nommées
// Format: pnpm screenshot <url> [options]

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Obtenir le répertoire courant en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration par défaut
const DEFAULT_CONFIG = {
  width: 1920,
  height: 1080,
  format: 'png',
  quality: 85,
  delay: 0,
  fullPage: true
};

// Fonction pour analyser les arguments de ligne de commande
function parseArgs() {
  const args = process.argv.slice(2);
  let url = '';
  let outputDir = null;
  let format = DEFAULT_CONFIG.format;
  let delay = DEFAULT_CONFIG.delay;
  let quality = DEFAULT_CONFIG.quality;
  let width = DEFAULT_CONFIG.width;
  let height = DEFAULT_CONFIG.height;
  let fullPage = DEFAULT_CONFIG.fullPage;

  // Première valeur non-option est l'URL
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--') || arg.startsWith('-')) {
      // C'est une option, la traiter avec sa valeur
      if (arg === '--output' || arg === '-o') {
        outputDir = args[++i]; // Prendre la valeur suivante
      } else if (arg === '--format' || arg === '-f') {
        format = args[++i]; // Prendre la valeur suivante
      } else if (arg === '--delay' || arg === '-d') {
        delay = parseInt(args[++i], 10); // Convertir en nombre
        if (isNaN(delay) || delay < 0) {
          console.error('Erreur: Le délai doit être un nombre positif en millisecondes');
          process.exit(1);
        }
      } else if (arg === '--quality' || arg === '-q') {
        quality = parseInt(args[++i], 10); // Convertir en nombre
        if (isNaN(quality) || quality < 1 || quality > 100) {
          console.error('Erreur: La qualité doit être un nombre entre 1 et 100');
          process.exit(1);
        }
      } else if (arg === '--width' || arg === '-w') {
        width = parseInt(args[++i], 10); // Convertir en nombre
        if (isNaN(width) || width <= 0) {
          console.error('Erreur: La largeur doit être un nombre positif');
          process.exit(1);
        }
      } else if (arg === '--height' || arg === '-h') {
        height = parseInt(args[++i], 10); // Convertir en nombre
        if (isNaN(height) || height <= 0) {
          console.error('Erreur: La hauteur doit être un nombre positif');
          process.exit(1);
        }
      } else if (arg === '--full-page' || arg === '-fp') {
        const value = args[++i];
        if (value && (value.toLowerCase() === 'false' || value === '0')) {
          fullPage = false;
        } else {
          fullPage = true;
        }
      } else if (arg === '--help') {
        showHelp();
        process.exit(0);
      } else {
        console.error(`Option non reconnue: ${arg}`);
        showHelp();
        process.exit(1);
      }
    } else if (!url) {
      // Premier argument non-option est l'URL
      url = arg;
    }
  }

  return { url, outputDir, format, delay, quality, width, height, fullPage };
}

// Afficher l'aide
function showHelp() {
  console.log(`
Usage: pnpm screenshot <url> [options]

Options:
  --output, -o <dir>      Dossier de destination (par défaut: ./screenshots)
  --format, -f <format>   Format d'image: png, jpeg, webp (par défaut: png)
  --delay, -d <ms>        Délai en millisecondes avant la capture (par défaut: 0)
  --quality, -q <1-100>   Qualité pour jpeg/webp (par défaut: 85)
  --width, -w <pixels>    Largeur de la fenêtre en pixels (par défaut: 1920)
  --height, -h <pixels>   Hauteur de la fenêtre en pixels (par défaut: 1080)
  --full-page, -fp <bool> Capturer la page entière (par défaut: true)
  --help                  Afficher cette aide

Exemples:
  pnpm screenshot https://example.com
  pnpm screenshot https://example.com -o ./captures
  pnpm screenshot https://example.com -fp false -f jpeg -q 90
  pnpm screenshot https://example.com -d 2000 -w 375 -h 667 -f webp
  `);
}

// Fonction principale pour prendre une capture d'écran
async function takeScreenshot(url, outputDir, format = DEFAULT_CONFIG.format, 
                             delay = DEFAULT_CONFIG.delay, quality = DEFAULT_CONFIG.quality,
                             width = DEFAULT_CONFIG.width, height = DEFAULT_CONFIG.height,
                             fullPage = DEFAULT_CONFIG.fullPage) {
  // Vérifier si l'URL est valide
  if (!url) {
    console.error('Erreur: Veuillez fournir une URL valide');
    showHelp();
    process.exit(1);
  }

  // Valider le format
  const validFormats = ['png', 'jpeg', 'webp'];
  if (!validFormats.includes(format.toLowerCase())) {
    console.error(`Erreur: Format "${format}" non supporté. Utilisez png, jpeg ou webp.`);
    process.exit(1);
  }

  // Normaliser le format (minuscules)
  format = format.toLowerCase();

  // Assurer que l'URL commence par http:// ou https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url;
  }

  console.log(`Prise de capture d'écran de: ${url}`);
  console.log(`Format: ${format}, Résolution: ${width}x${height}, Page entière: ${fullPage ? 'Oui' : 'Non'}`);
  
  if (delay > 0) {
    console.log(`Délai avant capture: ${delay}ms`);
  }

  // Déterminer le dossier de destination - tout est relatif au répertoire d'exécution
  const currentExecutionDir = process.cwd();
  let screenshotsDir;

  if (!outputDir) {
    // Pas de dossier spécifié : utiliser ./screenshots relatif au répertoire d'exécution
    screenshotsDir = path.join(currentExecutionDir, 'screenshots');
  } else if (outputDir === '.') {
    // Point spécifié : utiliser directement le répertoire d'exécution actuel
    screenshotsDir = currentExecutionDir;
  } else {
    // Autre dossier spécifié : résoudre le chemin par rapport au répertoire d'exécution
    screenshotsDir = path.isAbsolute(outputDir) 
      ? outputDir 
      : path.join(currentExecutionDir, outputDir);
  }

  console.log(`Dossier de destination: ${screenshotsDir}`);

  // Créer le dossier de destination s'il n'existe pas
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Formater la date et l'heure pour le nom du fichier
  const date = new Date();
  const timestamp = date.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '');
  
  // Créer un nom de fichier basé sur l'URL et le timestamp
  const urlForFilename = url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);
  
  // Ajouter des informations sur la résolution au nom du fichier
  const filename = `${urlForFilename}_${width}x${height}_${timestamp}.${format}`;
  const filePath = path.join(screenshotsDir, filename);

  try {
    // Lancer le navigateur
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: '/usr/bin/google-chrome'
    });
    
    // Ouvrir une nouvelle page
    const page = await browser.newPage();
    
    // Définir la taille d'écran spécifiée
    await page.setViewport({ width, height });
    
    // Aller à l'URL et attendre que la page soit chargée
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Attendre le délai spécifié si nécessaire
    if (delay > 0) {
      console.log(`Attente de ${delay}ms avant capture...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Options pour la capture d'écran
    const screenshotOptions = { 
      path: filePath,
      fullPage: fullPage,
      type: format
    };
    
    // Ajouter la qualité pour jpeg et webp
    if (format === 'jpeg' || format === 'webp') {
      screenshotOptions.quality = quality;
      console.log(`Qualité d'image: ${quality}%`);
    }
    
    // Prendre la capture d'écran
    await page.screenshot(screenshotOptions);
    
    // Fermer le navigateur
    await browser.close();
    
    console.log(`Capture d'écran enregistrée: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Erreur lors de la capture d\'écran:', error);
    process.exit(1);
  }
}

// Analyser les arguments et exécuter
const { url, outputDir, format, delay, quality, width, height, fullPage } = parseArgs();

// Si pas d'URL et pas --help, afficher l'aide
if (!url) {
  console.error('Erreur: URL manquante');
  showHelp();
  process.exit(1);
}

// Exécuter la fonction
takeScreenshot(url, outputDir, format, delay, quality, width, height, fullPage);