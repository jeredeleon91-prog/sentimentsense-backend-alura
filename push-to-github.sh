#!/bin/bash
# Comandos para subir SentimentSense a GitHub
# Usuario: jeredeleon91-prog
# Repositorio: sentimentsense-backend-alura

echo "==========================================="
echo "Subiendo a GitHub"
echo "==========================================="
echo ""

# Opción 1: Usando GitHub CLI (recomendado si tienes 'gh' instalado)
echo "Opción 1: Con GitHub CLI"
echo "-------------------------"
echo "gh repo create sentimentsense-backend-alura --public --source=. --remote=origin --push --description 'Sistema SaaS de Análisis de Sentimientos con ML - Backend Spring Boot + Frontend React'"
echo ""

# Opción 2: Manual (si no tienes GitHub CLI)
echo "Opción 2: Manual"
echo "-------------------------"
echo "1. Ve a: https://github.com/new"
echo "2. Nombre del repositorio: sentimentsense-backend-alura"
echo "3. Descripción: Sistema SaaS de Análisis de Sentimientos con ML - Backend Spring Boot + Frontend React"
echo "4. Selecciona: Público"
echo "5. NO marques 'Initialize with README'"
echo "6. Click 'Create repository'"
echo ""
echo "Luego ejecuta estos comandos:"
echo ""
echo "git remote add origin https://github.com/jeredeleon91-prog/sentimentsense-backend-alura.git"
echo "git push -u origin main"
echo ""
echo "==========================================="
