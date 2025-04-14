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

  // Utiliser le dossier personnalisé ou le dossier par défaut 'screenshots'
  const screenshotsDir = outputDir 
    ? path.resolve(outputDir) 
    : path.join(process.cwd(), 'screenshots');
  
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
    // Lancer le navigateur
    const browser = await puppeteer.launch({
      headless: 'new', // Utilise le nouveau mode headless pour Puppeteer
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Ouvrir une nouvelle page
    const page = await browser.newPage();
    
    // Définir une taille d'écran standard
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Aller à l'URL et attendre que la page soit chargée
    await page.goto(url, { waitUntil: 'networkidle2' });
    
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