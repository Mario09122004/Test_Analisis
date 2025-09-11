"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, InferQueryOutput } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { PlusCircle, Trash2, FileText, ClipboardEdit, Search, ChevronsUpDown } from 'lucide-react';

type SampleWithDetails = InferQueryOutput<api.muestras.getSamplesWithDetails>[number];
type OrderWithClient = InferQueryOutput<api.ordenes.obtenerOrdenesConCliente>[number];

const SAMPLES_PER_PAGE = 8;

function getStatusBadgeVariant(status: SampleWithDetails["estado"]) {
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

function GenerateSamplesModal({ open, onOpenChange, isGenerating, generateSamplesMutation }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isGenerating: boolean;
    generateSamplesMutation: (args: { orderId: Id<"orders"> }) => Promise<any>;
}) {
    const orders = useQuery(api.ordenes.obtenerOrdenesConCliente);

    const handleSelectOrder = async (orderId: Id<"orders">) => {
        onOpenChange(false); 
        toast.loading("Generando muestras...");
        try {
            const result = await generateSamplesMutation({ orderId });
            toast.success(`¡Se generaron ${result.generatedSamples.length} muestras exitosamente!`);
        } catch (error) {
            console.error(error);
            toast.error("Error al generar las muestras. Revisa la consola.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generar Muestras</DialogTitle>
                    <DialogDescription>
                        Busca y selecciona una orden para generar sus muestras correspondientes.
                    </DialogDescription>
                </DialogHeader>
                <Command className="rounded-lg border shadow-md">
                    <CommandInput placeholder="Buscar orden por ID o nombre de paciente..." />
                    <CommandList>
                        {orders === undefined && <div className="p-4 text-sm">Cargando órdenes...</div>}
                        <CommandEmpty>No se encontraron órdenes.</CommandEmpty>
                        <CommandGroup>
                            {orders?.map((order) => (
                                <CommandItem
                                    key={order._id}
                                    value={`${order._id} ${order.patientName}`}
                                    onSelect={() => handleSelectOrder(order._id)}
                                    disabled={isGenerating}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{order._id}</span>
                                        <span className="text-xs text-muted-foreground">{order.patientName}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
}


export default function SamplesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sampleToDelete, setSampleToDelete] = useState<SampleWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allSamples = useQuery(api.muestras.getSamplesWithDetails);
  const generateSamples = useMutation(api.muestras.generarMuestrasDeOrden);
  const deleteSample = useMutation(api.muestras.eliminarMuestra);

  const filteredSamples = useMemo(() => {
    if (!allSamples) return [];
    const lowercasedFilter = searchTerm.toLowerCase();
    return allSamples.filter(sample =>
        sample.analysisName.toLowerCase().includes(lowercasedFilter) ||
        sample.patientName.toLowerCase().includes(lowercasedFilter) ||
        sample.patientEmail.toLowerCase().includes(lowercasedFilter)
    );
  }, [allSamples, searchTerm]);

  const paginatedSamples = useMemo(() => {
    const startIndex = (currentPage - 1) * SAMPLES_PER_PAGE;
    const endIndex = startIndex + SAMPLES_PER_PAGE;
    return filteredSamples.slice(startIndex, endIndex);
  }, [filteredSamples, currentPage]);

  const totalPages = Math.ceil(filteredSamples.length / SAMPLES_PER_PAGE);

  const confirmDelete = (sample: SampleWithDetails) => {
    setSampleToDelete(sample);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (sampleToDelete) {
        //cambiar alerta
        toast.loading("Eliminando muestra...");
        try {
            await deleteSample({ id: sampleToDelete._id });
            //cambiar alerta
            toast.success("Muestra eliminada correctamente.");
        } catch (error) {
            //cambiar alerta
            toast.error("Error al eliminar la muestra.");
        } finally {
            setDialogOpen(false);
            setSampleToDelete(null);
        }
    }
  };
  
  const handleNavigate = (path: string) => {
    router.push(path);
  }

  const generateSamplesMutation = async (args: { orderId: Id<"orders"> }) => {
    setIsGenerating(true);
    try {
        return await generateSamples(args);
    } finally {
        setIsGenerating(false);
    }
};

  if (allSamples === undefined) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-4">
        <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const renderSampleActions = (sample: SampleWithDetails) => (
    <div className="flex items-center justify-end space-x-2">
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleNavigate(`/samples/details/${sample._id}`)}>
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">Ver Detalles</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Ver Detalles</p>
            </TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleNavigate(`/samples/results/${sample._id}`)}>
                    {sample.estado !== 'finalizada' ? <PlusCircle className="h-4 w-4" /> : <ClipboardEdit className="h-4 w-4" />}
                    <span className="sr-only">{sample.estado !== 'finalizada' ? 'Agregar Resultados' : 'Editar Resultados'}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{sample.estado !== 'finalizada' ? 'Agregar Resultados' : 'Editar Resultados'}</p>
            </TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => confirmDelete(sample)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar Muestra</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Eliminar Muestra</p>
            </TooltipContent>
        </Tooltip>
    </div>
  );

  return (
    <TooltipProvider>
        <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por paciente, correo o análisis..."
                        className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <Button onClick={() => setIsModalOpen(true)} disabled={isGenerating}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isGenerating ? "Generando..." : "Generar Muestras de Orden"}
                </Button>
            </div>

            {paginatedSamples.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <p>No se encontraron muestras.</p>
                    {searchTerm && <p className="text-sm">Intenta con otro término de búsqueda.</p>}
                </div>
            ) : (
                <>
                    <div className="hidden md:block border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Análisis</TableHead>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Correo</TableHead>
                                    <TableHead>Fecha Creación</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSamples.map((sample) => (
                                    <TableRow key={sample._id}>
                                        <TableCell className="font-medium">{sample.analysisName}</TableCell>
                                        <TableCell>{sample.patientName}</TableCell>
                                        <TableCell>{sample.patientEmail}</TableCell>
                                        <TableCell>{new Date(sample._creationTime).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(sample.estado)}>
                                                {sample.estado}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {renderSampleActions(sample)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {paginatedSamples.map((sample) => (
                            <Card key={sample._id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between text-base">
                                        <span className="font-semibold truncate">{sample.analysisName}</span>
                                        <Badge variant={getStatusBadgeVariant(sample.estado)}>
                                            {sample.estado}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Paciente</span>
                                        <span>{sample.patientName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Correo</span>
                                        <span>{sample.patientEmail}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Creado</span>
                                        <span>{new Date(sample._creationTime).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end">
                                    {renderSampleActions(sample)}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href="#" isActive>
                                        Página {currentPage} de {totalPages}
                                    </PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la muestra del análisis
                            <span className="font-bold"> {sampleToDelete?.analysisName}</span> para el paciente <span className="font-bold">{sampleToDelete?.patientName}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <GenerateSamplesModal 
                open={isModalOpen} 
                onOpenChange={setIsModalOpen}
                isGenerating={isGenerating}
                generateSamplesMutation={generateSamplesMutation}
            />
        </div>
    </TooltipProvider>
  );
}