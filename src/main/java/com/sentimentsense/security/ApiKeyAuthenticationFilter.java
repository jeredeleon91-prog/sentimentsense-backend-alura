/*
 * Fecha de Creación: 28/12/2025
 * Fecha de Actualización: 24/01/2026
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.security;

import com.sentimentsense.model.entity.Cliente;
import com.sentimentsense.repository.ClienteRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    @Value("${sentimentsense.security.api-key-header}")
    private String apiKeyHeader;

    private final ClienteRepository clienteRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String apiKey = request.getHeader(apiKeyHeader);
        String path = request.getRequestURI();

        System.out.println("🔑 [APIKEY FILTER] Path: " + path + ", API Key present: " + (apiKey != null));

        if (apiKey != null) {
            Optional<Cliente> clienteOpt = clienteRepository.findByApiKey(apiKey);
            if (clienteOpt.isPresent()) {
                Cliente cliente = clienteOpt.get();
                System.out.println("🔑 [APIKEY FILTER] Cliente found: " + cliente.getNombreEmpresa() + ", Activo: "
                        + cliente.getActivo());
                if (cliente.getActivo()) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            cliente, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_CLIENTE")));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out
                            .println("✅ [APIKEY FILTER] Authentication set for cliente: " + cliente.getNombreEmpresa());
                } else {
                    System.out.println("❌ [APIKEY FILTER] Cliente is NOT active");
                }
            } else {
                System.out.println("❌ [APIKEY FILTER] No cliente found for API Key: "
                        + apiKey.substring(0, Math.min(10, apiKey.length())) + "...");
            }
        }

        filterChain.doFilter(request, response);
    }
}
