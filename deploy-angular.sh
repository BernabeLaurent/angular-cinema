#!/bin/bash

echo "🚀 Déploiement Angular Cinema"
echo "============================="

# Aller dans le répertoire du projet
cd /var/www/angular-cinema || {
    echo "❌ Erreur: Impossible d'accéder au répertoire /var/www/angular-cinema"
    exit 1
}

echo "=== Mise à jour du code source ==="
git pull origin main

echo "=== Installation des dépendances ==="
npm install

echo "=== Vérification des outils globaux ==="
npm install -g http-server @angular/cli || echo "Outils déjà installés"

echo "=== Build de production ==="
ng build --configuration production

if [ ! -d "dist/angular-cinema" ]; then
    echo "❌ Erreur: Le build a échoué, répertoire dist/angular-cinema introuvable"
    exit 1
fi

echo "=== Arrêt de l'ancien serveur ==="
pkill -f "http-server.*angular-cinema" || echo "Aucun serveur à arrêter"

echo "=== Démarrage du nouveau serveur ==="
nohup http-server dist/angular-cinema -a 0.0.0.0 -p 4200 --cors > angular.log 2>&1 &

echo "=== Attente du démarrage ==="
sleep 10

echo "=== Vérification du serveur ==="
if pgrep -f "http-server.*angular-cinema" > /dev/null; then
    echo "✅ Serveur Angular démarré avec succès"
    echo "🌐 Application disponible sur http://159.89.20.85:4200"
    echo "📋 PID du processus: $(pgrep -f 'http-server.*angular-cinema')"
else
    echo "❌ Échec du démarrage du serveur"
    echo "=== Logs d'erreur ==="
    tail -n 20 angular.log 2>/dev/null || echo "Aucun log trouvé"
    exit 1
fi

echo "✅ Déploiement terminé avec succès"