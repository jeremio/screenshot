// @ts-check

import eslint from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ["node_modules/"], // Ignorer le dossier node_modules
  },
  eslint.configs.recommended, // Appliquer les règles recommandées par ESLint
  {
    languageOptions: {
      ecmaVersion: 'latest', // Utiliser la dernière version d'ECMAScript
      sourceType: 'module', // Indiquer que vous utilisez des modules ES
      globals: {
        ...globals.node, // Variables globales de l'environnement Node.js
        // Ajoutez ici d'autres globales si nécessaire pour votre projet
      }
    },
    rules: {
      // Vous pouvez ajouter ou surcharger des règles ici si besoin
      // Par exemple :
      // 'no-unused-vars': 'warn', // Avertir pour les variables non utilisées au lieu d'une erreur
      // 'indent': ['error', 2], // Forcer une indentation de 2 espaces (si vous n'utilisez pas Prettier)
      // 'semi': ['error', 'always'], // Toujours utiliser des points-virgules
    }
  }
];
