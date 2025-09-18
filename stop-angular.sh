#!/bin/bash

echo "🛑 Arrêt du serveur Angular"
echo "=========================="

# Arrêter les processus http-server
pkill -f "http-server.*angular-cinema" || echo "Aucun serveur Angular à arrêter"

# Attendre un peu
sleep 3

# Vérifier que les processus sont arrêtés
if pgrep -f "http-server.*angular-cinema" > /dev/null; then
    echo "⚠️ Certains processus résistent, force kill..."
    pkill -9 -f "http-server.*angular-cinema"
    sleep 2
fi

echo "✅ Serveur Angular arrêté avec succès"