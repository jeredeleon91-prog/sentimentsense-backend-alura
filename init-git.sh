#!/bin/bash
# Script de inicialización de repositorio Git para SentimentSense
# Autor: Jeremias de Leon
# Fecha: 25/01/2026

echo "============================================"
echo "Inicializando Repositorio Git para GitHub"
echo "============================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "pom.xml" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}Error: Debes ejecutar este script desde el directorio raíz del proyecto${NC}"
    exit 1
fi

echo -e "${BLUE}Verificando configuración de Git...${NC}"

# Verificar que git esté instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git no está instalado. Por favor instálalo primero:${NC}"
    echo "macOS: brew install git"
    echo "O descarga desde: https://git-scm.com/downloads"
    exit 1
fi

# Verificar configuración de usuario
git_user=$(git config --global user.name)
git_email=$(git config --global user.email)

if [ -z "$git_user" ] || [ -z "$git_email" ]; then
    echo -e "${YELLOW}Configuración de Git no encontrada${NC}"
    echo -e "Por favor configura tu nombre y email:"
    echo ""
    read -p "Tu nombre: " user_name
    read -p "Tu email: " user_email
    git config --global user.name "$user_name"
    git config --global user.email "$user_email"
    echo -e "${GREEN}✓ Configuración de Git guardada${NC}"
else
    echo -e "${GREEN}✓ Usuario Git: $git_user${NC}"
    echo -e "${GREEN}✓ Email Git: $git_email${NC}"
fi

echo ""
echo -e "${BLUE}Inicializando repositorio...${NC}"

# Inicializar repositorio si no existe
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✓ Repositorio Git inicializado${NC}"
else
    echo -e "${YELLOW}! Repositorio Git ya existe${NC}"
fi

# Cambiar a rama main
git branch -M main 2>/dev/null
echo -e "${GREEN}✓ Rama principal: main${NC}"

echo ""
echo -e "${BLUE}Agregando archivos al staging area...${NC}"

# Agregar todos los archivos
git add .

# Mostrar estadísticas
files_added=$(git diff --cached --numstat | wc -l)
echo -e "${GREEN}✓ $files_added archivos agregados${NC}"

echo ""
echo -e "${BLUE}Creando commit inicial...${NC}"

# Crear commit
git commit -m "Initial commit: SentimentSense SaaS Platform

- Backend completo con Spring Boot 3.2.1 y Java 17
- Frontend React 18 con Vite  
- Sistema de autenticación JWT y API Key
- Análisis de sentimientos con ONNX Runtime
- WebSocket STOMP para comunicación en tiempo real
- Dashboard interactivo con métricas por departamento
- Sistema multi-tenant con MySQL
- Documentación completa en español
- 46 archivos Java con cabeceras documentadas
- Diagramas de arquitectura y flujos de datos
- Modelo ML para clasificación de sentimientos"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Commit inicial creado exitosamente${NC}"
else
    echo -e "${RED}✗ Error al crear commit${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}¡Repositorio Git inicializado exitosamente!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo ""
echo "1. Crea un repositorio en GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Conecta con el repositorio remoto:"
echo -e "   ${BLUE}git remote add origin https://github.com/TU_USUARIO/NOMBRE_REPO.git${NC}"
echo ""
echo "3. Sube el código:"
echo -e "   ${BLUE}git push -u origin main${NC}"
echo ""
echo "O usa GitHub CLI para hacerlo todo en un paso:"
echo -e "   ${BLUE}gh repo create sentimentsense-saas --public --source=. --remote=origin --push${NC}"
echo ""
echo "Para más detalles, consulta: GITHUB_SETUP.md"
echo ""
