import {
  BookOpenCheck,
  ClipboardList,
  FileSpreadsheet,
  MessageSquareText,
  School,
  Users,
} from "lucide-react";
import type { Feature } from "@/types";

export const navigation = [
  { label: "Problema", href: "#problema" },
  { label: "Propuesta", href: "#solucion" },
  { label: "Demostración", href: "#demostracion" },
  { label: "Participar", href: "#participar" },
  { label: "Proceso", href: "#proceso" },
];

export const problems = [
  {
    icon: ClipboardList,
    title: "Registros dispersos",
    text: "La información se repite entre cuadernos, hojas de cálculo y distintas plataformas.",
  },
  {
    icon: BookOpenCheck,
    title: "Conclusiones manuales",
    text: "Preparar descripciones individuales exige revisar y ordenar evidencias una por una.",
  },
  {
    icon: MessageSquareText,
    title: "Comunicación tardía",
    text: "Convertir el avance académico en mensajes claros para las familias toma tiempo adicional.",
  },
];

export const users = [
  {
    icon: FileSpreadsheet,
    role: "Docentes",
    need: "Registrar una vez y reutilizar la información en tareas frecuentes.",
  },
  {
    icon: Users,
    role: "Familias",
    need: "Recibir mensajes oportunos, comprensibles y centrados en el progreso.",
  },
  {
    icon: School,
    role: "Directores",
    need: "Acompañar la gestión pedagógica con información ordenada y accesible.",
  },
];

export const features: Feature[] = [
  {
    id: "registro-unificado",
    title: "Registro académico unificado",
    description: "Organizar asistencia, evidencias y observaciones desde un solo lugar.",
  },
  {
    id: "conclusiones",
    title: "Apoyo para conclusiones descriptivas",
    description: "Preparar borradores editables a partir de información ya registrada.",
  },
  {
    id: "asistencia-agil",
    title: "Asistencia ágil",
    description: "Registrar el estado del aula con controles rápidos y una vista resumida.",
  },
  {
    id: "comunicacion",
    title: "Comunicación con familias",
    description: "Convertir avances y alertas en mensajes claros antes de enviarlos.",
  },
];

export const timeline = [
  {
    step: "01",
    name: "Empatizar",
    status: "En curso",
    text: "Entrevistas y observación para comprender rutinas, dificultades y contexto real.",
  },
  {
    step: "02",
    name: "Definir",
    status: "Siguiente",
    text: "Sintetizar hallazgos y formular el reto de innovación con precisión.",
  },
  {
    step: "03",
    name: "Idear",
    status: "Por iniciar",
    text: "Comparar alternativas y priorizar la función con mayor valor percibido.",
  },
  {
    step: "04",
    name: "Prototipar",
    status: "Vista preliminar",
    text: "Transformar la propuesta elegida en una experiencia navegable de baja fidelidad.",
  },
  {
    step: "05",
    name: "Evaluar",
    status: "Por iniciar",
    text: "Probar con usuarios, recoger evidencia y decidir qué mejorar o descartar.",
  },
];

export const faqs = [
  {
    question: "¿AulaEnlace ya es un aplicativo en funcionamiento?",
    answer:
      "No. Esta web presenta una propuesta académica y una simulación para validar necesidades antes de desarrollar el producto.",
  },
  {
    question: "¿Los datos del panel pertenecen a estudiantes reales?",
    answer:
      "No. Todos los nombres, indicadores, evaluaciones y mensajes son ficticios y se usan únicamente para demostrar la idea.",
  },
  {
    question: "¿Qué ocurre con mi respuesta?",
    answer:
      "En esta primera versión se guarda temporalmente en este dispositivo mediante almacenamiento local. No se envía a un servidor.",
  },
  {
    question: "¿Las funciones mostradas son definitivas?",
    answer:
      "No. Son hipótesis de solución. Las entrevistas y opiniones ayudarán a decidir cuál debería convertirse en la función innovadora principal.",
  },
];
