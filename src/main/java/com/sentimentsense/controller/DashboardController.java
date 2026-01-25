/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.controller;

import com.sentimentsense.model.entity.Cliente;
import com.sentimentsense.model.response.DashboardResponse;
import com.sentimentsense.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador del Dashboard
 * Gestiona las operaciones principales del panel de control del cliente.
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Obtiene estadísticas del dashboard para un periodo dado.
     * 
     * @param principal Usuario autenticado
     * @param periodo   Periodo de tiempo (semana, mes, hoy)
     * @return Estadísticas del dashboard
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<DashboardResponse> getEstadisticas(
            @AuthenticationPrincipal Object principal,
            @RequestParam(defaultValue = "semana") String periodo) {

        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        return ResponseEntity.ok(dashboardService.obtenerEstadisticas(cliente, periodo));
    }

    /**
     * Obtiene la lista de comentarios para el dashboard.
     * 
     * @param principal Usuario autenticado
     * @return Lista de últimos comentarios
     */
    @GetMapping("/comentarios")
    public ResponseEntity<java.util.List<com.sentimentsense.model.entity.Analisis>> getComentariosDashboard(
            @AuthenticationPrincipal Object principal) {

        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        // Usando servicio para obtener lista
        return ResponseEntity.ok(dashboardService.listarUltimosComentarios(cliente));
    }

    /**
     * Responde a un análisis específico.
     * 
     * @param id        Identificador del análisis
     * @param body      Cuerpo de la petición con la respuesta
     * @param principal Usuario autenticado
     * @return Respuesta vacía
     */
    @org.springframework.web.bind.annotation.PostMapping("/analisis/{id}/responder")
    public ResponseEntity<Void> responderAnalisis(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal Object principal) {

        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        String respuesta = body.get("respuesta");
        dashboardService.responderComentario(id, respuesta);

        return ResponseEntity.ok().build();
    }

    /**
     * Endpoint alternativo para responder comentarios desde el frontend.
     */
    @org.springframework.web.bind.annotation.PostMapping("/comentarios/{id}/respuesta")
    public ResponseEntity<Void> responderComentarioFrontend(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal Object principal) {

        return responderAnalisis(id, body, principal);
    }

    /**
     * Obtiene todas las respuestas en un hilo de comentarios.
     * 
     * @param id        ID del comentario padre
     * @param principal Usuario autenticado
     * @return Lista de respuestas en el hilo
     */
    @GetMapping("/analisis/{id}/respuestas")
    public ResponseEntity<java.util.List<com.sentimentsense.model.entity.RespuestaComentario>> getRespuestasHilo(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @AuthenticationPrincipal Object principal) {

        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        return ResponseEntity.ok(dashboardService.obtenerHiloRespuestas(id));
    }

    /**
     * Agrega una respuesta a un hilo de comentarios.
     * 
     * @param id        ID del comentario padre
     * @param body      Datos de la respuesta
     * @param principal Usuario autenticado
     * @return La respuesta creada
     */
    @org.springframework.web.bind.annotation.PostMapping("/analisis/{id}/respuestas")
    public ResponseEntity<com.sentimentsense.model.entity.RespuestaComentario> agregarRespuestaHilo(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> body,
            @AuthenticationPrincipal Object principal) {

        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        String texto = (String) body.get("texto");
        Long parentId = body.get("parentId") != null ? Long.valueOf(body.get("parentId").toString()) : null;
        String autorTipo = (String) body.getOrDefault("autorTipo", "CLIENTE");

        var respuesta = dashboardService.agregarRespuestaHilo(id, parentId, texto, autorTipo,
                cliente.getNombreEmpresa());
        return ResponseEntity.ok(respuesta);
    }

    /**
     * Obtiene estadísticas de calificación del cliente.
     * 
     * @param principal Usuario autenticado
     * @return Mapa con estadísticas de rating
     */
    @GetMapping("/rating-stats")
    public ResponseEntity<java.util.Map<String, Object>> getRatingStats(
            @AuthenticationPrincipal Object principal) {

        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        return ResponseEntity.ok(dashboardService.obtenerEstadisticasRating(cliente));
    }

    /**
     * Obtiene el perfil del cliente actual (ID, Nombre).
     * Útil para autenticación WebSocket.
     */
    @GetMapping("/me")
    public ResponseEntity<java.util.Map<String, Object>> getMyProfile(
            @AuthenticationPrincipal Object principal) {

        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        return ResponseEntity.ok(java.util.Map.of(
                "id", cliente.getId(),
                "nombreEmpresa", cliente.getNombreEmpresa()));
    }

    /**
     * Obtiene la configuración del cliente.
     */
    @GetMapping("/config")
    public ResponseEntity<java.util.Map<String, Object>> getConfig(
            @AuthenticationPrincipal Object principal) {
        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        return ResponseEntity.ok(dashboardService.obtenerConfiguracion(cliente));
    }

    /**
     * Actualiza la configuración del cliente.
     */
    @org.springframework.web.bind.annotation.PutMapping("/config")
    public ResponseEntity<Void> updateConfig(
            @AuthenticationPrincipal Object principal,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> body) {
        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        dashboardService.actualizarConfiguracion(cliente, body);
        return ResponseEntity.ok().build();
    }

    /**
     * Registra un nuevo departamento/módulo para el cliente.
     */
    @org.springframework.web.bind.annotation.PostMapping("/modulos")
    public ResponseEntity<com.sentimentsense.model.entity.DepartamentoCliente> registrarModulo(
            @AuthenticationPrincipal Object principal,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body) {

        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        String nombre = body.get("nombre");
        String codigo = body.get("codigo");
        String tipo = body.get("tipo"); // REGISTRADO, INVITADO

        return ResponseEntity.ok(dashboardService.registrarModulo(cliente, nombre, codigo, tipo));
    }

    /**
     * Obtiene los productos del cliente.
     */
    @GetMapping("/productos")
    public ResponseEntity<java.util.List<com.sentimentsense.model.entity.Producto>> getProductos(
            @AuthenticationPrincipal Object principal) {
        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        return ResponseEntity.ok(dashboardService.listarProductos(cliente));
    }

    /**
     * Registra un nuevo producto, opcionalmente asociado a un departamento.
     */
    @org.springframework.web.bind.annotation.PostMapping("/productos")
    public ResponseEntity<com.sentimentsense.model.entity.Producto> registrarProducto(
            @AuthenticationPrincipal Object principal,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> body) {

        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        String nombre = (String) body.get("nombre");
        String descripcion = (String) body.get("descripcion");
        Integer departamentoId = body.get("departamentoId") != null
                ? Integer.parseInt(body.get("departamentoId").toString())
                : null;

        return ResponseEntity.ok(dashboardService.registrarProducto(cliente, nombre, descripcion, departamentoId));
    }

    /**
     * Registra múltiples productos (Bulk Import con departamento opcional).
     */
    @org.springframework.web.bind.annotation.PostMapping("/productos/batch")
    public ResponseEntity<java.util.List<com.sentimentsense.model.entity.Producto>> registrarProductosBatch(
            @AuthenticationPrincipal Object principal,
            @org.springframework.web.bind.annotation.RequestBody java.util.List<java.util.Map<String, Object>> body) {

        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        return ResponseEntity.ok(dashboardService.registrarProductosBatch(cliente, body));
    }

    /**
     * Elimina un producto por ID.
     */
    @org.springframework.web.bind.annotation.DeleteMapping("/productos/{id}")
    public ResponseEntity<Void> eliminarProducto(
            @AuthenticationPrincipal Object principal,
            @org.springframework.web.bind.annotation.PathVariable Long id) {

        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        dashboardService.eliminarProducto(cliente, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Elimina múltiples productos (Batch Delete).
     */
    @org.springframework.web.bind.annotation.DeleteMapping("/productos/batch")
    public ResponseEntity<Void> eliminarProductosBatch(
            @AuthenticationPrincipal Object principal,
            @org.springframework.web.bind.annotation.RequestBody java.util.List<Long> ids) {

        Cliente cliente = resolverCliente(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        dashboardService.eliminarProductosBatch(cliente, ids);
        return ResponseEntity.noContent().build();
    }

    /**
     * Método auxiliar para resolver la entidad Cliente desde el principal de
     * seguridad.
     * Soporta autenticación directa de Cliente (API Key) o Usuario registrado.
     */
    private Cliente resolverCliente(Object principal) {
        if (principal instanceof Cliente) {
            return (Cliente) principal;
        } else if (principal instanceof com.sentimentsense.model.entity.Usuario) {
            return ((com.sentimentsense.model.entity.Usuario) principal).getCliente();
        }
        return null;
    }
}
