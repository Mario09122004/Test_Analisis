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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
    <>
      
        {analisis.length === 0 ? (
              <p>No hay analisis</p>
        ) : (
          analisis.map((analisi) => (
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>{analisi.nombre}</CardTitle>
                <CardDescription>{analisi.descripcion}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>${analisi.costo}</p>
              </CardContent>
              <CardFooter>
                <p>Card Footer</p>
              </CardFooter>
            </Card>

          ))
        )}
    </>
  );
}