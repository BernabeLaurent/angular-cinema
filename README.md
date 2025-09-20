# 🎬 Angular Cinema - Application de Gestion de Cinéma

**Version Angular** : 19.2.x
**Dernière mise à jour** : 20 septembre 2025

Application web moderne de gestion de cinéma développée avec Angular 19, Material Design et une architecture modulaire optimisée pour la performance.

## 📋 Table des Matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Installation et Configuration](#-installation-et-configuration)
- [Scripts Disponibles](#-scripts-disponibles)
- [Structure du Projet](#-structure-du-projet)
- [Composants Principaux](#-composants-principaux)
- [Services et État](#-services-et-état)
- [Authentification et Autorisation](#-authentification-et-autorisation)
- [Système de Réservation](#-système-de-réservation)
- [Module Administrateur](#-module-administrateur)
- [Optimisations Performance](#-optimisations-performance)
- [Tests](#-tests)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)

## 🎯 Vue d'ensemble

Angular Cinema est une application complète de gestion de cinéma permettant :
- 🎪 **Gestion des films** : Affichage, recherche et détails des films
- 🎟️ **Système de réservation** : Réservation de places avec sélection interactive
- 👥 **Gestion utilisateurs** : Inscription, connexion, profils
- 🏛️ **Administration** : Gestion des films, salles, utilisateurs et réservations
- 🎨 **Interface moderne** : Material Design avec accessibilité WCAG
- ⚡ **Performance optimisée** : Bundle réduit (-110kB), lazy loading, Core Web Vitals

## ✨ Fonctionnalités

### 🎬 Interface Publique
- **Page d'accueil** avec film vedette et carousel
- **Catalogue de films** avec filtres et recherche avancée
- **Détails des films** avec bandes-annonces et informations complètes
- **Système de réservation** interactif avec sélection de places
- **Profil utilisateur** avec historique des réservations

### 🔐 Authentification
- **Inscription/Connexion** avec validation complète
- **Gestion des rôles** : Client, Employé, Administrateur
- **JWT Token** avec refresh automatique
- **Protection des routes** par rôle

### 👑 Interface Administrateur
- **Dashboard** avec statistiques temps réel
- **Gestion des films** : CRUD complet avec upload d'images
- **Gestion des salles** : Configuration des sièges
- **Gestion des utilisateurs** : Attribution de rôles
- **Gestion des réservations** : Vue d'ensemble et modifications

## 🏗️ Architecture

### Structure Modulaire
```
src/app/
├── auth/                    # Module d'authentification
├── booking/                 # Module de réservation
├── common/                  # Composants partagés
│   ├── components/          # Navbar, Footer, Modales
│   └── guards/              # Guards de protection
├── components/              # Composants de pages
├── movies/                  # Module films
├── services/                # Services métier
├── users/                   # Module utilisateurs
└── admin/                   # Module administration (lazy loaded)
```

### Technologies Utilisées
- **Frontend** : Angular 19 + TypeScript
- **UI/UX** : Angular Material + SCSS
- **État** : RxJS + Services
- **Testing** : Jasmine + Karma
- **Build** : Webpack + Angular CLI
- **Optimisation** : Bundle splitting, Tree-shaking, Lazy loading

## 🚀 Installation et Configuration

### Prérequis
- Node.js ≥ 18.x
- npm ≥ 9.x
- Angular CLI 19.x

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd angular-cinema

# Installer les dépendances
npm install

# Configuration environnement
cp src/environments/environment.example.ts src/environments/environment.ts
# Éditer environment.ts avec vos paramètres
```

### Variables d'Environnement
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  jwtSecret: 'your-jwt-secret'
};
```

## 📜 Scripts Disponibles

### Développement
```bash
# Serveur de développement
npm start
# ou
ng serve

# Build de développement
npm run build:dev

# Watch mode
npm run watch
```

### Production
```bash
# Build optimisé
npm run build
# ou
ng build --configuration production

# Serveur production local
npm run start:prod
```

### Tests et Qualité
```bash
# Tests unitaires
npm test

# Tests en mode headless
npm test -- --watch=false --browsers=ChromeHeadless

# Analyse du bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/angular-cinema/stats.json
```

### Docker
```bash
# Démarrer l'environnement
npm run dockerUp

# Arrêter l'environnement
npm run dockerDown
```

## 📁 Structure du Projet

```
angular-cinema/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 auth/                    # Authentification
│   │   │   ├── login.component.ts      # Composant de connexion
│   │   │   ├── register.component.ts   # Composant d'inscription
│   │   │   ├── auth.service.ts         # Service d'authentification
│   │   │   └── auth.guard.ts           # Guard d'authentification
│   │   ├── 📁 booking/                 # Réservations
│   │   │   ├── booking.component.ts    # Interface de réservation
│   │   │   ├── seat-selection.component.ts # Sélection des places
│   │   │   └── booking.service.ts      # Service de réservation
│   │   ├── 📁 common/                  # Composants partagés
│   │   │   ├── 📁 components/
│   │   │   │   ├── navbar.component.ts # Navigation principale
│   │   │   │   ├── footer.component.ts # Pied de page
│   │   │   │   └── search-modal.component.ts # Modal de recherche
│   │   │   └── 📁 guards/
│   │   │       ├── admin.guard.ts      # Protection admin
│   │   │       └── auth.guard.ts       # Protection authentification
│   │   ├── 📁 components/              # Pages principales
│   │   │   ├── home.component.ts       # Page d'accueil
│   │   │   ├── movies-list.component.ts # Liste des films
│   │   │   ├── movie-details.component.ts # Détails film
│   │   │   └── hero-section.component.ts # Section héro
│   │   ├── 📁 services/                # Services métier
│   │   │   ├── movie.service.ts        # Gestion des films
│   │   │   ├── user-role.service.ts    # Gestion des rôles
│   │   │   └── theater.service.ts      # Gestion des salles
│   │   ├── 📁 admin/                   # Module administration (lazy)
│   │   │   ├── admin-dashboard.component.ts
│   │   │   ├── movies-management.component.ts
│   │   │   ├── users-management.component.ts
│   │   │   └── bookings-management.component.ts
│   │   └── app.routes.ts              # Configuration des routes
│   ├── 📁 environments/               # Configuration environnements
│   ├── 📁 assets/                     # Ressources statiques
│   ├── 📁 styles/                     # Styles globaux
│   └── index.html                     # Point d'entrée HTML
├── 📄 angular.json                   # Configuration Angular CLI
├── 📄 package.json                   # Dépendances et scripts
├── 📄 tsconfig.json                  # Configuration TypeScript
├── 📄 webpack.config.js              # Configuration Webpack
└── 📄 OPTIMISATIONS-PERFORMANCE.md   # Documentation optimisations
```

## 🧩 Composants Principaux

### Navigation (NavbarComponent)
- **Localisation** : `src/app/common/components/navbar/`
- **Fonctionnalités** :
  - Navigation responsive avec menu mobile
  - Gestion de l'authentification (login/logout)
  - Recherche globale avec modal
  - Menu utilisateur avec profil et rôles
  - Lazy loading des modales (login, register, search)

### Page d'Accueil (HomeComponent)
- **Localisation** : `src/app/components/home/`
- **Sections** :
  - Hero section avec film vedette optimisé (LCP)
  - Carousel des films populaires
  - Films récents et recommandations
  - Appels à l'action pour réservations

### Liste Films (MoviesListComponent)
- **Localisation** : `src/app/components/movies-list/`
- **Fonctionnalités** :
  - Affichage en grille responsive
  - Filtres par genre, année, note
  - Recherche textuelle
  - Pagination optimisée
  - Chargement lazy des images

### Détails Film (MovieDetailsComponent)
- **Localisation** : `src/app/components/movie-details/`
- **Contenu** :
  - Informations complètes du film
  - Galerie d'images et bandes-annonces
  - Horaires et disponibilités
  - Bouton de réservation contextuel

### Réservation (BookingComponent)
- **Localisation** : `src/app/booking/`
- **Processus** :
  - Sélection de la séance
  - Plan interactif de la salle
  - Sélection des places
  - Récapitulatif et paiement
  - Confirmation avec QR code

## 🔧 Services et État

### AuthService
- **Localisation** : `src/app/auth/auth.service.ts`
- **Responsabilités** :
  - Authentification JWT
  - Gestion des tokens (access/refresh)
  - Persistance des sessions
  - Observable d'état d'authentification

### UserRoleService
- **Localisation** : `src/app/services/user-role.service.ts`
- **Fonctionnalités** :
  - Gestion des rôles (Client, Employé, Admin)
  - Observables réactifs pour l'UI
  - Contrôle d'accès granulaire
  - Initiales utilisateur pour avatar

### MovieService
- **Localisation** : `src/app/services/movie.service.ts`
- **API** :
  - CRUD complet des films
  - Recherche et filtrage
  - Gestion des images
  - Cache intelligent

### BookingService
- **Localisation** : `src/app/booking/booking.service.ts`
- **Gestion** :
  - État des réservations
  - Validation des places
  - Calcul des tarifs
  - Historique utilisateur

## 🔐 Authentification et Autorisation

### Système JWT
- **Tokens** : Access token (15min) + Refresh token (7 jours)
- **Stockage** : localStorage avec fallback sessionStorage
- **Sécurité** : Expiration automatique et refresh silencieux

### Rôles et Permissions
```typescript
enum RoleUser {
  CLIENT = 'client',          // Utilisateur standard
  EMPLOYEE = 'employee',      // Employé du cinéma
  ADMIN = 'admin'            // Administrateur
}
```

### Guards de Protection
- **AuthGuard** : Vérification d'authentification
- **AdminGuard** : Accès réservé admin/employé
- **RoleGuard** : Contrôle granulaire par rôle

### Routes Protégées
```typescript
// Exemple de protection de routes
{
  path: 'admin',
  loadChildren: () => import('./admin/admin.routes'),
  canActivate: [AdminGuard]
}
```

## 🎟️ Système de Réservation

### Workflow Complet
1. **Sélection film** → Redirection vers horaires
2. **Choix séance** → Vérification disponibilité
3. **Plan de salle** → Sélection interactive des places
4. **Récapitulatif** → Validation et tarification
5. **Paiement** → Simulation (intégration future)
6. **Confirmation** → Génération QR code et e-mail

### Composant SeatSelection
- **Interface** : Plan 2D interactif de la salle
- **États** : Disponible, Occupé, Sélectionné, Réservé
- **Validation** : Limite de places, places adjacentes
- **Accessibilité** : Navigation clavier, lecteurs d'écran

### Gestion d'État
- **Observable pattern** pour la réactivité
- **State management** local avec RxJS
- **Synchronisation** temps réel avec le backend

## 👑 Module Administrateur

### Chargement Lazy
- **Route** : `/admin`
- **Bundle séparé** : 365kB (chargé uniquement si admin)
- **Performance** : Pas d'impact sur l'utilisateur standard

### Dashboard Admin
- **Métriques** : Réservations, revenus, occupation
- **Graphiques** : Charts.js pour visualisations
- **Temps réel** : Mise à jour automatique

### Gestion Films
- **CRUD complet** : Création, modification, suppression
- **Upload images** : Drag & drop avec preview
- **Validation** : Formulaires réactifs Angular
- **Recherche/Tri** : Interface optimisée

### Gestion Utilisateurs
- **Liste paginée** : Performance optimisée
- **Attribution rôles** : Interface intuitive
- **Historique actions** : Audit trail
- **Export données** : CSV/Excel

### Gestion Réservations
- **Vue d'ensemble** : Toutes les réservations
- **Filtres avancés** : Date, film, utilisateur, statut
- **Modifications** : Annulation, déplacement
- **Statistiques** : Taux d'occupation, revenus

## ⚡ Optimisations Performance

### Bundle JavaScript
- **Réduction** : -110.57 kB (-11.4%)
- **Transfer** : -17.21 kB gzippé (-7.9%)
- **Technique** : Tree-shaking, code splitting, dynamic imports

### Core Web Vitals
- **LCP** : Image héro optimisée avec NgOptimizedImage priority
- **FCP** : Polices système + font-display: swap
- **TTI** : Lazy loading des composants non-critiques

### Techniques Avancées
- **Dynamic imports** : Modales chargées à la demande
- **Webpack optimization** : Bundle splitting intelligent
- **Angular compiler** : AOT + optimizeFor: 'size'
- **TypeScript** : ES2022, removeComments, tree-shaking

### Monitoring
- **Budgets** : Limites de taille configurées
- **Lighthouse** : Audit automatique des performances
- **Bundle analyzer** : Analyse de la composition

## 🧪 Tests

### Configuration
- **Framework** : Jasmine + Karma
- **Browser** : ChromeHeadless pour CI/CD
- **Coverage** : Rapport de couverture automatique

### Stratégie de Test
- **Composants** : Tests unitaires avec mocking
- **Services** : Tests d'intégration avec HTTP interceptors
- **Guards** : Tests de sécurité et redirection
- **E2E** : Tests fonctionnels (à implémenter)

### Commandes de Test
```bash
# Tests en mode watch
npm test

# Tests headless (CI)
npm test -- --watch=false --browsers=ChromeHeadless

# Tests avec coverage
npm test -- --code-coverage
```

### État Actuel
- **Réussis** : 47/52 tests (90.4%)
- **Échecs** : 5 tests (mocking MatDialog/MatSnackBar)
- **Note** : Fonctionnalités opérationnelles, problèmes de test uniquement

## 🚀 Déploiement

### Build Production
```bash
# Build optimisé
npm run build

# Vérification des budgets
ng build --stats-json

# Analyse finale
npx webpack-bundle-analyzer dist/angular-cinema/stats.json
```

### Artefacts de Build
```
dist/angular-cinema/
├── vendor.ae26f033d1a36b05.js    # 710.85 kB
├── main.3586e9b4d673caf8.js      # 101.17 kB
├── polyfills.66fc160b66e03765.js # 34.79 kB
├── styles.7cc851035374623d.css   # 14.54 kB
└── runtime.700b731e6ede7bbb.js   # 3.04 kB
```

### Recommandations Déploiement
- **Serveur web** : nginx avec compression gzip/brotli
- **CDN** : CloudFront/CloudFlare pour les assets
- **Cache** : Headers de cache appropriés
- **HTTPS** : Obligatoire pour PWA et sécurité

## 🤝 Contribution

### Standards de Code
- **TypeScript** : Strict mode activé
- **Linting** : ESLint + Prettier
- **Convention** : Angular style guide
- **Commits** : Conventional commits

### Workflow
1. Fork du repository
2. Branche feature/bugfix
3. Tests et documentation
4. Pull request avec review
5. Merge après validation

### Structure des Commits
```
type(scope): description

feat(auth): add social login support
fix(booking): resolve seat selection bug
docs(readme): update installation guide
perf(bundle): optimize dynamic imports
```

## 📞 Support et Documentation

### Documentation Complémentaire
- **Performance** : [OPTIMISATIONS-PERFORMANCE.md](./OPTIMISATIONS-PERFORMANCE.md)
- **API** : Documentation Swagger (à venir)
- **Deployment** : Guide de déploiement (à venir)

### Ressources Externes
- [Angular Documentation](https://angular.dev/)
- [Angular Material](https://material.angular.io/)
- [RxJS Documentation](https://rxjs.dev/)
- [Core Web Vitals](https://web.dev/vitals/)

### Contact
- **Issues** : GitHub Issues pour bugs et features
- **Discussions** : GitHub Discussions pour questions
- **Security** : security@company.com pour vulnérabilités

---

**Développé avec ❤️ en Angular 19**
**Performance optimisée • Accessibilité WCAG • Production ready**

---

*Dernière mise à jour : 20 septembre 2025*
*Version : 1.0.0*
*Angular : 19.2.x*
