/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad Respuesta
 * Representa una respuesta en un hilo de conversación.
 */
@Entity
@Table(name = "respuestas_comentarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaComentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analisis_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Analisis analisis;

    @Column(name = "analisis_id", insertable = false, updatable = false)
    private Long analisisId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private RespuestaComentario parent;

    @Column(name = "parent_id", insertable = false, updatable = false)
    private Long parentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "autor_tipo", nullable = false)
    private AutorTipo autorTipo;

    @Column(name = "autor_nombre", length = 100)
    private String autorNombre;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String texto;

    @Enumerated(EnumType.STRING)
    private Analisis.Sentimiento sentimiento;

    @Column(precision = 5, scale = 4)
    private BigDecimal probabilidad;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum AutorTipo {
        CLIENTE, // El dueño del negocio (admin del cliente)
        ADMIN, // Administrador del sistema
        USUARIO // El usuario final que dejó el comentario original
    }
}
