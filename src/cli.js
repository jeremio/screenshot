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
  // Le bac à sable Chromium reste actif par défaut : le désactiver expose la
  // machine hôte en cas de faille du moteur de rendu sur une page hostile.
  noSandbox: process.env.SCREENSHOT_NO_SANDBOX === '1',
};

/**
 * Convertit une chaîne en entier de façon stricte.
 * Contrairement à parseInt, rejette les valeurs partiellement numériques
 * ("50xyz") et les décimaux ("3.9") au lieu de les tronquer silencieusement.
 * @returns {number} L'entier analysé, ou NaN si la valeur n'est pas un entier.
 */
function parseStrictInteger(value) {
  if (typeof value !== 'string' || value.trim() === '') return NaN;
  const num = Number(value);
  return Number.isInteger(num) ? num : NaN;
}

// Fonctions de validation
function validatePositiveNumber(value, name) {
  const num = parseStrictInteger(value);
  if (isNaN(num) || num <= 0) {
    console.error(`Erreur: ${name} doit être un nombre entier positif. Reçu: "${value}"`);
    process.exit(1);
  }
  return num;
}

function validateNonNegativeNumber(value, name) {
  const num = parseStrictInteger(value);
  if (isNaN(num) || num < 0) {
    console.error(`Erreur: ${name} doit être un nombre entier positif ou nul. Reçu: "${value}"`);
    process.exit(1);
  }
  return num;
}

function validateQuality(value) {
  const num = parseStrictInteger(value);
  if (isNaN(num) || num < 1 || num > 100) {
    console.error(`Erreur: La qualité doit être un nombre entier entre 1 et 100. Reçu: "${value}"`);
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
  { names: ['--delay', '-d'], key: 'delay', takesValue: true, validator: (val) => validateNonNegativeNumber(val, 'Le délai') },
  { names: ['--quality', '-q'], key: 'quality', takesValue: true, validator: validateQuality },
  { names: ['--width', '-w'], key: 'width', takesValue: true, validator: (val) => validatePositiveNumber(val, 'La largeur') },
  { names: ['--height', '-h'], key: 'height', takesValue: true, validator: (val) => validatePositiveNumber(val, 'La hauteur') },
  { names: ['--full-page', '-fp'], key: 'fullPage', takesValue: true, validator: (val) => validateBoolean(val, '--full-page') },
  { names: ['--executable-path', '-ep'], key: 'executablePath', takesValue: true, validator: (val) => validatePath(val, '--executable-path') },
  { names: ['--timeout', '-t'], key: 'timeout', takesValue: true, validator: (val) => validateNonNegativeNumber(val, 'Le timeout') },
  { names: ['--wait-until', '-wu'], key: 'waitUntil', takesValue: true, validator: validateWaitUntil },
  { names: ['--no-sandbox'], key: 'noSandbox', takesValue: false, value: true },
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
      } else if (optionConfig.takesValue === false) {
        // Option booléenne sans valeur (ex: --no-sandbox)
        parsedArgs[optionConfig.key] = optionConfig.value;
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
  --executable-path, -ep [path]  Chemin vers l'exécutable du navigateur (par défaut: Chromium intégré à Puppeteer)
  --timeout, -t [ms]             Timeout de navigation en millisecondes (par défaut: 30000)
  --wait-until, -wu [option]     Condition d'attente: load, domcontentloaded, networkidle0, networkidle2 (par défaut: networkidle2)
  --no-sandbox                   Désactiver le bac à sable Chromium (DANGEREUX, voir ci-dessous)
  --help                         Afficher cette aide

Sécurité:
  Le bac à sable Chromium est actif par défaut. Il constitue la principale
  barrière entre le moteur de rendu et votre machine lors de la visite d'une
  page potentiellement hostile. Ne le désactivez (--no-sandbox, ou la variable
  d'environnement SCREENSHOT_NO_SANDBOX=1) que dans un environnement déjà isolé
  : conteneur, CI/CD. Si le lancement échoue avec une erreur de sandbox sous
  Linux, la bonne solution est d'activer les namespaces utilisateur non
  privilégiés plutôt que de désactiver la protection :
    sudo sysctl -w kernel.unprivileged_userns_clone=1

Exemples:
  pnpm screenshot https://example.com
  pnpm screenshot https://example.com -o ./captures
  pnpm screenshot https://example.com -fp false -f jpeg -q 90
  pnpm screenshot https://example.com -d 2000 -w 375 -h 667 -f webp
  pnpm screenshot https://example.com -ep /opt/mybrowser/chrome
  pnpm screenshot https://example.com -t 60000 -wu load
  pnpm screenshot https://example.com --no-sandbox
  `);
}
