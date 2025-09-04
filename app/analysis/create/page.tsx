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


export default function CrearEstudiantePage() {
    const router = useRouter();
    const crearAnalisis = useMutation(api.analisis.crearAnalisis)
    const [fields, setFields] = useState([""]); // inicializamos con un campo

    // Agregar un nuevo campo
    const addField = () => {
        setFields([...fields, ""]);
    };

    // Eliminar un campo
    const removeLastField = () => {
        if (fields.length > 1) {
        setFields(fields.slice(0, -1)); // elimina el último elemento
        }
    };

    // Actualizar el valor de un campo
    const handleChangeArray = (index: number, value: string) => {
        const newFields = [...fields];
        newFields[index] = value;
        setFields(newFields);
    };

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        diasDeEspera: "",
        costo: "",
        datos: [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Filtrar campos vacíos del array de datos
        const datosFiltrados = fields.filter(field => field.trim() !== "");

        // Validar que los campos numéricos no estén vacíos
        if (!formData.diasDeEspera || !formData.costo) {
            alert("Por favor completa todos los campos numéricos");
            setIsSubmitting(false);
            return;
        }

        // Validar que al menos un parámetro esté presente
        if (datosFiltrados.length === 0) {
            alert("Por favor agrega al menos un parámetro al análisis");
            setIsSubmitting(false);
            return;
        }

        const newFormData = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            diasDeEspera: parseInt(formData.diasDeEspera),
            costo: parseFloat(formData.costo),
            datos: datosFiltrados
        }

        try {
            await crearAnalisis(newFormData);
            router.push("/analysis");
        } catch (error) {
            console.error("Error al crear analisis:", error);
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
                        Crear Nuevo Analisis
                    </h1>
                </div>
            </div>

            <Card className="w-full max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="font-semibold text-center">Información del Analisis</CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="Nombre">Nombre del analisis</Label>
                            <Input
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Quimica sanguinea"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Descripción del analisis</Label>
                            <Input
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Descripción del analisis"
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
                                    onClick={addField}
                                    variant="outline" 
                                    size="sm"
                                    >
                                    <IconPlus className="h-4 w-4" />
                                    Agregar parámetro
                                </Button>
                                <Button
                                    type="button"
                                    onClick={removeLastField}
                                    variant="outline" 
                                    size="sm"
                                    disabled={fields.length <= 1}
                                    >
                                    <IconMinus className="h-4 w-4" />
                                    Eliminar último
                                </Button>
                            </div>
                            <div className="space-y-2 mt-4">
                                {fields.map((value, index) => (
                                    <Input
                                    key={index}
                                    type="text"
                                    value={value}
                                    onChange={(e) => handleChangeArray(index, e.target.value)}
                                    placeholder={`Parámetro ${index + 1} (ej: Glucosa, Colesterol, etc.)`}
                                    className="w-full"
                                    />
                                ))}
                            </div>
                        </div>

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
                            {isSubmitting ? "Creando..." : "Crear Analisis"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>

    );
}
