/*
 * Fecha de Creación: 02/01/2026
 * Fecha de Actualización: 24/01/2026
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.repository;

import com.sentimentsense.model.entity.Cliente;
import com.sentimentsense.model.entity.DepartamentoCliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartamentoClienteRepository extends JpaRepository<DepartamentoCliente, Integer> {
    Optional<DepartamentoCliente> findByClienteAndNombre(Cliente cliente, String nombre);

    boolean existsByClienteAndNombre(Cliente cliente, String nombre);
}
