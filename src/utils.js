// Seuls ces protocoles sont autorisés (liste blanche : tout le reste est rejeté).
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Normalise une URL pour s'assurer qu'elle commence par http:// ou https://.
 * @param {string} url L'URL à normaliser.
 * @returns {string} L'URL normalisée.
 * @throws {Error} Si l'URL est invalide ou utilise un protocole non autorisé.
 */
export function normalizeUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('URL invalide : doit être une chaîne non vide');
  }

  const trimmedUrl = url.trim();

  // N'ajouter le préfixe que si l'entrée ne déclare aucun schéma. Une entrée
  // comme "chrome://settings" doit être analysée telle quelle puis rejetée par
  // la liste blanche, et non maquillée en "https://chrome://settings".
  // Le (?!\d) distingue un schéma d'un couple hôte:port : dans "localhost:8080",
  // "localhost:" n'est pas un schéma.
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:(?!\d)/.test(trimmedUrl);
  const normalizedUrl = hasScheme ? trimmedUrl : 'https://' + trimmedUrl;

  // Valider que l'URL est bien formée
  let parsedUrl;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch (error) {
    throw new Error(`URL mal formée : ${url} (${error.message})`, { cause: error });
  }

  if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
    throw new Error(`Protocole non autorisé : "${parsedUrl.protocol}". Seuls http: et https: sont acceptés.`);
  }

  return normalizedUrl;
}

/**
 * Génère un nom de fichier pour la capture d'écran.
 * @param {string} url L'URL de la page capturée.
 * @param {number} width La largeur de la capture.
 * @param {number} height La hauteur de la capture.
 * @param {string} format Le format de l'image (png, jpeg, webp).
 * @returns {string} Le nom de fichier généré.
 */
export function generateFilename(url, width, height, format) {
  const date = new Date();
  const timestamp = date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
  
  // Utiliser l'URL déjà normalisée si elle l'est avant d'appeler cette fonction
  const urlForFilename = url
    .replace(/^https?:\/\//, '') // Supprimer http(s)://
    .replace(/[^a-zA-Z0-9_.-]/g, '-') // Remplacer les caractères non alphanumériques (sauf _, ., -) par des tirets
    .replace(/\.{2,}/g, '.') // Réduire les suites de points : aucun ".." ne doit subsister dans le nom
    .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
    .replace(/(?:^[-.]+|[-.]+$)/g, '') // Supprimer tirets et points en début/fin
    .substring(0, 50); // Limiter la longueur pour éviter des noms de fichiers trop longs

  // Filet de sécurité : ne jamais produire un nom commençant par le séparateur.
  const safeUrlPart = urlForFilename || 'capture';

  return `${safeUrlPart}_${width}x${height}_${timestamp}.${format}`;
}
