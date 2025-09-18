# Étape 1 : build de l'application Angular
FROM node:22-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer Chrome pour les tests
RUN apt-get update && apt-get install -y \
    chromium-browser \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Définir la variable d'environnement pour Chrome
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROMIUM_FLAGS="--no-sandbox --disable-dev-shm-usage --disable-gpu"

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Exécuter les tests unitaires
RUN npm run test -- --watch=false --browsers=ChromeHeadless

# Builder l'application Angular en mode production
RUN npm run build

# Étape 2 : serveur web pour servir l'app (nginx)
FROM nginx:alpine

# Copier le build Angular dans le dossier nginx
COPY --from=build /app/dist/angular-cinema /usr/share/nginx/html/

# Copier la configuration nginx personnalisée
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Commande de démarrage de nginx
CMD ["nginx", "-g", "daemon off;"]
