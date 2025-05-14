/**
 * Normalise une URL pour s'assurer qu'elle commence par http:// ou https://.
 * @param {string} url L'URL à normaliser.
 * @returns {string} L'URL normalisée.
 */
export function normalizeUrl(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'http://' + url;
  }
  return url;
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
    .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
    .replace(/(?:^-+|-+$)/g, '') // Supprimer les tirets en début/fin
    .substring(0, 50); // Limiter la longueur pour éviter des noms de fichiers trop longs
  
  return `${urlForFilename}_${width}x${height}_${timestamp}.${format}`;
}
