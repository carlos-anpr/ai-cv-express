<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# En este codigo, quiero implementar la funcionalidad de compartir enlace que se gener un docuemento publico que no haga falta autenticarse con clerk,

Que se descargue el pdf automaticamente al ir al enlace.

Para implementar la funcionalidad de compartir enlace público donde el PDF se descargue automáticamente sin necesidad de autenticación con Clerk, necesitas hacer los siguientes cambios:[^1]

---

title: "Compartir CV: diseño y plan de implementación"
author: Equipo AI Resume Builder
created: 2025-10-08

---

## Resumen

Este documento agrupa la especificación, las decisiones de diseño y el plan de ejecución para implementar la funcionalidad "Compartir CV" mediante un enlace público que, al abrirse, genera y descarga automáticamente un PDF sin requerir autenticación (Clerk). He eliminado contenido repetido y añadido documentos de apoyo con pasos detallados.

Archivos adicionales creados en esta carpeta:

- `IMPLEMENTATION-PLAN.md` — plan de ejecución con tareas, pruebas y comandos.
- `API-ENDPOINTS.md` — especificación y ejemplos de endpoints (Strapi y cliente).

## Objetivo funcional

- Permitir que un usuario genere un enlace público único (shareToken) para su CV.
- El enlace público debe ser accesible sin autenticación.
- Al abrir la URL pública, la vista debe renderizar el CV y descargar automáticamente un PDF.

## Requisitos (resumidos)

- Frontend: botón para generar/copiar/enviar el enlace; página pública que renderiza el CV y lanza la descarga.
- Backend: endpoint público que devuelve el CV por su token; campo `shareToken` en el modelo de CV.
- Compatibilidad: que funcione tanto en desktop como en móviles (comportamiento nativo de compartir cuando sea posible).
- Seguridad: token suficientemente fuerte (aleatorio y no predecible), expiración opcional y/o revocación.

## Diseño técnico (alto nivel)

- Campo en modelo: `shareToken` (string, único, indexado).
- API pública: GET /user-resumes/by-token/:shareToken (auth: false) — devuelve CV y relaciones necesarias.
- Cliente: ruta pública `/share/:shareToken` que:
  - consulta el backend por token,
  - renderiza el CV con `ResumePreview` dentro de un `ResumeInfoContext`,
  - genera un PDF (html2canvas + jsPDF) y fuerza la descarga automáticamente.

## Componentes y cambios principales (mapa)

- src/services/LocalDatabase.js: agregar método GetResumeByShareToken.
- src/my-resume/[resumeId]/index.jsx (ResumeView): añadir botón/diálogo "Compartir" para generar/copiar/enviar link.
- src/public-resume/[shareToken]/index.jsx (PublicResumePDF): página pública que carga el CV y descarga el PDF.
- src/main.jsx: añadir ruta pública `/share/:shareToken` y mantener la página pública fuera de la redirección de Clerk en `App.jsx`.
- Backend (Strapi o similar): nuevo endpoint público para consultar por `shareToken`.

## Consideraciones importantes y edge-cases

- Generación de token: usar una función con suficiente entropía (crypto.randomUUID o crypto APIs cuando sea posible). Evitar Math.random en producción.
- Validez / expiración: considerar campo `shareTokenExpiresAt` o revocarlo desde la UI (botón "revocar enlace").
- Privacidad: no incluir datos sensibles en la respuesta pública.
- CORS y assets: si el CV carga imágenes externas, asegurar que html2canvas pueda usarlas (useCORS + cabeceras CORS o servir imágenes desde el mismo dominio).
- Tiempos de render: esperar a que el DOM esté listo antes de capturar; agregar un fallback de botón manual para descargar si la automática falla.

## Seguridad y mitigaciones

- Token: generar con Web Crypto API (por ejemplo, crypto.randomUUID() o un hash aleatorio de 32+ bytes).
- Rate limiting: proteger endpoint público de scraping (limitar peticiones por IP si procede).
- Revocación: permitir que el usuario regenere o elimine el shareToken.

## Pruebas mínimas (aceptación)

- Generar enlace en la vista del CV: el token se persiste en la base de datos.
- Copiar enlace: contenido correcto y clicable.
- Acceso público: GET /share/:token renderiza la vista pública sin redirección a login.
- Descarga automática: al abrir /share/:token el navegador descarga un PDF con el contenido visible.
- Fallback manual: si la automática falla, el botón "Descargar PDF" funciona.

## Siguientes pasos (plan rápido)

1. Backend: añadir `shareToken` al modelo y endpoint público. (Ver `API-ENDPOINTS.md`)
2. Cliente: añadir método en `LocalDatabase.js` y componente público `PublicResumePDF`.
3. Cliente: añadir UI en `ResumeView` con diálogo de compartir y botones de copia/abrir/compartir.
4. Rutas: añadir `/share/:shareToken` y adaptar `App.jsx` para permitir rutas públicas.
5. Tests: pruebas end-to-end para flujo completo (generar -> abrir enlace -> descargar).
6. QA y despliegue: revisar CORS y assets; pruebas en móviles.

---

Para detalles de implementación paso a paso, código de ejemplo y comandos, abre:

- `IMPLEMENTATION-PLAN.md`
- `API-ENDPOINTS.md`

---

## Mapa rápido de cobertura de requisitos

- Revisión y desduplicación del contenido: He consolidado las secciones repetidas y creado documentos de apoyo. (Done)
- Plan de ejecución paso a paso: Agregado en `IMPLEMENTATION-PLAN.md`. (Done)
- Especificación de endpoints y ejemplos Strapi: Agregado en `API-ENDPOINTS.md`. (Done)

---

Si quieres que empiece a implementar los archivos concretos en el código (crear los componentes React, actualizar `LocalDatabase.js`, modificar rutas y/o el backend Strapi), dime si prefieres que use el token simple (Math.random) para prototipo o que implemente generación con Web Crypto API (recomendado en producción). También puedo crear PRs o commits directos si quieres que aplique los cambios en el repo ahora.
