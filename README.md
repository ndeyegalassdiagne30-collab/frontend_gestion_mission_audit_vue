# AuditFlow — Frontend Vue 3

Interface de gestion des missions d'audit pour les cabinets d'expertise comptable.
Portage du frontend JavaScript natif (`frontend_gestion_mission_audit`) vers **Vue 3**,
à design et couleurs strictement identiques.

Consomme l'API Hono du dossier `backend_gestion_mission_audit`.

## Stack

| Outil | Version | Rôle |
| --- | --- | --- |
| Vue | 3.5 | Composants `<script setup>` |
| Vue Router | 5.2 | Routage et contrôle d'accès par rôle |
| Pinia | 4.0 | Store d'authentification |
| Vite | 8.2 | Serveur de développement et build |
| Tailwind CSS | 4.3 | Styles utilitaires (`@tailwindcss/vite`) |
| Font Awesome 6.5 | CDN | Icônes |

## Démarrage

```bash
npm install
cp .env.example .env   # puis vérifier VITE_API_URL
npm run dev
```

L'application démarre sur <http://localhost:5173>.
Le backend doit tourner en parallèle (par défaut `http://localhost:3003`).

| Script | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualise le build |

## Structure

```
src/
├── main.js                 Point d'entrée (Pinia + Router)
├── App.vue                 Layout : sidebar, navbar, drawer, toasts, confirmation
├── assets/main.css         Thème Tailwind + tout le design AuditFlow
├── router/index.js         Routes et garde d'accès par rôle
├── stores/auth.js          Session, rôle, page par défaut
├── services/               Appels API (un fichier par ressource)
├── composables/            useToast, useConfirm, useDrawer
├── utils/                  Comparaison d'ids, validation, formats, libellés
├── components/
│   ├── layout/             AppSidebar, AppNavbar
│   ├── ui/                 Tableau, filtre, drawer, champs, badges, slider...
│   ├── forms/              Formulaires ouverts dans le panneau latéral
│   └── details/            Fiches en lecture seule
└── views/                  Une vue par page
```

## Rôles et accès

Repris à l'identique de l'ancien routeur (`meta.roles` dans `router/index.js`) :

| Page | Administrateur | Expert-comptable | Auditeur | Client |
| --- | :---: | :---: | :---: | :---: |
| Tableau de bord | ✅ | ✅ | ✅ | — |
| Utilisateurs | ✅ | — | — | — |
| Journal d'activité | ✅ | — | — | — |
| Clients | ✅ | ✅ | — | — |
| Missions | ✅ | ✅ | ✅ (les siennes) | ✅ (celles de son entreprise) |
| Affectation des auditeurs | — | ✅ | — | — |
| Documents | ✅ | ✅ | ✅ | — |
| Mon profil | ✅ | ✅ | ✅ | ✅ |

Une page interdite renvoie vers la page d'accueil du rôle : `missions` pour un
client, `dashboard` pour les autres.

## Conservation du design

Le design de l'ancien projet est repris **sans aucune modification visuelle** :

- `css/style.css` est intégralement recopié dans `src/assets/main.css`, hors de
  tout `@layer` : il garde donc la priorité sur les utilitaires Tailwind, comme
  lorsqu'il était chargé après `tailwind.css`.
- La palette de `tailwind.config.js` (`brand` et ses cinq nuances, la police
  Inter, l'ombre `soft`) est reportée dans le bloc `@theme` de Tailwind 4 :
  `bg-brand`, `text-brand-dark`, `bg-brand/10`… fonctionnent à l'identique.
- Trois différences de comportement entre Tailwind 3 et 4 sont neutralisées dans
  `main.css` : la valeur de `shadow-sm` (l'échelle des ombres a été décalée en
  v4), le curseur « main » sur les boutons, et la couleur des placeholders.

## Différences de fonctionnement avec l'ancienne version

| Point | Avant | Maintenant |
| --- | --- | --- |
| Navigation | `?page=clients` | Vraies URLs : `/clients` |
| Après connexion / modification du profil | rechargement complet de la page | mise à jour réactive |
| Email d'un client sans compte | envoyé à `""`, refusé par l'API | envoyé à `null` |
| Affectation des auditeurs | `PATCH /missions/:id` | route dédiée `PATCH /missions/:id/auditeurs` |
| Boîte de confirmation | l'action tournait dans la boîte | la boîte se ferme, l'action suit |
| `createId()` et `logActivite()` | code mort (ids générés côté serveur, journal écrit par l'API) | supprimés |

## API consommée

| Méthode | Route | Utilisée par |
| --- | --- | --- |
| POST | `/auth/login` `/auth/logout` | Connexion, déconnexion |
| GET POST PATCH DELETE | `/utilisateurs` | Utilisateurs, profil |
| GET POST PATCH DELETE | `/clients` | Clients |
| GET POST PATCH DELETE | `/missions` | Missions |
| PATCH | `/missions/:id/auditeurs` | Affectations |
| GET POST DELETE | `/documents` | Documents |
| POST | `/uploads` | Photos de profil et documents (Cloudinary) |
| GET | `/journaux_activites` | Journal d'activité |

Le jeton JWT et l'utilisateur connecté sont conservés dans `localStorage`
(`auditflow_token`, `auditflow_user`). Une réponse `401` vide la session et
renvoie vers `/login`.
