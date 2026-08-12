// Limite de texture de Chromium : au-delà, le moteur de rendu échoue.
export const MAX_DIMENSION = 16384;

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
  help: false,
};

/**
 * Erreur d'usage de la ligne de commande. Les validateurs la lèvent plutôt que
 * d'appeler process.exit(), ce qui garde le module testable et laisse au point
 * d'entrée la responsabilité du code de sortie.
 */
export class CliError extends Error {
  constructor(message, { withHelp = false } = {}) {
    super(message);
    this.name = 'CliError';
    this.withHelp = withHelp;
  }
}

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
function validateDimension(value, name) {
  const num = parseStrictInteger(value);
  if (isNaN(num) || num <= 0) {
    throw new CliError(`${name} doit être un nombre entier positif. Reçu: "${value}"`);
  }
  if (num > MAX_DIMENSION) {
    throw new CliError(`${name} ne peut pas dépasser ${MAX_DIMENSION} pixels (limite de rendu de Chromium). Reçu: "${value}"`);
  }
  return num;
}

function validateNonNegativeNumber(value, name) {
  const num = parseStrictInteger(value);
  if (isNaN(num) || num < 0) {
    throw new CliError(`${name} doit être un nombre entier positif ou nul. Reçu: "${value}"`);
  }
  return num;
}

function validateQuality(value) {
  const num = parseStrictInteger(value);
  if (isNaN(num) || num < 1 || num > 100) {
    throw new CliError(`La qualité doit être un nombre entier entre 1 et 100. Reçu: "${value}"`);
  }
  return num;
}

function validateBoolean(value, optionName) {
  const lowerValue = value.toLowerCase();
  if (lowerValue === 'true' || lowerValue === '1') return true;
  if (lowerValue === 'false' || lowerValue === '0') return false;
  throw new CliError(
    `Valeur invalide pour l'option ${optionName}. Attendu 'true', 'false', '1', ou '0'. Reçu: "${value}"`,
    { withHelp: true },
  );
}

function validatePath(value, name) {
  if (value.trim() === '') {
    throw new CliError(`Le chemin pour ${name} est vide.`, { withHelp: true });
  }
  return value;
}

function validateFormat(value) {
  const lowerCaseValue = value.toLowerCase();
  const validFormats = ['png', 'jpeg', 'webp'];
  if (!validFormats.includes(lowerCaseValue)) {
    throw new CliError(`Format d'image non supporté : "${value}". Formats valides : ${validFormats.join(', ')}.`);
  }
  return lowerCaseValue;
}

function validateWaitUntil(value) {
  const validOptions = ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'];
  if (!validOptions.includes(value)) {
    throw new CliError(`Option waitUntil invalide : "${value}". Options valides : ${validOptions.join(', ')}.`);
  }
  return value;
}

export const ARG_OPTIONS = [
  { names: ['--output', '-o'], key: 'outputDir', takesValue: true, validator: (val) => validatePath(val, '--output') },
  { names: ['--format', '-f'], key: 'format', takesValue: true, validator: validateFormat },
  { names: ['--delay', '-d'], key: 'delay', takesValue: true, validator: (val) => validateNonNegativeNumber(val, 'Le délai') },
  { names: ['--quality', '-q'], key: 'quality', takesValue: true, validator: validateQuality },
  { names: ['--width', '-w'], key: 'width', takesValue: true, validator: (val) => validateDimension(val, 'La largeur') },
  { names: ['--height', '-H'], key: 'height', takesValue: true, validator: (val) => validateDimension(val, 'La hauteur') },
  { names: ['--full-page', '-fp'], key: 'fullPage', takesValue: true, validator: (val) => validateBoolean(val, '--full-page') },
  { names: ['--executable-path', '-ep'], key: 'executablePath', takesValue: true, validator: (val) => validatePath(val, '--executable-path') },
  { names: ['--timeout', '-t'], key: 'timeout', takesValue: true, validator: (val) => validateNonNegativeNumber(val, 'Le timeout') },
  { names: ['--wait-until', '-wu'], key: 'waitUntil', takesValue: true, validator: validateWaitUntil },
  { names: ['--no-sandbox'], key: 'noSandbox', takesValue: false, value: true },
  { names: ['--help', '-h'], key: 'help', takesValue: false, value: true },
];

function findOption(token) {
  return ARG_OPTIONS.find(opt => opt.names.includes(token));
}

/**
 * Détermine si un jeton peut servir de valeur à une option.
 * Un simple test sur le préfixe "-" rejetterait les nombres négatifs et les
 * chemins comme "-captures" : on ne refuse donc que les noms d'options connus
 * et les options longues (qui ne peuvent pas être des valeurs légitimes).
 */
function canBeValue(token) {
  return token !== undefined && !findOption(token) && !token.startsWith('--');
}

/**
 * Analyse les arguments de ligne de commande.
 * @param {string[]} argv Les arguments à analyser (par défaut ceux du processus).
 * @returns {object} La configuration résolue, incluant `url`.
 * @throws {CliError} Si un argument est inconnu, manquant ou invalide.
 */
export function parseArgs(argv = process.argv.slice(2)) {
  const parsedArgs = { ...DEFAULT_CONFIG, url: '' };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const optionConfig = findOption(arg);

    if (optionConfig) {
      if (!optionConfig.takesValue) {
        // Option booléenne sans valeur (ex: --no-sandbox, --help)
        parsedArgs[optionConfig.key] = optionConfig.value;
        continue;
      }
      if (!canBeValue(argv[i + 1])) {
        throw new CliError(`Valeur manquante pour l'option ${arg}`, { withHelp: true });
      }
      i++;
      const value = optionConfig.validator ? optionConfig.validator(argv[i]) : argv[i];
      parsedArgs[optionConfig.key] = value;
    } else if (arg.startsWith('-') && arg !== '-') {
      throw new CliError(`Option non reconnue: ${arg}`, { withHelp: true });
    } else if (!parsedArgs.url) {
      parsedArgs.url = arg;
    } else {
      throw new CliError(`Argument non reconnu ou URL déjà spécifiée: ${arg}`, { withHelp: true });
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
  --width, -w [pixels]           Largeur de la fenêtre en pixels (par défaut: 1920, max: ${MAX_DIMENSION})
  --height, -H [pixels]          Hauteur de la fenêtre en pixels (par défaut: 1080, max: ${MAX_DIMENSION})
  --full-page, -fp [bool]        Capturer la page entière (par défaut: true). Valeurs acceptées: true, false, 1, 0.
  --executable-path, -ep [path]  Chemin vers l'exécutable du navigateur (par défaut: Chromium intégré à Puppeteer)
  --timeout, -t [ms]             Timeout de navigation en millisecondes (par défaut: 30000)
  --wait-until, -wu [option]     Condition d'attente: load, domcontentloaded, networkidle0, networkidle2 (par défaut: networkidle2)
  --no-sandbox                   Désactiver le bac à sable Chromium (DANGEREUX, voir ci-dessous)
  --help, -h                     Afficher cette aide

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
  pnpm screenshot https://example.com -d 2000 -w 375 -H 667 -f webp
  pnpm screenshot https://example.com -ep /opt/mybrowser/chrome
  pnpm screenshot https://example.com -t 60000 -wu load
  pnpm screenshot https://example.com --no-sandbox
  `);
}
