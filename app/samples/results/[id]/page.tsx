"use client";

import { useQuery, useMutation, InferQueryOutput } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- SHADCN UI COMPONENTS ---
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { ArrowLeft, Save, Loader2, User, TestTube } from 'lucide-react';

type SampleDetails = InferQueryOutput<api.muestras.getSampleDetailsById>;

const resultSchema = z.object({
  nombre: z.string(),
  medicion: z.string(),
  estandar: z.string(),
  valor: z.string().min(1, { message: "El resultado es requerido." }),
});

const formSchema = z.object({
  resultados: z.array(resultSchema),
});

export default function SampleResultsPage() {
    const router = useRouter();
    const params = useParams();
    const sampleId = params.id as Id<"samples">;

    const [isClient, setIsClient] = useState(false);

    const sampleDetails = useQuery(api.muestras.getSampleDetailsById, { id: sampleId });
    const updateResults = useMutation(api.muestras.llenarResultadosMuestra);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            resultados: [],
        },
    });

    const { isSubmitting } = form.formState;

    useEffect(() => {
        setIsClient(true);

        if (sampleDetails?.resultados) {
            const formData = sampleDetails.resultados.map(res => ({
                ...res,
                valor: res.valor !== null ? String(res.valor) : "",
            }));
            form.reset({ resultados: formData });
        }
    }, [sampleDetails, form.reset]);
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!sampleDetails) return;

        const resultsToSubmit = values.resultados.map(res => ({
            ...res,
            valor: res.valor,
        }));

        //cambiar alerta
        toast.loading("Guardando resultados...");
        try {
            await updateResults({
                id: sampleId,
                resultados: resultsToSubmit,
            });

            //cambiar alerta
            toast.success("Resultados guardados exitosamente.");
            router.push(`/samples`);
        } catch (error) {
            console.error("Error al guardar los resultados:", error);
            //cambiar alerta
            toast.error("No se pudo guardar. Inténtalo de nuevo.");
        }
    }

    if (!isClient || sampleDetails === undefined) {
        return (
            <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-96 w-full" />
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
        <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6">
            <header>
                <Button variant="outline" size="sm" className="mb-4" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">
                    {sampleDetails.estado === 'finalizada' ? 'Editar Resultados' : 'Agregar Resultados'}
                </h1>
                <p className="text-muted-foreground">Ingresa los valores para cada parámetro del análisis.</p>
            </header>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Formulario de Resultados</CardTitle>
                            <CardDescription>
                                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-2">
                                     <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground"/>
                                        <span className="font-medium">{sampleDetails.patientName}</span>
                                     </div>
                                      <div className="flex items-center gap-2">
                                        <TestTube className="h-4 w-4 text-muted-foreground"/>
                                        <span className="font-medium">{sampleDetails.analysisName}</span>
                                     </div>
                                </div>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {form.getValues('resultados').map((resultado, index) => (
                                <div key={index}>
                                    <FormField
                                        control={form.control}
                                        name={`resultados.${index}.valor`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                                    <FormLabel className="text-base">{resultado.nombre}</FormLabel>
                                                    <div className="text-sm text-muted-foreground text-left sm:text-right">
                                                        <span>Rango: {resultado.estandar}</span>
                                                        <span className="mx-2">|</span>
                                                        <span>Unidad: {resultado.medicion}</span>
                                                    </div>
                                                </div>
                                                <FormControl>
                                                    <Input placeholder="Ingresa el valor..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Separator className="mt-6" />
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
