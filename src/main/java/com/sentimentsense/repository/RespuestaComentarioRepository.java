/*
 * Fecha de Creación: 29/12/2025
 * Fecha de Actualización: 24/01/2026
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.repository;

import com.sentimentsense.model.entity.RespuestaComentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RespuestaComentarioRepository extends JpaRepository<RespuestaComentario, Long> {

    List<RespuestaComentario> findByAnalisisIdOrderByCreatedAtAsc(Long analisisId);

    List<RespuestaComentario> findByParentIdOrderByCreatedAtAsc(Long parentId);

    long countByAnalisisId(Long analisisId);
}
