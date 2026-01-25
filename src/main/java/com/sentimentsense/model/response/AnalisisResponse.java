/*
 * Fecha de Creación: 28/12/2025
 * Fecha de Actualización: 24/01/2026
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.model.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class AnalisisResponse {
    private String analisisId;
    private String sentimiento;
    private BigDecimal probabilidad;
    private Boolean necesitaSeguimiento;
}
