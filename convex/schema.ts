import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    analisis: defineTable({
        nombre: v.string(),
        descripcion: v.string(),
        diasDeEspera: v.number(),
        costo: v.number(),
        datos: v.array(v.string()),
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
    .index("by_correo", ["correo"])
});