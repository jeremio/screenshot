#!/usr/bin/env node

import { parseArgs, showHelp, CliError } from './cli.js';
import { takeScreenshot } from './capture.js';

async function main() {
  let parsed;
  try {
    parsed = parseArgs();
  } catch (error) {
    if (!(error instanceof CliError)) throw error;
    console.error(`Erreur: ${error.message}`);
    if (error.withHelp) showHelp();
    process.exit(1);
  }

  const { url, help, ...options } = parsed;

  if (help) {
    showHelp();
    process.exit(0);
  }

  if (!url) {
    console.error('Erreur: URL manquante. Veuillez fournir une URL valide.');
    showHelp();
    process.exit(1); // Quitter si l'URL est manquante est une responsabilité du point d'entrée CLI
  }

  try {
    const filePath = await takeScreenshot(url, options);
    console.log(`Opération terminée avec succès. Fichier enregistré à : ${filePath}`);
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
}

main();
