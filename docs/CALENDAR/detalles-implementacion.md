Perfecto, ya tengo una comprensión completa del código. Ahora voy a planificar meticulosamente la implementación del calendario de entrevistas.[1]

## **Plan de Implementación: Calendario de Entrevistas**

### **1. Análisis de la Estructura Actual**

Del código analizado, identifico:

- **JobApplications**: Contiene campos `interviewDate` e `interviewLink`[1]
- **LocalDatabase**: Tiene métodos para obtener candidaturas por CV[1]
- **UI Components**: Ya existen componentes de Calendar, Cards, Badges[1]
- **Routing**: El dashboard principal está en `/dashboard`[1]

---

### **2. Arquitectura de la Solución**

#### **Componentes a Crear**

**A. Componente Principal: `InterviewCalendar.jsx`**

- Ubicación: `src/dashboard/components/InterviewCalendar.jsx`
- Responsabilidades:
  - Mostrar calendario mensual con entrevistas marcadas
  - Permitir navegación entre meses
  - Manejar click en días con entrevistas
  - Mostrar modal con detalles al hacer clic

**B. Componente Auxiliar: `UpcomingInterviews.jsx`**

- Ubicación: `src/dashboard/components/UpcomingInterviews.jsx`
- Responsabilidades:
  - Listar las 10 entrevistas más próximas
  - Ordenar por fecha ascendente (más tempranas primero)
  - Mostrar información compacta de cada entrevista
  - Permitir navegación a la oferta

**C. Componente Cabecera: `InterviewsHeader.jsx`**

- Ubicación: `src/dashboard/components/InterviewsHeader.jsx`
- Responsabilidades:
  - Mostrar contador de entrevistas del mes actual
  - Calcular desde HOY hasta fin de mes
  - Diseño llamativo y visible

**D. Vista Completa: `InterviewsPage.jsx`**

- Ubicación: `src/dashboard/interviews/index.jsx`
- Responsabilidades:
  - Integrar todos los componentes
  - Gestionar el estado global
  - Cargar datos de entrevistas

---

### **3. Estructura de Datos**

```javascript
// Formato de entrevista procesada
{
  id: number,              // ID de la candidatura
  jobTitle: string,        // Título del puesto
  companyName: string,     // Nombre de la empresa
  interviewDate: string,   // Fecha ISO
  interviewLink: string,   // Enlace videollamada
  resumeId: string,        // ID del CV asociado
  status: string,          // Estado de la candidatura
  location: string,        // Ubicación
  // Campos calculados
  isPast: boolean,         // Si ya pasó
  isToday: boolean,        // Si es hoy
  daysUntil: number        // Días hasta la entrevista
}
```

---

### **4. Métodos de Base de Datos Necesarios**

**Añadir a `LocalDatabase.js`:**

```javascript
// Obtener todas las entrevistas de un usuario
async GetAllInterviews(userEmail) {
  await this.ensureDatabaseReady();
  try {
    const applications = await db.jobApplications
      .where('userEmail').equals(userEmail)
      .filter(app => app.interviewDate != null)
      .toArray();

    return {
      success: true,
      data: applications
    };
  } catch (error) {
    throw new Error('Error al obtener entrevistas: ' + error.message);
  }
}

// Obtener entrevistas de un mes específico
async GetInterviewsByMonth(userEmail, year, month) {
  await this.ensureDatabaseReady();
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const applications = await db.jobApplications
      .where('userEmail').equals(userEmail)
      .filter(app => {
        if (!app.interviewDate) return false;
        const interviewDate = new Date(app.interviewDate);
        return interviewDate >= startDate && interviewDate <= endDate;
      })
      .toArray();

    return {
      success: true,
      data: applications
    };
  } catch (error) {
    throw new Error('Error al obtener entrevistas del mes: ' + error.message);
  }
}
```

---

### **5. Componente del Calendario**

**`InterviewCalendar.jsx`:**

```jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Video, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function InterviewCalendar({ interviews, onMonthChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calcular días del mes
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  // Agrupar entrevistas por día
  const interviewsByDay = interviews.reduce((acc, interview) => {
    const date = new Date(interview.interviewDate);
    if (date.getMonth() === month && date.getFullYear() === year) {
      const day = date.getDate();
      if (!acc[day]) acc[day] = [];
      acc[day].push(interview);
    }
    return acc;
  }, {});

  // Navegación de meses
  const goToPreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate.getFullYear(), newDate.getMonth());
  };

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate.getFullYear(), newDate.getMonth());
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onMonthChange?.(today.getFullYear(), today.getMonth());
  };

  // Renderizar días del calendario
  const renderCalendarDays = () => {
    const days = [];

    // Días vacíos al inicio
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 h-24" />);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const hasInterviews = interviewsByDay[day]?.length > 0;
      const isToday =
        new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          className={`
            p-2 h-24 border border-gray-200 rounded-lg transition-all
            ${
              hasInterviews
                ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
                : 'bg-white'
            }
            ${isToday ? 'ring-2 ring-blue-500' : ''}
          `}
          onClick={() => hasInterviews && handleDayClick(day)}
        >
          <div
            className={`text-sm font-medium ${
              isToday ? 'text-blue-600' : 'text-gray-900'
            }`}
          >
            {day}
          </div>
          {hasInterviews && (
            <div className="mt-1 space-y-1">
              {interviewsByDay[day].slice(0, 2).map((interview, idx) => (
                <div
                  key={idx}
                  className="text-xs p-1 bg-blue-600 text-white rounded truncate"
                  title={`${interview.companyName} - ${interview.jobTitle}`}
                >
                  {interview.companyName}
                </div>
              ))}
              {interviewsByDay[day].length > 2 && (
                <div className="text-xs text-blue-600 font-medium">
                  +{interviewsByDay[day].length - 2} más
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const handleDayClick = (day) => {
    // Aquí podrías abrir un modal con detalles
    const dayInterviews = interviewsByDay[day];
    if (dayInterviews?.length === 1) {
      // Si solo hay una, navegar directamente
      navigate(
        `/dashboard/resume/${dayInterviews[0].resumeId}/job-applications/${dayInterviews[0].id}`
      );
    }
    // Si hay múltiples, podrías mostrar un modal de selección
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {MONTHS[month]} {year}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoy
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-600 p-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>
      </CardContent>
    </Card>
  );
}

export default InterviewCalendar;
```

---

### **6. Lista de Próximas Entrevistas**

**`UpcomingInterviews.jsx`:**

```jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Video,
  Building,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function UpcomingInterviews({ interviews }) {
  const navigate = useNavigate();

  // Filtrar solo entrevistas futuras o de hoy
  const upcomingInterviews = interviews
    .filter((interview) => {
      const interviewDate = new Date(interview.interviewDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return interviewDate >= today;
    })
    .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
    .slice(0, 10);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntil = (dateString) => {
    const interviewDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    interviewDate.setHours(0, 0, 0, 0);

    const diffTime = interviewDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Hoy', urgent: true };
    if (diffDays === 1) return { text: 'Mañana', urgent: true };
    if (diffDays <= 3) return { text: `En ${diffDays} días`, urgent: true };
    return { text: `En ${diffDays} días`, urgent: false };
  };

  const handleInterviewClick = (interview) => {
    navigate(
      `/dashboard/resume/${interview.resumeId}/job-applications/${interview.id}`
    );
  };

  if (upcomingInterviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximas Entrevistas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tienes entrevistas programadas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Próximas Entrevistas</CardTitle>
          <Badge variant="outline">
            {upcomingInterviews.length} entrevistas
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingInterviews.map((interview) => {
          const daysUntil = getDaysUntil(interview.interviewDate);

          return (
            <div
              key={interview.id}
              onClick={() => handleInterviewClick(interview)}
              className={`
                p-4 rounded-lg border transition-all cursor-pointer
                ${
                  daysUntil.urgent
                    ? 'bg-red-50 border-red-200 hover:bg-red-100'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              {/* Cabecera */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 line-clamp-1">
                    {interview.jobTitle}
                  </h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Building className="w-3.5 h-3.5" />
                    {interview.companyName}
                  </p>
                </div>
                <Badge
                  className={daysUntil.urgent ? 'bg-red-600' : 'bg-blue-600'}
                >
                  {daysUntil.text}
                </Badge>
              </div>

              {/* Detalles */}
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(interview.interviewDate)}</span>
                </div>

                {interview.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{interview.location}</span>
                  </div>
                )}

                {interview.interviewLink && (
                  <a
                    href={interview.interviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Unirse a la entrevista</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default UpcomingInterviews;
```

---

### **7. Cabecera con Contador**

**`InterviewsHeader.jsx`:**

```jsx
import React from 'react';
import { Calendar, Clock } from 'lucide-react';

function InterviewsHeader({ interviews }) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Calcular entrevistas del mes actual desde HOY hasta fin de mes
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

  const monthInterviewsCount = interviews.filter((interview) => {
    const interviewDate = new Date(interview.interviewDate);
    return (
      interviewDate >= today &&
      interviewDate <= endOfMonth &&
      interviewDate.getMonth() === currentMonth &&
      interviewDate.getFullYear() === currentYear
    );
  }).length;

  const monthName = today.toLocaleDateString('es-ES', { month: 'long' });

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Entrevistas Programadas</h2>
          <p className="text-blue-100">
            Gestiona y prepara tus próximas entrevistas
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <Calendar className="w-5 h-5" />
            <span className="text-blue-100 capitalize">
              Este mes ({monthName})
            </span>
          </div>
          <div className="text-5xl font-bold">{monthInterviewsCount}</div>
          <p className="text-blue-100 text-sm mt-1">
            {monthInterviewsCount === 1
              ? 'entrevista por hacer'
              : 'entrevistas por hacer'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default InterviewsHeader;
```

---

### **8. Vista Principal**

**`src/dashboard/interviews/index.jsx`:**

```jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import LocalDatabase from '@/services/LocalDatabase';
import InterviewsHeader from '../components/InterviewsHeader';
import InterviewCalendar from '../components/InterviewCalendar';
import UpcomingInterviews from '../components/UpcomingInterviews';
import { toast } from 'sonner';

function InterviewsPage() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadInterviews();
  }, [user]);

  const loadInterviews = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      setLoading(true);
      const response = await LocalDatabase.GetAllInterviews(
        user.primaryEmailAddress.emailAddress
      );

      if (response.success) {
        setInterviews(response.data || []);
      }
    } catch (error) {
      console.error('Error cargando entrevistas:', error);
      toast.error('Error al cargar las entrevistas');
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (year, month) => {
    setCurrentMonth(new Date(year, month, 1));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando entrevistas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabecera con contador */}
      <InterviewsHeader interviews={interviews} />

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario (2/3) */}
        <div className="lg:col-span-2">
          <InterviewCalendar
            interviews={interviews}
            onMonthChange={handleMonthChange}
          />
        </div>

        {/* Próximas entrevistas (1/3) */}
        <div>
          <UpcomingInterviews interviews={interviews} />
        </div>
      </div>
    </div>
  );
}

export default InterviewsPage;
```

---

### **9. Routing**

**Actualizar `src/main.jsx`:**

```jsx
import InterviewsPage from './dashboard/interviews';

// Añadir en las rutas:
{
  path: '/dashboard/interviews',
  element: <InterviewsPage />
}
```

**Añadir enlace en el Header o Dashboard:**

```jsx
<Link to="/dashboard/interviews">
  <Button variant="ghost" className="flex items-center gap-2">
    <Calendar className="w-4 h-4" />
    Entrevistas
  </Button>
</Link>
```

---

### **10. Mejoras Opcionales**

1. **Modal de Detalles**: Al hacer clic en un día con múltiples entrevistas
2. **Filtros**: Por estado, empresa, etc.
3. **Exportar**: Exportar a Google Calendar / iCal
4. **Notificaciones**: Recordatorios antes de entrevistas
5. **Estadísticas**: Tasa de conversión, entrevistas por mes, etc.

---

### **11. Testing**

**Casos de prueba:**

- ✅ Mostrar calendario correctamente
- ✅ Días con entrevistas destacados
- ✅ Click abre oferta correcta
- ✅ Contador del mes actual preciso
- ✅ Lista ordenada correctamente
- ✅ Manejo de 0 entrevistas
- ✅ Navegación entre meses
- ✅ Responsive en móvil

---

### **12. Resumen de Archivos a Crear/Modificar**

**Nuevos archivos:**

1. `src/dashboard/components/InterviewCalendar.jsx`
2. `src/dashboard/components/UpcomingInterviews.jsx`
3. `src/dashboard/components/InterviewsHeader.jsx`
4. `src/dashboard/interviews/index.jsx`

**Archivos a modificar:**

1. `src/services/LocalDatabase.js` - Añadir métodos `GetAllInterviews` y `GetInterviewsByMonth`
2. `src/main.jsx` - Añadir ruta `/dashboard/interviews`
3. `src/dashboard/components/Header.jsx` o `Dashboard/index.jsx` - Añadir enlace al calendario

---

Esta planificación proporciona una implementación completa, modular y escalable del calendario de entrevistas solicitado. ¿Quieres que proceda con la generación del código completo o prefieres ajustar algún aspecto del plan?
