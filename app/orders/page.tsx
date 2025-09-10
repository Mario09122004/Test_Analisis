"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

// Componentes de shadcn/ui
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Iconos
import { IconPlus, IconTrash, IconEdit, IconFileDescription } from "@tabler/icons-react";

// Función para obtener el estilo del badge según el estado
function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "pagado": return "default";
    case "reembolsado": return "secondary";
    case "pendiente": return "destructive";
    case "cancelado": return "outline";
    default: return "outline";
  }
}

export default function OrdersListResponsive() {
  const router = useRouter();
  const ordenes = useQuery(api.ordenes.obtenerOrdenesConUsuario);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const handleEliminar = (id: Id<"orders">) => {
    console.log("Eliminar orden:", id);
  };

  const handleEditar = (id: Id<"orders">) => {
    router.push(`/orders/edit/${id}`);
  };

  const handleVerDetalles = (id: Id<"orders">) => {
    router.push(`/orders/${id}`);
  };

  const filteredOrders = ordenes
    ? ordenes.filter(
        (orden) =>
          orden.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orden.correoUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orden.statusPago.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  if (ordenes === undefined) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">Órdenes Recientes</h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Buscar por cliente, correo, estado..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-64"
            />
            <Button onClick={() => router.push('/orders/create')}>
              <IconPlus className="mr-2 h-4 w-4" /> Crear Orden
            </Button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
           <div className="text-center py-10">
             <p className="text-muted-foreground">No se encontraron órdenes.</p>
           </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableCaption>
                  Mostrando {paginatedOrders.length} de {filteredOrders.length} órdenes.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado de Pago</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Saldo Pendiente</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((orden) => (
                    <TableRow key={orden._id}>
                      <TableCell>
                        <div className="font-medium">{orden.nombreUsuario}</div>
                        <div className="text-xs text-muted-foreground">{orden.correoUsuario}</div>
                      </TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(orden.statusPago)}>{orden.statusPago}</Badge></TableCell>
                      <TableCell>{new Date(orden._creationTime).toLocaleDateString('es-MX')}</TableCell>
                      {/* <-- CAMBIO AQUÍ: Se calcula y formatea el saldo pendiente --> */}
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(orden.totalPago - orden.montoPagado)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild><Button variant="outline" size="icon" className="size-8" onClick={() => handleVerDetalles(orden._id)}><IconFileDescription className="size-4"/></Button></TooltipTrigger>
                            <TooltipContent><p>Ver Detalles</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild><Button variant="outline" size="icon" className="size-8" onClick={() => handleEditar(orden._id)}><IconEdit className="size-4"/></Button></TooltipTrigger>
                            <TooltipContent><p>Editar Orden</p></TooltipContent>
                          </Tooltip>
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild><AlertDialogTrigger asChild><Button variant="destructive" size="icon" className="size-8"><IconTrash className="size-4"/></Button></AlertDialogTrigger></TooltipTrigger>
                              <TooltipContent><p>Eliminar Orden</p></TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción eliminará permanentemente la orden. No se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleEliminar(orden._id)}>Continuar</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="md:hidden space-y-4">
              {paginatedOrders.map((orden) => (
                <Card key={orden._id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <span className="font-medium">{orden.nombreUsuario}</span>
                      <Badge variant={getStatusBadgeVariant(orden.statusPago)}>{orden.statusPago}</Badge>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground pt-0">{orden.correoUsuario}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Fecha</span><span className="text-sm font-medium">{new Date(orden._creationTime).toLocaleDateString('es-MX')}</span></div>
                    {/* <-- CAMBIO AQUÍ: Se muestra el saldo pendiente en la tarjeta --> */}
                    <div className="flex justify-between pt-1 border-t">
                      <span className="text-sm text-muted-foreground">Saldo Pendiente</span>
                      <span className="text-sm font-semibold">
                        {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(orden.totalPago - orden.montoPagado)}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild><Button variant="outline" size="icon" className="size-8" onClick={() => handleVerDetalles(orden._id)}><IconFileDescription className="size-4"/></Button></TooltipTrigger>
                        <TooltipContent><p>Ver Detalles</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild><Button variant="outline" size="icon" className="size-8" onClick={() => handleEditar(orden._id)}><IconEdit className="size-4"/></Button></TooltipTrigger>
                        <TooltipContent><p>Editar Orden</p></TooltipContent>
                      </Tooltip>
                      <AlertDialog>
                        <Tooltip>
                          <TooltipTrigger asChild><AlertDialogTrigger asChild><Button variant="destructive" size="icon" className="size-8"><IconTrash className="size-4"/></Button></AlertDialogTrigger></TooltipTrigger>
                          <TooltipContent><p>Eliminar Orden</p></TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción eliminará permanentemente la orden. No se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleEliminar(orden._id)}>Continuar</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(p - 1, 1)); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}/></PaginationItem>
                  <PaginationItem><span className="px-4 py-2 text-sm">Página {currentPage} de {totalPages}</span></PaginationItem>
                  <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(p + 1, totalPages)); }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}/></PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}