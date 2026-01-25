/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.controller;

import com.sentimentsense.model.entity.Cliente;
import com.sentimentsense.repository.ClienteRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador de Configuración del Cliente
 * Permite ajustar opciones de análisis de sentimiento y preferencias.
 */
@RestController
@RequestMapping("/api/v1/config")
@RequiredArgsConstructor
public class ClienteConfigController {

    private final ClienteRepository clienteRepository;

    /**
     * Obtiene la configuración actual del cliente.
     */
    @GetMapping
    public ResponseEntity<ConfigResponse> getConfig(@AuthenticationPrincipal Object principal) {
        Cliente cliente = getClienteFromPrincipal(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        return ResponseEntity.ok(ConfigResponse.builder()
                .usarRatingEnAnalisis(cliente.getUsarRatingEnAnalisis())
                .pesoRating(cliente.getPesoRating())
                .nombreEmpresa(cliente.getNombreEmpresa())
                .plan(cliente.getPlan().name())
                .build());
    }

    /**
     * Actualiza la configuración del cliente (Peso de rating, habilitar rating).
     */
    @PutMapping
    public ResponseEntity<Void> updateConfig(
            @AuthenticationPrincipal Object principal,
            @RequestBody ConfigRequest request) {

        Cliente cliente = getClienteFromPrincipal(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        // Validar peso entre 0 y 100
        if (request.getPesoRating() != null) {
            int peso = Math.max(0, Math.min(100, request.getPesoRating()));
            cliente.setPesoRating(peso);
        }

        if (request.getUsarRatingEnAnalisis() != null) {
            cliente.setUsarRatingEnAnalisis(request.getUsarRatingEnAnalisis());
        }

        clienteRepository.save(cliente);
        return ResponseEntity.ok().build();
    }

    private Cliente getClienteFromPrincipal(Object principal) {
        if (principal instanceof Cliente) {
            return (Cliente) principal;
        } else if (principal instanceof com.sentimentsense.model.entity.Usuario) {
            return ((com.sentimentsense.model.entity.Usuario) principal).getCliente();
        }
        return null;
    }

    @Data
    @lombok.Builder
    public static class ConfigResponse {
        private Boolean usarRatingEnAnalisis;
        private Integer pesoRating;
        private String nombreEmpresa;
        private String plan;
    }

    @Data
    public static class ConfigRequest {
        private Boolean usarRatingEnAnalisis;
        private Integer pesoRating;
    }
}
