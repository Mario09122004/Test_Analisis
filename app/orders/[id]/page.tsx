"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";

// Componentes de shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Iconos
import { ArrowLeft, User, FileText, Hash, Receipt, AlertCircle } from "lucide-react";

// Función para el estilo del Badge
function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "pagado": return "default";
    case "reembolsado": return "secondary";
    case "pendiente": return "destructive";
    case "cancelado": return "outline";
    default: return "outline";
  }
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as Id<"orders">;

  // <-- CAMBIO AQUÍ: Se usa "skip" para evitar ejecutar la consulta sin ID
  const orden = useQuery(api.ordenes.obtenerOrdenPorIdConUsuario, orderId ? { id: orderId } : "skip");

  // 1. Estado de Carga
  if (orden === undefined) {
    return <OrderDetailsSkeleton />;
  }

  // 2. Estado de Orden no Encontrada
  if (orden === null) {
    return (
      <div className="container mx-auto max-w-4xl p-6 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            La orden que buscas no fue encontrada. Es posible que haya sido eliminada.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} variant="outline" className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
        </Button>
      </div>
    );
  }
  
  // 3. Renderizado de la página de detalles
  const subtotal = orden.order_item.reduce((sum, item) => sum + item.subtotal, 0);
  const saldoPendiente = orden.totalPago - orden.montoPagado;

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button onClick={() => router.back()} variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalles de la Orden</h1>
            <p className="text-sm text-muted-foreground font-mono">{orden._id}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Columna Izquierda */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <Hash className="h-5 w-5" />
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de Creación</span>
                <span>{new Date(orden._creationTime).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estado de Pago</span>
                <Badge variant={getStatusBadgeVariant(orden.statusPago)}>{orden.statusPago}</Badge>
              </div>
               <div className="flex justify-between">
                <span className="text-muted-foreground">Método de Pago</span>
                <span className="capitalize">{orden.metodoPago}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <User className="h-5 w-5" />
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre</span>
                <span>{orden.usuario?.nombre ?? "No disponible"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Correo</span>
                <span>{orden.usuario?.correo ?? "No disponible"}</span>
              </div>
            </CardContent>
          </Card>

          {orden.notas && (
             <Card>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <FileText className="h-5 w-5" />
                <CardTitle>Notas Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{orden.notas}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna Derecha */}
        <div className="space-y-6">
           <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <Receipt className="h-5 w-5" />
              <CardTitle>Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Descuento</span><span>-{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(orden.descuento)}</span></div>
              <div className="flex justify-between font-semibold"><span className="text-muted-foreground">Total</span><span>{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(orden.totalPago)}</span></div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Monto Pagado</span><span>{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(orden.montoPagado)}</span></div>
              <div className={`flex justify-between font-bold text-base ${saldoPendiente > 0 ? 'text-destructive' : 'text-green-600'}`}><span>Saldo Pendiente</span><span>{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(saldoPendiente)}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla de Análisis */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose de Análisis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Análisis</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unitario</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orden.order_item.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.nombre}</TableCell>
                  <TableCell className="text-center">{item.cantidad}</TableCell>
                  <TableCell className="text-right">{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(item.precioUnitario)}</TableCell>
                  <TableCell className="text-right">{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para mostrar mientras cargan los datos
function OrderDetailsSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9" />
        <div className="space-y-1">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}