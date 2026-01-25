/*
 * Fecha de Creación: 27/12/2025
 * Fecha de Actualización: 24/01/2026
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.repository;

import com.sentimentsense.model.entity.DepartamentoCliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartamentoRepository extends JpaRepository<DepartamentoCliente, Integer> {
    List<DepartamentoCliente> findByClienteId(Integer clienteId);

    DepartamentoCliente findByClienteIdAndCodigo(Integer clienteId, String codigo);
}
