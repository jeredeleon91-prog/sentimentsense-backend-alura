# Guía para Subir el Proyecto a GitHub

## Pasos para Crear el Repositorio

### Información Necesaria

Antes de ejecutar los comandos, necesitarás:
1. Tu nombre de usuario de GitHub
2. El nombre que quieres para el repositorio
3. Tener instalado Git en tu sistema
4. Tener configurado tu cuenta de GitHub en Git

### Verificaciones Previas

```bash
# Verificar que Git está instalado
git --version

# Verificar configuración de usuario
git config --global user.name
git config --global user.email

# Si no están configurados, configúralos
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

## Script de Inicialización Git

Ejecuta los siguientes comandos en el directorio del proyecto:

```bash
# Navegar al proyecto
cd "/Users/jeremiasdeleon/Documents/Backend-proyecto Alura"

# Inicializar repositorio Git
git init

# Agregar todos los archivos (el .gitignore ya excluye los innecesarios)
git add .

# Crear el commit inicial
git commit -m "Initial commit: SentimentSense SaaS Platform

- Backend completo con Spring Boot 3.2.1 y Java 17
- Frontend React 18 con Vite
- Sistema de autenticación JWT y API Key
- Análisis de sentimientos con ONNX Runtime
- WebSocket STOMP para comunicación en tiempo real
- Dashboard interactivo con métricas por departamento
- Sistema multi-tenant con MySQL
- Documentación completa en español
- 46 archivos Java con cabeceras documentadas"

# Cambiar nombre de rama a main (si es necesario)
git branch -M main
```

## Crear Repositorio en GitHub

### Opción 1: Desde la interfaz web de GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `sentimentsense-saas` (o el que prefieras)
3. Descripción: "Sistema SaaS de Análisis de Sentimientos en Tiempo Real con ML"
4. Selecciona: Repositorio Público o Privado
5. **NO** marques "Initialize this repository with a README" (ya tenemos uno)
6. Click en "Create repository"

### Opción 2: Desde la línea de comandos (GitHub CLI)

```bash
# Instalar GitHub CLI si no lo tienes
# macOS: brew install gh

# Login
gh auth login

# Crear repositorio público
gh repo create sentimentsense-saas --public --source=. --remote=origin --push

# O crear repositorio privado
gh repo create sentimentsense-saas --private --source=. --remote=origin --push
```

## Conectar con el Repositorio Remoto (Opción 1)

Después de crear el repositorio en GitHub, ejecuta:

```bash
# Agregar el repositorio remoto (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/sentimentsense-saas.git

# Verificar que se agregó correctamente
git remote -v

# Subir el código al repositorio
git push -u origin main
```

## Archivos que se Subirán

### Incluidos (necesarios para el sistema empresarial)
- Código fuente Java (src/)
- Frontend completo (frontend/)
- Archivos de configuración (pom.xml, package.json)
- Scripts SQL (schema.sql, create_admin.sql)
- Documentación (README.md, frontend/README.md)
- Modelo ML (src/main/resources/models/)
- Configuración git (.gitignore)

### Excluidos (según .gitignore)
- Dependencias (node_modules/, target/)
- Archivos IDE (.idea/, .vscode/)
- Logs y temporales
- Archivos de configuración sensibles (application-local.yml)
- Build artifacts (dist/, build/)

## Configuración Recomendada del Repositorio

### README Badges (opcional)
Agrega al inicio del README.md:

```markdown
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red.svg)]()
```

### Topics Sugeridos para GitHub
Agrega estos topics al repositorio:
- `sentiment-analysis`
- `saas-platform`
- `spring-boot`
- `react`
- `machine-learning`
- `onnx`
- `websocket`
- `jwt-authentication`
- `multi-tenant`
- `real-time`

### Protección de Ramas (Recomendado)
1. Ve a Settings > Branches
2. Agrega regla de protección para `main`
3. Marca: "Require pull request reviews before merging"

## Comandos Git Útiles para el Futuro

```bash
# Ver estado de archivos
git status

# Agregar cambios específicos
git add archivo.java

# Agregar todos los cambios
git add .

# Crear commit
git commit -m "Descripción del cambio"

# Subir cambios
git push origin main

# Ver historial
git log --oneline

# Crear nueva rama para desarrollo
git checkout -b desarrollo

# Cambiar entre ramas
git checkout main
```

## Verificación Final

Después de subir:
1. Ve a https://github.com/TU_USUARIO/sentimentsense-saas
2. Verifica que el README se muestre correctamente
3. Revisa que los diagramas Mermaid se rendericen bien
4. Confirma que los archivos sensibles NO estén en el repositorio
5. Prueba clonar el repositorio en otra ubicación para verificar

## Notas de Seguridad

### Archivos Sensibles Verificados
- `application.yml` está en el repositorio pero solo contiene configuración de ejemplo
- Las credenciales reales deben estar en `application-local.yml` (excluido por .gitignore)
- No hay API keys o credenciales hardcodeadas en el código
- El modelo ONNX puede subirse (es solo el modelo entrenado, no datos sensibles)

### Si Accidentalmente Subiste Información Sensible

```bash
# Remover archivo del historial
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch ruta/al/archivo" \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push
git push origin --force --all
```

## Contacto

Si necesitas ayuda:
- **Autor**: Jeremias de Leon
- **Email**: jeredeleon@yahoo.com
