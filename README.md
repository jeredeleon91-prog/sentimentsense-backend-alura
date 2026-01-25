# SentimentSense - Sistema de Análisis de Sentimientos SaaS

## Descripción

SentimentSense es una plataforma SaaS para análisis de sentimientos en tiempo real, diseñada para ayudar a empresas a comprender y gestionar la opinión de sus clientes a través de comentarios y reseñas.

El sistema utiliza modelos de Machine Learning para clasificar automáticamente el sentimiento de los textos como Positivo, Neutro o Negativo, y proporciona dashboards interactivos para visualizar tendencias y métricas clave.

## Características Principales

- Análisis de Sentimientos en Tiempo Real con modelos ML y ONNX Runtime
- Sistema Multi-tenant con soporte para múltiples clientes
- Control de acceso basado en API Keys y JWT
- Dashboard interactivo con métricas por departamento y producto
- Sistema de seguimiento de comentarios negativos
- Actualización instantánea vía WebSocket
- API RESTful para integración con sistemas externos
- Frontend moderno con React, Vite y animaciones fluidas

## Arquitectura de Comunicación

```mermaid
graph TB
    subgraph Frontend["Frontend (React - Puerto 5173)"]
        UI[Interfaz Usuario]
        AuthModule[Módulo Autenticación]
        WSClient[Cliente WebSocket]
    end
    
    subgraph Backend["Backend (Spring Boot - Puerto 8080)"]
        SecurityFilter[Filtros de Seguridad]
        JWTFilter[JWT Filter]
        APIKeyFilter[API Key Filter]
        Controllers[Controladores REST]
        WSBroker[WebSocket Broker STOMP]
        Services[Servicios]
        MLEngine[Motor ML ONNX]
    end
    
    subgraph Database["Base de Datos"]
        MySQL[(MySQL 8.0)]
    end
    
    UI -->|"POST /auth/login<br/>Content-Type: application/json<br/>{username, password}"| SecurityFilter
    SecurityFilter --> JWTFilter
    JWTFilter --> Controllers
    
    UI -->|"POST /api/v1/analizar<br/>X-API-Key: {apiKey}<br/>Content-Type: application/json<br/>{texto, rating, producto}"| SecurityFilter
    SecurityFilter --> APIKeyFilter
    APIKeyFilter --> Controllers
    
    Controllers --> Services
    Services --> MLEngine
    Services --> MySQL
    
    Controllers -->|"200 OK<br/>Content-Type: application/json<br/>{token, username, role}"| AuthModule
    
    Controllers -->|"200 OK<br/>Content-Type: application/json<br/>{sentimiento, probabilidad}"| UI
    
    WSClient -->|"CONNECT<br/>ws://localhost:8080/ws-stomp"| WSBroker
    WSBroker -->|"SUBSCRIBE /topic/comentarios/{apiKey}<br/>SUBSCRIBE /topic/respuestas/{id}"| WSClient
    WSBroker -->|"MESSAGE<br/>Content-Type: application/json<br/>{analisisId, texto, sentimiento}"| WSClient
    
    AuthModule -->|"Authorization: Bearer {jwt}"| JWTFilter
```

## Detalles de Comunicación HTTP

### Headers de Autenticación

#### Autenticación JWT (Admin y Cliente registrado)
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Autenticación API Key (Aplicaciones externas)
```
X-API-Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Content-Type: application/json
```

### Ejemplos de Request/Response

#### Login de Usuario
```http
POST /auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "username": "administrador",
  "password": "administrador"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "administrador",
  "role": "ADMIN"
}
```

#### Análisis de Sentimiento
```http
POST /api/v1/analizar HTTP/1.1
Host: localhost:8080
X-API-Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Content-Type: application/json

{
  "texto": "El producto es excelente, muy buena calidad",
  "nombreUsuario": "Juan Pérez",
  "emailUsuario": "juan@example.com",
  "rating": 5,
  "producto": "Laptop Dell"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "analisisId": "12345",
  "sentimiento": "POSITIVO",
  "probabilidad": 0.9234,
  "necesitaSeguimiento": false
}
```

#### Obtener Dashboard
```http
GET /api/v1/dashboard HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "empresa": "Mi Empresa",
  "periodo": "últimos_30_días",
  "resumen": {
    "totalComentarios": 1250,
    "distribucion": {
      "POSITIVO": 850,
      "NEUTRO": 200,
      "NEGATIVO": 200
    },
    "tasaSatisfaccion": 82.5
  },
  "porDepartamento": [...],
  "tendencias": {...},
  "alertasActivas": 5
}
```

### WebSocket STOMP

#### Conexión
```javascript
const socket = new SockJS('http://localhost:8080/ws-stomp');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
  // Suscribirse a nuevos comentarios
  stompClient.subscribe('/topic/comentarios/' + apiKey, function(message) {
    const comentario = JSON.parse(message.body);
    // Procesar comentario
  });
  
  // Suscribirse a respuestas
  stompClient.subscribe('/topic/respuestas/' + analisisId, function(message) {
    const respuesta = JSON.parse(message.body);
    // Procesar respuesta
  });
});
```

## Pipeline de Análisis de Sentimientos con Modelo ML

```mermaid
graph LR
    subgraph Cliente["Cliente / Frontend"]
        Request[Request HTTP]
    end
    
    subgraph Backend["Backend Spring Boot"]
        Controller[AnalisisController]
        Service[AnalisisService]
        MLService[MLService]
        Preprocessor[Preprocesador de Texto]
    end
    
    subgraph ModeloML["Motor de Machine Learning"]
        ONNXRuntime[ONNX Runtime]
        Model[Modelo pipeline_sentimiento.onnx]
        Tokenizer[Tokenizer]
        Vectorizer[TF-IDF Vectorizer]
        Classifier[Clasificador LogisticRegression]
    end
    
    subgraph Database["Persistencia"]
        MySQL[(MySQL)]
    end
    
    Request -->|"POST /api/v1/analizar<br/>{texto, rating}"| Controller
    Controller -->|AnalisisRequest DTO| Service
    Service -->|String texto| MLService
    
    MLService -->|1. Limpiar texto| Preprocessor
    Preprocessor -->|Texto normalizado| MLService
    
    MLService -->|2. Cargar modelo| ONNXRuntime
    ONNXRuntime -->|Inicializar| Model
    
    MLService -->|3. Crear input tensor<br/>float[1][vocab_size]| Model
    
    Model -->|Pipeline ONNX| Tokenizer
    Tokenizer -->|Tokens| Vectorizer
    Vectorizer -->|Vector TF-IDF| Classifier
    Classifier -->|Probabilidades<br/>[P_NEG, P_NEU, P_POS]| Model
    
    Model -->|Output tensor| ONNXRuntime
    ONNXRuntime -->|float[] probabilities| MLService
    
    MLService -->|4. Interpretar resultado| MLService
    MLService -->|Sentimiento + Probabilidad| Service
    
    Service -->|5. Guardar análisis| MySQL
    MySQL -->|Analisis entity| Service
    
    Service -->|AnalisisResponse| Controller
    Controller -->|"200 OK<br/>{sentimiento, probabilidad}"| Request
    
    style Model fill:#e1f5ff
    style ONNXRuntime fill:#fff4e1
    style Classifier fill:#ffe1e1
```

### Detalles del Procesamiento ML

#### Entrada al Modelo
```java
// Estructura del input
{
  "texto": "El producto es excelente",
  "rating": 5  // opcional, usado para ajuste
}
```

#### Pasos del Pipeline ONNX

1. **Preprocesamiento de Texto**
   - Normalización: lowercase, eliminación de caracteres especiales
   - Limpieza: stopwords, puntuación
   
2. **Tokenización**
   - División del texto en tokens
   - Construcción del vocabulario
   
3. **Vectorización TF-IDF**
   - Conversión de tokens a vectores numéricos
   - Ponderación por Term Frequency-Inverse Document Frequency
   - Vector de dimensión: `[1, vocab_size]`
   
4. **Clasificación**
   - Modelo: LogisticRegression
   - Input: Vector TF-IDF `float[1][n_features]`
   - Output: Probabilidades `float[3]` para [NEGATIVO, NEUTRO, POSITIVO]
   
5. **Interpretación de Resultados**
   ```java
   float[] probabilities = {0.05, 0.15, 0.80};  // [NEG, NEU, POS]
   String sentimiento = "POSITIVO";  // max(probabilities)
   float confianza = 0.80;  // probabilidad del sentimiento detectado
   ```

#### Salida del Modelo
```json
{
  "analisisId": "12345",
  "sentimiento": "POSITIVO",
  "probabilidad": 0.8023,
  "necesitaSeguimiento": false
}
```

### Configuración del Modelo

Ubicación del archivo: `src/main/resources/models/pipeline_sentimiento.onnx`

Características del modelo:
- Formato: ONNX (Open Neural Network Exchange)
- Algoritmo: Logistic Regression
- Features: TF-IDF Vectorization
- Clases: 3 (NEGATIVO, NEUTRO, POSITIVO)
- Tamaño aproximado: 2-5 MB
- Inferencia: CPU-optimized

## Tecnologías Utilizadas

### Backend
- Java 17
- Spring Boot 3.2.1
- Spring Security (JWT + API Key)
- Spring Data JPA
- MySQL 8.0
- WebSocket STOMP
- ONNX Runtime para modelos ML
- Lombok
- Maven

### Frontend
- React 18
- Vite
- React Router DOM
- Framer Motion
- Recharts
- Lucide React
- STOMP.js

## Estructura del Proyecto

```
Backend-proyecto Alura/
├── src/
│   └── main/
│       ├── java/com/sentimentsense/
│       │   ├── config/           # Security, CORS, WebSocket
│       │   ├── controller/       # REST Controllers
│       │   ├── model/
│       │   │   ├── dto/         # Data Transfer Objects
│       │   │   ├── entity/      # Entidades JPA
│       │   │   ├── request/     # Request models
│       │   │   └── response/    # Response models
│       │   ├── repository/       # JPA Repositories
│       │   ├── security/         # Security filters
│       │   └── service/          # Business logic
│       └── resources/
│           └── application.yml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
├── schema.sql
├── create_admin.sql
└── pom.xml
```

## Requisitos Previos

- Java 17 o superior
- Maven 3.8+
- MySQL 8.0+
- Node.js 18+ y npm

## Instalación y Configuración

### Base de Datos

```bash
mysql -u root -p < schema.sql
mysql -u root -p < create_admin.sql
```

### Backend

Editar `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/sentimentsense_db
    username: tu_usuario
    password: tu_contraseña
```

Compilar y ejecutar:

```bash
mvn clean install
mvn spring-boot:run
```

Backend disponible en `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en `http://localhost:5173`

## Endpoints Principales

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /api/v1/clientes/registro` - Registro de cliente

### Análisis
- `POST /api/v1/analizar` - Analizar sentimiento
- `GET /api/v1/dashboard` - Métricas del dashboard

### Gestión
- `GET /api/v1/productos` - Listar productos
- `POST /api/v1/productos` - Crear producto
- `POST /api/v1/productos/batch` - Carga masiva

### Comentarios
- `GET /api/v1/comentarios` - Listar comentarios
- `POST /api/v1/comentarios/{id}/respuesta` - Responder

## Credenciales por Defecto

Administrador:
- Usuario: `administrador`
- Contraseña: `administrador`

## Modelo de Sentimientos

Motor de Machine Learning con ONNX Runtime que clasifica textos:
- Sentimiento: POSITIVO, NEUTRO, NEGATIVO
- Probabilidad: 0.0 a 1.0 (confianza del modelo)

## Seguridad

- JWT para autenticación de usuarios
- API Keys para aplicaciones externas
- CORS configurado
- Contraseñas hasheadas con BCrypt
- Filtros de seguridad en cadena

## Autor

Jeremias de Leon
- jeredeleon@yahoo.com
- Diciembre 2025 - Enero 2026

## Créditos del Equipo

### Equipo de Desarrollo H12-25-L-Equipo 37

Este proyecto fue desarrollado como parte del programa Alura Latam por un equipo multidisciplinario.

### Equipo Data Science

Joel Valencia San Roman - Data Scientist Lead
- Email: joelvalenciasanroman@gmail.com
- Desarrollo y entrenamiento del modelo de análisis de sentimientos
- Implementación del pipeline ONNX

Ana Mosquera Lozano - Data Scientist
- Email: armosque99@gmail.com
- Preprocesamiento de datos y vectorización TF-IDF
- Optimización del modelo predictivo

Jetsael Villegas - Data Scientist
- Email: jet7vm@hotmail.com
- Análisis exploratorio de datos
- Validación y métricas del modelo

Enrique Antonio Hernández Parra - Data Scientist
- Email: enriketf@gmail.com
- Feature engineering y selección de variables
- Documentación técnica del modelo ML

Paola Andrea Rubiano Ruiz - Data Scientist
- Email: piavoal@hotmail.com
- Evaluación de performance y fine-tuning
- Testing del modelo en producción

### Programador Backend y Diseño

Jeremias de Leon - Backend Developer
- Email: jeredeleon@yahoo.com
- Desarrollo completo del backend con Spring Boot
- Integración del modelo ML con ONNX Runtime
- Diseño y desarrollo del frontend React
- Arquitectura de la base de datos MySQL
- Sistema de autenticación JWT y API Keys
- Implementación de WebSocket para tiempo real
- Documentación técnica del proyecto

### Agradecimientos

Proyecto desarrollado en el marco del programa de formación Alura Latam.

## Licencia

Copyright 2025-2026 Jeremias de Leon. Todos los derechos reservados.

