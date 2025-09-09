import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      
      {/* Sección principal: Encabezado */}
      <header className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Laboratorio de Análisis Clínicos
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Ofrecemos servicios de análisis de alta precisión para el cuidado de tu salud.
          Confía en nosotros para obtener resultados rápidos y confiables.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button className="px-6 py-3 font-semibold text-lg" asChild>
            <a href="#services">Nuestros Servicios</a>
          </Button>
          <Button variant="outline" className="px-6 py-3 font-semibold text-lg" asChild>
            <a href="#contact">Contáctanos</a>
          </Button>
        </div>
      </header>

      {/* Sección de Servicios */}
      <section id="services" className="w-full max-w-5xl mx-auto my-12">
        <h2 className="text-3xl font-bold text-center mb-8">Nuestros Servicios</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Sangre</CardTitle>
              <CardDescription>Pruebas completas para un chequeo de rutina.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Ofrecemos pruebas de glucosa, colesterol, triglicéridos y más. Sin largas esperas y con resultados en línea.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Exámenes de Orina</CardTitle>
              <CardDescription>Análisis detallado para detectar infecciones y enfermedades.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Nuestros análisis de orina ayudan a identificar problemas renales, hepáticos y otras condiciones médicas.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pruebas de Hormonas</CardTitle>
              <CardDescription>Medición precisa para evaluar el balance hormonal.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Realizamos pruebas de tiroides, testosterona, estrógeno y otras hormonas esenciales para tu bienestar.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-12 w-1/2" />

      {/* Sección de Contacto */}
      <section id="contact" className="w-full max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Contáctanos</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Estamos aquí para ayudarte. Agenda una cita o resuelve tus dudas.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild>
            <a href="#">Agendar Cita</a>
          </Button>
        </div>
      </section>

    </div>
  );
}