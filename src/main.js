#!/usr/bin/env node

import { parseArgs, showHelp } from './cli.js';
import { takeScreenshot } from './capture.js';

async function main() {
  const { url, outputDir, format, delay, quality, width, height, fullPage, executablePath, timeout, waitUntil } = parseArgs();

  if (!url) {
    console.error('Erreur (main.js): URL manquante. Veuillez fournir une URL valide.');
    showHelp();
    process.exit(1); // Quitter si l'URL est manquante est une responsabilité du point d'entrée CLI
  }

  try {
    const options = {
      outputDir,
      format,
      delay,
      quality,
      width,
      height,
      fullPage,
      executablePath,
      timeout,
      waitUntil,
    };
    const filePath = await takeScreenshot(
      url,
      options,
    );
    // Ajouter un log final utilisant filePath
    console.log(`(main.js) Opération terminée avec succès. Fichier enregistré à : ${filePath}`);
  } catch (error) {
    // Gérer les erreurs propagées par takeScreenshot ou d'autres erreurs potentielles ici
    console.error(`Erreur rencontrée dans main.js: ${error.message}`);
    // On pourrait avoir des codes de sortie différents selon le type d'erreur si nécessaire
    process.exit(1);
  }
}

main();
