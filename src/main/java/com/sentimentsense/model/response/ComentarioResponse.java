/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.model.response;

/**
 * DTO de Respuesta de Comentario
 * Estructura de datos enviada al frontend con la información del comentario.
 */

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ComentarioResponse {
    private String nombreUsuario;
    private String texto;
    private Integer rating;
    private String sentimiento;
    private Long id;
    private Long productoId;
    private String respuesta;
    private String respuestaSentimiento;
    private String producto;
    private String departamento;
    private LocalDateTime fecha;
}
