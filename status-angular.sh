#!/bin/bash

echo "📊 Statut du serveur Angular"
echo "=========================="

# Vérifier les processus http-server
PIDS=$(pgrep -f "http-server.*angular-cinema")

if [ -z "$PIDS" ]; then
    echo "❌ Serveur Angular: ARRÊTÉ"
    EXIT_CODE=1
else
    echo "✅ Serveur Angular: EN COURS"
    echo "📋 PID(s): $PIDS"

    # Informations sur les processus
    echo ""
    echo "=== Détails des processus ==="
    ps aux | grep "http-server.*angular-cinema" | grep -v grep

    EXIT_CODE=0
fi

echo ""
echo "=== Vérification des ports ==="
if netstat -tlnp 2>/dev/null | grep ":4200 " > /dev/null; then
    echo "✅ Port 4200: OUVERT"
else
    echo "❌ Port 4200: FERMÉ"
    EXIT_CODE=1
fi

echo ""
echo "=== Vérification HTTP ==="
if curl -s -o /dev/null -w "%{http_code}" http://localhost:4200 | grep -q "200\|301\|302"; then
    echo "✅ HTTP Response: OK"
else
    echo "❌ HTTP Response: ERREUR"
    EXIT_CODE=1
fi

echo ""
echo "=== Logs récents ==="
if [ -f "angular.log" ]; then
    echo "📄 Dernières lignes des logs:"
    tail -n 5 angular.log
else
    echo "⚠️ Aucun fichier de log trouvé"
fi

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Serveur Angular fonctionne correctement"
    echo "🌐 URL: http://159.89.20.85:4200"
else
    echo "❌ Problème détecté avec le serveur Angular"
fi

exit $EXIT_CODE