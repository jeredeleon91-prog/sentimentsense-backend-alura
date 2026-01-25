/*
 * Fecha de Creación: 03/01/2026
 * Fecha de Actualización: 24/01/2026
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.model.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardResponse {
    private String empresa;
    private String periodo;
    private ResumenMetricas resumen;
    private List<DeptoMetricas> porDepartamento;
    private Map<String, Object> tendencias;
    private Integer alertasActivas;

    @Data
    @Builder
    public static class ResumenMetricas {
        private Integer totalComentarios;
        private Map<String, Integer> distribucion;
        private Double tasaSatisfaccion;
    }

    @Data
    @Builder
    public static class DeptoMetricas {
        private String departamento;
        private Integer total;
        private Integer positivos;
        private Integer neutros;
        private Integer negativos;
        private Double tasaResolucion;
        private String tipoAcceso; // REGISTRADO or INVITADO
    }
}
