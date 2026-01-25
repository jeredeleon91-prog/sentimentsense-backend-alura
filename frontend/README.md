# SentimentSense - Frontend

## Descripción

Frontend de la aplicación SentimentSense, una plataforma SaaS para análisis de sentimientos en tiempo real. Construido con React, Vite y diseñado con componentes modernos y animaciones fluidas.

## Tecnologías

- **React 18** - Librería UI
- **Vite** - Build tool y servidor de desarrollo rápido
- **React Router DOM** - Enrutamiento
- **Framer Motion** - Animaciones profesionales
- **Recharts** - Gráficas interactivas
- **Lucide React** - Iconos SVG modernos
- **STOMP.js** - Cliente WebSocket para comunicación en tiempo real

## Características

- 📊 Dashboard interactivo con métricas en tiempo real
- 💬 Sistema de comentarios con hilos de respuestas
- 🔔 Notificaciones en tiempo real via WebSocket
- 🎨 Modo oscuro automático
- ⚡ Animaciones fluidas y transiciones suaves
- 📱 Diseño responsive

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de build de producción
npm run preview
```

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo en http://localhost:5173
- `npm run build` - Compila para producción en la carpeta `dist/`
- `npm run preview` - Vista previa del build de producción
- `npm run lint` - Ejecuta ESLint para verificar código

## Estructura de Páginas

- `/` - Página principal/landing
- `/admin/login` - Login de administrador
- `/client/login` - Login de cliente
- `/client/dashboard` - Dashboard del cliente
- `/libreria` - Demo pública (Librería)
- `/zapateria` - Demo pública (Zapatería)

## Configuración

El frontend se conecta al backend en `http://localhost:8080` por defecto. Para cambiar esto, actualiza las URLs en los archivos de configuración de los servicios.

## WebSocket

La aplicación utiliza STOMP sobre WebSocket para recibir actualizaciones en tiempo real:
- Nuevos comentarios
- Respuestas a comentarios
- Actualizaciones de métricas

## Autor

**Jeremias de Leon**
- Email: jeredeleon@yahoo.com

## Licencia

© 2025-2026 Jeremias de Leon
