Comprendo perfectamente tu feedback. Tienes toda la razón: el diseño anterior era poco profesional, sobrecargado y no seguía la armonía del homepage. Voy a crear un diseño realmente profesional, minimalista y elegante que fluya con los colores y el estilo del homepage.[1]

## Rediseño Profesional y Minimalista - Página de Candidaturas

### **Filosofía de Diseño**

- **Minimalismo elegante**: Espacios generosos, tipografía limpia
- **Armonía cromática**: Negro para textos y elementos destacados, grises claros para fondos
- **Profesionalismo**: Sin colores chillones, transiciones suaves
- **Usabilidad**: Información clara y accesible, jerarquía visual

---

## **Ficheros a Modificar**

### **1. src/dashboard/resume/[resumeId]/job-applications/index.jsx**

**Propósito**: Página principal con diseño limpio y profesional

```jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Briefcase,
  FileText,
  MessageSquare,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import JobApplicationCard from './components/JobApplicationCard';
import LocalDatabase from '@/services/LocalDatabase';
import { toast } from 'sonner';

function JobApplications() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeInfo, setResumeInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [coverLetterStats, setCoverLetterStats] = useState(0);

  // ... mantener funciones loadCoverLetterStats, loadApplications, loadResumeInfo, useEffect

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-black mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Cargando candidaturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Minimalista */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Título */}
            <div className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-black -ml-3 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al dashboard
              </Button>

              <h1 className="text-3xl font-bold text-black mb-2">
                Mis Candidaturas
              </h1>
              <p className="text-gray-600">
                {resumeInfo?.firstName && resumeInfo?.lastName
                  ? `CV de ${resumeInfo.firstName} ${resumeInfo.lastName}`
                  : 'Gestiona y realiza seguimiento de tus candidaturas'}
              </p>
            </div>

            {/* Botón Nueva Candidatura */}
            <Button
              onClick={() =>
                navigate(`/dashboard/resume/${resumeId}/job-applications/new`)
              }
              className="bg-black text-white hover:bg-gray-900 px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Candidatura
            </Button>
          </div>

          {/* Estadísticas Minimalistas */}
          {applications.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Total
                  </span>
                  <Briefcase className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-black">
                  {applications.length}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Enviadas
                  </span>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <p className="text-2xl font-bold text-black">
                  {
                    applications.filter((app) => app.status === 'applied')
                      .length
                  }
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Entrevistas
                  </span>
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-black">
                  {
                    applications.filter((app) => app.status === 'interview')
                      .length
                  }
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Con Carta
                  </span>
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-black">
                  {coverLetterStats}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtros Minimalistas */}
        {applications.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por empresa, puesto o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-11 border-gray-200 focus:border-black focus:ring-1 focus:ring-black rounded-lg bg-white"
                />
              </div>

              {/* Filtros Estado */}
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className={
                    statusFilter === 'all'
                      ? 'bg-black text-white hover:bg-gray-900 border-0'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                  }
                >
                  Todas
                </Button>
                <Button
                  variant={statusFilter === 'draft' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('draft')}
                  className={
                    statusFilter === 'draft'
                      ? 'bg-black text-white hover:bg-gray-900 border-0'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                  }
                >
                  Borradores
                </Button>
                <Button
                  variant={statusFilter === 'applied' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('applied')}
                  className={
                    statusFilter === 'applied'
                      ? 'bg-black text-white hover:bg-gray-900 border-0'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                  }
                >
                  Enviadas
                </Button>
                <Button
                  variant={statusFilter === 'interview' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('interview')}
                  className={
                    statusFilter === 'interview'
                      ? 'bg-black text-white hover:bg-gray-900 border-0'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                  }
                >
                  Entrevistas
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Candidaturas */}
        {filteredApplications.length === 0 && applications.length === 0 ? (
          // Estado Vacío Minimalista
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-6">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-3">
              No tienes candidaturas aún
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Crea tu primera candidatura y comienza a realizar seguimiento
              profesional
            </p>
            <Button
              onClick={() =>
                navigate(`/dashboard/resume/${resumeId}/job-applications/new`)
              }
              className="bg-black text-white hover:bg-gray-900 px-6 py-2.5 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Candidatura
            </Button>
          </div>
        ) : filteredApplications.length === 0 ? (
          // No hay resultados
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">
              No se encontraron candidaturas
            </h3>
            <p className="text-gray-600 mb-6">
              Prueba a cambiar los filtros o el término de búsqueda
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="border-gray-200 bg-white"
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          // Grid de Cards
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <JobApplicationCard
                key={application.id}
                application={application}
                resumeId={resumeId}
                onDelete={handleDeleteApplication}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobApplications;
```

**Detalles clave**:

1. **Fondo blanco limpio** sin gradientes
2. **Header simple** con border-bottom gris claro
3. **Estadísticas en cajas grises claras** (bg-gray-50) con bordes sutiles
4. **Botones negros** con hover gris oscuro
5. **Tipografía clara**: Títulos bold negros, textos gray-600
6. **Espaciado generoso**: py-6, px-6, gap-6
7. **Sin iconos de colores chillones**: solo negro y grises

---

### **2. src/dashboard/resume/[resumeId]/job-applications/components/JobApplicationCard.jsx**

**Propósito**: Card elegante, minimalista, con fecha de entrevista integrada

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatusBadge from './StatusBadge';
import QuickActions from './QuickActions';
import {
  MapPin,
  Euro,
  Calendar,
  Building,
  Clock,
  FileText,
  MessageSquare,
  ExternalLink,
  Video,
  Bell,
} from 'lucide-react';

const JobApplicationCard = ({
  application,
  resumeId,
  onDelete,
  onStatusChange,
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return null;
    return new Intl.NumberFormat('es-ES').format(salary);
  };

  const handleCardClick = () => {
    navigate(
      `/dashboard/resume/${resumeId}/job-applications/${application.id}`
    );
  };

  const getDaysAgo = (date) => {
    const diffTime = Date.now() - new Date(date).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  // Calcular si la entrevista es próxima (dentro de 3 días)
  const getInterviewUrgency = (interviewDate) => {
    if (!interviewDate) return null;
    const diff = new Date(interviewDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { status: 'past', label: 'Realizada', urgent: false };
    if (days === 0) return { status: 'today', label: 'Hoy', urgent: true };
    if (days === 1)
      return { status: 'tomorrow', label: 'Mañana', urgent: true };
    if (days <= 3)
      return { status: 'soon', label: `En ${days} días`, urgent: true };
    return {
      status: 'scheduled',
      label: formatDate(interviewDate),
      urgent: false,
    };
  };

  const interviewInfo = getInterviewUrgency(application.interviewDate);

  return (
    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group border border-gray-200 bg-white">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex items-start gap-3 flex-1 min-w-0"
            onClick={handleCardClick}
          >
            {/* Icono Empresa */}
            <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg flex-shrink-0">
              <Building className="w-5 h-5 text-gray-600" />
            </div>

            {/* Título y Empresa */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-black line-clamp-2 leading-tight mb-1">
                {application.jobTitle}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {application.companyName}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions
            application={application}
            resumeId={resumeId}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        </div>

        {/* Estado */}
        <div className="mb-4" onClick={handleCardClick}>
          <StatusBadge status={application.status} showIcon={false} size="sm" />
        </div>

        {/* ALERTA DE ENTREVISTA - Integrada con elegancia */}
        {application.interviewDate && interviewInfo && (
          <div
            className={`mb-4 p-3 rounded-lg border transition-all ${
              interviewInfo.urgent
                ? 'bg-black text-white border-black'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {interviewInfo.urgent ? (
                  <Bell className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <Calendar className="w-4 h-4 flex-shrink-0 text-gray-600" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold mb-0.5 ${
                      interviewInfo.urgent ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Entrevista
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      interviewInfo.urgent ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {interviewInfo.label}
                  </p>
                </div>
              </div>

              {/* Botón Enlace */}
              {application.interviewLink && interviewInfo.status !== 'past' && (
                <a
                  href={application.interviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                    interviewInfo.urgent
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Unirse
                </a>
              )}
            </div>
          </div>
        )}

        {/* Información Adicional */}
        <div className="space-y-2 mb-4" onClick={handleCardClick}>
          {/* Ubicación y Salario */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {application.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{application.location}</span>
              </div>
            )}
            {application.salary && (
              <div className="flex items-center gap-1.5">
                <Euro className="w-3.5 h-3.5 text-gray-400" />
                <span>{formatSalary(application.salary)}</span>
              </div>
            )}
          </div>

          {/* Modalidad */}
          {application.workMode && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded text-xs text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              <span className="capitalize font-medium">
                {application.workMode}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="pt-3 border-t border-gray-100"
          onClick={handleCardClick}
        >
          <div className="flex items-center justify-between">
            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {application.coverLetterGenerated && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  <FileText className="w-3 h-3" />
                  Carta
                </span>
              )}
              {application.interviewSimulated && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  <MessageSquare className="w-3 h-3" />
                  Test
                </span>
              )}
              {application.jobUrl && (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Oferta
                </a>
              )}
            </div>

            {/* Fecha */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{getDaysAgo(application.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobApplicationCard;
```

**Detalles clave**:

1. **Card blanco** con border gris claro (border-gray-200)
2. **Hover suave**: shadow-md, sin scale
3. **Icono empresa** en cuadrado gris claro redondeado
4. **Bloque entrevista**:
   - **Urgente** (hoy/mañana/3 días): fondo negro, texto blanco, botón blanco
   - **Programada**: fondo gris claro, texto negro, botón negro
   - **Pasada**: fondo gris claro, sin botón
5. **Sin colores chillones**: solo negro, blanco, grises
6. **Badges minimalistas**: bg-gray-100 con texto gray-700
7. **Espaciado limpio**: p-6, gap-3, mb-4

---

### **3. src/dashboard/resume/[resumeId]/job-applications/components/StatusBadge.jsx**

**Propósito**: Badge minimalista con colores sutiles

```jsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusLabel } from '@/services/types';

const StatusBadge = ({ status, showIcon = false, size = 'default' }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'applied':
        return 'bg-gray-900 text-white border-gray-900';
      case 'interview':
        return 'bg-black text-white border-black';
      case 'rejected':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'accepted':
        return 'bg-black text-white border-black';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1',
    default: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <Badge
      className={`${getStatusStyle(status)} border ${
        sizeClasses[size]
      } inline-flex items-center gap-1.5 rounded-md font-medium`}
    >
      {getStatusLabel(status)}
    </Badge>
  );
};

export default StatusBadge;
```

**Detalles**:

1. **Sin iconos** (más limpio)
2. **Colores sutiles**: grises para draft/rejected, negro para importantes
3. **Border matching**: border color igual al background
4. **Font-medium** en lugar de semibold

---

### **4. Estilos CSS adicionales (si es necesario) - src/index.css**

```css
/* Transiciones suaves para hover */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Line clamp para truncar texto */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Focus visible para accesibilidad */
.focus\:ring-1:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(
      --tw-ring-offset-width
    )
    var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(
      1px + var(--tw-ring-offset-width)
    )
    var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0
        0 #0000);
}
```

---

## **Comparación: Antes vs Ahora**

| Aspecto          | Diseño Anterior (Malo)             | Diseño Nuevo (Profesional)           |
| ---------------- | ---------------------------------- | ------------------------------------ |
| **Header**       | Negro chillón con gradiente        | Blanco limpio con border gris sutil  |
| **Colores**      | Neones verdes/amarillos            | Negro, blanco, grises claros         |
| **Estadísticas** | Glassmorphism con colores          | Cajas grises claras minimalistas     |
| **Botones**      | Blanco sobre negro (contraste feo) | Negro sobre blanco, hover suave      |
| **Cards**        | Barra de color superior            | Border gris, hover shadow suave      |
| **Entrevista**   | Amarillo/naranja chillón           | Negro para urgentes, gris para resto |
| **Iconos**       | Colores saturados                  | Grises sutiles (gray-400/gray-600)   |
| **Espaciado**    | Apretado                           | Generoso (p-6, gap-6, py-6)          |
| **Tipografía**   | Múltiples tamaños                  | Jerarquía clara (3xl, base, sm, xs)  |

---

## **Principios de Diseño Aplicados**

### **1. Minimalismo**

- Fondo blanco limpio
- Bordes grises sutiles (gray-100, gray-200)
- Sin gradientes ni efectos exagerados

### **2. Armonía Cromática**

- **Negro** (#000000): Textos principales, botones, estados importantes
- **Gris oscuro** (gray-900): Hover de botones
- **Gris medio** (gray-600): Textos secundarios
- **Gris claro** (gray-50, gray-100): Fondos de cajas, badges
- **Blanco** (#ffffff): Fondo principal, textos sobre negro

### **3. Tipografía Profesional**

- **Títulos**: font-bold, text-3xl/text-xl, text-black
- **Subtítulos**: font-semibold, text-base, text-black
- **Textos**: font-normal, text-sm, text-gray-600
- **Labels**: font-medium, text-xs, text-gray-600 uppercase

### **4. Espaciado Generoso**

- **Padding**: p-6 en cards, p-5 en estadísticas
- **Gaps**: gap-6 en grids, gap-4 en flexbox
- **Margins**: mb-4, mb-6, mb-8 para separación vertical

### **5. Interacciones Suaves**

- **Hover**: shadow-md (no scale)
- **Transiciones**: duration-200
- **Focus**: ring-1 ring-black

---

## **Ejemplo de Card Express (Referencia)**

Aplicando los mismos principios del card que compartiste:

```jsx
<Card className="border border-gray-200 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm hover:shadow-md cursor-pointer">
  <CardContent className="p-6">
    {/* Estructura similar pero con colores profesionales */}
  </CardContent>
</Card>
```

---

Este diseño es **profesional, minimalista y elegante**, fluyendo perfectamente con el homepage. Sin colores chillones, con espaciado generoso y jerarquía visual clara. La información de entrevista destaca de forma elegante (negro para urgente, gris claro para programada) sin ser agresiva.
