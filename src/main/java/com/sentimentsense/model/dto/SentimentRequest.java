/*
 * Fecha de Creación: 26/12/2025
 * Fecha de Actualización: 24/01/2026
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SentimentRequest {
    @NotBlank(message = "El campo 'text' no puede estar vacío")
    @Size(min = 3, message = "El texto debe tener al menos 3 caracteres")
    private String text;
}
