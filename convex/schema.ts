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
        ),
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
        userId: v.id("user"),
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
        order_item: v.array(
            v.object({
                analisisId: v.id("analisis"),
                nombre: v.string(),
                cantidad: v.number(),
                precioUnitario: v.number(),
                subtotal: v.number(),
            })
        ),
        totalPago: v.number(),
        montoPagado: v.number(),
        notas: v.optional(v.string()),
        descuento: v.number(),
        updatedAt: v.number(),
    })
    .index("by_UserId", ["userId"]),

    samples: defineTable({ // Poner un boton en las ordenes en la cual se uestre una pestaña con las muestras de la orden
        orderId: v.id("orders"),
        analisisId: v.id("analisis"),
        estado: v.union(
            v.literal("sin tomar"),
            v.literal("procesando"),
            v.literal("finalizada")
        ),
        resultados: v.optional(
            v.record(
                v.string(),
                v.union(v.string(), v.number(), v.boolean(), v.null())
            )
        ),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
    .index("by_Order",["orderId"])
});