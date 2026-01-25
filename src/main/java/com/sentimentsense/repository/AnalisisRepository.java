/*
 * Fecha de Creación: 26/12/2025
 * Fecha de Actualización: 24/01/2026
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.repository;

import com.sentimentsense.model.entity.Analisis;
import com.sentimentsense.model.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

public interface AnalisisRepository extends JpaRepository<Analisis, Long> {
        Page<Analisis> findByClienteAndFechaSolicitudBetween(Cliente cliente, LocalDateTime start, LocalDateTime end,
                        Pageable pageable);

        // For Public API (Library) - with department filter
        java.util.List<Analisis> findByClienteApiKeyAndDepartamento_CodigoOrderByFechaSolicitudDesc(String apiKey,
                        String codigo);

        // For Public API (Library) - ALL comments for client (no department filter)
        java.util.List<Analisis> findByClienteApiKeyOrderByFechaSolicitudDesc(String apiKey);

        // Find analysis records linked to a specific product
        java.util.List<Analisis> findByProductoEntity(com.sentimentsense.model.entity.Producto producto);
}
