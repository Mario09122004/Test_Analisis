"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DetalleAnalisisPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const idAnalisis = id as Id<"analisis">;
    const router = useRouter();
    const analisi = useQuery(api.analisis.obtenerAnalisisPorId, { id: idAnalisis });

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (analisi === undefined) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Skeleton className="h-8 w-64" />
                </div>
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-8 w-full mb-2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-24 mr-2" />
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!analisi) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">Análisis no encontrado</h1>
                </div>
                <p>No se pudo encontrar el análisis con el ID proporcionado.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center gap-2 mb-6 justify-center">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">Detalle del Análisis</h1>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">
                            {analisi.nombre}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Descripción</h3>
                        <div className="p-2 bg-muted rounded-md">{analisi.descripcion}</div>
                    </div>

                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Días de espera</h3>
                        <div className="p-2 bg-muted rounded-md">{analisi.diasDeEspera}</div>
                    </div>

                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Costo</h3>
                        <div className="p-2 bg-muted rounded-md">{analisi.costo}</div>
                    </div>

                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Parámetros del análisis</h3>
                        {analisi.datos.length === 0 ? (
                            <p>No hay parámetros definidos.</p>
                        ) : (
                            analisi.datos.map((dato, index) => (
                                <div className="p-4 bg-muted rounded-md mt-2 space-y-1" key={index}>
                                    <p>
                                        <span className="font-semibold">Nombre:</span> {dato.nombre}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Medición:</span> {dato.medicion}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Estándar:</span> {dato.estandar}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}