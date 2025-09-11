"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bar, BarChart, Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

import { Users, CreditCard, FlaskConical, Activity } from 'lucide-react';

function StatCard({ title, value, icon: Icon, description, isLoading }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description: string;
    isLoading: boolean;
}) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-1/2 mb-1" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    const stats = useQuery(api.dashboard.getDashboardStats);
    const samplesByAnalysis = useQuery(api.dashboard.getSamplesByAnalysis);
    const ordersByDay = useQuery(api.dashboard.getOrdersByDayOfWeek);

    const isLoading = stats === undefined || samplesByAnalysis === undefined || ordersByDay === undefined;

    const samplesChartConfig = {
      total: {
        label: "Muestras",
        color: "hsl(var(--chart-1))",
      },
    } satisfies ChartConfig;

    const ordersChartConfig = {
        total: {
            label: "Órdenes",
            color: "hsl(var(--chart-2))",
        }
    } satisfies ChartConfig

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Muestras Pendientes"
                    value={stats?.pendingSamples ?? 0}
                    icon={FlaskConical}
                    description="Muestras sin tomar o en procesamiento"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Órdenes sin Pagar"
                    value={stats?.unpaidOrders ?? 0}
                    icon={CreditCard}
                    description="Órdenes con pago pendiente"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total de Usuarios"
                    value={stats?.totalUsers ?? 0}
                    icon={Users}
                    description="Usuarios registrados en el sistema"
                    isLoading={isLoading}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Muestras por Tipo de Análisis</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {isLoading ? <Skeleton className="h-[350px] w-full" /> : (
                            <ChartContainer config={samplesChartConfig} className="h-[350px] w-full">
                                <BarChart accessibilityLayer data={samplesByAnalysis}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                    <Bar dataKey="total" fill="var(--color-total)" radius={8} />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Volumen de Órdenes Semanal</CardTitle>
                        <CardDescription>Cantidad de órdenes generadas por día de la semana.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                         <ChartContainer config={ordersChartConfig} className="h-[300px] w-full">
                            <AreaChart
                                accessibilityLayer
                                data={ordersByDay}
                                margin={{ left: 12, right: 12 }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Area
                                    dataKey="total"
                                    type="natural"
                                    fill="var(--color-total)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-total)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}