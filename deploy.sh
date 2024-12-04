#!/bin/bash

# Construction de l'application
echo "🏗️ Construction de l'application..."
npm run build

# Vérification de la construction
if [ $? -eq 0 ]; then
    echo "✅ Construction réussie !"
else
    echo "❌ Erreur lors de la construction"
    exit 1
fi

# Compression des fichiers
echo "📦 Compression des fichiers..."
cd dist
zip -r ../dist.zip ./*
cd ..

echo "🚀 L'application est prête à être déployée !"
echo "Le fichier dist.zip contient l'application prête pour la production." 