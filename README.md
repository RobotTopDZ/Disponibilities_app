# Mon Calendrier de Disponibilités Pro - KHALDI Oussama

Une application web moderne et responsive pour afficher les créneaux de disponibilité basée sur les données JSON.

## Fonctionnalités

- ✅ Affichage des créneaux disponibles uniquement
- ✅ Interface mobile-first et responsive
- ✅ Navigation par semaine
- ✅ Design moderne avec Tailwind CSS
- ✅ Filtrage automatique des périodes bloquées et de récupération

## Technologies

- **Next.js** - Framework React
- **Tailwind CSS** - Styling
- **React** - Interface utilisateur

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Build

```bash
npm run build
npm start
```

## Déploiement Railway

Cette application est prête pour le déploiement sur Railway avec Docker :

1. **Via GitHub** :
   - Connectez votre repository GitHub à Railway
   - Railway détectera automatiquement le Dockerfile
   - Le déploiement se fera automatiquement

2. **Via Railway CLI** :
   ```bash
   railway login
   railway link
   railway up
   ```

3. **Test Docker local** :
   ```bash
   npm run docker:build
   npm run docker:run
   ```

### Configuration Railway

- **Port** : 3000 (configuré automatiquement)
- **Build** : Dockerfile
- **Node.js** : Version 18+
- **Mémoire** : Minimum 512MB recommandé

## Structure des données

L'application lit les données depuis `disponibilities.json` et filtre automatiquement :
- ✅ Affiche uniquement les créneaux `DISPONIBLE`
- ❌ Exclut les créneaux `BLOCKED`
- ❌ Exclut les périodes `Buffer` (récupération après cours)

## Règles métier

- Seules les plages marquées `DISPONIBLE` sont affichées
- Les périodes `Buffer` ne sont jamais affichées (temps de récupération)
- Interface en français
- Design professionnel et moderne
