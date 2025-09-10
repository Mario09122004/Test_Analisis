"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import { Id } from "@/convex/_generated/dataModel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface OrderItem {
    analisisId: Id<"analisis"> | null;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

interface FormState {
    userId: Id<"user"> | null;
    statusPago: "pendiente" | "pagado" | "cancelado" | "reembolsado";
    metodoPago: "efectivo" | "tarjeta" | "transferencia" | "paypal";
    order_item: OrderItem[];
    totalPago: number;
    montoPagado: number | "";
    notas: string;
    descuento: number | "";
}

const generarTicketPDF = (ordenData: any, nombreCliente: string, ordenId: Id<"orders">) => {
    const doc = new jsPDF();
    const subtotal = ordenData.order_item.reduce((sum: number, item: any) => sum + item.subtotal, 0);

    doc.setFontSize(20);
    doc.text("Ticket de Compra", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Orden ID: ${ordenId}`, 14, 35);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 14, 42);
    doc.text(`Cliente: ${nombreCliente}`, 14, 49);
    doc.text(`Método de Pago: ${ordenData.metodoPago.charAt(0).toUpperCase() + ordenData.metodoPago.slice(1)}`, 14, 56);
    
    autoTable(doc, {
        startY: 65,
        head: [['Análisis', 'Cantidad', 'Precio Unitario', 'Subtotal']],
        body: ordenData.order_item.map((item: any) => [
            item.nombre,
            item.cantidad,
            `$${item.precioUnitario.toFixed(2)}`,
            `$${item.subtotal.toFixed(2)}`
        ]),
        headStyles: { fillColor: [38, 38, 38] },
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Descuento: -$${ordenData.descuento.toFixed(2)}`, 14, finalY + 17);
    doc.setFont("bold");
    doc.text(`Total Pagado: $${ordenData.totalPago.toFixed(2)}`, 14, finalY + 24);

    doc.save(`ticket-orden-${ordenId}.pdf`);
};


export default function CrearOrdenPage() {
    const router = useRouter();
    const crearOrden = useMutation(api.ordenes.crearOrden);
    const analisis = useQuery(api.analisis.obtenerAnalisis);
    const users = useQuery(api.users.consultusers);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
    const [openUserPopover, setOpenUserPopover] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState<string>("");

    const [openAnalisisPopover, setOpenAnalisisPopover] = useState<boolean[]>([]);
    const [selectedAnalisisNames, setSelectedAnalisisNames] = useState<string[]>([]);

    const [formData, setFormData] = useState<FormState>({
        userId: null,
        statusPago: "pendiente",
        metodoPago: "efectivo",
        order_item: [{ analisisId: null, nombre: "", cantidad: 1, precioUnitario: 0, subtotal: 0 }],
        totalPago: 0,
        montoPagado: "",
        notas: "",
        descuento: "",
    });

    useEffect(() => {
        const subtotalGeneral = formData.order_item.reduce((sum, item) => sum + item.subtotal, 0);
        const descuentoPorcentaje = Number(formData.descuento) || 0;
        const montoDescontado = subtotalGeneral * (descuentoPorcentaje / 100);
        const totalFinal = subtotalGeneral - montoDescontado;
        setFormData((prev) => ({ ...prev, totalPago: totalFinal >= 0 ? totalFinal : 0 }));
    }, [formData.order_item, formData.descuento]);
    
    useEffect(() => {
        if (analisis && formData.order_item.length > openAnalisisPopover.length) {
            setOpenAnalisisPopover(new Array(formData.order_item.length).fill(false));
            setSelectedAnalisisNames(
                formData.order_item.map(item => {
                    const foundAnalisis = analisis.find(a => a._id === item.analisisId);
                    return foundAnalisis ? foundAnalisis.nombre : "";
                })
            );
        }
    }, [analisis, formData.order_item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    
    const handleAnalisisPopoverChange = (index: number, isOpen: boolean) => {
        const newOpenState = [...openAnalisisPopover];
        newOpenState[index] = isOpen;
        setOpenAnalisisPopover(newOpenState);
    };

    const handleItemChange = (index: number, name: keyof OrderItem, value: any) => {
        const newItems = [...formData.order_item];
        const updatedItem = { ...newItems[index], [name]: value };

        if (name === "analisisId" && analisis) {
            const selectedAnalisis = analisis.find(a => a._id === value);
            if (selectedAnalisis) {
                updatedItem.nombre = selectedAnalisis.nombre;
                updatedItem.precioUnitario = selectedAnalisis.costo;
                updatedItem.subtotal = updatedItem.cantidad * selectedAnalisis.costo;
            } else {
                 updatedItem.precioUnitario = 0;
                 updatedItem.subtotal = 0;
            }
        }

        if (name === "cantidad" || name === "precioUnitario") {
            updatedItem.cantidad = Number(updatedItem.cantidad);
            updatedItem.precioUnitario = Number(updatedItem.precioUnitario);
            updatedItem.subtotal = updatedItem.cantidad * updatedItem.precioUnitario;
        }

        newItems[index] = updatedItem;
        setFormData((prev) => ({ ...prev, order_item: newItems }));
    };

    const addOrderItem = () => {
        setFormData((prev) => ({
            ...prev,
            order_item: [...prev.order_item, { analisisId: null, nombre: "", cantidad: 1, precioUnitario: 0, subtotal: 0 }]
        }));
    };

    const removeLastOrderItem = () => {
        if (formData.order_item.length > 1) {
            setFormData((prev) => ({
                ...prev,
                order_item: prev.order_item.slice(0, -1)
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        const { userId, totalPago, montoPagado, order_item, descuento } = formData;
        
        if (!userId || montoPagado === "" || order_item.some(item => !item.analisisId)) {
            setErrorMessage("Por favor, completa todos los campos obligatorios y selecciona al menos un análisis.");
            setIsSubmitting(false);
            return;
        }

        const subtotalGeneral = order_item.reduce((sum, item) => sum + item.subtotal, 0);
        const descuentoPorcentaje = Number(descuento) || 0;
        const montoDescuentoFinal = subtotalGeneral * (descuentoPorcentaje / 100);

        const newOrder = {
            userId: userId as Id<"user">,
            statusPago: formData.statusPago,
            metodoPago: formData.metodoPago,
            order_item: order_item.map(item => ({
                analisisId: item.analisisId as Id<"analisis">,
                nombre: item.nombre,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                subtotal: item.subtotal,
            })),
            totalPago: totalPago,
            montoPagado: Number(montoPagado),
            notas: formData.notas,
            descuento: montoDescuentoFinal,
        }

        try {
            const nuevaOrdenId = await crearOrden(newOrder);
            generarTicketPDF(newOrder, selectedUserName, nuevaOrdenId);
            router.push("/orders");

        } catch (error) {
            console.error("Error al crear la orden:", error);
            setErrorMessage("Error al crear la orden. Por favor, intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (analisis === undefined || users === undefined) {
        return (
             <div className="container mx-auto py-10">
                <Skeleton className="h-8 w-64 mb-6" />
                <Card className="max-w-2xl mx-auto">
                    <CardHeader><Skeleton className="h-6 w-full" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!users || users.length === 0 || !analisis || analisis.length === 0) {
        return (
            <div className="container mx-auto py-10 text-center">
                <p className="text-xl font-bold">No hay usuarios o análisis disponibles para crear una orden.</p>
                <Button onClick={() => router.back()} className="mt-4">Volver</Button>
            </div>
        );
    }
    
    const subtotal = formData.order_item.reduce((sum, item) => sum + item.subtotal, 0);
    const montoDescontadoUI = subtotal * ((Number(formData.descuento) || 0) / 100);

    return (
        <div className="container px-4 sm:px-6 lg:px-8 py-10 mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-bold">Crear Nueva Orden</h1>
                </div>
            </div>

            <Card className="w-full max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="font-semibold text-center">Información de la Orden</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6">
                        {/* ... Código sin cambios ... */}
                        <div className="grid gap-2">
                            <Label htmlFor="userId">Cliente</Label>
                            <Popover open={openUserPopover} onOpenChange={setOpenUserPopover}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={openUserPopover} className="w-full justify-between">
                                        {selectedUserName || "Selecciona un cliente..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar cliente..." />
                                        <CommandList>
                                            <CommandEmpty>No se encontró ningún cliente.</CommandEmpty>
                                            <CommandGroup>
                                                {users.map((user) => (
                                                    <CommandItem key={user._id} value={`${user.nombre} (${user.correo})`} onSelect={() => {
                                                        setFormData((prev) => ({ ...prev, userId: user._id as Id<"user"> }));
                                                        setSelectedUserName(`${user.nombre} (${user.correo})`);
                                                        setOpenUserPopover(false);
                                                    }}>
                                                        <Check className={cn("mr-2 h-4 w-4", formData.userId === user._id ? "opacity-100" : "opacity-0")} />
                                                        {user.nombre} ({user.correo})
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Separator className="my-4" />
                        
                        <div className="grid gap-2">
                            <Label htmlFor="order_item">Análisis en la orden</Label>
                            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2">
                                <Button type="button" onClick={addOrderItem} variant="outline" size="sm">
                                    <IconPlus className="h-4 w-4" /> Agregar análisis
                                </Button>
                            </div>
                            {formData.order_item.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 border p-2 rounded-md">
                                    <div className="col-span-2">
                                        <Label className="text-xs">Análisis</Label>
                                        <Popover open={openAnalisisPopover[index]} onOpenChange={(isOpen) => handleAnalisisPopoverChange(index, isOpen)}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" aria-expanded={openAnalisisPopover[index]} className="w-full justify-between">
                                                    {selectedAnalisisNames[index] || "Selecciona un análisis..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar análisis..." />
                                                    <CommandList>
                                                        <CommandEmpty>No se encontró ningún análisis.</CommandEmpty>
                                                        <CommandGroup>
                                                            {analisis?.map((a) => (
                                                                <CommandItem key={a._id} value={a.nombre} onSelect={() => {
                                                                    handleItemChange(index, "analisisId", a._id);
                                                                    const newNames = [...selectedAnalisisNames];
                                                                    newNames[index] = a.nombre;
                                                                    setSelectedAnalisisNames(newNames);
                                                                    handleAnalisisPopoverChange(index, false);
                                                                }}>
                                                                    <Check className={cn("mr-2 h-4 w-4", item.analisisId === a._id ? "opacity-100" : "opacity-0")} />
                                                                    {a.nombre}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="col-span-1">
                                        <Label className="text-xs">Cantidad</Label>
                                        <Input type="number" value={item.cantidad} onChange={(e) => handleItemChange(index, "cantidad", e.target.value)} min="1" step="1" inputMode="numeric" required />
                                    </div>
                                    <div className="col-span-1">
                                        <Label className="text-xs">Subtotal</Label>
                                        <Input type="text" value={`$${item.subtotal.toFixed(2)}`} readOnly className="font-bold text-center" />
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-end gap-4 mt-2">
                                <Button type="button" onClick={removeLastOrderItem} variant="outline" size="sm" disabled={formData.order_item.length <= 1}>
                                    <IconMinus className="h-4 w-4" /> Eliminar último
                                </Button>
                            </div>
                        </div>
                        <Separator className="my-4" />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="statusPago">Estado de Pago</Label>
                                <Select value={formData.statusPago} onValueChange={(value) => handleSelectChange("statusPago", value as "pendiente" | "pagado" | "cancelado" | "reembolsado")}>
                                    <SelectTrigger><SelectValue placeholder="Selecciona el estado de pago" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pendiente">Pendiente</SelectItem>
                                        <SelectItem value="pagado">Pagado</SelectItem>
                                        <SelectItem value="cancelado">Cancelado</SelectItem>
                                        <SelectItem value="reembolsado">Reembolsado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="metodoPago">Método de Pago</Label>
                                <Select value={formData.metodoPago} onValueChange={(value) => handleSelectChange("metodoPago", value as "efectivo" | "tarjeta" | "transferencia" | "paypal")}>
                                    <SelectTrigger><SelectValue placeholder="Selecciona el método" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="efectivo">Efectivo</SelectItem>
                                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                        <SelectItem value="transferencia">Transferencia</SelectItem>
                                        <SelectItem value="paypal">PayPal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                            <div className="grid gap-2">
                                <Label>Subtotal</Label>
                                <Input type="text" value={`$${subtotal.toFixed(2)}`} readOnly className="text-center" />
                            </div>
                            <div className="relative grid gap-2">
                                <Label htmlFor="descuento">Descuento (%)</Label>
                                <Input
                                    id="descuento" name="descuento" type="number"
                                    value={formData.descuento} onChange={handleChange}
                                    placeholder="Ej: 10" min="0" max="100" step="1" inputMode="numeric"
                                />
                                <p className={cn(
                                    "text-xs text-muted-foreground text-center pt-1",
                                    { "invisible": montoDescontadoUI <= 0 }
                                )}>
                                    Equivale a: -${montoDescontadoUI.toFixed(2)}
                                </p>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="totalPago">Total a Pagar</Label>
                                <Input 
                                    id="totalPago" type="text" value={`$${formData.totalPago.toFixed(2)}`} 
                                    readOnly className="font-bold text-lg text-center bg-secondary" 
                                />
                            </div>
                        </div>
                        
                        <div className="grid gap-2 mt-4">
                            <Label htmlFor="montoPagado">Monto Pagado</Label>
                            <Input id="montoPagado" type="number" name="montoPagado" value={formData.montoPagado} onChange={handleChange} placeholder="Ej: 500.00" min="0" step="0.01" inputMode="decimal" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notas">Notas (opcional)</Label>
                            <textarea id="notas" name="notas" value={formData.notas} onChange={handleChange} placeholder="Notas adicionales sobre la orden..." className="w-full p-2 border rounded-md min-h-[80px]" />
                        </div>
                        {errorMessage && (
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
                        <Button type="button" variant="destructive" onClick={() => router.back()} disabled={isSubmitting} className="w-full sm:w-auto">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting ? "Creando..." : "Crear Orden y Ticket"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}