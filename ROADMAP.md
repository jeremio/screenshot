# Roadmap - Fonctionnalités futures

Ce document présente les idées de fonctionnalités pour les futures versions de l'outil de capture d'écran.

## Navigation et Interaction

### Options de navigation
- `--wait-for <selector>` - Attendre qu'un élément spécifique apparaisse avant la capture
- `--timeout <ms>` - Délai maximum d'attente avant échec (défaut: 30000)
- `--user-agent <string>` - Définir un User-Agent personnalisé pour simuler un navigateur spécifique

### Options d'interaction
- `--click <selector>` - Cliquer sur un élément avant la capture (ex: fermer un popup)
- `--scroll-to <selector>` - Défiler jusqu'à un élément avant la capture
- `--type <selector> <text>` - Saisir du texte dans un champ (ex: formulaire de recherche)
- `--hover <selector>` - Simuler un survol de souris sur un élément

## Manipulation visuelle

### Modification d'affichage
- `--hide <selector>` - Masquer des éléments avant la capture (bannières de cookies, popups)
- `--dark-mode` - Forcer le mode sombre pour la capture
- `--emulate <device>` - Emuler un appareil précis (ex: "iPhone 12", "iPad")
- `--css-inject <css>` - Injecter du CSS personnalisé avant la capture

### Rognage et cadrage
- `--clip <x,y,width,height>` - Capturer uniquement une zone spécifique de la page
- `--element <selector>` - Capturer uniquement un élément spécifique
- `--padding <px>` - Ajouter une marge autour de l'élément capturé

## Traitement par lots

### Multi-capture
- `--batch <file.csv>` - Traiter un fichier CSV contenant des URLs et options
- `--repeat <n> --interval <ms>` - Prendre n captures à intervalles réguliers
- `--urls <url1,url2,url3>` - Capturer plusieurs URLs en une commande

### Automatisation
- `--schedule <cron>` - Planifier des captures avec une expression cron
- `--watch <url>` - Surveiller une page et capturer quand des changements sont détectés

## Authentification et sécurité

### Connexion aux sites protégés
- `--auth-user <username> --auth-pass <password>` - Pour les sites avec authentification HTTP basic
- `--cookie <name=value>` - Définir des cookies pour l'authentification
- `--session <file.json>` - Charger une session stockée pour l'authentification

### Sécurité
- `--proxy <url>` - Utiliser un proxy pour les requêtes
- `--headful` - Mode visible (non-headless) pour contourner certaines détections de bots
- `--incognito` - Utiliser un contexte de navigation privée

## Options de sortie avancées

### Nommage et métadonnées
- `--prefix <text>` - Préfixe personnalisé pour les noms de fichiers
- `--timestamp-format <format>` - Format personnalisé pour l'horodatage
- `--metadata` - Ajouter des métadonnées EXIF/XMP aux images (URL source, date, etc.)

### Formats spéciaux
- `--pdf` - Générer un PDF au lieu d'une image
- `--pdf-options <json>` - Options spécifiques au PDF (format, marges, etc.)
- `--mp4` - Enregistrer une courte vidéo au lieu d'une image fixe

## Analyse et comparaison

### Comparaison d'images
- `--compare <path>` - Comparer avec une capture précédente et générer un différentiel
- `--highlight-changes` - Surligner les différences en couleur
- `--threshold <percent>` - Seuil de détection pour les différences (défaut: 0.1%)

### Analyses
- `--lighthouse` - Exécuter un audit Lighthouse en même temps que la capture
- `--extract-text` - Extraire le texte visible de la page
- `--analyze-colors` - Analyser et extraire la palette de couleurs de la page

## Intégration et Hooks

### Automatisation de workflow
- `--before-script <file.js>` - Exécuter un script JavaScript avant la capture
- `--after-capture <command>` - Exécuter une commande shell après la capture
- `--webhook <url>` - Envoyer le résultat à un webhook
- `--notify <service>` - Envoyer une notification après la capture (email, Slack, etc.)

## Performance et optimisation

### Optimisation d'image
- `--optimize` - Optimiser automatiquement l'image après capture
- `--compress <level>` - Niveau de compression supplémentaire
- `--resize <width,height>` - Redimensionner l'image après capture

### Performance
- `--parallel <n>` - Nombre de captures parallèles pour les traitements par lots
- `--cache <dir>` - Réutiliser une session de navigateur entre les captures
- `--throttle <preset>` - Simuler une connexion réseau lente (3G, 4G, etc.)

## Comment contribuer

Si vous souhaitez implémenter l'une de ces fonctionnalités ou proposer de nouvelles idées, n'hésitez pas à ouvrir une issue ou une pull request sur le dépôt.