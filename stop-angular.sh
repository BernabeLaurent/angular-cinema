#!/bin/bash

echo "🛑 Arrêt du serveur Angular"
echo "=========================="

# Trouver et arrêter les processus http-server pour angular-cinema
PIDS=$(pgrep -f "http-server.*angular-cinema")

if [ -z "$PIDS" ]; then
    echo "ℹ️ Aucun serveur Angular n'est en cours d'exécution"
    exit 0
fi

echo "📋 Processus trouvés: $PIDS"

# Arrêter les processus
pkill -f "http-server.*angular-cinema"

# Attendre un peu
sleep 3

# Vérifier que les processus sont arrêtés
REMAINING_PIDS=$(pgrep -f "http-server.*angular-cinema")

if [ -z "$REMAINING_PIDS" ]; then
    echo "✅ Serveur Angular arrêté avec succès"
else
    echo "⚠️ Certains processus résistent, force kill..."
    pkill -9 -f "http-server.*angular-cinema"
    sleep 2

    FINAL_CHECK=$(pgrep -f "http-server.*angular-cinema")
    if [ -z "$FINAL_CHECK" ]; then
        echo "✅ Serveur Angular arrêté avec succès (force)"
    else
        echo "❌ Impossible d'arrêter complètement le serveur"
        exit 1
    fi
fi