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
 * Entidad de Análisis
 * Representa un comentario procesado con su sentimiento y metadatos asociados.
 */
@Entity
@Table(name = "analisis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Analisis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private DepartamentoCliente departamento;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String texto;

    @Column(name = "nombre_usuario", length = 100)
    private String nombreUsuario;

    @Column(name = "email_usuario", length = 100)
    private String emailUsuario;

    // Opcional: Enlace a usuario registrado (null para comentarios de invitados)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Usuario usuario;

    private Integer rating;

    @Column(length = 50)
    @Builder.Default
    private String fuente = "web";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Sentimiento sentimiento;

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal probabilidad;

    @Column(name = "palabras_clave", columnDefinition = "JSON")
    private String palabrasClave;

    @Column(name = "ip_solicitud", length = 45)
    private String ipSolicitud;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(columnDefinition = "TEXT")
    private String respuesta;

    @Column(name = "producto", length = 100)
    private String producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Producto productoEntity;

    @Enumerated(EnumType.STRING)
    @Column(name = "respuesta_sentimiento")
    private Sentimiento respuestaSentimiento;

    @CreationTimestamp
    @Column(name = "fecha_solicitud", updatable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "necesita_seguimiento")
    @Builder.Default
    private Boolean necesitaSeguimiento = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "seguimiento_estado")
    @Builder.Default
    private SeguimientoEstado seguimientoEstado = SeguimientoEstado.PENDIENTE;

    @Column(name = "seguimiento_notas", columnDefinition = "TEXT")
    private String seguimientoNotas;

    @Column(name = "seguimiento_fecha_respuesta")
    private LocalDateTime seguimientoFechaRespuesta;

    public enum Sentimiento {
        POSITIVO, NEUTRO, NEGATIVO
    }

    public enum SeguimientoEstado {
        PENDIENTE, EN_PROCESO, RESUELTO
    }
}
