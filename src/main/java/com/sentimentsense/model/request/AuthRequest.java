/*
 * Fecha de Creación: 31/12/2025
 * Fecha de Actualización: 24/01/2026
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.model.request;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
}
