/*
 * Fecha de Creación: 28/12/2025
 * Fecha de Actualización: 24/01/2026
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.repository;

import com.sentimentsense.model.entity.SeguimientoNegativo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeguimientoRepository extends JpaRepository<SeguimientoNegativo, Integer> {
}
