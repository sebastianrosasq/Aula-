# AulaEnlace

Página web de validación para un proyecto académico de innovación educativa. Presenta el problema, explica la propuesta, simula un futuro panel docente y recoge votos y respuestas sin utilizar un backend.

## Tecnologías

- React y TypeScript
- Vite mediante Vinext
- Tailwind CSS
- Lucide React y Framer Motion
- React Hook Form y Zod
- LocalStorage
- ESLint y Prettier

## Ejecutar el proyecto

Requiere Node.js 22.13 o posterior.

```bash
npm install
npm run dev
```

Después abre la dirección local que aparece en la terminal.

## Validar antes de publicar

```bash
npm run lint
npm run format:check
npm run build
```

## Dónde modificar el contenido

- `data/content.ts`: navegación, problemas, usuarios, funciones, proceso y preguntas frecuentes.
- `data/prototype.ts`: estudiantes, asistencia, evaluaciones y comunicaciones ficticias.
- `data/form-options.ts`: opciones del formulario.
- `components/prototype`: simulación del panel docente.
- `components/forms`: formulario de validación.
- `schemas`: reglas de validación con Zod.
- `app/globals.css`: identidad visual y comportamiento responsive.

## Almacenamiento

Los votos y formularios se guardan únicamente en el LocalStorage del navegador. No se envía información a servicios externos. Para reiniciar la demostración, borra los datos del sitio desde las herramientas del navegador.

## Preparación futura

La lógica de persistencia está aislada en `utils/storage.ts`, por lo que puede sustituirse por llamadas a una API cuando el proyecto avance a una siguiente etapa.
