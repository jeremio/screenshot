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
- `--delay`, `-d` : Délai en millisecondes avant la capture (par défaut: `0`)
- `--quality`, `-q` : Qualité pour jpeg/webp de 1 à 100 (par défaut: `85`)
- `--width`, `-w` : Largeur de la fenêtre en pixels (par défaut: `1920`)
- `--height`, `-h` : Hauteur de la fenêtre en pixels (par défaut: `1080`)
- `--full-page`, `-fp` : Capturer la page entière ou seulement la partie visible (par défaut: `true`)
- `--help` : Afficher l'aide

### Exemples

1. **Capture d'écran avec paramètres par défaut**

```bash
pnpm screenshot https://example.com
```
*L'image sera enregistrée au format PNG dans le dossier `./screenshots/` avec une résolution de 1920x1080*

2. **Capture d'écran d'une application locale**

```bash
pnpm screenshot localhost:3000
```

3. **Enregistrer dans le répertoire courant**

```bash
pnpm screenshot https://example.com -o .
```
*L'image sera enregistrée directement dans le dossier d'où vous exécutez la commande*

4. **Spécifier uniquement le format**

```bash
pnpm screenshot https://example.com -f jpeg
```
*L'image sera enregistrée au format JPEG dans le dossier par défaut `./screenshots/`*

5. **Capture uniquement de la partie visible (sans défilement)**

```bash
pnpm screenshot https://example.com -fp false
```
*Capture uniquement ce qui est visible dans le viewport sans faire défiler la page*

6. **Spécifier la qualité de l'image**

```bash
pnpm screenshot https://example.com -f jpeg -q 95
```
*L'image sera enregistrée au format JPEG avec une qualité de 95% dans le dossier par défaut*

7. **Ajouter un délai avant la capture**

```bash
pnpm screenshot https://example.com -d 2000
```
*L'outil attendra 2 secondes après le chargement de la page avant de prendre la capture*

8. **Capture en mode mobile**

```bash
pnpm screenshot https://example.com -w 375 -h 667
```
*Capture d'écran simulant un appareil mobile (iPhone 8)*

9. **Capture en mode tablette sans défilement**

```bash
pnpm screenshot https://example.com -w 768 -h 1024 -fp false
```
*Capture d'écran simulant une tablette, uniquement ce qui est visible à l'écran*

10. **Combinaison de plusieurs options**

```bash
pnpm screenshot https://example.com -o ./captures -f webp -q 90 -d 1500 -w 1024 -h 768
```
*Capture au format WebP, qualité 90%, après un délai de 1,5 seconde, en résolution 1024x768, dans le dossier ./captures/*

11. **Utiliser un chemin absolu pour la sortie**

```bash
pnpm screenshot https://example.com -o /home/user/Documents/captures
```

12. **Utiliser un chemin relatif complexe**

```bash
pnpm screenshot https://example.com -o ../archives/captures
```
*L'image sera enregistrée dans le dossier parent `../archives/captures/` relatif à l'endroit d'où vous exécutez la commande*

13. **Afficher l'aide**

```bash
pnpm screenshot --help
```

## Résolutions courantes

| Appareil         | Largeur | Hauteur | Commande                                       |
|------------------|---------|---------|------------------------------------------------|
| Mobile (petit)   | 320     | 568     | `pnpm screenshot URL -w 320 -h 568`            |
| Mobile (moyen)   | 375     | 667     | `pnpm screenshot URL -w 375 -h 667`            |
| Mobile (grand)   | 414     | 896     | `pnpm screenshot URL -w 414 -h 896`            |
| Tablette         | 768     | 1024    | `pnpm screenshot URL -w 768 -h 1024`           |
| Laptop           | 1366    | 768     | `pnpm screenshot URL -w 1366 -h 768`           |
| Desktop          | 1920    | 1080    | `pnpm screenshot URL -w 1920 -h 1080`          |
| 4K               | 3840    | 2160    | `pnpm screenshot URL -w 3840 -h 2160`          |

## Formats d'image supportés

- **PNG** (par défaut) : Qualité optimale sans perte, parfait pour les captures d'écran d'interfaces
- **JPEG** : Fichiers plus légers, idéal quand la taille est prioritaire
- **WebP** : Excellent compromis entre qualité et taille de fichier

## Pourquoi utiliser les différentes options ?

### Mode page entière vs viewport
- **Page entière** (`--full-page true`) : Capture toute la page, même les parties non visibles sans défilement
- **Viewport uniquement** (`--full-page false`) : Capture uniquement ce qui est visible dans la fenêtre du navigateur

### Délai avant capture
Le délai peut être utile dans plusieurs cas :
- Sites avec animations ou chargements progressifs
- Sites qui effectuent des requêtes AJAX après le chargement initial
- Pages où vous souhaitez capturer un état spécifique après interaction

### Résolution personnalisée
Utile pour :
- Tests de responsive design
- Simulation de différents appareils
- Création d'images pour des usages spécifiques (réseaux sociaux, présentations)
- Comparaisons de l'affichage sur différentes tailles d'écran

### Format et qualité
À choisir selon vos besoins :
- PNG : pour une qualité parfaite (interfaces, texte)
- JPEG : pour des fichiers plus légers (photos, grandes images)
- WebP : pour un bon compromis entre qualité et taille

## Structure des fichiers générés

Le nom des fichiers générés suit le modèle suivant:
```
domaine-exemple-com_1920x1080_2025-04-14T12-30-45.png
```

- Première partie : nom de domaine simplifié
- Seconde partie : résolution (largeur x hauteur)
- Troisième partie : date et heure de la capture
- Extension : format de l'image (.png, .jpeg, ou .webp)

## Astuces d'utilisation

- **Tests de responsive design** : Utilisez différentes largeurs pour vérifier les points de rupture de votre site
- **Automation** : Créez un script bash pour capturer plusieurs résolutions en une seule commande
- **Qualité vs taille** : Pour les formats JPEG/WebP, une qualité de 85% offre un bon équilibre
- **Mode viewport** : Utilisez `-fp false` pour capturer uniquement ce qui est visible sans défilement, utile pour vérifier l'apparence "above the fold"

## Dépannage

Si vous rencontrez des erreurs, assurez-vous que:

1. Puppeteer est correctement installé
2. L'URL est valide et accessible
3. Vous avez les droits d'écriture dans le dossier de destination
4. Chrome ou Chromium est installé et accessible

## Configuration technique

- Node.js avec modules ES
- Puppeteer pour l'automatisation du navigateur Chrome
- Résolution par défaut: 1920x1080
- Qualité JPEG/WebP par défaut: 85%
- Mode headless (sans interface graphique)

## Roadmap

Consultez le fichier [ROADMAP.md](./ROADMAP.md) pour découvrir les fonctionnalités prévues pour les prochaines versions.

## Licence

MIT