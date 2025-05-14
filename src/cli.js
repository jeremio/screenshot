// Configuration par défaut
export const DEFAULT_CONFIG = {
  width: 1920,
  height: 1080,
  format: 'png',
  quality: 85,
  delay: 0,
  fullPage: true,
  executablePath: '/usr/bin/google-chrome'
};

// Fonction pour analyser les arguments de ligne de commande
export function parseArgs() {
  const args = process.argv.slice(2);
  let url = '';
  let outputDir = null;
  let format = DEFAULT_CONFIG.format;
  let delay = DEFAULT_CONFIG.delay;
  let quality = DEFAULT_CONFIG.quality;
  let width = DEFAULT_CONFIG.width;
  let height = DEFAULT_CONFIG.height;
  let fullPage = DEFAULT_CONFIG.fullPage;
  let executablePath = DEFAULT_CONFIG.executablePath;

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
      } else if (arg === '--executable-path' || arg === '-ep') {
        executablePath = args[++i];
        if (!executablePath || executablePath.startsWith('-')) {
          console.error('Erreur: Le chemin pour --executable-path est manquant ou invalide.');
          showHelp();
          process.exit(1);
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

  return { url, outputDir, format, delay, quality, width, height, fullPage, executablePath };
}

// Afficher l'aide
export function showHelp() {
  console.log(`
Usage: pnpm screenshot <url> [options]

Options:
  --output, -o <dir>             Dossier de destination (par défaut: répertoire courant)
  --format, -f <format>          Format d'image: png, jpeg, webp (par défaut: png)
  --delay, -d <ms>               Délai en millisecondes avant la capture (par défaut: 0)
  --quality, -q <1-100>          Qualité pour jpeg/webp (par défaut: 85)
  --width, -w <pixels>           Largeur de la fenêtre en pixels (par défaut: 1920)
  --height, -h <pixels>          Hauteur de la fenêtre en pixels (par défaut: 1080)
  --full-page, -fp <bool>        Capturer la page entière (par défaut: true)
  --executable-path, -ep <path>  Chemin vers l'exécutable du navigateur (par défaut: ${DEFAULT_CONFIG.executablePath})
  --help                         Afficher cette aide

Exemples:
  pnpm screenshot https://example.com
  pnpm screenshot https://example.com -o ./captures
  pnpm screenshot https://example.com -fp false -f jpeg -q 90
  pnpm screenshot https://example.com -d 2000 -w 375 -h 667 -f webp
  pnpm screenshot https://example.com -ep /opt/mybrowser/chrome
  `);
}
