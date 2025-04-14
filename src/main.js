// Traitement des arguments avec options nommées
// Format: pnpm screenshot <url> [--output|-o <dir>] [--format|-f <format>]

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Obtenir le répertoire courant en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour analyser les arguments de ligne de commande
function parseArgs() {
  const args = process.argv.slice(2);
  let url = '';
  let outputDir = null;
  let format = 'png';

  // Première valeur non-option est l'URL
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--') || arg.startsWith('-')) {
      // C'est une option, la traiter avec sa valeur
      if (arg === '--output' || arg === '-o') {
        outputDir = args[++i]; // Prendre la valeur suivante
      } else if (arg === '--format' || arg === '-f') {
        format = args[++i]; // Prendre la valeur suivante
      } else if (arg === '--help' || arg === '-h') {
        showHelp();
        process.exit(0);
      }
    } else if (!url) {
      // Premier argument non-option est l'URL
      url = arg;
    }
  }

  return { url, outputDir, format };
}

// Afficher l'aide
function showHelp() {
  console.log(`
Usage: pnpm screenshot <url> [options]

Options:
  --output, -o <dir>    Dossier de destination (par défaut: ./screenshots)
  --format, -f <format> Format d'image: png, jpeg, webp (par défaut: png)
  --help, -h            Afficher cette aide

Exemples:
  pnpm screenshot https://example.com
  pnpm screenshot https://example.com -o ./captures
  pnpm screenshot https://example.com -f jpeg
  pnpm screenshot https://example.com -o . -f webp
  `);
}

// Fonction principale pour prendre une capture d'écran
async function takeScreenshot(url, outputDir, format = 'png') {
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

  console.log(`Prise de capture d'écran de: ${url} (format: ${format})`);

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
  
  // Ajouter l'extension de fichier correspondant au format
  const filename = `${urlForFilename}_${timestamp}.${format}`;
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
    
    // Définir une taille d'écran standard
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Aller à l'URL et attendre que la page soit chargée
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Options pour la capture d'écran
    const screenshotOptions = { 
      path: filePath,
      fullPage: true,
      type: format
    };
    
    // Ajouter la qualité pour jpeg et webp
    if (format === 'jpeg' || format === 'webp') {
      screenshotOptions.quality = 85; // 85% est un bon compromis entre qualité et taille
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
const { url, outputDir, format } = parseArgs();

// Si pas d'URL et pas --help, afficher l'aide
if (!url) {
  console.error('Erreur: URL manquante');
  showHelp();
  process.exit(1);
}

// Exécuter la fonction
takeScreenshot(url, outputDir, format);