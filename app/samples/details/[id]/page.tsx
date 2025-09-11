"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { ArrowLeft, Printer, User, FileText, Calendar, Hash } from 'lucide-react';

type SampleDetails = InferQueryOutput<api.muestras.getSampleDetailsById>;

function getStatusBadgeVariant(status: SampleDetails["estado"]) {
  switch (status) {
    case "finalizada":
      return "default";
    case "procesando":
      return "secondary";
    case "sin tomar":
      return "destructive";
    default:
      return "outline";
  }
}

export default function SampleDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const sampleId = params.id as Id<"samples">;

    const [creationDate, setCreationDate] = useState("");

    const sampleDetails = useQuery(api.muestras.getSampleDetailsById, { id: sampleId });

    useEffect(() => {
        if (sampleDetails) {
            setCreationDate(new Date(sampleDetails._creationTime).toLocaleString());
        }
    }, [sampleDetails]);


    if (sampleDetails === undefined) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (sampleDetails === null) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h2 className="text-2xl font-bold mb-2">Muestra no encontrada</h2>
                <p className="text-muted-foreground mb-4">
                    La muestra que estás buscando no existe o ha sido eliminada.
                </p>
                <Button onClick={() => router.push('/samples')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a la lista
                </Button>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <Button variant="outline" size="sm" className="mb-2" onClick={() => router.push('/samples')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Detalles de la Muestra</h1>
                    <p className="text-muted-foreground">Resultados e información del paciente y análisis.</p>
                </div>
                {sampleDetails.estado === 'finalizada' && (
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir / Guardar PDF
                    </Button>
                )}
            </header>

            <main className="space-y-6">
                 <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" /> Información del Paciente
                        </CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground">Nombre</span>
                            <span className="font-medium text-right truncate">{sampleDetails.patientName}</span>
                        </div>
                        <Separator />
                         <div className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground">Correo</span>
                            <span className="text-right truncate">{sampleDetails.patientEmail}</span>
                        </div>
                         <Separator />
                         <div className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground">ID Orden</span>
                            <span className="font-mono text-right truncate">{sampleDetails.orderId}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" /> Información de la Muestra
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground">ID Muestra</span>
                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate">{sampleDetails._id}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Estado</span>
                            <Badge variant={getStatusBadgeVariant(sampleDetails.estado)}>
                                {sampleDetails.estado}
                            </Badge>
                        </div>
                         <Separator />
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground">Análisis</span>
                            <span className="font-medium text-right truncate">{sampleDetails.analysisName}</span>
                        </div>
                        <Separator />
                         <div className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground">Fecha de Creación</span>
                            <span className="text-right truncate">{creationDate || "..."}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Resultados del Análisis</CardTitle>
                        <CardDescription>{sampleDetails.analysisDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Parámetro</TableHead>
                                        <TableHead>Resultado</TableHead>
                                        <TableHead>Unidad</TableHead>
                                        <TableHead>Rango de Referencia</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sampleDetails.resultados?.map((res, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium whitespace-nowrap">{res.nombre}</TableCell>
                                            <TableCell className="font-bold whitespace-nowrap">
                                                {res.valor !== null ? String(res.valor) : 'Pendiente'}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{res.medicion}</TableCell>
                                            <TableCell className="whitespace-nowrap">{res.estandar}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}