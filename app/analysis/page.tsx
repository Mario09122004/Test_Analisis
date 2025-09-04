"use client";

import { TablaEstudiantes } from './_tableanalysis'
import { IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation';

export default function Analysis() {
  const router = useRouter();

  const handleCrear = () => {
    router.push("/analysis/create");
  };

  return (
    <div>
      <Button variant="outline" size="sm" onClick={handleCrear}>
        <IconPlus /> Agregar
      </Button>
      <TablaEstudiantes />
    </div>
  )
}
