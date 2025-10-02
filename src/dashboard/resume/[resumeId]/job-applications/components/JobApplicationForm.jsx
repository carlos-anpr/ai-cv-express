import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Briefcase,
  Building,
  MapPin,
  Euro,
  Calendar,
  User,
  Mail,
  Globe,
} from 'lucide-react';
import { JOB_APPLICATION_STATUS } from '@/services/types';

const JobApplicationForm = ({
  formData,
  onChange,
  onSubmit,
  loading = false,
  errors = {},
  submitLabel = 'Guardar',
  showAllFields = true,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleInputChange = (field, value) => {
    onChange(field, value);
  };

  const handleStepSubmit = (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(e);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step}
          </div>
          {step < totalSteps && (
            <div
              className={`w-12 h-1 mx-2 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Información del Puesto
          </CardTitle>
          <CardDescription>
            Datos básicos de la oferta de trabajo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobTitle">Título del Puesto *</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle || ''}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder="ej. Desarrollador Frontend React"
                className={errors.jobTitle ? 'border-red-500' : ''}
              />
              {errors.jobTitle && (
                <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>
              )}
            </div>

            <div>
              <Label htmlFor="companyName">Empresa *</Label>
              <Input
                id="companyName"
                value={formData.companyName || ''}
                onChange={(e) =>
                  handleInputChange('companyName', e.target.value)
                }
                placeholder="ej. Tech Solutions S.L."
                className={errors.companyName ? 'border-red-500' : ''}
              />
              {errors.companyName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.companyName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="location">Ubicación</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  placeholder="ej. Madrid, España"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="salary">Salario (€/año)</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary || ''}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  placeholder="45000"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="workMode">Modalidad</Label>
              <Select
                value={formData.workMode || 'presencial'}
                onValueChange={(value) => handleInputChange('workMode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="remoto">Remoto</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="jobUrl">URL de la Oferta</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="jobUrl"
                type="url"
                value={formData.jobUrl || ''}
                onChange={(e) => handleInputChange('jobUrl', e.target.value)}
                placeholder="https://empresa.com/jobs/123"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Descripción y Requisitos</CardTitle>
          <CardDescription>
            Detalles del puesto y requisitos solicitados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="jobDescription">Descripción del Puesto *</Label>
            <Textarea
              id="jobDescription"
              value={formData.jobDescription || ''}
              onChange={(e) =>
                handleInputChange('jobDescription', e.target.value)
              }
              placeholder="Pega aquí la descripción completa del puesto..."
              rows={6}
              className={errors.jobDescription ? 'border-red-500' : ''}
            />
            {errors.jobDescription && (
              <p className="text-red-500 text-sm mt-1">
                {errors.jobDescription}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Consejo: Copia la descripción original para mejor personalización
              de cartas
            </p>
          </div>

          <div>
            <Label htmlFor="requirements">Requisitos Específicos</Label>
            <Textarea
              id="requirements"
              value={formData.requirements || ''}
              onChange={(e) =>
                handleInputChange('requirements', e.target.value)
              }
              placeholder="ej. 3+ años experiencia React, TypeScript, conocimientos de testing..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="benefits">Beneficios y Ventajas</Label>
            <Textarea
              id="benefits"
              value={formData.benefits || ''}
              onChange={(e) => handleInputChange('benefits', e.target.value)}
              placeholder="ej. Seguro médico, formación continua, flexibilidad horaria..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contacto y Seguimiento</CardTitle>
          <CardDescription>
            Información para el seguimiento de la candidatura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPerson">Persona de Contacto</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="contactPerson"
                  value={formData.contactPerson || ''}
                  onChange={(e) =>
                    handleInputChange('contactPerson', e.target.value)
                  }
                  placeholder="ej. Ana García - RRHH"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contactEmail">Email de Contacto</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) =>
                    handleInputChange('contactEmail', e.target.value)
                  }
                  placeholder="rrhh@empresa.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="applicationDate">Fecha de Candidatura</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="applicationDate"
                  type="date"
                  value={
                    formData.applicationDate ||
                    new Date().toISOString().split('T')[0]
                  }
                  onChange={(e) =>
                    handleInputChange('applicationDate', e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status || 'draft'}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JOB_APPLICATION_STATUS).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Cualquier información adicional relevante..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (showAllFields) {
    // Modo de edición: mostrar todos los campos en una sola vista
    return (
      <form onSubmit={onSubmit} className="space-y-6">
        {renderStep1()}
        {renderStep2()}
        {renderStep3()}

        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Guardando...' : submitLabel}
          </Button>
        </div>
      </form>
    );
  }

  // Modo de creación: formulario paso a paso
  return (
    <div className="max-w-2xl mx-auto">
      {renderStepIndicator()}

      <form onSubmit={handleStepSubmit} className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <div className="flex justify-between pt-6">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevStep}>
              Anterior
            </Button>
          )}
          <div className="ml-auto">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading
                ? 'Guardando...'
                : currentStep < totalSteps
                ? 'Continuar'
                : submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JobApplicationForm;
