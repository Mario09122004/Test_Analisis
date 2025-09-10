import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Consultar todas las órdenes
export const obtenerOrdenes = query({
    handler: async (ctx) => {
        return await ctx.db.query("orders").collect();
    },
});

// Consultar una orden con su ID
export const obtenerOrdenPorId = query({
    args: { id: v.id("orders") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

//Consultar con los datos del usuario
export const obtenerOrdenesConUsuario = query({
  handler: async (ctx) => {
    const ordenes = await ctx.db.query("orders").order("desc").collect();

    const ordenesConUsuario = await Promise.all(
      ordenes.map(async (orden) => {
        const usuario = await ctx.db.get(orden.userId);
        return {
          ...orden,
          nombreUsuario: usuario?.nombre ?? "Usuario no encontrado",
          correoUsuario: usuario?.correo ?? "N/A",
        };
      })
    );

    return ordenesConUsuario;
  },
});

export const obtenerOrdenPorIdConUsuario = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const orden = await ctx.db.get(args.id);

    if (!orden) {
      return null;
    }

    const usuario = await ctx.db.get(orden.userId);

    return {
      ...orden,
      nombreUsuario: usuario?.nombre ?? "Usuario no encontrado",
      correoUsuario: usuario?.correo ?? "N/A",
    };
  },
});

// Crear una nueva orden
export const crearOrden = mutation({
    args: {
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
    },
    handler: async (ctx, args) => {
        const { userId, statusPago, metodoPago, order_item, totalPago, montoPagado, notas, descuento } = args;
        const now = Date.now();
        return await ctx.db.insert("orders", {
            userId,
            statusPago,
            metodoPago,
            order_item,
            totalPago,
            montoPagado,
            notas,
            descuento,
            updatedAt: now,
        });
    },
});

// Actualizar una orden existente
export const actualizarOrden = mutation({
    args: {
        id: v.id("orders"),
        userId: v.optional(v.id("user")),
        statusPago: v.optional(v.union(
            v.literal("pendiente"),
            v.literal("pagado"),
            v.literal("cancelado"),
            v.literal("reembolsado")
        )),
        metodoPago: v.optional(v.union(
            v.literal("efectivo"),
            v.literal("tarjeta"),
            v.literal("transferencia"),
            v.literal("paypal")
        )),
        order_item: v.optional(v.array(
            v.object({
                analisisId: v.id("analisis"),
                nombre: v.string(),
                cantidad: v.number(),
                precioUnitario: v.number(),
                subtotal: v.number(),
            })
        )),
        totalPago: v.optional(v.number()),
        montoPagado: v.optional(v.number()),
        notas: v.optional(v.string()),
        descuento: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...rest } = args;

        return await ctx.db.patch(id, {
            ...rest,
            updatedAt: Date.now(),
        });
    },
});

// Eliminar una orden
export const eliminarOrden = mutation({
    args: {
        id: v.id("orders"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.id);
    },
});