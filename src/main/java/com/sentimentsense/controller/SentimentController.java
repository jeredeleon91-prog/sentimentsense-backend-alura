/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.controller;

import com.sentimentsense.model.dto.SentimentRequest;
import com.sentimentsense.model.response.SentimentResponse;
import com.sentimentsense.service.AnalisisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador de Sentimiento (Simple)
 * Endpoint básico para análisis directo.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SentimentController {

    private final AnalisisService analisisService;

    /**
     * Obtiene el sentimiento de un texto y lo persiste (versión simplificada).
     */
    @PostMapping("/sentiment")
    public ResponseEntity<SentimentResponse> getSentiment(@Valid @RequestBody SentimentRequest request) {
        // El servicio ahora maneja la persistencia y la llamada al modelo
        SentimentResponse response = analisisService.analizarYPersistir(request.getText());
        return ResponseEntity.ok(response);
    }
}
