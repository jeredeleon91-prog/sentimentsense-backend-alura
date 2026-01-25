/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.service;

import com.sentimentsense.model.entity.Analisis;
import com.sentimentsense.model.entity.SeguimientoNegativo;
import com.sentimentsense.repository.SeguimientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Servicio de Seguimiento
 * Gestiona la creación de alertas para casos negativos.
 */
@Service
@RequiredArgsConstructor
public class SeguimientoService {

    private final SeguimientoRepository seguimientoRepository;

    /**
     * Crea un registro de seguimiento si el análisis es negativo.
     */
    @Transactional
    public void crearSeguimiento(Analisis analisis) {
        if (analisis.getSentimiento() == Analisis.Sentimiento.NEGATIVO) {
            SeguimientoNegativo seguimiento = SeguimientoNegativo.builder()
                    .analisis(analisis)
                    .cliente(analisis.getCliente())
                    .prioridad(calcularPrioridad(analisis))
                    .etapa(SeguimientoNegativo.Etapa.DETECTADO)
                    .proximoSeguimiento(LocalDateTime.now().plusHours(24))
                    .build();

            seguimientoRepository.save(seguimiento);
        }
    }

    private SeguimientoNegativo.Prioridad calcularPrioridad(Analisis analisis) {
        // Lógica profesional: si el rating es 1, prioridad ALTA
        if (analisis.getRating() != null && analisis.getRating() == 1) {
            return SeguimientoNegativo.Prioridad.ALTA;
        }
        return SeguimientoNegativo.Prioridad.MEDIA;
    }
}
