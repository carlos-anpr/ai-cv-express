# API Endpoints — Compartir CV (ejemplos)

Este documento contiene ejemplos y notas para implementar el endpoint público (Strapi) y las llamadas desde el cliente.

## 1) Strapi — Ruta pública: buscar por shareToken

Rutas: `api/user-resume/routes/user-resume.js`

```javascript
module.exports = {
  routes: [
    // ... otras rutas
    {
      method: 'GET',
      path: '/user-resumes/by-token/:shareToken',
      handler: 'user-resume.findByShareToken',
      config: {
        auth: false, // Público
      },
    },
  ],
};
```

Controlador: `api/user-resume/controllers/user-resume.js`

```javascript
module.exports = {
  async findByShareToken(ctx) {
    const { shareToken } = ctx.params;

    const resume = await strapi.db
      .query('api::user-resume.user-resume')
      .findOne({
        where: { shareToken },
        populate: ['experience', 'education', 'skills', 'languages'],
      });

    if (!resume) {
      return ctx.notFound('CV no encontrado');
    }

    // Opcional: eliminar datos sensibles antes de devolver
    // delete resume.sensitiveField;

    return resume;
  },
};
```

Notas Strapi:

- Marcar `auth: false` en la ruta para permitir acceso público.
- Asegurar que los roles/permisos no bloqueen la entidad en la configuración general si se accede mediante collection queries.
- Considerar añadir limitadores por IP/headers si preocupa scraping.

## 2) Strapi alternativo — query por filtros (collection)

Si prefieres no crear una ruta personalizada, puedes exponer una collection con filtros y ajustar permisos en la UI de Strapi para permitir GET por `shareToken`. Ejemplo de cliente:

```http
GET /api/user-resumes?filters[shareToken][$eq]={shareToken}&populate=*
```

Asegúrate de que la entidad y sus relaciones estén configuradas para ser visibles públicamente.

## 3) Cliente — LocalDatabase.js (axios)

Ejemplo de método a añadir en `src/services/LocalDatabase.js`:

```javascript
const GetResumeByShareToken = (shareToken) =>
  axiosClient.get(
    `/user-resumes?filters[shareToken][$eq]=${shareToken}&populate=*`
  );

export default {
  CreateNewResume,
  GetUserResumes,
  UpdateResumeDetail,
  GetResumeById,
  DeleteResumeById,
  GetResumeByShareToken,
};
```

O si usas ruta personalizada:

```javascript
const GetResumeByShareToken = (shareToken) =>
  axiosClient.get(`/user-resumes/by-token/${shareToken}`);
```

## 4) Ejemplo de respuesta esperada (JSON)

```json
{
  "id": 123,
  "firstName": "Ana",
  "lastName": "Perez",
  "title": "Full Stack Developer",
  "experience": [ ... ],
  "education": [ ... ],
  "skills": [ ... ],
  "shareToken": "abc123...",
}
```

## 5) Seguridad / recomendaciones

- No exponer datos sensibles (dni, passwords, tokens de terceros).
- Añadir expiración o revocación del token si se requiere control.
- Uso de Web Crypto API para generación de tokens en frontend o backend (preferible backend).

---

Si quieres, aplico los cambios concretos en el código (añadir método en LocalDatabase, crear componente público y actualizar rutas). Indica si prefieres que implemente la generación segura del token (`crypto.randomUUID()`), o usar Math.random() temporalmente para prototipos.
