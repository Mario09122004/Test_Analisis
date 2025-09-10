"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { IconPlus, IconMinus } from "@tabler/icons-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Dato {
    nombre: string;
    medicion: string;
    estandar: string;
}

export default function CrearEstudiantePage() {
    const router = useRouter();
    const crearAnalisis = useMutation(api.analisis.crearAnalisis)
    const [datosFields, setDatosFields] = useState<Dato[]>([{ nombre: "", medicion: "", estandar: "" }]);
    const [errorMessage, setErrorMessage] = useState("");

    const addDatoField = () => {
        setDatosFields([...datosFields, { nombre: "", medicion: "", estandar: "" }]);
    };

    const removeLastDatoField = () => {
        if (datosFields.length > 1) {
            setDatosFields(datosFields.slice(0, -1));
        }
    };

    const handleDatoChange = (index: number, name: keyof Dato, value: string) => {
        const newDatosFields = [...datosFields];
        newDatosFields[index][name] = value;
        setDatosFields(newDatosFields);
    };

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        diasDeEspera: "",
        costo: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        if (!formData.diasDeEspera || !formData.costo) {
            setErrorMessage("Por favor completa todos los campos.");
            setIsSubmitting(false);
            return;
        }

        const hasEmptyDatos = datosFields.some(dato => 
            !dato.nombre.trim() || !dato.medicion.trim() || !dato.estandar.trim()
        );

        if (hasEmptyDatos || datosFields.length === 0) {
            setErrorMessage("Por favor, completa todos los campos de cada parámetro.");
            setIsSubmitting(false);
            return;
        }

        const newFormData = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            diasDeEspera: parseInt(formData.diasDeEspera),
            costo: parseFloat(formData.costo),
            datos: datosFields
        }

        try {
            await crearAnalisis(newFormData);
            router.push("/analysis");
        } catch (error) {
            console.error("Error al crear analisis:", error);
            setErrorMessage("Error al crear el análisis. Por favor, intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container px-4 sm:px-6 lg:px-8 py-10 mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Crear Nuevo Análisis
                    </h1>
                </div>
            </div>

            <Card className="w-full max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="font-semibold text-center">Información del Análisis</CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre del análisis</Label>
                            <Input
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Química sanguínea"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="descripcion">Descripción del análisis</Label>
                            <Input
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Descripción del análisis"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="diasDeEspera">Días de espera</Label>
                            <Input
                                id="diasDeEspera"
                                name="diasDeEspera"
                                type="number"
                                value={formData.diasDeEspera}
                                onChange={handleChange}
                                placeholder="Ej: 5"
                                min="1"
                                step="1"
                                inputMode="numeric"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="costo">Costo del análisis</Label>
                            <Input
                                id="costo"
                                name="costo"
                                type="number"
                                value={formData.costo}
                                onChange={handleChange}
                                placeholder="Ej: 200.00"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="parametros">Parámetros del análisis</Label>
                            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
                                <Button
                                    type="button"
                                    onClick={addDatoField}
                                    variant="outline" 
                                    size="sm"
                                    >
                                    <IconPlus className="h-4 w-4" />
                                    Agregar parámetro
                                </Button>
                                <Button
                                    type="button"
                                    onClick={removeLastDatoField}
                                    variant="outline" 
                                    size="sm"
                                    disabled={datosFields.length <= 1}
                                    >
                                    <IconMinus className="h-4 w-4" />
                                    Eliminar último
                                </Button>
                            </div>
                            <div className="space-y-4 mt-4">
                                {datosFields.map((dato, index) => (
                                    <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <Input
                                            type="text"
                                            value={dato.nombre}
                                            onChange={(e) => handleDatoChange(index, "nombre", e.target.value)}
                                            placeholder={`Nombre (ej: Glucosa)`}
                                            className="w-full"
                                            required
                                        />
                                        <Input
                                            type="text"
                                            value={dato.medicion}
                                            onChange={(e) => handleDatoChange(index, "medicion", e.target.value)}
                                            placeholder={`Medición (ej: g)`}
                                            className="w-full"
                                            required
                                        />
                                        <Input
                                            type="text"
                                            value={dato.estandar}
                                            onChange={(e) => handleDatoChange(index, "estandar", e.target.value)}
                                            placeholder={`Estándar (ej: 50-60)`}
                                            className="w-full"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {errorMessage && (
                            <Alert variant="destructive">
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            {isSubmitting ? "Creando..." : "Crear Análisis"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}