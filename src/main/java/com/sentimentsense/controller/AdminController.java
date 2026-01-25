/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.controller;

import com.sentimentsense.model.entity.Cliente;
import com.sentimentsense.model.entity.Usuario;
import com.sentimentsense.repository.ClienteRepository;
import com.sentimentsense.repository.UsuarioRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Controlador de Administración
 * Gestiona el alta de clientes (empresas) y usuarios administradores.
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Obtiene la lista de todos los clientes registrados (Solo Admin).
     */
    @GetMapping("/clientes")
    public List<Cliente> getAllClientes() {
        return clienteRepository.findAll();
    }

    /**
     * Crea un nuevo cliente (empresa) y su usuario administrador inicial.
     * 
     * @param request Datos de la empresa
     * @return Credenciales generadas (API Key, Usuario, Password)
     */
    @PostMapping("/clientes")
    public ResponseEntity<CreateClienteResponse> createCliente(@RequestBody CreateClienteRequest request) {
        // 1. Crear Cliente
        Cliente cliente = Cliente.builder()
                .nombreEmpresa(request.getNombreEmpresa())
                .contactoEmail(request.getContactoEmail())
                .apiKey("sk_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24))
                .activo(true)
                .fechaRegistro(LocalDateTime.now())
                .plan(Cliente.Plan.free)
                .limiteMensual(100)
                .usadoEsteMes(0)
                .build();

        cliente = clienteRepository.save(cliente);

        // 2. Crear Usuario para acceso al Dashboard
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        String username = request.getNombreEmpresa().toLowerCase().replaceAll("\\s+", "") + "_admin";

        Usuario usuario = Usuario.builder()
                .username(username)
                .password(passwordEncoder.encode(tempPassword))
                .role(Usuario.Role.CLIENTE)
                .cliente(cliente)
                .build();

        usuarioRepository.save(usuario);

        return ResponseEntity.ok(new CreateClienteResponse(
                cliente.getApiKey(),
                username,
                tempPassword));
    }

    @Data
    public static class CreateClienteRequest {
        private String nombreEmpresa;
        private String contactoEmail;
    }

    @Data
    @AllArgsConstructor
    public static class CreateClienteResponse {
        private String apiKey;
        private String username;
        private String password;
    }
}
