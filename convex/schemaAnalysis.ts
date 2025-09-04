import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    analisis: defineTable({
        nombre: v.string(),
        descripcion: v.string(),
        diasDeEspera: v.number(),
        costo: v.number(),
        datos: v.array(v.string()),
    }),
});