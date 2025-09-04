"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner, type SpinnerProps } from '@/components/ui/shadcn-io/spinner';

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

export function TablaEstudiantes() {
  const analisis = useQuery(api.analisis.obtenerAnalisis);

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
    <Table>
      <TableCaption>Lista de Analisis</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Dias de espera</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Costos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {analisis.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              No hay analisis
            </TableCell>
          </TableRow>
        ) : (
          analisis.map((analisi) => (
            <TableRow key={analisi._id}>
              <TableCell className="font-medium">
                  {analisi.disDeEspera}
                </TableCell>
                <TableCell>{analisi.nombre}</TableCell>
                <TableCell>{analisi.costo}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}