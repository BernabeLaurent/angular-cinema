# Étape 1 : build de l'application Angular
FROM node:22-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Builder l'application Angular (ajuste la commande selon ton script npm)
RUN npm run build --prod

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
