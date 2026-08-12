import { describe, it, expect } from 'vitest';
import { parseArgs, CliError, DEFAULT_CONFIG, MAX_DIMENSION } from './cli.js';

describe('parseArgs', () => {
  describe('valeurs par défaut', () => {
    it('applique la configuration par défaut sans argument', () => {
      expect(parseArgs([])).toEqual({ ...DEFAULT_CONFIG, url: '' });
    });

    it('capture l\'URL en argument positionnel', () => {
      expect(parseArgs(['https://example.com']).url).toBe('https://example.com');
    });

    it('n\'active pas --no-sandbox par défaut', () => {
      // Le bac à sable doit rester actif tant qu'il n'est pas explicitement levé.
      expect(parseArgs(['https://example.com']).noSandbox).toBe(false);
    });
  });

  describe('options avec valeur', () => {
    it.each([
      [['--output', './out'], 'outputDir', './out'],
      [['-o', './out'], 'outputDir', './out'],
      [['--format', 'jpeg'], 'format', 'jpeg'],
      [['-f', 'WEBP'], 'format', 'webp'],
      [['--quality', '90'], 'quality', 90],
      [['--width', '800'], 'width', 800],
      [['-w', '800'], 'width', 800],
      [['--height', '600'], 'height', 600],
      [['--delay', '2000'], 'delay', 2000],
      [['--timeout', '60000'], 'timeout', 60000],
      [['--wait-until', 'load'], 'waitUntil', 'load'],
      [['--executable-path', '/usr/bin/chromium'], 'executablePath', '/usr/bin/chromium'],
    ])('analyse %s', (args, key, expected) => {
      expect(parseArgs(['https://example.com', ...args])[key]).toBe(expected);
    });

    it.each([
      ['true', true], ['1', true], ['false', false], ['0', false], ['TRUE', true],
    ])('analyse --full-page %s', (input, expected) => {
      expect(parseArgs(['https://example.com', '-fp', input]).fullPage).toBe(expected);
    });

    it('accepte 0 pour le délai et le timeout', () => {
      // Régression : 0 est une valeur légitime (timeout illimité côté Puppeteer).
      const args = parseArgs(['https://example.com', '-d', '0', '-t', '0']);
      expect(args.delay).toBe(0);
      expect(args.timeout).toBe(0);
    });

    it('signale une valeur manquante en fin de ligne', () => {
      expect(() => parseArgs(['https://example.com', '-w'])).toThrow(CliError);
      expect(() => parseArgs(['https://example.com', '-w'])).toThrow(/Valeur manquante/);
    });

    it('signale une valeur manquante quand une autre option suit', () => {
      expect(() => parseArgs(['-o', '--format', 'png'])).toThrow(/Valeur manquante pour l'option -o/);
    });
  });

  describe('options booléennes', () => {
    it('active --no-sandbox sans consommer de valeur', () => {
      const args = parseArgs(['--no-sandbox', 'https://example.com']);
      expect(args.noSandbox).toBe(true);
      expect(args.url).toBe('https://example.com');
    });

    it.each(['--help', '-h'])('positionne help avec %s', (flag) => {
      expect(parseArgs([flag]).help).toBe(true);
    });

    it('traite -h comme l\'aide, pas comme la hauteur', () => {
      // -h était auparavant l'alias de --height, à rebours de la convention.
      const args = parseArgs(['-h']);
      expect(args.help).toBe(true);
      expect(args.height).toBe(DEFAULT_CONFIG.height);
    });

    it('expose la hauteur sur -H', () => {
      expect(parseArgs(['https://example.com', '-H', '600']).height).toBe(600);
    });
  });

  describe('analyse stricte des entiers', () => {
    // parseInt acceptait "50xyz" comme 50 et réduisait "1e9" à 1, produisant
    // des captures aux mauvaises dimensions sans le moindre avertissement.
    it.each(['50xyz', '3.9', 'abc', '', ' ', 'Infinity', 'NaN'])(
      'rejette la largeur %s', (value) => {
        expect(() => parseArgs(['https://example.com', '-w', value])).toThrow(CliError);
      });

    it('rejette une qualité décimale', () => {
      expect(() => parseArgs(['https://example.com', '-q', '3.9'])).toThrow(/entier/);
    });

    it('inclut la valeur fautive dans le message', () => {
      expect(() => parseArgs(['https://example.com', '-w', '50xyz'])).toThrow(/"50xyz"/);
    });
  });

  describe('bornes des dimensions', () => {
    it.each(['0', '-1'])('rejette la largeur %s', (value) => {
      expect(() => parseArgs(['https://example.com', '-w', value])).toThrow(/positif/);
    });

    it('accepte la dimension maximale', () => {
      expect(parseArgs(['https://example.com', '-w', String(MAX_DIMENSION)]).width).toBe(MAX_DIMENSION);
    });

    it.each(['-w', '-H'])('rejette %s au-delà de la limite de rendu', (flag) => {
      expect(() => parseArgs(['https://example.com', flag, String(MAX_DIMENSION + 1)]))
        .toThrow(/ne peut pas dépasser/);
    });

    it('rejette une dimension absurde qui ferait échouer Chromium', () => {
      expect(() => parseArgs(['https://example.com', '-w', '1e9'])).toThrow(/dépasser/);
    });
  });

  describe('bornes de la qualité', () => {
    it.each(['0', '101', '-5'])('rejette la qualité %s', (value) => {
      expect(() => parseArgs(['https://example.com', '-q', value])).toThrow(/entre 1 et 100/);
    });

    it.each(['1', '100'])('accepte la qualité %s', (value) => {
      expect(parseArgs(['https://example.com', '-q', value]).quality).toBe(Number(value));
    });
  });

  describe('valeurs négatives et chemins commençant par un tiret', () => {
    // Le test d'origine (!token.startsWith('-')) confondait valeur négative et
    // valeur absente, produisant un « Valeur manquante » trompeur.
    it('signale un délai négatif comme invalide, pas comme manquant', () => {
      expect(() => parseArgs(['https://example.com', '-d', '-500'])).toThrow(/positif ou nul/);
      expect(() => parseArgs(['https://example.com', '-d', '-500'])).not.toThrow(/Valeur manquante/);
    });

    it('accepte un dossier de sortie commençant par un tiret', () => {
      expect(parseArgs(['https://example.com', '-o', '-captures']).outputDir).toBe('-captures');
    });
  });

  describe('validation des énumérations', () => {
    it('rejette un format non supporté', () => {
      expect(() => parseArgs(['https://example.com', '-f', 'gif'])).toThrow(/Format d'image non supporté/);
    });

    it('rejette une condition d\'attente inconnue', () => {
      expect(() => parseArgs(['https://example.com', '-wu', 'whenever'])).toThrow(/waitUntil invalide/);
    });

    it('rejette une valeur booléenne non reconnue', () => {
      expect(() => parseArgs(['https://example.com', '-fp', 'oui'])).toThrow(/Valeur invalide/);
    });

    it('rejette un chemin de sortie vide', () => {
      expect(() => parseArgs(['https://example.com', '-o', ' '])).toThrow(/vide/);
    });
  });

  describe('erreurs d\'usage', () => {
    it('rejette une option inconnue', () => {
      expect(() => parseArgs(['https://example.com', '--inconnue'])).toThrow(/Option non reconnue/);
    });

    it('rejette une seconde URL', () => {
      expect(() => parseArgs(['https://a.com', 'https://b.com'])).toThrow(/URL déjà spécifiée/);
    });

    it('demande l\'affichage de l\'aide sur les erreurs d\'usage', () => {
      let caught;
      try {
        parseArgs(['--inconnue']);
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(CliError);
      expect(caught.withHelp).toBe(true);
    });

    it('n\'affiche pas l\'aide pour une simple valeur hors bornes', () => {
      let caught;
      try {
        parseArgs(['https://example.com', '-q', '999']);
      } catch (error) {
        caught = error;
      }
      expect(caught.withHelp).toBe(false);
    });
  });

  it('combine plusieurs options', () => {
    const args = parseArgs([
      'https://example.com', '-o', './out', '-f', 'jpeg', '-q', '90',
      '-w', '375', '-H', '667', '-fp', 'false', '-d', '2000', '--no-sandbox',
    ]);
    expect(args).toMatchObject({
      url: 'https://example.com', outputDir: './out', format: 'jpeg', quality: 90,
      width: 375, height: 667, fullPage: false, delay: 2000, noSandbox: true,
    });
  });
});
