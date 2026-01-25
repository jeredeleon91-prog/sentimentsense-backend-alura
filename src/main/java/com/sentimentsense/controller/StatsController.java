/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.controller;

import com.sentimentsense.model.entity.Analisis;
import com.sentimentsense.repository.AnalisisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador de Estadísticas (Simple)
 * Provee métricas básicas globales.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class StatsController {

    private final AnalisisRepository analisisRepository;

    /**
     * Obtiene estadísticas simples globales (Total y porcentajes).
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Analisis> todos = analisisRepository.findAll();
        long total = todos.size();
        long positivos = todos.stream().filter(a -> a.getSentimiento() == Analisis.Sentimiento.POSITIVO).count();
        long neutros = todos.stream().filter(a -> a.getSentimiento() == Analisis.Sentimiento.NEUTRO).count();
        long negativos = todos.stream().filter(a -> a.getSentimiento() == Analisis.Sentimiento.NEGATIVO).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("total_comentarios", total);
        stats.put("porcentaje_positivos", total > 0 ? (positivos * 100.0 / total) : 0);
        stats.put("porcentaje_neutros", total > 0 ? (neutros * 100.0 / total) : 0);
        stats.put("porcentaje_negativos", total > 0 ? (negativos * 100.0 / total) : 0);

        return ResponseEntity.ok(stats);
    }
}
