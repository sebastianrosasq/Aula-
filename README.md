# Aula+

Aplicación educativa con paneles diferenciados para administración, docentes, estudiantes y familias. La información académica se guarda en MySQL; el navegador no usa LocalStorage para datos institucionales.

## Capacidades implementadas

- Inicio de sesión con correo y contraseña, contraseñas hash bcrypt y sesiones opacas en cookies HttpOnly.
- Permisos comprobados en servidor para cada rol.
- Horario contextual del docente: identifica la clase vigente o siguiente y prioriza el acceso a asistencia.
- Registro masivo de asistencia con búsqueda. Una ausencia nueva crea una notificación persistente para las familias vinculadas.
- Bandeja de mensajes con destinatarios restringidos a los vínculos reales entre aula, docente, estudiante y familia.
- Esquema MySQL con aulas, matrículas, horario, competencias, evaluaciones AD/A/B/C, conclusiones, alertas, mensajes y notificaciones.

## Requisitos

- Node.js 22.13 o superior.
- MySQL 8.0 o compatible.

## Puesta en marcha local

1. Instala dependencias:

   \`\`\`bash
   npm install
   \`\`\`

2. Copia \`.env.example\` como \`.env.local\` y reemplaza sus valores con la conexión de MySQL local. No subas este archivo al repositorio.

3. Genera y aplica el esquema:

   \`\`\`bash
   npm run db:generate
   npm run db:push
   \`\`\`

4. Crea cuentas y los vínculos institucionales directamente en MySQL o desde un futuro módulo administrativo. Las contraseñas deben guardarse con bcrypt; no se incluyen usuarios ficticios ni datos académicos de ejemplo.

5. Inicia la aplicación:

   \`\`\`bash
   npm run dev
   \`\`\`

   Luego abre [http://localhost:5173](http://localhost:5173).

## Validación

\`\`\`bash
npm run lint
npm run format:check
npm run build
\`\`\`

## Organización

- \`app/api\`: endpoints protegidos de autenticación, asistencia y mensajes.
- \`app/panel\`: paneles autenticados y pantallas de acciones rápidas.
- \`db/schema.ts\`: modelo relacional Drizzle/MySQL.
- \`db/queries.ts\`: consultas de contexto y vistas por rol.
- \`lib/auth.ts\`: sesión segura y verificación de contraseña.

## Despliegue posterior en Cloudflare

La interfaz y los contratos de datos están aislados del navegador. La implementación actual de MySQL usa \`mysql2\`, apropiada para desarrollo o un runtime Node. Cloudflare Workers no permite conexiones TCP directas a MySQL: antes de desplegar allí, sustituye \`db/index.ts\` por un adaptador HTTP o Cloudflare Hyperdrive y conserva los mismos contratos de \`db/queries.ts\` y las rutas API. Las credenciales deben configurarse como secretos de Cloudflare, nunca como variables públicas.
