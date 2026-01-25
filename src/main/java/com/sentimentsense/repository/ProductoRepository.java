/*
 * Fecha de Creación: 31/12/2025
 * Fecha de Actualización: 24/01/2026
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.repository;

import com.sentimentsense.model.entity.Cliente;
import com.sentimentsense.model.entity.DepartamentoCliente;
import com.sentimentsense.model.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByClienteOrderByIdDesc(Cliente cliente);

    List<Producto> findByClienteAndDepartamentoOrderByIdDesc(Cliente cliente, DepartamentoCliente depto);

    Optional<Producto> findByClienteAndNombre(Cliente cliente, String nombre);

    boolean existsByClienteAndNombre(Cliente cliente, String nombre);
}
