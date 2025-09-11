import { query } from "./_generated/server";

export const getDashboardStats = query({
  handler: async (ctx) => {
    const allSamples = await ctx.db.query("samples").collect();
    const pendingSamples = allSamples.filter(
      (sample) => sample.estado !== "finalizada"
    ).length;

    const allOrders = await ctx.db.query("orders").collect();
    const unpaidOrders = allOrders.filter(
      (order) => order.statusPago === "pendiente"
    ).length;

    const allUsers = await ctx.db.query("user").collect();
    const totalUsers = allUsers.length;

    return {
      pendingSamples,
      unpaidOrders,
      totalUsers,
    };
  },
});

export const getSamplesByAnalysis = query({
  handler: async (ctx) => {
    const samples = await ctx.db.query("samples").collect();
    const analyses = await ctx.db.query("analisis").collect();

    const analysisNameMap = new Map(analyses.map((a) => [a._id, a.nombre]));

    const samplesByAnalysis = samples.reduce((acc, sample) => {
      const analysisId = sample.analisisId;
      acc[analysisId] = (acc[analysisId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(samplesByAnalysis).map(
      ([analysisId, count]) => ({
        name: analysisNameMap.get(analysisId as any) || "Desconocido",
        total: count,
      })
    );

    return chartData;
  },
});

export const getOrdersByDayOfWeek = query({
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    
    const ordersByDay = [
        { day: "Dom", total: 0 },
        { day: "Lun", total: 0 },
        { day: "Mar", total: 0 },
        { day: "Mié", total: 0 },
        { day: "Jue", total: 0 },
        { day: "Vie", total: 0 },
        { day: "Sáb", total: 0 },
    ];

    orders.forEach((order) => {
      const date = new Date(order._creationTime);
      const dayIndex = date.getDay();
      ordersByDay[dayIndex].total++;
    });

    return ordersByDay;
  },
});