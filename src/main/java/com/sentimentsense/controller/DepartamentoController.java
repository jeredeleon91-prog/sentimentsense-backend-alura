/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.controller;

import com.sentimentsense.model.entity.Cliente;
import com.sentimentsense.model.entity.DepartamentoCliente;
import com.sentimentsense.model.entity.Usuario;
import com.sentimentsense.repository.DepartamentoRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador de Departamentos
 * Gestiona la creación y listado de módulos/departamentos por cliente.
 */
@RestController
@RequestMapping("/api/v1/departamentos")
@RequiredArgsConstructor
public class DepartamentoController {

    private final DepartamentoRepository departamentoRepository;

    /**
     * Obtiene los departamentos del cliente autenticado.
     */
    @GetMapping
    public ResponseEntity<List<DepartamentoCliente>> getDepartamentos(@AuthenticationPrincipal Object principal) {
        Cliente cliente = getClienteFromPrincipal(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        return ResponseEntity.ok(departamentoRepository.findByClienteId(cliente.getId()));
    }

    /**
     * Crea un nuevo departamento para el cliente.
     */
    @PostMapping
    public ResponseEntity<DepartamentoCliente> createDepartamento(
            @AuthenticationPrincipal Object principal,
            @RequestBody CreateDepartamentoRequest request) {

        Cliente cliente = getClienteFromPrincipal(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        DepartamentoCliente depto = DepartamentoCliente.builder()
                .cliente(cliente)
                .nombre(request.getNombre())
                .codigo(request.getCodigo())
                .descripcion(request.getDescripcion())
                .colorHex(request.getColorHex() != null ? request.getColorHex() : "#3498db")
                .build();

        return ResponseEntity.ok(departamentoRepository.save(depto));
    }

    /**
     * Crea múltiples departamentos (Batch).
     */
    @PostMapping("/batch")
    public ResponseEntity<List<DepartamentoCliente>> createDepartamentosBatch(
            @AuthenticationPrincipal Object principal,
            @RequestBody List<CreateDepartamentoRequest> requests) {

        Cliente cliente = getClienteFromPrincipal(principal);
        if (cliente == null)
            return ResponseEntity.status(403).build();

        List<DepartamentoCliente> deptos = requests.stream().map(req -> DepartamentoCliente.builder()
                .cliente(cliente)
                .nombre(req.getNombre())
                .codigo(req.getCodigo())
                .descripcion(req.getDescripcion())
                .colorHex(req.getColorHex() != null ? req.getColorHex() : "#3498db")
                .build()).toList();

        return ResponseEntity.ok(departamentoRepository.saveAll(deptos));
    }

    private Cliente getClienteFromPrincipal(Object principal) {
        if (principal instanceof Cliente) {
            return (Cliente) principal;
        } else if (principal instanceof Usuario) {
            return ((Usuario) principal).getCliente();
        }
        return null;
    }

    @Data
    public static class CreateDepartamentoRequest {
        private String nombre;
        private String codigo;
        private String descripcion;
        private String colorHex;
    }
}
