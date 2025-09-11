"use client";

import { useQuery, InferQueryOutput } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- SHADCN UI COMPONENTS ---
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// --- ICONS (lucide-react) ---
import { ArrowLeft, FileText, Calendar, FlaskConical, User } from 'lucide-react';
import { useUser } from "@clerk/nextjs";

// --- TYPE DEFINITION ---
type UserResults = InferQueryOutput<api.muestras.getCompletedSamplesByClerkId>;

// --- HELPER COMPONENT FOR CLIENT-SIDE DATE FORMATTING ---
function ClientFormattedDate({ timestamp }: { timestamp: number }) {
    const [formattedDate, setFormattedDate] = useState("");

    useEffect(() => {
        // This ensures the date is formatted only in the browser, preventing hydration errors.
        setFormattedDate(new Date(timestamp).toLocaleDateString());
    }, [timestamp]);

    return <span>{formattedDate || "..."}</span>;
}


// --- MAIN COMPONENT ---
export default function UserResultsPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useUser();
    const clerkId = user.id

    // --- STATE TO ENSURE QUERY IS READY ---
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        // The component is ready to fetch data once the clerkId is available from the URL params.
        if (clerkId) {
            setIsReady(true);
        }
    }, [clerkId]);

    console.log(clerkId)

    // --- CONVEX DATA FETCHING ---
    const resultsData = useQuery(
        api.muestras.getCompletedSamplesByClerkId,
        // Only run the query when the component is ready (i.e., clerkId is available)
        isReady ? { clerkId } : "skip"
    );
    const { user, samples } = resultsData || {};

    // --- RENDER LOGIC ---

    // Loading State: Show skeleton until data is loaded
    if (resultsData === undefined) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    // Not Found State
    if (user === null) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h2 className="text-2xl font-bold mb-2">Usuario no encontrado</h2>
                <p className="text-muted-foreground mb-4">
                    No se pudo encontrar un usuario con el ID proporcionado.
                </p>
                <Button onClick={() => router.push('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio
                </Button>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            {/* --- HEADER --- */}
            <header>
                 <h1 className="text-3xl font-bold tracking-tight">Mis Resultados</h1>
                 <p className="text-muted-foreground">Aquí puedes ver el historial de tus análisis finalizados.</p>
            </header>

            {/* --- PATIENT INFO CARD --- */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Información del Paciente
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-muted-foreground">Nombre</span>
                        <span className="font-medium text-right truncate">{user.nombre}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-muted-foreground">Correo</span>
                        <span className="text-right truncate">{user.correo}</span>
                    </div>
                </CardContent>
            </Card>

            {/* --- RESULTS LIST --- */}
            <main className="space-y-4">
                {samples && samples.length > 0 ? (
                    samples.map((sample) => (
                        <Card key={sample._id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row justify-between gap-2">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <FlaskConical className="h-5 w-5 text-primary" />
                                            {sample.analysisName}
                                        </CardTitle>
                                        <CardDescription className="mt-1 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Completado el: <ClientFormattedDate timestamp={sample.updatedAt} /></span>
                                        </CardDescription>
                                    </div>
                                    <Badge>Finalizada</Badge>
                                </div>
                            </CardHeader>
                            <CardFooter>
                                <Button className="w-full sm:w-auto" onClick={() => router.push(`/samples/details/${sample._id}`)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Ver Informe Completo
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h3 className="text-xl font-semibold">No hay resultados</h3>
                        <p className="text-muted-foreground mt-2">
                            Aún no tienes análisis finalizados y pagados para mostrar.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}