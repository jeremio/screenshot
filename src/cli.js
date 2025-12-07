// Configuration par défaut
export const DEFAULT_CONFIG = {
  outputDir: '.',
  width: 1920,
  height: 1080,
  format: 'png',
  quality: 85,
  delay: 0,
  fullPage: true,
  executablePath: undefined, // Laisser Puppeteer utiliser son Chromium intégré
  timeout: 30000,
  waitUntil: 'networkidle2',
};

// Fonctions de validation
function validatePositiveNumber(value, name) {
  const num = parseInt(value, 10);
  if (isNaN(num) || num <= 0) {
    console.error(`Erreur: ${name} doit être un nombre positif.`);
    process.exit(1);
  }
  return num;
}

function validateQuality(value) {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1 || num > 100) {
    console.error('Erreur: La qualité doit être un nombre entre 1 et 100.');
    process.exit(1);
  }
  return num;
}

function validateBoolean(value, optionName) {
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === '1') return true;
    if (lowerValue === 'false' || lowerValue === '0') return false;
  }
  // Si nous arrivons ici, la valeur n'est pas une chaîne booléenne reconnue
  console.error(`Erreur: Valeur invalide pour l'option ${optionName}. Attendu 'true', 'false', '1', ou '0'. Reçu: "${value}"`);
  showHelp(); // showHelp est disponible dans cette portée
  process.exit(1);
}

function validatePath(value, name) {
  if (!value || value.startsWith('-')) {
    console.error(`Erreur: Le chemin pour ${name} est manquant ou invalide.`);
    showHelp();
    process.exit(1);
  }
  return value;
}

function validateFormat(value) {
  const lowerCaseValue = value.toLowerCase();
  const validFormats = ['png', 'jpeg', 'webp'];
  if (!validFormats.includes(lowerCaseValue)) {
    console.error(`Erreur: Format d'image non supporté : "${value}". Formats valides : png, jpeg, webp.`);
    process.exit(1);
  }
  return lowerCaseValue;
}

function validateWaitUntil(value) {
  const validOptions = ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'];
  if (!validOptions.includes(value)) {
    console.error(`Erreur: Option waitUntil invalide : "${value}". Options valides : ${validOptions.join(', ')}.`);
    process.exit(1);
  }
  return value;
}

const ARG_OPTIONS = [
  { names: ['--output', '-o'], key: 'outputDir', takesValue: true },
  { names: ['--format', '-f'], key: 'format', takesValue: true, validator: validateFormat },
  { names: ['--delay', '-d'], key: 'delay', takesValue: true, validator: (val) => validatePositiveNumber(val, 'Le délai') },
  { names: ['--quality', '-q'], key: 'quality', takesValue: true, validator: validateQuality },
  { names: ['--width', '-w'], key: 'width', takesValue: true, validator: (val) => validatePositiveNumber(val, 'La largeur') },
  { names: ['--height', '-h'], key: 'height', takesValue: true, validator: (val) => validatePositiveNumber(val, 'La hauteur') },
  { names: ['--full-page', '-fp'], key: 'fullPage', takesValue: true, validator: (val) => validateBoolean(val, '--full-page') },
  { names: ['--executable-path', '-ep'], key: 'executablePath', takesValue: true, validator: (val) => validatePath(val, '--executable-path') },
  { names: ['--timeout', '-t'], key: 'timeout', takesValue: true, validator: (val) => validatePositiveNumber(val, 'Le timeout') },
  { names: ['--wait-until', '-wu'], key: 'waitUntil', takesValue: true, validator: validateWaitUntil },
  { names: ['--help'], action: () => { showHelp(); process.exit(0); } },
];

// Fonction pour analyser les arguments de ligne de commande
export function parseArgs() {
  const args = process.argv.slice(2);
  const parsedArgs = { ...DEFAULT_CONFIG, url: '' };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const optionConfig = ARG_OPTIONS.find(opt => opt.names.includes(arg));

    if (optionConfig) {
      if (optionConfig.action) {
        optionConfig.action();
      } else if (optionConfig.takesValue) {
        if (i + 1 < args.length && !args[i+1].startsWith('-')) {
          i++;
          let value = args[i];
          if (optionConfig.validator) {
            value = optionConfig.validator(value);
          }
          parsedArgs[optionConfig.key] = value;
        } else {
          console.error(`Erreur: Valeur manquante pour l'option ${arg}`);
          showHelp();
          process.exit(1);
        }
      }
    } else if (arg.startsWith('-')) {
      console.error(`Option non reconnue: ${arg}`);
      showHelp();
      process.exit(1);
    } else if (!parsedArgs.url) {
      parsedArgs.url = arg;
    } else {
      console.error(`Argument non reconnu ou URL déjà spécifiée: ${arg}`);
      showHelp();
      process.exit(1);
    }
  }
  return parsedArgs;
}

// Afficher l'aide
export function showHelp() {
  console.log(`
Usage: pnpm screenshot [url] [options]

Options:
  --output, -o [dir]             Dossier de destination (par défaut: répertoire courant)
  --format, -f [format]          Format d'image: png, jpeg, webp (par défaut: png)
  --delay, -d [ms]               Délai en millisecondes avant la capture (par défaut: 0)
  --quality, -q [1-100]          Qualité pour jpeg/webp (par défaut: 85)
  --width, -w [pixels]           Largeur de la fenêtre en pixels (par défaut: 1920)
  --height, -h [pixels]          Hauteur de la fenêtre en pixels (par défaut: 1080)
  --full-page, -fp [bool]        Capturer la page entière (par défaut: true). Valeurs acceptées: true, false, 1, 0.
  --executable-path, -ep [path]  Chemin vers l'exécutable du navigateur (par défaut: ${DEFAULT_CONFIG.executablePath})
  --timeout, -t [ms]             Timeout de navigation en millisecondes (par défaut: 30000)
  --wait-until, -wu [option]     Condition d'attente: load, domcontentloaded, networkidle0, networkidle2 (par défaut: networkidle2)
  --help                         Afficher cette aide

Exemples:
  pnpm screenshot https://example.com
  pnpm screenshot https://example.com -o ./captures
  pnpm screenshot https://example.com -fp false -f jpeg -q 90
  pnpm screenshot https://example.com -d 2000 -w 375 -h 667 -f webp
  pnpm screenshot https://example.com -ep /opt/mybrowser/chrome
  pnpm screenshot https://example.com -t 60000 -wu load
  `);
}
