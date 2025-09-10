import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    analisis: defineTable({
        nombre: v.string(),
        descripcion: v.string(),
        diasDeEspera: v.number(),
        costo: v.number(),
        datos: v.array(
            v.object({
            nombre: v.string(),
            medicion: v.string(),
            estandar: v.string(),
            })
        ), //datos, medicion y estandar por ejemplo "Glucos" "g" "180" 
        createdAt: v.number(),
        updatedAt: v.number(),
    })
    .index("by_nombre", ["nombre"])
    .index("by_costo", ["costo"])
    .index("by_diasDeEspera", ["diasDeEspera"]),

    user: defineTable({
        nombre: v.string(),
        correo: v.string(),
        idClerk: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
    .index("by_clerk_id", ["idClerk"])
    .index("by_correo", ["correo"]),

    orders: defineTable({
        userId: v.id("users"),
        totalPago: v.number(),
        statusPago: v.union(
            v.literal("pendiente"),
            v.literal("pagado"),
            v.literal("cancelado"),
            v.literal("reembolsado")
        ),
        metodoPago: v.union(
            v.literal("efectivo"),
            v.literal("tarjeta"),
            v.literal("transferencia"),
            v.literal("paypal")
        ),
        montoPagado: v.number(),
        updatedAt: v.number(),
        notas: v.optional(v.string()),
        fechaHoraCita: v.number()
    }),

    order_items: defineTable({
        orderId: v.id("orders"), // Relación con la orden
        analisisId: v.id("analisis"),  // ID del análisis/servicio
        nombre: v.string(),      // Nombre del análisis (se guarda aquí para historial)
        cantidad: v.number(),    // Siempre 1 si es análisis, pero sirve para flexibilidad
        precioUnitario: v.number(), // Precio al momento de la compra
        subtotal: v.number(),    // cantidad * precioUnitario
        status: v.union(
            v.literal("pendiente"),
            v.literal("en proceso"),
            v.literal("completado"),
            v.literal("cancelado")
        ),
    }),

    samples: defineTable({
        orderItemId: v.id("order_items"), // Relación con el análisis de la orden
        analisisId: v.id("analisis"),     // Para referencia directa al análisis
        resultados: v.array(
            v.object({
            campo: v.string(),           // Nombre del parámetro, viene de analisis.datos
            valor: v.union(v.string(), v.number(), v.null()), // Valor ingresado
            unidad: v.optional(v.string()) // Ejemplo: "mg/dL"
            })
        ),
        observaciones: v.optional(v.string()), // Comentarios generales del resultado
        createdAt: v.number(),
        updatedAt: v.number()
    })
});