/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
package com.sentimentsense.service;

import com.sentimentsense.model.response.SentimentResponse;
import ai.onnxruntime.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.Map;

/**
 * Servicio de Evaluación ML usando ONNX Runtime (Puro Java).
 * Cumple con el requisito de no depender de Python en tiempo de ejecución.
 */
@Service
public class MLEvaluatorService {

    @Value("${sentimentsense.ml.model-path}")
    private String modelPath;

    private OrtEnvironment env;
    private OrtSession session;

    @PostConstruct
    public void init() {
        try {
            this.env = OrtEnvironment.getEnvironment();
            // Cargar el modelo desde el sistema de archivos
            // Nota: En producción empaquetada (JAR), esto requeriría extraer el recurso a
            // un archivo temporal
            this.session = env.createSession(modelPath, new OrtSession.SessionOptions());
            System.out.println("✅ Modelo ONNX cargado exitosamente en JavaEnvironment: " + modelPath);
        } catch (OrtException e) {
            System.err.println("❌ Error fatal al cargar el modelo ONNX: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Evalúa un texto utilizando el modelo ONNX cargado.
     * 
     * @param texto Texto a evaluar
     * @return Respuesta con predicción y probabilidad
     */
    public SentimentResponse evaluar(String texto) {
        if (session == null) {
            return fallbackResponse("Error: Modelo no cargado");
        }

        try {
            // Preparar Input: Tensor de String [1, 1]
            // El modelo espera una matriz de strings (ej. skl2onnx standard)
            String[] inputData = new String[] { texto };
            long[] shape = new long[] { 1, 1 };

            System.out.println("🔍 [ML DEBUG] Input texto: \"" + texto + "\"");

            try (OnnxTensor inputTensor = OnnxTensor.createTensor(env, inputData, shape)) {

                // Obtener el nombre del input del modelo (generalmente "X" o "input")
                String inputName = session.getInputNames().iterator().next();
                System.out.println("🔍 [ML DEBUG] Input name: " + inputName);

                // Ejecutar Inferencia
                try (OrtSession.Result result = session.run(Collections.singletonMap(inputName, inputTensor))) {

                    // Extraer Predicción (Label) - Output 0
                    OnnxValue labelValue = result.get(0);
                    String prediction = "neutro"; // Default consistente con minúsculas

                    if (labelValue instanceof OnnxTensor) {
                        String[] labels = (String[]) labelValue.getValue();
                        prediction = labels[0]; // "positivo", "negativo", "neutro"
                    }

                    // Extraer Probabilidad - Output 1 (si existe)
                    BigDecimal probability = BigDecimal.valueOf(0.0);

                    try {
                        if (result.size() > 1) {
                            OnnxValue probValue = result.get(1);
                            if (probValue instanceof OnnxSequence) {
                                // output is List<Map<String, Float>>
                                java.util.List<?> seq = ((OnnxSequence) probValue).getValue();
                                if (!seq.isEmpty() && seq.get(0) instanceof Map) {
                                    Map<?, ?> map = (Map<?, ?>) seq.get(0);
                                    // Buscar la probabilidad de la clase predicha
                                    Object val = map.get(prediction);
                                    if (val instanceof Float) {
                                        probability = BigDecimal.valueOf((Float) val);
                                    } else if (val instanceof Double) {
                                        probability = BigDecimal.valueOf((Double) val);
                                    }
                                }
                            }
                        }
                    } catch (Exception e) {
                        System.out.println("⚠️ [ML WARNING] No se pudo extraer probabilidad: " + e.getMessage());
                    }

                    System.out.println(
                            "✅ [ML RESULT] \"" + texto + "\" => " + prediction + " (prob: " + probability + ")");

                    return SentimentResponse.builder()
                            .prevision(prediction)
                            .probabilidad(probability)
                            .build();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return fallbackResponse("Error en Inferencia: " + e.getMessage());
        }
    }

    private SentimentResponse fallbackResponse(String reason) {
        System.err.println(reason);
        return SentimentResponse.builder()
                .prevision("Neutro")
                .probabilidad(BigDecimal.ZERO)
                .build();
    }
}
