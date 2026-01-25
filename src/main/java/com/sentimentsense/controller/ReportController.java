/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.controller;

import com.sentimentsense.model.entity.Analisis;
import com.sentimentsense.repository.AnalisisRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controlador de Reportes
 * Genera resúmenes ejecutivos del estado del sistema.
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final AnalisisRepository analisisRepository;

    /**
     * Genera un resumen ejecutivo con métricas clave y problemas críticos.
     */
    @GetMapping("/executive-summary")
    public ResponseEntity<ExecutiveSummary> getExecutiveSummary() {
        List<Analisis> all = analisisRepository.findAll();

        long total = all.size();
        long negative = all.stream().filter(a -> a.getSentimiento() == Analisis.Sentimiento.NEGATIVO).count();

        List<String> topIssues = all.stream()
                .filter(a -> a.getSentimiento() == Analisis.Sentimiento.NEGATIVO)
                .map(Analisis::getTexto)
                .limit(5)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ExecutiveSummary.builder()
                .totalProcessed(total)
                .criticalAlerts(negative)
                .satisfactionIndex(total > 0 ? ((total - negative) * 100.0 / total) : 100.0)
                .topCriticalComments(topIssues)
                .status("OPERATIONAL")
                .build());
    }

    @Data
    @Builder
    public static class ExecutiveSummary {
        private long totalProcessed;
        private long criticalAlerts;
        private double satisfactionIndex;
        private List<String> topCriticalComments;
        private String status;
    }
}
