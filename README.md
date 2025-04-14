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
pnpm screenshot <url> [dossier-sortie]
```

### Exemples

1. **Capture d'écran d'un site web avec dossier par défaut**

```bash
pnpm screenshot https://example.com
```
*L'image sera enregistrée dans le dossier `./screenshots/` relatif à l'endroit d'où vous exécutez la commande*

2. **Capture d'écran d'une application locale**

```bash
pnpm screenshot localhost:3000
```

3. **Enregistrer dans le répertoire courant**

```bash
pnpm screenshot https://example.com .
```
*L'image sera enregistrée directement dans le dossier d'où vous exécutez la commande*

4. **Spécifier un dossier personnalisé**

```bash
pnpm screenshot https://example.com ./captures
```
*L'image sera enregistrée dans le dossier `./captures/` relatif à l'endroit d'où vous exécutez la commande*

5. **Utiliser un chemin absolu pour la sortie**

```bash
pnpm screenshot https://example.com /Users/votrenom/Documents/captures
```

6. **Utiliser un chemin relatif complexe**

```bash
pnpm screenshot https://example.com ../archives/captures
```
*L'image sera enregistrée dans le dossier parent `../archives/captures/` relatif à l'endroit d'où vous exécutez la commande*

## Caractéristiques

- **Format ESM** - Utilise la syntaxe moderne des modules ES
- **Nommage automatique** - Les fichiers sont nommés avec l'URL et le timestamp (date et heure)
- **Capture en pleine page** - Capture l'intégralité de la page, pas seulement la partie visible
- **Résolution HD** - Captures en 1920x1080 par défaut
- **Création automatique de dossiers** - Crée les dossiers de destination s'ils n'existent pas

## Structure de fichiers

Le nom des fichiers générés suit le modèle suivant:
```
domaine-exemple-com_2025-04-14T12-30-45.png
```

## Configuration technique

- Node.js avec modules ES
- Puppeteer pour l'automatisation du navigateur Chrome
- Résolution par défaut: 1920x1080
- Mode headless (sans interface graphique)

## Dépannage

Si vous rencontrez des erreurs, assurez-vous que:

1. Puppeteer est correctement installé
2. L'URL est valide et accessible
3. Vous avez les droits d'écriture dans le dossier de destination

## Licence

MIT