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
 * Entidad Cliente
 * Representa a una empresa suscrita al servicio.
 */
@Entity
@Table(name = "clientes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nombre_empresa", nullable = false, length = 100)
    private String nombreEmpresa;

    @Column(name = "api_key", unique = true, nullable = false, length = 64)
    private String apiKey;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Plan plan = Plan.free;

    @Column(name = "limite_mensual")
    @Builder.Default
    private Integer limiteMensual = 100;

    @Column(name = "usado_este_mes")
    @Builder.Default
    private Integer usadoEsteMes = 0;

    @Column(name = "contacto_email", length = 100)
    private String contactoEmail;

    @CreationTimestamp
    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    // Configuración de análisis de sentimiento
    @Column(name = "usar_rating_en_analisis")
    @Builder.Default
    private Boolean usarRatingEnAnalisis = false;

    @Column(name = "peso_rating")
    @Builder.Default
    private Integer pesoRating = 30; // 0-100, porcentaje de influencia del rating vs ML

    @Builder.Default
    private Boolean activo = true;

    public enum Plan {
        free, basic, premium
    }
}
