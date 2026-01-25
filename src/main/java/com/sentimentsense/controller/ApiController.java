/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.controller;

import com.sentimentsense.model.entity.Analisis;
import com.sentimentsense.model.entity.Cliente;
import com.sentimentsense.model.entity.Usuario;
import com.sentimentsense.model.dto.AnalisisRequest;
import com.sentimentsense.model.response.AnalisisResponse;
import com.sentimentsense.service.AnalisisService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador API Público
 * Gestiona la recepción de análisis y listado de comentarios públicos.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ApiController {

        private final AnalisisService analisisService;
        private final com.sentimentsense.repository.DepartamentoRepository departamentoRepository;

        /**
         * Recibe un texto para analizar su sentimiento.
         * 
         * @param request        Solicitud con el texto y metadatos
         * @param principal      Usuario autenticado (Cliente o Usuario)
         * @param servletRequest Request HTTP para metadatos (IP, Headers)
         * @return Resultado del análisis
         */
        @PostMapping("/analizar")
        public ResponseEntity<AnalisisResponse> analizar(
                        @RequestBody AnalisisRequest request,
                        @AuthenticationPrincipal Object principal,
                        HttpServletRequest servletRequest) {

                System.out.println("📥 [API DEBUG] /analizar llamado");

                // Determinar Cliente y Usuario desde el principal
                Cliente cliente = null;
                Usuario usuario = null;
                String nombreUsuario = request.getNombreUsuario();
                String emailUsuario = request.getEmailUsuario();

                if (principal instanceof Cliente) {
                        // Usuario invitado via API Key
                        cliente = (Cliente) principal;
                } else if (principal instanceof Usuario) {
                        // Usuario registrado via JWT
                        usuario = (Usuario) principal;
                        cliente = usuario.getCliente();
                        // Autocompletar info de usuario registrado
                        nombreUsuario = usuario.getUsername();
                }

                if (cliente == null) {
                        return ResponseEntity.status(403).build();
                }

                String moduloCodigo = servletRequest.getHeader("X-Modulo");
                com.sentimentsense.model.entity.DepartamentoCliente departamento = null;

                if (moduloCodigo != null && !moduloCodigo.isEmpty()) {
                        departamento = departamentoRepository.findByClienteIdAndCodigo(cliente.getId(), moduloCodigo);
                }

                Analisis analisis = analisisService.procesarComentario(
                                request.getTexto(),
                                cliente,
                                departamento,
                                nombreUsuario,
                                emailUsuario,
                                request.getRating(),
                                servletRequest.getRemoteAddr(),
                                servletRequest.getHeader("User-Agent"),
                                usuario,
                                request.getProducto(),
                                request.getProductoId()); // Pasar ID del producto

                return ResponseEntity.ok(AnalisisResponse.builder()
                                .analisisId("ANL-" + analisis.getId())
                                .sentimiento(analisis.getSentimiento().name())
                                .probabilidad(analisis.getProbabilidad())
                                .necesitaSeguimiento(analisis.getNecesitaSeguimiento())
                                .build());
        }

        /**
         * Obtiene la lista de comentarios públicos para un módulo.
         * 
         * @param apiKey Clave API del cliente
         * @param modulo Código del módulo
         * @return Lista de comentarios formateada
         */
        @GetMapping("/comentarios")
        public ResponseEntity<java.util.List<com.sentimentsense.model.response.ComentarioResponse>> getComentarios(
                        @RequestHeader("X-API-KEY") String apiKey,
                        @RequestParam("modulo") String modulo) {

                java.util.List<Analisis> comentarios = analisisService.listarComentariosPublicos(apiKey, modulo);

                java.util.List<com.sentimentsense.model.response.ComentarioResponse> response = comentarios.stream()
                                .map(c -> com.sentimentsense.model.response.ComentarioResponse.builder()
                                                .id(c.getId())
                                                .nombreUsuario(c.getNombreUsuario())
                                                .texto(c.getTexto())
                                                .rating(c.getRating())
                                                .sentimiento(c.getSentimiento().name())
                                                .respuesta(c.getRespuesta())
                                                .respuestaSentimiento(c.getRespuestaSentimiento() != null
                                                                ? c.getRespuestaSentimiento().name()
                                                                : null)
                                                .producto(c.getProducto())
                                                .productoId(c.getProductoEntity() != null
                                                                ? c.getProductoEntity().getId()
                                                                : null)
                                                .departamento(c.getDepartamento() != null
                                                                ? c.getDepartamento().getNombre()
                                                                : "General")
                                                .fecha(c.getFechaSolicitud())
                                                .build())
                                .collect(java.util.stream.Collectors.toList());

                return ResponseEntity.ok(response);
        }

        @GetMapping("/public/productos")
        public ResponseEntity<java.util.List<com.sentimentsense.model.entity.Producto>> getProductosPublicos(
                        @RequestHeader("X-API-KEY") String apiKey) {
                return ResponseEntity.ok(analisisService.listarProductosPublicos(apiKey));
        }
}
