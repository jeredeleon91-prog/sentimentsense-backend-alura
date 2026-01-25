/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.controller;

import com.sentimentsense.model.request.AuthRequest;
import com.sentimentsense.model.response.AuthResponse;
import com.sentimentsense.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

/**
 * Controlador de Autenticación
 * Gestiona el inicio de sesión y registro de usuarios.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final JwtTokenProvider tokenProvider;
        private final com.sentimentsense.repository.UsuarioRepository usuarioRepository;
        private final com.sentimentsense.repository.ClienteRepository clienteRepository;
        private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

        /**
         * Inicia sesión en el sistema y genera un token JWT.
         * 
         * @param request Solicitud con nombre de usuario y contraseña
         * @return Respuesta con el token JWT y detalles del usuario
         */
        @PostMapping("/login")
        public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

                String username = authentication.getName();
                Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
                String role = authorities.stream()
                                .findFirst()
                                .map(GrantedAuthority::getAuthority)
                                .orElse("ROLE_CLIENTE"); // Rol por defecto si no se encuentra ninguno

                // Eliminar prefijo ROLE_ si está presente para una respuesta limpia
                if (role.startsWith("ROLE_")) {
                        role = role.substring(5);
                }

                String token = tokenProvider.generateToken(username, role);

                return ResponseEntity.ok(AuthResponse.builder()
                                .token(token)
                                .username(username)
                                .role(role)
                                .build());
        }

        /**
         * Endpoint de depuración - eliminar en producción.
         * Verifica si un usuario existe y si la contraseña coincide.
         */
        @PostMapping("/debug")
        public ResponseEntity<?> debug(@RequestBody AuthRequest request) {
                var userOpt = usuarioRepository.findByUsername(request.getUsername());
                if (userOpt.isEmpty()) {
                        return ResponseEntity.ok(java.util.Map.of(
                                        "encontrado", false,
                                        "mensaje", "Usuario no encontrado en base de datos: " + request.getUsername()));
                }
                var user = userOpt.get();
                boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());
                return ResponseEntity.ok(java.util.Map.of(
                                "encontrado", true,
                                "usuario", user.getUsername(),
                                "rol", user.getRole().name(),
                                "contraseñaCoincide", matches,
                                "hashAlmacenado", user.getPassword().substring(0, 20) + "..."));
        }

        /**
         * Genera un hash BCrypt para una contraseña dada - útil para pruebas manuales.
         */
        @org.springframework.web.bind.annotation.GetMapping("/generate-hash/{password}")
        public ResponseEntity<?> generateHash(@org.springframework.web.bind.annotation.PathVariable String password) {
                String hash = passwordEncoder.encode(password);
                return ResponseEntity.ok(java.util.Map.of(
                                "contraseña", password,
                                "hash", hash));
        }

        /**
         * Registra un nuevo usuario final asociado a un cliente (empresa).
         * 
         * @param apiKey  Clave API de la empresa
         * @param request Datos del nuevo usuario
         * @return Mensaje de éxito o error
         */
        @PostMapping("/register")
        public ResponseEntity<?> register(
                        @org.springframework.web.bind.annotation.RequestHeader("X-API-KEY") String apiKey,
                        @RequestBody com.sentimentsense.model.request.RegisterRequest request) {

                // 1. Validar Clave API
                var clienteOpt = clienteRepository.findByApiKey(apiKey);
                if (clienteOpt.isEmpty()) {
                        return ResponseEntity.status(403).body("Clave API Inválida");
                }

                // 2. Validar Nombre de Usuario
                if (usuarioRepository.findByUsername(request.getUsername()).isPresent()) {
                        return ResponseEntity.badRequest().body("El nombre de usuario ya existe");
                }

                // 3. Crear Usuario vinculado al Cliente
                var user = com.sentimentsense.model.entity.Usuario.builder()
                                .username(request.getUsername())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(com.sentimentsense.model.entity.Usuario.Role.USER) // Usuario Final
                                .cliente(clienteOpt.get())
                                .build();

                usuarioRepository.save(user);

                return ResponseEntity.ok("Usuario registrado exitosamente");
        }

        /**
         * Verificación de salud del sistema.
         * 
         * @return "OK" si el servicio está activo.
         */
        @org.springframework.web.bind.annotation.GetMapping("/health")
        public ResponseEntity<String> healthCheck() {
                return ResponseEntity.ok("OK");
        }
}
