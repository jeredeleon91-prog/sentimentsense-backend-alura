/*
 * Fecha de Creación: 29/12/2025
 * Fecha de Actualización: 24/01/2026
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.model.dto;

import lombok.Data;

@Data
public class AnalisisRequest {
    private String texto;
    private String nombreUsuario;
    private String emailUsuario;
    private Integer rating;
    private String producto;
    private Long productoId;
}
