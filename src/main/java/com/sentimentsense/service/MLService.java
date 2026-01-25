/*
 * Fecha de Creación: 26/12/2025
 * Fecha de Actualización: 24/01/2026
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.service;

import com.sentimentsense.model.entity.Analisis;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.Random;

@Service
public class MLService {
    private final Random random = new Random();

    public Analisis.Sentimiento predecirSentimiento(String texto) {
        // En una implementación real, aquí se cargaría el modelo PMML
        // Por ahora simulamos la lógica
        if (texto.toLowerCase().contains("malo") || texto.toLowerCase().contains("pésimo")
                || texto.toLowerCase().contains("dañado")) {
            return Analisis.Sentimiento.NEGATIVO;
        } else if (texto.toLowerCase().contains("bueno") || texto.toLowerCase().contains("excelente")
                || texto.toLowerCase().contains("genial")) {
            return Analisis.Sentimiento.POSITIVO;
        }
        return Analisis.Sentimiento.NEUTRO;
    }

    public BigDecimal obtenerProbabilidad(String texto) {
        return BigDecimal.valueOf(0.5 + (1.0 - 0.5) * random.nextDouble());
    }
}
