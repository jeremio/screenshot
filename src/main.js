#!/usr/bin/env node
// Traitement des arguments avec options nommées
// Format: pnpm screenshot <url> [options]

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
// import { fileURLToPath } from 'url';
import { DEFAULT_CONFIG, parseArgs, showHelp } from './cli.js';

// Obtenir le répertoire courant en ESM
// const __filename = fileURLToPath(import.meta.url); // Plus nécessaire ici si non utilisé
// const __dirname = path.dirname(__filename); // Plus nécessaire ici si non utilisé


// Fonction principale pour prendre une capture d'écran
async function takeScreenshot(url, outputDir, format = DEFAULT_CONFIG.format, 
                             delay = DEFAULT_CONFIG.delay, quality = DEFAULT_CONFIG.quality,
                             width = DEFAULT_CONFIG.width, height = DEFAULT_CONFIG.height,
                             fullPage = DEFAULT_CONFIG.fullPage) {
  // Vérifier si l'URL est valide
  if (!url) {
    console.error('Erreur: Veuillez fournir une URL valide');
    showHelp(); // Utilise la fonction importée
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
    // Pas de dossier spécifié : utiliser directement le répertoire d'exécution actuel (comportement par défaut)
    screenshotsDir = currentExecutionDir;
  } else {
    // Dossier spécifié : résoudre le chemin par rapport au répertoire d'exécution
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
const { url, outputDir, format, delay, quality, width, height, fullPage } = parseArgs(); // Utilise la fonction importée

// Si pas d'URL et pas --help (géré dans parseArgs maintenant), vérifier l'URL ici
if (!url) {
  // parseArgs gère déjà le --help et quitte.
  // Si on arrive ici sans URL, c'est que --help n'a pas été fourni et qu'il manque l'URL.
  console.error('Erreur: URL manquante');
  showHelp();
  process.exit(1);
}

// Exécuter la fonction
takeScreenshot(url, outputDir, format, delay, quality, width, height, fullPage);
