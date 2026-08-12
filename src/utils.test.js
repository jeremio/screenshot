import { describe, it, expect } from 'vitest';
import { normalizeUrl, generateFilename } from './utils.js';

describe('normalizeUrl', () => {
  describe('entrées valides', () => {
    it.each([
      ['https://example.com', 'https://example.com'],
      ['http://example.com', 'http://example.com'],
      ['https://example.com/a?b=c#d', 'https://example.com/a?b=c#d'],
      ['https://user:pass@example.com', 'https://user:pass@example.com'],
      ['https://example.com:8443/x', 'https://example.com:8443/x'],
    ])('conserve %s tel quel', (input, expected) => {
      expect(normalizeUrl(input)).toBe(expected);
    });

    it.each([
      ['example.com', 'https://example.com'],
      ['example.com/chemin', 'https://example.com/chemin'],
      ['localhost:8080', 'https://localhost:8080'],
      ['example.com:8443/chemin', 'https://example.com:8443/chemin'],
      ['192.168.1.1', 'https://192.168.1.1'],
    ])('préfixe %s en https quand aucun schéma n\'est déclaré', (input, expected) => {
      expect(normalizeUrl(input)).toBe(expected);
    });

    it('ignore les espaces autour de l\'URL', () => {
      expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com');
    });
  });

  describe('liste blanche de protocoles', () => {
    // Régression : ces schémas étaient auparavant filtrés par une liste noire
    // de préfixes, contournable. Ils doivent rester rejetés.
    it.each([
      'file:///etc/passwd',
      'FILE:///etc/passwd',
      'javascript:alert(1)',
      'JaVaScRiPt:alert(1)',
      'data:text/html,<h1>x</h1>',
      'chrome://settings',
      'ftp://example.com/a',
      'view-source:http://example.com',
      'blob:https://example.com/uuid',
    ])('rejette %s', (input) => {
      expect(() => normalizeUrl(input)).toThrow(/Protocole non autorisé|URL mal formée/);
    });

    it('ne maquille pas un schéma inconnu en URL https', () => {
      // Le bug d'origine produisait "https://chrome://settings", accepté.
      expect(() => normalizeUrl('chrome://settings')).toThrow(/chrome:/);
    });

    it('nomme le protocole fautif dans le message', () => {
      expect(() => normalizeUrl('ftp://example.com')).toThrow(/"ftp:"/);
    });
  });

  describe('entrées invalides', () => {
    it.each([
      ['chaîne vide', ''],
      ['null', null],
      ['undefined', undefined],
      ['nombre', 42],
      ['objet', {}],
    ])('rejette %s', (_label, input) => {
      expect(() => normalizeUrl(input)).toThrow(/URL invalide/);
    });

    it('rejette une URL mal formée', () => {
      expect(() => normalizeUrl('https://')).toThrow(/URL mal formée/);
    });

    it('attache la cause d\'origine à l\'erreur de parsing', () => {
      let caught;
      try {
        normalizeUrl('https://');
      } catch (error) {
        caught = error;
      }
      expect(caught.cause).toBeInstanceOf(Error);
    });
  });
});

describe('generateFilename', () => {
  it('produit le format domaine_LxH_horodatage.ext', () => {
    const name = generateFilename('https://example.com', 1920, 1080, 'png');
    expect(name).toMatch(/^example\.com_1920x1080_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.png$/);
  });

  it('retire le schéma http comme https', () => {
    expect(generateFilename('http://example.com', 1, 1, 'png')).toMatch(/^example\.com_/);
    expect(generateFilename('https://example.com', 1, 1, 'png')).toMatch(/^example\.com_/);
  });

  it('respecte le format demandé', () => {
    expect(generateFilename('https://example.com', 1, 1, 'webp')).toMatch(/\.webp$/);
    expect(generateFilename('https://example.com', 1, 1, 'jpeg')).toMatch(/\.jpeg$/);
  });

  describe('assainissement du nom de fichier', () => {
    // Le nom est concaténé à un chemin : aucun séparateur ne doit survivre.
    it.each([
      'https://example.com/a/b/c',
      'https://example.com/../../etc/passwd',
      'https://example.com/x?y=../../z',
    ])('ne laisse ni séparateur ni séquence de remontée dans %s', (url) => {
      const name = generateFilename(url, 1, 1, 'png');
      expect(name).not.toContain('/');
      expect(name).not.toContain('\\');
      expect(name).not.toContain('..');
    });

    it('remplace les caractères spéciaux par des tirets', () => {
      const name = generateFilename('https://example.com/a b&c', 1, 1, 'png');
      expect(name).toMatch(/^example\.com-a-b-c_/);
    });

    it('ne produit pas de tirets consécutifs', () => {
      const name = generateFilename('https://example.com/a???b', 1, 1, 'png');
      expect(name).not.toMatch(/--/);
    });

    it('ne commence ni ne finit la partie URL par un tiret ou un point', () => {
      const urlPart = generateFilename('https://example.com/a/', 1, 1, 'png').split('_')[0];
      expect(urlPart).not.toMatch(/^[-.]|[-.]$/);
    });

    it('retombe sur un nom générique si l\'URL ne laisse aucun caractère utile', () => {
      expect(generateFilename('https://...', 1, 1, 'png')).toMatch(/^capture_/);
    });

    it('borne la partie URL à 50 caractères', () => {
      const long = 'https://example.com/' + 'a'.repeat(200);
      const urlPart = generateFilename(long, 1, 1, 'png').split('_')[0];
      expect(urlPart.length).toBeLessThanOrEqual(50);
    });
  });

  it('n\'utilise pas de deux-points dans l\'horodatage', () => {
    // Les deux-points sont invalides dans un nom de fichier sous Windows.
    expect(generateFilename('https://example.com', 1, 1, 'png')).not.toContain(':');
  });
});
