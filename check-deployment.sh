#!/bin/bash

echo "=== Diagnostic de déploiement Angular Cinema ==="

echo "1. Vérification des conteneurs Docker:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "2. Logs du conteneur Angular:"
docker logs angular-cinema-app --tail 20

echo ""
echo "3. Logs du conteneur NestJS:"
docker logs nestjs-cinema-app --tail 20

echo ""
echo "4. Test de connectivité:"
echo "- Frontend (port 4200):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:4200 || echo "Échec de connexion au frontend"

echo "- Backend (port 3000):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000 || echo "Échec de connexion au backend"

echo ""
echo "5. Processus en cours:"
ps aux | grep -E "(node|nginx)" | head -10