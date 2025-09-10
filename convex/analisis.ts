import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Consultar todos los análisis
export const obtenerAnalisis = query({
  handler: async (ctx) => {
    return await ctx.db.query("analisis").collect();
  },
});

// Consultar un análisis por su ID
export const obtenerAnalisisPorId = query({
  args: { id: v.id("analisis") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});


// Crear un nuevo análisis
export const crearAnalisis = mutation({
  args: {
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

// Actualizar un análisis
export const actualizarAnalisis = mutation({
  args: {
    id: v.id("analisis"),
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

// Eliminar un análisis
export const eliminarAnalisis = mutation({
  args: {
    id: v.id("analisis"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});