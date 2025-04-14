# Screenshot Automation Tool

Un outil simple permettant de capturer automatiquement des captures d'écran de pages web en utilisant Node.js et Puppeteer.

## Installation

1. Clonez ce dépôt ou créez un nouveau projet
2. Installez les dépendances

```bash
pnpm install
```

## Utilisation

### Commande de base

```bash
pnpm screenshot <url> [options]
```

### Options

- `--output`, `-o` : Dossier de destination (par défaut: `./screenshots/`)
- `--format`, `-f` : Format d'image - png, jpeg ou webp (par défaut: `png`)
- `--help`, `-h` : Afficher l'aide

### Exemples

1. **Capture d'écran avec paramètres par défaut**

```bash
pnpm screenshot https://example.com
```
*L'image sera enregistrée au format PNG dans le dossier `./screenshots/`*

2. **Spécifier uniquement le format**

```bash
pnpm screenshot https://example.com --format jpeg
# ou avec la forme courte
pnpm screenshot https://example.com -f jpeg
```
*L'image sera enregistrée au format JPEG dans le dossier par défaut `./screenshots/`*

3. **Spécifier uniquement le dossier de sortie**

```bash
pnpm screenshot https://example.com --output ./captures
# ou avec la forme courte
pnpm screenshot https://example.com -o ./captures
```
*L'image sera enregistrée au format PNG dans le dossier `./captures/`*

4. **Spécifier le format et le dossier**

```bash
pnpm screenshot https://example.com -o . -f webp
```
*L'image sera enregistrée au format WebP dans le répertoire courant*

5. **Utiliser un chemin absolu pour la sortie**

```bash
pnpm screenshot https://example.com -o /Users/votrenom/Documents/captures
```

6. **Afficher l'aide**

```bash
pnpm screenshot --help
# ou
pnpm screenshot -h
```

## Formats d'image supportés

- **PNG** (par défaut) : Qualité optimale sans perte, parfait pour les captures d'écran d'interfaces
- **JPEG** : Fichiers plus légers, idéal quand la taille est prioritaire
- **WebP** : Excellent compromis entre qualité et taille de fichier

## Configuration technique

- Node.js avec modules ES
- Puppeteer pour l'automatisation du navigateur Chrome
- Résolution par défaut: 1920x1080
- Qualité JPEG/WebP: 85%
- Mode headless (sans interface graphique)