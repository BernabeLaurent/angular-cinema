#!/bin/bash
echo "Forcefully killing any process using port 4200..."

# Method 1: lsof
if command -v lsof >/dev/null 2>&1; then
    lsof -ti :4200 | xargs -r kill -9
fi

# Method 2: fuser (more aggressive)
if command -v fuser >/dev/null 2>&1; then
    fuser -k 4200/tcp 2>/dev/null || true
fi

# Method 3: pkill for any remaining Angular processes
pkill -9 -f "ng serve\|webpack-dev-server" 2>/dev/null || true

# Method 4: Kill any node process that might be on port 4200
for pid in $(netstat -tulpn 2>/dev/null | grep :4200 | awk '{print $7}' | cut -d'/' -f1); do
    if [ ! -z "$pid" ] && [ "$pid" != "-" ]; then
        kill -9 $pid 2>/dev/null || true
        echo "Killed process $pid using port 4200"
    fi
done

echo "Waiting for port to be freed..."
sleep 3

# Verify port is free
if ss -tulpn | grep -q :4200; then
    echo "WARNING: Port 4200 is still in use, but proceeding..."
else
    echo "Port 4200 is now free"
fi

echo "Clearing Angular cache..."
rm -rf .angular/cache

echo "Starting Angular on port 4200..."
ng serve
