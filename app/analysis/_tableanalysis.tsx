"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner, type SpinnerProps } from '@/components/ui/shadcn-io/spinner';
import {
  IconTrash,
  IconEdit,
  IconFileDescription
} from '@tabler/icons-react'
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const variants: SpinnerProps['variant'][] = [
  'default',
  'circle',
  'pinwheel',
  'circle-filled',
  'ellipsis',
  'ring',
  'bars',
  'infinite',
];
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { date } from "zod";
import { useRouter } from "next/navigation";

export function TablaEstudiantes() {
  const analisis = useQuery(api.analisis.obtenerAnalisis);
  const eliminarAnalisis = useMutation(api.analisis.eliminarAnalisis);
  const router = useRouter();

  const handleVerAnalisi = (id: string) => {
    router.push(`/analysis/${id}`);
  };

  const handleActualizarAnalisi = (id: string) => {
    router.push(`/analysis/${id}/update`);
  };
  
  const handleEliminar = async (id: string) => {
        try {
            await eliminarAnalisis({ id });
            toast("Análisis eliminado.", {
              description: new Date().toLocaleString(),
            });
        } catch (error) {
            console.error("Error al eliminar estudiante:", error);
        } finally {

        }
    };

  if (analisis === undefined) {
    return (
        <div
        className="flex flex-col items-center justify-center gap-4"
        key={"ellipsis"}
        >
        <Spinner key={"ellipsis"} variant="ellipsis" />
        </div>
    );
  }

  return (
    <div className="flex flex-wrap">
        {analisis.length === 0 ? (
              <p>No hay analisis</p>
        ) : (
          analisis.map((analisi) => (
            <Card className="max-w-100 min-w-60 w-full mb-4 mr-4" key={analisi._id}>
              <div className="space-y-1">
                <CardHeader>
                  <CardTitle className="text-2xl font-medium">{analisi.nombre}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>${analisi.costo}</p>
                  <CardDescription>{analisi.descripcion}</CardDescription>
                </CardContent>
              </div>
              <Separator className="h-0.5" />
              <CardFooter className="justify-center">
                <div className="flex h-5 items-center space-x-4 text-sm">

                  <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="size-8">
                            <IconTrash />
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eliminar análisis</p>
                      </TooltipContent>
                    </Tooltip>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta accion eliminara permanentemente el analisis.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleEliminar(analisi._id)}>
                          Continuar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Separator orientation="vertical" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="size-8" onClick={() => handleActualizarAnalisi(analisi._id)}>
                        <IconEdit />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar análisis</p>
                    </TooltipContent>
                  </Tooltip>

                  <Separator orientation="vertical" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="size-8" onClick={() => handleVerAnalisi(analisi._id)}>
                        <IconFileDescription />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Detalles del análisis</p>
                    </TooltipContent>
                  </Tooltip>

                </div>
              </CardFooter>

            </Card>
          ))
        )}
        
    </div>
  );
}