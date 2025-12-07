# Screenshot Automation Tool

Un outil simple permettant de capturer automatiquement des captures d'écran de pages web en utilisant Node.js et Puppeteer.

## Installation

### Installation locale

1. Clonez ce dépôt ou créez un nouveau projet
2. Installez les dépendances

```bash
pnpm install
```

### Installation globale

Pour utiliser l'outil partout dans votre système sans préfixe `pnpm` :

```bash
# Dans le répertoire du projet
pnpm link --global
```

Après l'installation globale, vous pouvez utiliser la commande `screenshot` depuis n'importe quel répertoire :

```bash
screenshot https://example.com -f jpeg
```

## Utilisation

### Commande de base

```bash
# Version locale (dans le répertoire du projet)
pnpm screenshot [url] [options]

# Version globale (n'importe où dans le système)
screenshot [url] [options]
```

### Options

- `--output`, `-o [dir]` : Dossier de destination (par défaut: répertoire courant d'où la commande est exécutée)
- `--format`, `-f [format]` : Format d'image - png, jpeg ou webp (par défaut: `png`)
- `--delay`, `-d [ms]` : Délai en millisecondes avant la capture (par défaut: `0`)
- `--quality`, `-q [1-100]` : Qualité pour jpeg/webp de 1 à 100 (par défaut: `85`)
- `--width`, `-w [pixels]` : Largeur de la fenêtre en pixels (par défaut: `1920`)
- `--height`, `-h [pixels]` : Hauteur de la fenêtre en pixels (par défaut: `1080`)
- `--full-page`, `-fp [bool]` : Capturer la page entière ou seulement la partie visible. Valeurs acceptées: `true`, `false`, `1`, `0` (par défaut: `true`)
- `--executable-path`, `-ep [path]` : Chemin vers l'exécutable du navigateur (par défaut: utilise le Chromium intégré à Puppeteer)
- `--timeout`, `-t [ms]` : Timeout de navigation en millisecondes (par défaut: `30000`)
- `--wait-until`, `-wu [option]` : Condition d'attente - load, domcontentloaded, networkidle0, networkidle2 (par défaut: `networkidle2`)
- `--help` : Afficher cette aide

### Exemples

1. **Capture d'écran avec paramètres par défaut**

```bash
# Version locale
pnpm screenshot https://example.com
```

```bash
# Version globale
screenshot https://example.com
```
*L'image sera enregistrée au format PNG directement dans le répertoire d'où vous exécutez la commande, avec une résolution de 1920x1080*

2. **Capture d'écran d'une application locale**

```bash
# Version locale
pnpm screenshot localhost:3000
```

```bash
# Version globale
screenshot localhost:3000
```

3. **Spécifier un dossier de destination personnalisé**

```bash
# Version locale
pnpm screenshot https://example.com -o ./captures
```

```bash
# Version globale
screenshot https://example.com -o ./captures
```
*L'image sera enregistrée dans le dossier `./captures/` relatif à l'endroit d'où vous exécutez la commande.*

4. **Spécifier uniquement le format**

```bash
# Version locale
pnpm screenshot https://example.com -f jpeg
```

```bash
# Version globale
screenshot https://example.com -f jpeg
```
*L'image sera enregistrée au format JPEG dans le répertoire courant*

5. **Capture uniquement de la partie visible (sans défilement)**

```bash
# Version locale
pnpm screenshot https://example.com -fp false
```

```bash
# Version globale
screenshot https://example.com -fp false
```
*Capture uniquement ce qui est visible dans le viewport sans faire défiler la page*

6. **Spécifier la qualité de l'image**

```bash
# Version locale
pnpm screenshot https://example.com -f jpeg -q 95
```

```bash
# Version globale
screenshot https://example.com -f jpeg -q 95
```
*L'image sera enregistrée au format JPEG avec une qualité de 95% dans le répertoire courant*

7. **Ajouter un délai avant la capture**

```bash
# Version locale
pnpm screenshot https://example.com -d 2000
```

```bash
# Version globale
screenshot https://example.com -d 2000
```
*L'outil attendra 2 secondes après le chargement de la page avant de prendre la capture*

8. **Capture en mode mobile**

```bash
# Version locale
pnpm screenshot https://example.com -w 375 -h 667
```

```bash
# Version globale
screenshot https://example.com -w 375 -h 667
```
*Capture d'écran simulant un appareil mobile (iPhone 8)*

9. **Capture en mode tablette sans défilement**

```bash
# Version locale
pnpm screenshot https://example.com -w 768 -h 1024 -fp false
```

```bash
# Version globale
screenshot https://example.com -w 768 -h 1024 -fp false
```
*Capture d'écran simulant une tablette, uniquement ce qui est visible à l'écran*

10. **Combinaison de plusieurs options**

```bash
# Version locale
pnpm screenshot https://example.com -o ./captures -f webp -q 90 -d 1500 -w 1024 -h 768
```

```bash
# Version globale
screenshot https://example.com -o ./captures -f webp -q 90 -d 1500 -w 1024 -h 768
```
*Capture au format WebP, qualité 90%, après un délai de 1,5 seconde, en résolution 1024x768, dans le dossier ./captures/*

11. **Personnaliser le timeout et la condition d'attente**

```bash
# Version locale
pnpm screenshot https://example.com -t 60000 -wu load
```

```bash
# Version globale
screenshot https://example.com -t 60000 -wu load
```
*Attend jusqu'à 60 secondes (au lieu de 30 par défaut) et attend uniquement l'événement "load" au lieu de "networkidle2"*

12. **Utiliser un chemin absolu pour la sortie**

```bash
# Version locale
pnpm screenshot https://example.com -o /home/user/Documents/captures
```

```bash
# Version globale
screenshot https://example.com -o /home/user/Documents/captures
```

13. **Utiliser un chemin relatif complexe**

```bash
# Version locale
pnpm screenshot https://example.com -o ../archives/captures
```

```bash
# Version globale
screenshot https://example.com -o ../archives/captures
```
*L'image sera enregistrée dans le dossier parent `../archives/captures/` relatif à l'endroit d'où vous exécutez la commande*

14. **Afficher l'aide**

```bash
# Version locale
pnpm screenshot --help
```

```bash
# Version globale
screenshot --help
```

## Désinstallation globale

Pour supprimer la commande globale :

```bash
pnpm unlink --global
```

## Résolutions courantes

| Appareil         | Largeur | Hauteur | Commande                                       |
|------------------|---------|---------|------------------------------------------------|
| Mobile (petit)   | 320     | 568     | `screenshot URL -w 320 -h 568`                 |
| Mobile (moyen)   | 375     | 667     | `screenshot URL -w 375 -h 667`                 |
| Mobile (grand)   | 414     | 896     | `screenshot URL -w 414 -h 896`                 |
| Tablette         | 768     | 1024    | `screenshot URL -w 768 -h 1024`                |
| Laptop           | 1366    | 768     | `screenshot URL -w 1366 -h 768`                |
| Desktop          | 1920    | 1080    | `screenshot URL -w 1920 -h 1080`               |
| 4K               | 3840    | 2160    | `screenshot URL -w 3840 -h 2160`               |

## Formats d'image supportés

- **PNG** (par défaut) : Qualité optimale sans perte, parfait pour les captures d'écran d'interfaces
- **JPEG** : Fichiers plus légers, idéal quand la taille est prioritaire
- **WebP** : Excellent compromis entre qualité et taille de fichier

## Pourquoi utiliser les différentes options ?

### Mode page entière vs viewport
- **Page entière** (`--full-page true` ou `1`) : Capture toute la page, même les parties non visibles sans défilement
- **Viewport uniquement** (`--full-page false` ou `0`) : Capture uniquement ce qui est visible dans la fenêtre du navigateur

### Délai avant capture
Le délai peut être utile dans plusieurs cas :
- Sites avec animations ou chargements progressifs
- Sites qui effectuent des requêtes AJAX après le chargement initial
- Pages où vous souhaitez capturer un état spécifique après interaction

### Timeout et condition d'attente
Le timeout et la condition d'attente permettent de contrôler quand la capture doit être prise :
- **Timeout** : Durée maximale d'attente avant d'abandonner (utile pour les sites lents)
- **waitUntil** :
  - `load` : Attend l'événement load (plus rapide, mais moins fiable)
  - `domcontentloaded` : Attend que le DOM soit chargé
  - `networkidle0` : Attend qu'il n'y ait plus de connexions réseau pendant 500ms
  - `networkidle2` : Attend qu'il y ait au maximum 2 connexions réseau pendant 500ms (défaut)

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

### Chemin de l'exécutable du navigateur
Par défaut, Puppeteer utilise son propre Chromium intégré (téléchargé automatiquement lors de l'installation).

L'option `--executable-path` permet de spécifier un navigateur différent. Utile si :
- Vous voulez utiliser votre installation système de Chrome/Chromium/Brave
- Vous avez besoin d'une version spécifique du navigateur
- Puppeteer ne peut pas télécharger Chromium (restrictions réseau, pare-feu)
- Vous avez une installation portable du navigateur

**Chemins communs sur Linux :**
- Google Chrome : `/usr/bin/google-chrome`
- Chromium : `/usr/bin/chromium-browser` ou `/usr/bin/chromium`
- Brave : `/usr/bin/brave-browser` ou `/usr/bin/brave`
- Snap Chromium : `/snap/bin/chromium`

**Pour trouver le chemin sur votre système :**
```bash
which google-chrome
which chromium-browser
which brave-browser
```

**Exemple d'utilisation :**
```bash
pnpm screenshot https://example.com -ep /usr/bin/chromium-browser
pnpm screenshot https://google.com -ep /var/lib/flatpak/exports/bin/com.brave.Browser
```

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

1. **Puppeteer est correctement installé** : Exécutez `pnpm install` dans le répertoire du projet
2. **L'URL est valide et accessible** : Vérifiez que le site est joignable depuis votre navigateur
3. **Droits d'écriture** : Assurez-vous d'avoir les permissions dans le dossier de destination
4. **Navigateur introuvable** : Si vous voyez l'erreur "Browser was not found at the configured executablePath" :
   - Par défaut, Puppeteer télécharge automatiquement Chromium lors du premier `pnpm install`
   - Si le téléchargement a échoué, réinstallez : `rm -rf node_modules && pnpm install`
   - Ou utilisez un navigateur système avec `-ep` : `pnpm screenshot URL -ep /usr/bin/chromium-browser`

### Dépannage de l'installation globale

Si la commande globale ne fonctionne pas :

1. Vérifiez que le script a un shebang et est exécutable :
   ```bash
   # Assurez-vous que src/main.js commence par #!/usr/bin/env node
   # Rendre exécutable
   chmod +x src/main.js
   ```

2. Vérifiez votre configuration pnpm :
   ```bash
   # Configurer pnpm correctement
   pnpm setup
   
   # Recharger votre fichier de configuration shell 
   source ~/.bashrc
   source ~/.zshrc
   ```

3. Refaites le lien global :
   ```bash
   # Supprimer l'ancien lien
   pnpm unlink --global
   
   # Recréer le lien
   pnpm link --global
   ```

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
