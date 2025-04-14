// screenshot.mjs
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Obtenir le répertoire courant en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction principale pour prendre une capture d'écran
async function takeScreenshot(url, outputDir) {
  // Vérifier si l'URL est valide
  if (!url) {
    console.error('Erreur: Veuillez fournir une URL valide');
    console.log('Usage: pnpm screenshot <url> [outputDir]');
    process.exit(1);
  }

  // Assurer que l'URL commence par http:// ou https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url;
  }

  console.log(`Prise de capture d'écran de: ${url}`);

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

  console.log(`Répertoire d'exécution: ${currentExecutionDir}`);
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
  
  const filename = `${urlForFilename}_${timestamp}.png`;
  const filePath = path.join(screenshotsDir, filename);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: '/usr/bin/google-chrome'
    });
    
    // Ouvrir une nouvelle page
    const page = await browser.newPage();
    
    // Définir une taille d'écran standard
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Ajouter un log pour voir le chargement
    console.log(`Navigation vers: ${url}`);
    
    // Aller à l'URL et attendre que la page soit chargée avec un timeout pnpm screenshot https://www.google.fraugmenté
    try {
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 60000 // Augmenter le timeout de navigation à 60 secondes
      });
      console.log('Page chargée avec succès');
    } catch (error) {
      console.error(`Erreur lors du chargement de la page: ${error.message}`);
      await browser.close();
      process.exit(1);
    }
    
    // Prendre la capture d'écran
    await page.screenshot({ path: filePath, fullPage: true });
    
    // Fermer le navigateur
    await browser.close();
    
    console.log(`Capture d'écran enregistrée: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Erreur lors de la capture d\'écran:', error);
    process.exit(1);
  }
}

// Récupérer l'URL et le dossier de sortie depuis les arguments de ligne de commande
const url = process.argv[2];
const outputDir = process.argv[3];

// Exécuter la fonction
takeScreenshot(url, outputDir);