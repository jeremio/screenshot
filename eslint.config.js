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
      // Règles spécifiques pour un projet CLI Node.js
      'no-console': 'off', // Les console.log sont normaux dans un CLI
      'no-process-exit': 'off', // process.exit() est normal dans un CLI

      // Gestion des variables non utilisées avec plus de flexibilité
      'no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],

      // Bonnes pratiques JavaScript modernes
      'eqeqeq': ['error', 'always'], // Forcer === et !==
      'no-var': 'error', // Interdire var, utiliser let/const
      'prefer-const': 'error', // Préférer const quand la variable n'est pas réassignée
      'no-throw-literal': 'error', // Toujours throw des instances d'Error
      'require-await': 'error', // Pas de fonction async sans await
    }
  }
];
