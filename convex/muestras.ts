// archivo: convex/muestras.ts

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Consultar todas las muestras
export const obtenerMuestras = query({
  handler: async (ctx) => {
    // Ya no es necesario unir datos, la muestra es autosuficiente.
    return await ctx.db.query("samples").collect();
  },
});

// Consultar muestra por id
export const obtenerMuestraPorId = query({
  args: {
    id: v.id("samples"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Eliminar muestra por id
export const eliminarMuestra = mutation({
  args: {
    id: v.id("samples"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true, message: `Muestra con ID ${args.id} eliminada.` };
  },
});

// Generar todas las muestras de una orden
export const generarMuestrasDeOrden = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error(`Orden con ID ${args.orderId} no encontrada.`);
    }

    const generatedSamplesIds = [];

    for (const item of order.order_item) {
        const analysis = await ctx.db.get(item.analisisId);
        if (!analysis) {
            console.warn(`Análisis con ID ${item.analisisId} no encontrado, saltando muestra.`);
            continue;
        }

        // Crear la estructura de resultados "congelando" los datos del análisis
        const initialResults = analysis.datos.map(dato => ({
            nombre: dato.nombre,
            medicion: dato.medicion,
            estandar: dato.estandar,
            valor: null,
        }));
        
        const sampleId = await ctx.db.insert("samples", {
            orderId: args.orderId,
            analisisId: item.analisisId,
            estado: "procesando",
            resultados: initialResults,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        generatedSamplesIds.push(sampleId);
    }

    return { success: true, generatedSamples: generatedSamplesIds };
  },
});

// Llenar los datos de la muestra
export const llenarResultadosMuestra = mutation({
  args: {
    id: v.id("samples"),
    // El frontend ahora debe enviar el array completo de resultados
    resultados: v.array(
        v.object({
            nombre: v.string(),
            medicion: v.string(),
            estandar: v.string(),
            valor: v.union(v.string(), v.number(), v.boolean(), v.null()),
        })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      resultados: args.resultados,
      estado: "finalizada",
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Actualizar los datos de la muestra
export const actualizarMuestra = mutation({
    args: {
        id: v.id("samples"),
        estado: v.optional(v.union(
            v.literal("sin tomar"),
            v.literal("procesando"),
            v.literal("finalizada")
        )),
        // La actualización de resultados también debe usar el nuevo formato de array
        resultados: v.optional(v.array(
            v.object({
                nombre: v.string(),
                medicion: v.string(),
                estandar: v.string(),
                valor: v.union(v.string(), v.number(), v.boolean(), v.null()),
            })
        )),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, {
            ...updates,
            updatedAt: Date.now(),
        });
        return { success: true };
    }
});

// Consultar las muestras en base al usuario (pagada y finalizado)
export const obtenerMuestrasDeUsuarioFiltradas = query({
  args: {
    userId: v.id("user"),
  },
  handler: async (ctx, args) => {
    const paidOrders = await ctx.db
      .query("orders")
      .withIndex("by_UserId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("statusPago"), "pagado"))
      .collect();

    if (paidOrders.length === 0) {
      return [];
    }

    let finalizadas = [];
    for (const order of paidOrders) {
      const samples = await ctx.db
        .query("samples")
        .withIndex("by_Order", (q) => q.eq("orderId", order._id))
        .filter((q) => q.eq(q.field("estado"), "finalizada"))
        .collect();
      
      finalizadas.push(...samples);
    }
    
    return finalizadas;
  },
});

// Consultar muestras en base a las ordenes
export const obtenerMuestrasPorOrden = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("samples")
      .withIndex("by_Order", (q) => q.eq("orderId", args.orderId))
      .collect();
  },
});

export const getSamplesWithDetails = query({
  handler: async (ctx) => {
    // 1. Obtiene todas las muestras de la base de datos.
    const samples = await ctx.db.query("samples").order("desc").collect();

    // 2. Para cada muestra, busca la información relacionada.
    return Promise.all(
      samples.map(async (sample) => {
        // Busca el análisis correspondiente a la muestra
        const analysis = await ctx.db.get(sample.analisisId);
        // Busca la orden correspondiente a la muestra
        const order = await ctx.db.get(sample.orderId);
        // Usando la orden, busca al usuario (paciente)
        const user = order ? await ctx.db.get(order.userId) : null;

        // 3. Devuelve un nuevo objeto combinado.
        return {
          ...sample, // Mantiene todos los datos originales de la muestra
          analysisName: analysis?.nombre ?? "Análisis Desconocido",
          patientName: user?.nombre ?? "Paciente Desconocido",
          patientEmail: user?.correo ?? "N/A",
        };
      })
    );
  },
});

// Agrega esto a tu archivo: convex/muestras.ts

export const getSampleDetailsById = query({
  args: { id: v.id("samples") },
  handler: async (ctx, args) => {
    // 1. Obtener la muestra por ID
    const sample = await ctx.db.get(args.id);
    if (!sample) {
      return null;
    }

    // 2. Obtener la información relacionada
    const analysis = await ctx.db.get(sample.analisisId);
    const order = await ctx.db.get(sample.orderId);
    const user = order ? await ctx.db.get(order.userId) : null;

    // 3. Devolver el objeto combinado
    return {
      ...sample,
      analysisName: analysis?.nombre ?? "Análisis Desconocido",
      analysisDescription: analysis?.descripcion ?? "Sin descripción.",
      patientName: user?.nombre ?? "Paciente Desconocido",
      patientEmail: user?.correo ?? "N/A",
    };
  },
});