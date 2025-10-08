# Plan de implementación — Compartir CV (enlace público con descarga automática)

Este documento detalla las tareas, órdenes de trabajo, pruebas y comandos para implementar la funcionalidad "Compartir CV".

Contexto

- Repositorio: ai-resume-builder
- Objetivo: generar un enlace público único (shareToken) que permita descargar automáticamente un PDF del CV al abrirlo, sin autenticación.

Resumen de alto nivel

1. Backend: añadir campo `shareToken` y endpoint público `GET /user-resumes/by-token/:shareToken`.
2. Cliente: añadir método `GetResumeByShareToken` en `src/services/LocalDatabase.js`.
3. Cliente: crear `src/public-resume/[shareToken]/index.jsx` que renderiza y descarga el PDF.
4. Cliente: añadir UI de "Compartir" en `my-resume/[resumeId]/index.jsx` (diálogo, copiar, abrir, compartir nativo).
5. Rutas: añadir ruta pública `/share/:shareToken` en `src/main.jsx` y exentarla de redirección en `App.jsx`.
6. Pruebas: unitarias y end-to-end.

Prioridades y estimación

- Backend model + endpoint: 2-3 horas (depende de Strapi y entorno)
- Frontend básico (métodos + componentes): 3-4 horas
- QA y tests (E2E): 2-3 horas

Tareas detalladas

1. Backend — Modelo y Endpoint (Strapi)

- Añadir campo `shareToken` (string, único) al content-type `user-resume`.
- Considerar campo opcional `shareTokenExpiresAt` (DateTime) si quieres expiraciones.
- Añadir ruta pública y controlador: `GET /user-resumes/by-token/:shareToken` (auth: false).
- Validar que la respuesta no incluya datos sensibles y que `populate` cargue relaciones necesarias (experience, education, skills, languages).

Ejemplo (Strapi):

- routes (api/user-resume/routes/user-resume.js)
- controller (api/user-resume/controllers/user-resume.js)

2. Frontend — API client

- Archivo: `src/services/LocalDatabase.js`
- Añadir:

```javascript
const GetResumeByShareToken = (shareToken) =>
  axiosClient.get(
    `/user-resumes?filters[shareToken][$eq]=${shareToken}&populate=*`
  );

export default {
  // ... existentes
  GetResumeByShareToken,
};
```

3. Frontend — Componente público

- Ruta: `/share/:shareToken`
- Archivo: `src/public-resume/[shareToken]/index.jsx`
- Funcionalidad:
  - Consultar backend por shareToken.
  - Renderizar `ResumePreview` dentro de `ResumeInfoContext`.
  - Tras el render correcto, ejecutar `handleDownloadPDF()` (html2canvas + jsPDF) y `pdf.save()`.
  - Mostrar mensajes de carga/error y botón manual de descarga.

Observaciones:

- Aumentar un pequeño retardo (1-1.5s) tras la carga para permitir que estilos e imágenes finalicen el render.
- Mantener un toggle `autoDownloadDone` para evitar descargas repetidas.

4. Frontend — UI de compartir en vista del CV

- Archivo: `src/my-resume/[resumeId]/index.jsx` (ResumeView)
- Añadir diálogo con:
  - Generar enlace (genera token, llama LocalDatabase.UpdateResumeDetail)
  - Mostrar URL, botón copiar, botón abrir en nueva pestaña, compartir nativo (react-web-share)
  - Botón regenerar (revocar)

Token generation

- Prototipo: Math.random (rápido pero menos seguro).
- Producción: `crypto.randomUUID()` o Web Crypto API para mayor aleatoriedad.

5. Rutas y App

- Añadir `{ path: '/share/:shareToken', element: <PublicResumePDF /> }` en `src/main.jsx`.
- En `App.jsx` detectar rutas públicas (startsWith('/share/')) y permitir acceso sin header y sin redirección a login (cuando Clerk no esté presente).

6. Dependencias

- html2canvas y jspdf para generación de PDF en cliente.
- react-web-share para compartir nativo (opcional).

Instalación (shell - PowerShell):

```powershell
npm install html2canvas jspdf react-web-share
```

7. Tests

- Manual rápido:
  - Generar token desde UI.
  - Abrir `/share/{token}` en incógnito (sin sesión) y verificar descarga automática.
  - Verificar botón de descarga si la automática falla.
- E2E (Selenium/Playwright): script que crea CV de prueba, genera token, abre enlace y verifica que se descargó un PDF.

Comprobaciones post-merge

- Linter y build: ejecutar `npm run build` y `npm run lint`.
- Pruebas unitarias si las hay.

Rollback y revocación

- Añadir endpoint o UI para eliminar `shareToken` (revocar enlace).
- Alternativa: regenerar `shareToken`.

Notas finales

- Para producción usar generación de tokens con Web Crypto API y considerar expiración/revocación.
- Documentar en la sección de privacidad qué datos se exponen por el enlace público.

---

En el siguiente archivo `API-ENDPOINTS.md` encontrarás ejemplos concretos para Strapi y para el cliente Axios.
