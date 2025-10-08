# Sistema de Estadísticas de Visualizaciones - CV Compartido

## 📊 Funcionalidad Implementada

Sistema completo de tracking y análisis de visualizaciones para enlaces de CV compartidos.

---

## ✅ Características

### 1. **Tracking Automático**

- ✅ Registro automático de cada visualización del enlace público
- ✅ Captura de metadatos: fecha/hora, user agent, referrer
- ✅ Preparado para geolocalización (país/ciudad con API externa)

### 2. **Panel de Estadísticas**

Visible en el diálogo de "Compartir" cuando el enlace ya ha sido generado:

**Métricas mostradas:**

- 👁️ **Total de visualizaciones**: Contador total de veces que se ha accedido al enlace
- 👥 **Visitantes únicos**: Número de user agents diferentes (estimación de usuarios únicos)
- 🌍 **Días activos**: Cantidad de días distintos con al menos una visualización
- 🕐 **Última visualización**: Fecha y hora de la última vez que se accedió al enlace

### 3. **Diseño Visual**

- Panel con gradiente azul-morado
- Tarjetas individuales para cada métrica
- Iconos descriptivos (Eye, Users, Globe, TrendingUp)
- Responsive y estéticamente integrado

---

## 🗄️ Base de Datos

### Nueva Tabla: `shareViews`

```javascript
{
  id: number (auto-increment),
  shareToken: string,
  resumeId: number,
  viewedAt: Date,
  userAgent: string,
  referrer: string,
  country: string | null,  // Para implementación futura
  city: string | null      // Para implementación futura
}
```

### Índices

- `shareToken` - Para consultas rápidas por token
- `resumeId` - Para obtener todas las vistas de un CV

---

## 🔧 API - LocalDatabase

### Nuevos Métodos

#### 1. `TrackShareView(shareToken, resumeId)`

Registra una nueva visualización del enlace compartido.

**Parámetros:**

- `shareToken` (string): Token único del enlace
- `resumeId` (number): ID del CV

**Retorna:** `Promise<void>`

**Ejemplo:**

```javascript
await LocalDatabase.TrackShareView('abc-123-xyz', 42);
```

---

#### 2. `GetShareStats(resumeId)`

Obtiene estadísticas completas de visualizaciones para un CV.

**Parámetros:**

- `resumeId` (number): ID del CV

**Retorna:** `Promise<ShareStats>`

**Estructura de respuesta:**

```javascript
{
  totalViews: 127,              // Total de visualizaciones
  uniqueVisitors: 45,           // Visitantes únicos estimados
  viewsByDate: {                // Visualizaciones agrupadas por fecha
    "08/10/2025": 23,
    "07/10/2025": 15,
    // ...
  },
  lastView: Date,               // Última visualización registrada
  recentViews: [                // Últimas 10 visualizaciones
    {
      id: 1,
      shareToken: "...",
      resumeId: 42,
      viewedAt: Date,
      userAgent: "Mozilla/5.0...",
      referrer: "https://linkedin.com"
    },
    // ...
  ]
}
```

**Ejemplo:**

```javascript
const stats = await LocalDatabase.GetShareStats(42);
console.log(`Total vistas: ${stats.totalViews}`);
console.log(`Visitantes únicos: ${stats.uniqueVisitors}`);
```

---

#### 3. `GetResumeByShareToken(shareToken, trackView = false)`

**Actualizado** - Ahora acepta parámetro opcional para registrar visualización.

**Parámetros:**

- `shareToken` (string): Token del enlace
- `trackView` (boolean, opcional): Si `true`, registra la visualización automáticamente

**Ejemplo:**

```javascript
// Sin tracking
const cv = await LocalDatabase.GetResumeByShareToken('token-123');

// Con tracking (usado en página pública)
const cv = await LocalDatabase.GetResumeByShareToken('token-123', true);
```

---

## 🎯 Flujo de Uso

### Usuario Comparte el CV:

1. Abre la vista del CV (`/my-resume/:id/view`)
2. Hace clic en "Compartir"
3. Genera enlace (si no existe)
4. Copia el enlace y lo comparte

### Alguien Accede al Enlace:

1. Accede a `/share/:shareToken`
2. **Se registra automáticamente la visualización** con:
   - Token del enlace
   - ID del CV
   - Fecha/hora actual
   - User agent del navegador
   - Referrer (de dónde viene)
3. Se carga el CV y se descarga el PDF

### Usuario Revisa Estadísticas:

1. Vuelve a abrir el diálogo de "Compartir"
2. **Ve automáticamente el panel de estadísticas** si hay visualizaciones
3. Puede monitorear el alcance de su CV compartido

---

## 🚀 Mejoras Futuras Opcionales

### 1. **Geolocalización**

Añadir detección de país/ciudad usando APIs como:

- ipapi.co
- ipgeolocation.io
- GeoJS

```javascript
// Ejemplo de implementación
async TrackShareView(shareToken, resumeId) {
  const geoData = await fetch('https://ipapi.co/json/').then(r => r.json());

  const viewData = {
    shareToken,
    resumeId,
    viewedAt: new Date(),
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    country: geoData.country_name,
    city: geoData.city,
  };

  await db.shareViews.add(viewData);
}
```

### 2. **Gráfico de Visualizaciones**

Usar Chart.js o Recharts para mostrar evolución temporal:

```bash
npm install recharts
```

### 3. **Exportar Estadísticas**

Botón para descargar CSV con todas las visualizaciones:

```javascript
const exportStats = (stats) => {
  const csv = stats.recentViews
    .map((v) => `${v.viewedAt},${v.userAgent},${v.referrer}`)
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'estadisticas-cv.csv';
  a.click();
};
```

### 4. **Notificaciones**

Enviar notificación al usuario cuando alguien vea su CV:

- Email notification
- Push notification (Web Push API)
- In-app notification badge

### 5. **Análisis Avanzado**

- Tasa de conversión (visualizaciones → descargas)
- Tiempo promedio en la página
- Dispositivos más comunes (desktop/mobile)
- Navegadores más usados

---

## 🧪 Cómo Probar

1. **Generar enlace compartido:**

   ```
   http://localhost:5173/my-resume/1/view
   → Click "Compartir" → "Generar enlace"
   ```

2. **Abrir enlace público (varias veces):**

   ```
   http://localhost:5173/share/tu-token-aqui
   ```

3. **Ver estadísticas:**
   ```
   Volver a /my-resume/1/view → "Compartir"
   → Ver panel de estadísticas
   ```

---

## 📝 Notas Técnicas

- **Privacidad**: No se almacena IP directamente (solo user agent)
- **Performance**: Índices optimizados para consultas rápidas
- **Escalabilidad**: Sistema preparado para miles de visualizaciones
- **Compatibilidad**: Funciona en todos los navegadores modernos

---

## ✨ Resultado Final

✅ **Tracking automático** de cada visualización  
✅ **Panel visual** con métricas clave  
✅ **Base de datos** optimizada  
✅ **API completa** para gestión de estadísticas  
✅ **Extensible** para futuras mejoras

---

**Implementado:** 8 de octubre de 2025  
**Versión de BD:** 6  
**Estado:** ✅ Completamente funcional
