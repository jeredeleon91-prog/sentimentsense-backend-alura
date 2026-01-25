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

import java.time.LocalDateTime;

/**
 * Entidad Departamento
 * Representa un módulo o área de la empresa cliente.
 */
@Entity
@Table(name = "departamentos_cliente", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "cliente_id", "nombre" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartamentoCliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Cliente cliente;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(length = 20)
    private String codigo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "color_hex", length = 7)
    @Builder.Default
    private String colorHex = "#3498db";

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_acceso", length = 20)
    @Builder.Default
    private TipoAcceso tipoAcceso = TipoAcceso.REGISTRADO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum TipoAcceso {
        REGISTRADO, INVITADO
    }
}
