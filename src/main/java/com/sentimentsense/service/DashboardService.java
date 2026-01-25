/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.service;

import com.sentimentsense.model.entity.Analisis;
import com.sentimentsense.model.entity.Cliente;
import com.sentimentsense.model.entity.RespuestaComentario;
import com.sentimentsense.model.response.DashboardResponse;
import com.sentimentsense.repository.AnalisisRepository;
import com.sentimentsense.repository.RespuestaComentarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio del Dashboard
 * Lógica de negocio para estadísticas, gestión de módulos y respuestas.
 */
@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class DashboardService {

        private final AnalisisRepository analisisRepository;
        private final com.sentimentsense.repository.ClienteRepository clienteRepository;
        private final com.sentimentsense.repository.DepartamentoClienteRepository departamentoClienteRepository;
        private final com.sentimentsense.repository.ProductoRepository productoRepository;
        private final RespuestaComentarioRepository respuestaComentarioRepository;
        private final MLEvaluatorService mlEvaluatorService;
        private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

        /**
         * Obtiene estadísticas generales del dashboard.
         */
        public DashboardResponse obtenerEstadisticas(Cliente cliente, String periodo) {
                LocalDateTime inicio = LocalDateTime.now().minusDays(7);
                if ("mes".equals(periodo))
                        inicio = LocalDateTime.now().minusMonths(1);

                List<Analisis> todos = analisisRepository.findByClienteAndFechaSolicitudBetween(
                                cliente, inicio, LocalDateTime.now(), PageRequest.of(0, 10000)).getContent();

                int total = todos.size();
                long positivos = todos.stream().filter(a -> a.getSentimiento() == Analisis.Sentimiento.POSITIVO)
                                .count();
                long neutros = todos.stream().filter(a -> a.getSentimiento() == Analisis.Sentimiento.NEUTRO).count();
                long negativos = todos.stream().filter(a -> a.getSentimiento() == Analisis.Sentimiento.NEGATIVO)
                                .count();

                Map<String, Integer> distribucion = new HashMap<>();
                distribucion.put("positivos", (int) positivos);
                distribucion.put("neutros", (int) neutros);
                distribucion.put("negativos", (int) negativos);

                // Calcular satisfacción combinando sentimiento y rating
                double tasaSatisfaccion = calcularSatisfaccionHibrida(todos, positivos, total);

                List<DashboardResponse.DeptoMetricas> deptos = todos.stream()
                                .filter(a -> a.getDepartamento() != null)
                                .collect(Collectors.groupingBy(a -> a.getDepartamento().getNombre()))
                                .entrySet().stream()
                                .map(entry -> {
                                        List<Analisis> lista = entry.getValue();
                                        long p = lista.stream().filter(
                                                        a -> a.getSentimiento() == Analisis.Sentimiento.POSITIVO)
                                                        .count();
                                        return DashboardResponse.DeptoMetricas.builder()
                                                        .departamento(entry.getKey())
                                                        .total(lista.size())
                                                        .positivos((int) p)
                                                        .negativos((int) lista.stream().filter(a -> a
                                                                        .getSentimiento() == Analisis.Sentimiento.NEGATIVO)
                                                                        .count())
                                                        .tasaResolucion(calcularTasaResolucion(lista))
                                                        .tipoAcceso(obtenerTipoAcceso(entry.getKey(), cliente))
                                                        .build();
                                }).collect(Collectors.toList());

                return DashboardResponse.builder()
                                .empresa(cliente.getNombreEmpresa())
                                .periodo(periodo)
                                .resumen(DashboardResponse.ResumenMetricas.builder()
                                                .totalComentarios(total)
                                                .distribucion(distribucion)
                                                .tasaSatisfaccion(tasaSatisfaccion)
                                                .build())
                                .porDepartamento(deptos)
                                .alertasActivas((int) todos.stream().filter(Analisis::getNecesitaSeguimiento).count())
                                .build();
        }

        private String obtenerTipoAcceso(String nombreDepto, Cliente cliente) {
                return departamentoClienteRepository
                                .findByClienteAndNombre(cliente, nombreDepto)
                                .map(d -> d.getTipoAcceso() != null ? d.getTipoAcceso().name() : "REGISTRADO")
                                .orElse("REGISTRADO");
        }

        /**
         * Registra un nuevo módulo/departamento.
         */
        @org.springframework.transaction.annotation.Transactional
        public com.sentimentsense.model.entity.DepartamentoCliente registrarModulo(Cliente cliente, String nombre,
                        String codigo, String tipoAcceso) {
                if (departamentoClienteRepository.existsByClienteAndNombre(cliente, nombre)) {
                        throw new RuntimeException("El módulo ya existe");
                }

                var depto = com.sentimentsense.model.entity.DepartamentoCliente.builder()
                                .cliente(cliente)
                                .nombre(nombre)
                                .codigo(codigo != null ? codigo : nombre.toUpperCase().replaceAll("\\s+", "_"))
                                .tipoAcceso(com.sentimentsense.model.entity.DepartamentoCliente.TipoAcceso
                                                .valueOf(tipoAcceso))
                                .build();

                return departamentoClienteRepository.save(depto);
        }

        /**
         * Obtiene todos los productos del cliente.
         */
        public List<com.sentimentsense.model.entity.Producto> listarProductos(Cliente cliente) {
                return productoRepository.findByClienteOrderByIdDesc(cliente);
        }

        /**
         * Registra un nuevo producto, opcionalmente asociado a un departamento.
         */
        @org.springframework.transaction.annotation.Transactional
        public com.sentimentsense.model.entity.Producto registrarProducto(Cliente cliente, String nombre,
                        String descripcion, Integer departamentoId) {
                if (productoRepository.existsByClienteAndNombre(cliente, nombre)) {
                        throw new RuntimeException("El producto ya existe");
                }

                var builder = com.sentimentsense.model.entity.Producto.builder()
                                .cliente(cliente)
                                .nombre(nombre)
                                .descripcion(descripcion);

                // Link to department if provided
                if (departamentoId != null) {
                        departamentoClienteRepository.findById(departamentoId)
                                        .ifPresent(builder::departamento);
                }

                return productoRepository.save(builder.build());
        }

        /**
         * Registra múltiples productos desde una lista de mapas (JSON).
         * Cada objeto puede incluir: nombre, descripcion, departamentoId
         */
        @org.springframework.transaction.annotation.Transactional
        public List<com.sentimentsense.model.entity.Producto> registrarProductosBatch(Cliente cliente,
                        List<Map<String, Object>> productos) {
                List<com.sentimentsense.model.entity.Producto> guardados = new java.util.ArrayList<>();

                for (Map<String, Object> prod : productos) {
                        String nombre = (String) prod.get("nombre");
                        String descripcion = (String) prod.get("descripcion");
                        Object deptoIdObj = prod.get("departamentoId");
                        Integer departamentoId = deptoIdObj != null ? Integer.parseInt(deptoIdObj.toString()) : null;

                        if (nombre != null && !nombre.isEmpty()
                                        && !productoRepository.existsByClienteAndNombre(cliente, nombre)) {
                                var builder = com.sentimentsense.model.entity.Producto.builder()
                                                .cliente(cliente)
                                                .nombre(nombre)
                                                .descripcion(descripcion != null ? descripcion : "");

                                // Link to department if provided
                                if (departamentoId != null) {
                                        departamentoClienteRepository.findById(departamentoId)
                                                        .ifPresent(builder::departamento);
                                }

                                guardados.add(productoRepository.save(builder.build()));
                        }
                }
                return guardados;
        }

        /**
         * Elimina un producto por ID (solo si pertenece al cliente).
         * Primero limpia las referencias FK en la tabla analisis.
         */
        @org.springframework.transaction.annotation.Transactional
        public void eliminarProducto(Cliente cliente, Long productoId) {
                productoRepository.findById(productoId).ifPresent(producto -> {
                        if (producto.getCliente().getId().equals(cliente.getId())) {
                                // Clear FK references in analisis table first
                                java.util.List<Analisis> linked = analisisRepository.findByProductoEntity(producto);
                                for (Analisis a : linked) {
                                        a.setProductoEntity(null);
                                        analisisRepository.save(a);
                                }
                                // Now safe to delete
                                productoRepository.delete(producto);
                        }
                });
        }

        /**
         * Elimina múltiples productos por IDs (solo si pertenecen al cliente).
         */
        @org.springframework.transaction.annotation.Transactional
        public void eliminarProductosBatch(Cliente cliente, List<Long> productoIds) {
                for (Long id : productoIds) {
                        eliminarProducto(cliente, id);
                }
        }

        /**
         * Calcula satisfacción híbrida combinando % positivos y promedio de ratings
         */
        private double calcularSatisfaccionHibrida(List<Analisis> todos, long positivos, int total) {
                if (total == 0)
                        return 0.0;

                double satisfaccionSentimiento = positivos * 100.0 / total;

                // Calcular promedio de ratings (si existen)
                double promedioRating = todos.stream()
                                .filter(a -> a.getRating() != null)
                                .mapToInt(Analisis::getRating)
                                .average()
                                .orElse(0);

                if (promedioRating == 0) {
                        return satisfaccionSentimiento;
                }

                // Combinar: 60% sentimiento + 40% rating (convertido a %)
                return satisfaccionSentimiento * 0.6 + (promedioRating * 20.0) * 0.4;
        }

        private double calcularTasaResolucion(List<Analisis> lista) {
                long resueltos = lista.stream()
                                .filter(a -> a.getSeguimientoEstado() == Analisis.SeguimientoEstado.RESUELTO)
                                .count();
                return lista.isEmpty() ? 0 : (resueltos * 100.0 / lista.size());
        }

        /**
         * Lista los últimos comentarios del cliente (último año).
         */
        public List<Analisis> listarUltimosComentarios(Cliente cliente) {
                return analisisRepository.findByClienteAndFechaSolicitudBetween(
                                cliente,
                                LocalDateTime.now().minusDays(365),
                                LocalDateTime.now(),
                                PageRequest.of(0, 50)).getContent();
        }

        /**
         * Responde a un comentario (resolución oficial).
         */
        @org.springframework.transaction.annotation.Transactional
        public void responderComentario(Long analisisId, String respuesta) {
                Analisis analisis = analisisRepository.findById(analisisId)
                                .orElseThrow(() -> new RuntimeException("Análisis no encontrado"));

                com.sentimentsense.model.response.SentimentResponse prediction = mlEvaluatorService.evaluar(respuesta);
                Analisis.Sentimiento sent = Analisis.Sentimiento.NEUTRO;
                try {
                        sent = Analisis.Sentimiento.valueOf(prediction.getPrevision().toUpperCase());
                } catch (Exception e) {
                }

                analisis.setRespuesta(respuesta);
                analisis.setRespuestaSentimiento(sent);
                analisis.setSeguimientoEstado(Analisis.SeguimientoEstado.RESUELTO);
                analisis.setSeguimientoFechaRespuesta(LocalDateTime.now());
                analisisRepository.save(analisis);

                // Notificar via WebSocket
                Map<String, Object> notification = new HashMap<>();
                notification.put("type", "COMMENT_REPLY");
                notification.put("commentId", analisisId);
                notification.put("replyText", respuesta);
                notification.put("replyAuthor", "CLIENTE");
                messagingTemplate.convertAndSend("/topic/client/" + analisis.getCliente().getId() + "/comments",
                                notification);
        }

        // =============== HILOS DE RESPUESTAS ===============

        /**
         * Obtener todas las respuestas de un hilo de comentario
         */
        public List<RespuestaComentario> obtenerHiloRespuestas(Long analisisId) {
                return respuestaComentarioRepository.findByAnalisisIdOrderByCreatedAtAsc(analisisId);
        }

        /**
         * Agregar una respuesta al hilo
         */
        @org.springframework.transaction.annotation.Transactional
        public RespuestaComentario agregarRespuestaHilo(Long analisisId, Long parentId, String texto,
                        String autorTipo, String autorNombre) {

                Analisis analisis = analisisRepository.findById(analisisId)
                                .orElseThrow(() -> new RuntimeException("Análisis no encontrado"));

                // Analizar sentimiento de la respuesta
                var prediction = mlEvaluatorService.evaluar(texto);
                Analisis.Sentimiento sent = Analisis.Sentimiento.NEUTRO;
                try {
                        sent = Analisis.Sentimiento.valueOf(prediction.getPrevision().toUpperCase());
                } catch (Exception e) {
                }

                RespuestaComentario respuesta = RespuestaComentario.builder()
                                .analisis(analisis)
                                .parentId(parentId)
                                .autorTipo(RespuestaComentario.AutorTipo.valueOf(autorTipo.toUpperCase()))
                                .autorNombre(autorNombre)
                                .texto(texto)
                                .sentimiento(sent)
                                .probabilidad(prediction.getProbabilidad())
                                .build();

                respuesta = respuestaComentarioRepository.save(respuesta);

                // Notificar via WebSocket
                Map<String, Object> notification = new HashMap<>();
                notification.put("type", "COMMENT_REPLY");
                notification.put("commentId", analisisId);
                notification.put("replyText", texto);
                notification.put("replyAuthor", autorNombre);
                notification.put("parentId", parentId);
                messagingTemplate.convertAndSend("/topic/client/" + analisis.getCliente().getId() + "/comments",
                                notification);

                return respuesta;
        }

        // =============== ESTADÍSTICAS DE RATINGS ===============

        /**
         * Obtener estadísticas detalladas de ratings para un cliente
         */
        public Map<String, Object> obtenerEstadisticasRating(Cliente cliente) {
                List<Analisis> todos = analisisRepository.findByClienteAndFechaSolicitudBetween(
                                cliente,
                                LocalDateTime.now().minusMonths(3),
                                LocalDateTime.now(),
                                PageRequest.of(0, 10000)).getContent();

                List<Analisis> conRating = todos.stream()
                                .filter(a -> a.getRating() != null)
                                .collect(Collectors.toList());

                double promedioRating = conRating.stream().mapToInt(Analisis::getRating).average().orElse(0);

                Map<Integer, Long> distribucionRating = conRating.stream()
                                .collect(Collectors.groupingBy(Analisis::getRating, Collectors.counting()));

                // Tendencia: comparar último mes vs mes anterior
                LocalDateTime haceUnMes = LocalDateTime.now().minusMonths(1);
                double promedioMesActual = conRating.stream()
                                .filter(a -> a.getFechaSolicitud().isAfter(haceUnMes))
                                .mapToInt(Analisis::getRating)
                                .average().orElse(0);
                double promedioMesAnterior = conRating.stream()
                                .filter(a -> a.getFechaSolicitud().isBefore(haceUnMes))
                                .mapToInt(Analisis::getRating)
                                .average().orElse(0);

                String tendencia = promedioMesActual > promedioMesAnterior ? "UP"
                                : promedioMesActual < promedioMesAnterior ? "DOWN" : "STABLE";

                return Map.of(
                                "totalConRating", conRating.size(),
                                "promedioRating", Math.round(promedioRating * 100.0) / 100.0,
                                "distribucion", distribucionRating,
                                "ratingsAltos", conRating.stream().filter(a -> a.getRating() >= 4).count(),
                                "ratingsBajos", conRating.stream().filter(a -> a.getRating() <= 2).count(),
                                "tendencia", tendencia,
                                "cambioMensual", Math.round((promedioMesActual - promedioMesAnterior) * 100.0) / 100.0);
        }

        /**
         * Obtiene la configuración del cliente.
         */
        public Map<String, Object> obtenerConfiguracion(Cliente cliente) {
                return Map.of(
                                "usarRatingEnAnalisis",
                                cliente.getUsarRatingEnAnalisis() != null ? cliente.getUsarRatingEnAnalisis() : false,
                                "pesoRating", cliente.getPesoRating() != null ? cliente.getPesoRating() : 30,
                                "apiKey", cliente.getApiKey());
        }

        /**
         * Actualiza la configuración del cliente.
         */
        @org.springframework.transaction.annotation.Transactional
        public void actualizarConfiguracion(Cliente cliente, Map<String, Object> body) {
                Cliente entity = clienteRepository.findById(cliente.getId())
                                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

                if (body.containsKey("usarRatingEnAnalisis")) {
                        entity.setUsarRatingEnAnalisis(Boolean.valueOf(body.get("usarRatingEnAnalisis").toString()));
                }
                if (body.containsKey("pesoRating")) {
                        entity.setPesoRating(Integer.valueOf(body.get("pesoRating").toString()));
                }

                clienteRepository.save(entity);
        }
}
