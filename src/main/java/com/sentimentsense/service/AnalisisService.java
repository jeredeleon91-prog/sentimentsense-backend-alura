/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.service;

import com.sentimentsense.model.entity.Analisis;
import com.sentimentsense.model.entity.Cliente;
import com.sentimentsense.model.response.SentimentResponse;
import com.sentimentsense.repository.AnalisisRepository;
import com.sentimentsense.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de Análisis
 * Lógica central para el procesamiento de sentimientos, persistencia y
 * notificaciones.
 */
@Service
@RequiredArgsConstructor
public class AnalisisService {
    private final AnalisisRepository analisisRepository;
    private final ClienteRepository clienteRepository;
    private final com.sentimentsense.repository.ProductoRepository productoRepository;
    private final MLEvaluatorService mlEvaluatorService;
    private final SeguimientoService seguimientoService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    /**
     * Procesa un nuevo comentario:
     * 1. Evalúa con ML.
     * 2. Calcula sentimiento híbrido (si aplica).
     * 3. Persiste en base de datos.
     * 4. Inicia seguimiento si es negativo.
     * 5. Notifica cambios vía WebSocket.
     * 
     * @param texto         Texto del comentario
     * @param cliente       Cliente asociado
     * @param departamento  Departamento/Módulo del comentario
     * @param nombreUsuario Nombre del autor
     * @param emailUsuario  Email del autor
     * @param rating        Calificación (1-5) opcional
     * @param ipSolicitud   Dirección IP
     * @param userAgent     User Agent del navegador
     * @param usuario       Usuario registrado (si aplica)
     * @return La entidad Analisis creada
     */
    @Transactional
    public Analisis procesarComentario(String texto, Cliente cliente,
            com.sentimentsense.model.entity.DepartamentoCliente departamento, String nombreUsuario, String emailUsuario,
            Integer rating, String ipSolicitud, String userAgent, com.sentimentsense.model.entity.Usuario usuario,
            String producto, Long productoId) {

        // 0. Resolver Producto Entity si viene ID
        com.sentimentsense.model.entity.Producto productoEntity = null;
        if (productoId != null) {
            productoEntity = productoRepository.findById(productoId).orElse(null);
        } else if (producto != null && !producto.isEmpty()) {
            // Opcional: auto-vincular por nombre si existe
            productoEntity = productoRepository.findByClienteAndNombre(cliente, producto).orElse(null);
        }

        // 1. Obtener predicción del modelo ML
        SentimentResponse prediction = mlEvaluatorService.evaluar(texto);

        // 2. Calcular sentimiento (híbrido si está habilitado)
        Analisis.Sentimiento sentimientoFinal;
        java.math.BigDecimal probabilidadFinal;

        if (Boolean.TRUE.equals(cliente.getUsarRatingEnAnalisis()) && rating != null && rating >= 1 && rating <= 5) {
            // Cálculo híbrido: combinar ML + Rating
            int pesoRating = cliente.getPesoRating() != null ? cliente.getPesoRating() : 30;
            sentimientoFinal = calcularSentimientoHibrido(prediction.getPrevision(), rating, pesoRating);

            // Ajustar probabilidad basada en concordancia ML-Rating
            boolean concuerda = sentimientoFinal == mapSentimiento(prediction.getPrevision());
            probabilidadFinal = concuerda
                    ? prediction.getProbabilidad()
                    : prediction.getProbabilidad().multiply(java.math.BigDecimal.valueOf(0.8));
        } else {
            // Solo ML
            sentimientoFinal = mapSentimiento(prediction.getPrevision());
            probabilidadFinal = prediction.getProbabilidad();
        }

        // 3. Construir entidad
        Analisis analisis = Analisis.builder()
                .cliente(cliente)
                .departamento(departamento)
                .texto(texto)
                .nombreUsuario(nombreUsuario)
                .emailUsuario(emailUsuario)
                .usuario(usuario) // Link to registered user (null for guests)
                .usuario(usuario) // Link to registered user (null for guests)
                .rating(rating)
                .producto(producto)
                .productoEntity(productoEntity)
                .ipSolicitud(ipSolicitud)
                .userAgent(userAgent)
                .sentimiento(sentimientoFinal)
                .probabilidad(probabilidadFinal)
                .necesitaSeguimiento(sentimientoFinal == Analisis.Sentimiento.NEGATIVO)
                .build();

        // 4. Persistir
        analisis = analisisRepository.save(analisis);

        // 5. Iniciar seguimiento si aplica
        if (analisis.getNecesitaSeguimiento()) {
            seguimientoService.crearSeguimiento(analisis);
        }

        // 6. Notificar via WebSocket (STOMP)
        String modulo = departamento != null ? departamento.getCodigo() : "GENERAL";

        java.util.Map<String, Object> notification = new java.util.HashMap<>();
        notification.put("type", "NEW_COMMENT");
        notification.put("commentId", analisis.getId());
        notification.put("modulo", modulo);
        notification.put("sentimiento", sentimientoFinal);
        notification.put("priority", sentimientoFinal == Analisis.Sentimiento.NEGATIVO ? "HIGH" : "NORMAL");

        // Agregar datos completos para el frontend (Zapateria.jsx)
        notification.put("id", analisis.getId());
        notification.put("texto", analisis.getTexto());
        notification.put("nombreUsuario", analisis.getNombreUsuario());
        notification.put("fechaSolicitud",
                analisis.getFechaSolicitud() != null ? analisis.getFechaSolicitud().toString()
                        : java.time.LocalDateTime.now().toString());
        notification.put("producto", analisis.getProducto());
        notification.put("rating", analisis.getRating());

        // Notify client specific topic (Dashboard)
        messagingTemplate.convertAndSend("/topic/client/" + cliente.getId() + "/comments", notification);

        // Notify public topic (Zapateria/Libreria Demo)
        messagingTemplate.convertAndSend("/topic/comentarios", notification);

        // Also notify alerts if needed
        if (analisis.getNecesitaSeguimiento()) {
            java.util.Map<String, Object> alert = new java.util.HashMap<>();
            alert.put("type", "ALERT");
            alert.put("priority", "URGENT");
            alert.put("commentId", analisis.getId());
            alert.put("mensaje", "Nuevo comentario negativo requiere atención");
            messagingTemplate.convertAndSend("/topic/client/" + cliente.getId() + "/alerts", alert);
        }

        return analisis;
    }

    /**
     * Calcula sentimiento híbrido combinando ML y Rating.
     * 
     * @param mlPrediction Predicción del modelo (Positivo, Negativo, Neutro)
     * @param rating       Rating del usuario (1-5)
     * @param pesoRating   Peso del rating (0-100%)
     * @return Sentimiento calculado
     */
    private Analisis.Sentimiento calcularSentimientoHibrido(String mlPrediction, int rating, int pesoRating) {
        // Convertir ML a score: POSITIVO=1, NEUTRO=0, NEGATIVO=-1
        double mlScore;
        String ml = mlPrediction.toUpperCase();
        if ("POSITIVO".equals(ml)) {
            mlScore = 1.0;
        } else if ("NEGATIVO".equals(ml)) {
            mlScore = -1.0;
        } else {
            mlScore = 0.0;
        }

        // Convertir Rating a score: 4-5=POSITIVO, 3=NEUTRO, 1-2=NEGATIVO
        double ratingScore;
        if (rating >= 4) {
            ratingScore = 1.0;
        } else if (rating == 3) {
            ratingScore = 0.0;
        } else {
            ratingScore = -1.0;
        }

        // Calcular score ponderado
        double pesoML = (100.0 - pesoRating) / 100.0;
        double pesoRat = pesoRating / 100.0;
        double scoreFinal = (mlScore * pesoML) + (ratingScore * pesoRat);

        // Mapear score final a sentimiento
        if (scoreFinal > 0.3)
            return Analisis.Sentimiento.POSITIVO;
        if (scoreFinal < -0.3)
            return Analisis.Sentimiento.NEGATIVO;
        return Analisis.Sentimiento.NEUTRO;
    }

    /**
     * Método simplificado para analizar y persistir (Deprecado/Alternativo).
     */
    @Transactional
    public SentimentResponse analizarYPersistir(String texto) {
        // Versión simple para pruebas
        SentimentResponse prediction = mlEvaluatorService.evaluar(texto);
        return prediction;
    }

    /**
     * Mapea la cadena de texto de predicción al enum Sentimiento.
     */
    private Analisis.Sentimiento mapSentimiento(String prevision) {
        try {
            return Analisis.Sentimiento.valueOf(prevision.toUpperCase());
        } catch (Exception e) {
            return Analisis.Sentimiento.NEUTRO;
        }
    }

    /**
     * Lista los comentarios públicos para un cliente y módulo.
     * NOTA: Filtro de ocultar negativos está DESHABILITADO para Demo.
     * 
     * @param apiKey       Clave API del cliente
     * @param codigoModulo Código del módulo (opcional)
     * @return Lista de análisis
     */
    public java.util.List<Analisis> listarComentariosPublicos(String apiKey, String codigoModulo) {
        java.util.List<Analisis> result = new java.util.ArrayList<>();

        // Intentar filtro por módulo primero
        if (codigoModulo != null && !codigoModulo.isEmpty()) {
            result = analisisRepository
                    .findByClienteApiKeyAndDepartamento_CodigoOrderByFechaSolicitudDesc(apiKey, codigoModulo);
        }

        // Fallback: retornar todos los del cliente si lista vacía
        if (result.isEmpty()) {
            result = analisisRepository.findByClienteApiKeyOrderByFechaSolicitudDesc(apiKey);
        }

        // Filtro: Ocultar NEGATIVOS a menos que tengan respuesta
        // Filtro DESACTIVADO para Demo: Mostrar todos
        return result;
    }

    /**
     * Agrega una respuesta oficial a un análisis y actualiza su estado.
     * 
     * @param analisisId ID del análisis
     * @param respuesta  Texto de la respuesta
     */
    @Transactional
    public void responderComentario(Long analisisId, String respuesta) {
        Analisis analisis = analisisRepository.findById(analisisId)
                .orElseThrow(() -> new RuntimeException("Análisis no encontrado"));
        analisis.setRespuesta(respuesta);
        analisis.setSeguimientoEstado(Analisis.SeguimientoEstado.RESUELTO);
        analisis.setSeguimientoFechaRespuesta(java.time.LocalDateTime.now());
        analisisRepository.save(analisis);
        analisisRepository.save(analisis);
    }

    public java.util.List<com.sentimentsense.model.entity.Producto> listarProductosPublicos(String apiKey) {
        return clienteRepository.findByApiKey(apiKey)
                .map(productoRepository::findByClienteOrderByIdDesc)
                .orElse(java.util.Collections.emptyList());
    }
}
