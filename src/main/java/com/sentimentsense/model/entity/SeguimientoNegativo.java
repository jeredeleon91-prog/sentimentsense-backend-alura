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
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entidad Seguimiento
 * Representa el flujo de gestión de un caso negativo escalado.
 */
@Entity
@Table(name = "seguimiento_negativos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeguimientoNegativo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analisis_id", nullable = false)
    private Analisis analisis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Prioridad prioridad = Prioridad.MEDIA;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Etapa etapa = Etapa.DETECTADO;

    @Column(name = "intentos_contacto")
    @Builder.Default
    private Integer intentosContacto = 0;

    @Column(name = "ultimo_intento")
    private LocalDateTime ultimoIntento;

    @Column(name = "proximo_seguimiento")
    private LocalDateTime proximoSeguimiento;

    @Column(name = "tiempo_deteccion_horas")
    private Integer tiempoDeteccionHoras;

    @Column(name = "tiempo_resolucion_horas")
    private Integer tiempoResolucionHoras;

    @Column(name = "resolucion_exitosa")
    private Boolean resolucionExitosa;

    @Column(name = "feedback_cliente", columnDefinition = "JSON")
    private String feedbackCliente;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Prioridad {
        ALTA, MEDIA, BAJA
    }

    public enum Etapa {
        DETECTADO, ASIGNADO, PRIMER_CONTACTO, SEGUIMIENTO, RESUELTO
    }
}
