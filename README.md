# Mon Calendrier de Disponibilités Pro

Application web pour afficher les créneaux de disponibilité de KHALDI Oussama.

## Technologies

- Next.js
- React
- Tailwind CSS
- Docker

## Installation

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000

## Fonctionnement

L'application lit le fichier `disponibilities.json` et affiche uniquement les créneaux marqués "DISPONIBLE". Les périodes "BLOCKED" et "Buffer" sont automatiquement exclues.

## Déploiement Railway

Connecter le repository GitHub à Railway. Le Dockerfile gère le déploiement automatiquement.
