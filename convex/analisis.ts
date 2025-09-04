import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

//Consult all analysis
export const obtenerAnalisis = query({
  handler: async (ctx) => {
    return await ctx.db.query("analisis").collect();
  },
});

//Consult a analysis with id
export const obtenerAnalisisPorId = query({
  args: { id: v.id("analisis") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});


// create a new Analysis
export const crearAnalisis = mutation({
  args: {
    nombre: v.string(),
    descripcion: v.string(),
    diasDeEspera: v.number(),
    costo: v.number(),
    datos: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { nombre, descripcion, diasDeEspera, costo, datos } = args;
    const now = Date.now();
    return await ctx.db.insert("analisis", {
      nombre, 
      descripcion, 
      diasDeEspera, 
      costo, 
      datos,
      createdAt: now,
      updatedAt: now,
    });
  },
});

//update Analysis
export const actualizarAnalisis = mutation({
  args: {
    id: v.id("analisis"),
    nombre: v.string(),
    descripcion: v.string(),
    diasDeEspera: v.number(),
    costo: v.number(),
    datos: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, nombre, descripcion, diasDeEspera, costo, datos } = args;
    return await ctx.db.patch(id, {
      nombre, 
      descripcion, 
      diasDeEspera, 
      costo, 
      datos,
      updatedAt: Date.now(),
    });
  },
});

//Delete Analysis
export const eliminarAnalisis = mutation({
  args: {
    id: v.id("analisis"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});