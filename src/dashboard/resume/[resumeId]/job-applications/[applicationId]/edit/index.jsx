import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import JobApplicationForm from '../../components/JobApplicationForm';
import LocalDatabase from '@/services/LocalDatabase';
import { toast } from 'sonner';

function EditJobApplication() {
  const { resumeId, applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    location: '',
    salary: '',
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    notes: '',
    jobUrl: '',
    contactEmail: '',
    contactPhone: '',
    contactPerson: '',
    requirements: '',
    benefits: '',
    workMode: 'presencial',
    interviewDate: '',
    interviewLink: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [resumeInfo, setResumeInfo] = useState(null);

  // Cargar datos de la candidatura
  useEffect(() => {
    const loadData = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      try {
        setLoading(true);

        // Cargar información del CV
        const resumeResponse = await LocalDatabase.GetResumeById(resumeId);
        setResumeInfo(resumeResponse.data);

        // Cargar datos de la candidatura
        const applicationResponse = await LocalDatabase.GetJobApplicationById(
          applicationId,
          user.primaryEmailAddress.emailAddress
        );

        if (applicationResponse.success && applicationResponse.data) {
          const app = applicationResponse.data;
          setFormData({
            jobTitle: app.jobTitle || '',
            companyName: app.companyName || '',
            jobDescription: app.jobDescription || '',
            location: app.location || '',
            salary: app.salary ? app.salary.toString() : '',
            applicationDate:
              app.applicationDate || new Date().toISOString().split('T')[0],
            status: app.status || 'draft',
            notes: app.notes || '',
            jobUrl: app.jobUrl || '',
            contactEmail: app.contactEmail || '',
            contactPhone: app.contactPhone || '',
            contactPerson: app.contactPerson || '',
            requirements: app.requirements || '',
            benefits: app.benefits || '',
            workMode: app.workMode || 'presencial',
            interviewDate: app.interviewDate || '',
            interviewLink: app.interviewLink || '',
          });
        } else {
          toast.error('No se pudo cargar la candidatura');
          navigate(`/dashboard/resume/${resumeId}/job-applications`);
        }
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        toast.error('Error al cargar la candidatura');
        navigate(`/dashboard/resume/${resumeId}/job-applications`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    resumeId,
    applicationId,
    user?.primaryEmailAddress?.emailAddress,
    navigate,
  ]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error del campo al cambiar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const determineCandidateLevel = () => {
    if (!resumeInfo?.experience) return 'junior';

    const totalExperience = resumeInfo.experience.reduce((total, exp) => {
      const startYear = new Date(exp.startDate).getFullYear();
      const endYear = exp.currentlyWorking
        ? new Date().getFullYear()
        : new Date(exp.endDate).getFullYear();
      return total + (endYear - startYear);
    }, 0);

    if (totalExperience >= 7) return 'senior';
    if (totalExperience >= 3) return 'mid';
    return 'junior';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setErrors({});
      setSaving(true);

      // Preparar datos de actualización
      const updateData = {
        companyName: formData.companyName?.trim(),
        jobTitle: formData.jobTitle?.trim(),
        jobDescription: formData.jobDescription?.trim(),
        location: formData.location?.trim(),
        salary: formData.salary ? parseFloat(formData.salary) : null,
        interviewDate: formData.interviewDate || null,
        interviewLink: formData.interviewLink?.trim() || '',
        applicationDate: formData.applicationDate,
        status: formData.status,
        notes: formData.notes?.trim(),
        jobUrl: formData.jobUrl?.trim(),
        contactEmail: formData.contactEmail?.trim(),
        contactPhone: formData.contactPhone?.trim(),
        contactPerson: formData.contactPerson?.trim(),
        requirements: formData.requirements?.trim(),
        benefits: formData.benefits?.trim(),
        workMode: formData.workMode,
        candidateLevel: determineCandidateLevel(),
        updatedAt: new Date().toISOString(),
      };

      // Validar datos básicos
      if (!updateData.jobTitle?.trim()) {
        setErrors({ jobTitle: 'El título del puesto es obligatorio' });
        return;
      }
      if (!updateData.companyName?.trim()) {
        setErrors({ companyName: 'El nombre de la empresa es obligatorio' });
        return;
      }

      console.log('📝 Actualizando candidatura:', updateData);
      console.log('📱 Campo contactPhone:', updateData.contactPhone);

      const response = await LocalDatabase.UpdateJobApplication(
        applicationId,
        updateData
      );
      console.log('✅ Candidatura actualizada:', response.data);

      toast.success('Candidatura actualizada correctamente');
      navigate(
        `/dashboard/resume/${resumeId}/job-applications/${applicationId}`
      );
    } catch (error) {
      console.error('❌ Error actualizando candidatura:', error);

      // Si el error contiene información de validación, extraer errores específicos
      if (error.message.includes('Campos obligatorios faltantes')) {
        const missingFields = error.message.split(': ')[1].split(', ');
        const fieldErrors = {};
        missingFields.forEach((field) => {
          fieldErrors[field] = 'Este campo es obligatorio';
        });
        setErrors(fieldErrors);
        toast.error('Por favor, completa todos los campos obligatorios');
      } else {
        toast.error('Error al actualizar la candidatura: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando candidatura...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                `/dashboard/resume/${resumeId}/job-applications/${applicationId}`
              )
            }
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Editar Candidatura
            </h1>
            <p className="text-gray-600 mt-1">
              {formData.jobTitle && formData.companyName
                ? `${formData.jobTitle} en ${formData.companyName}`
                : 'Modifica los datos de tu candidatura'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Información de la Candidatura
          </CardTitle>
          <CardDescription>
            Actualiza los datos de tu candidatura de trabajo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobApplicationForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            loading={saving}
            errors={errors}
            submitLabel="Guardar Cambios"
            showAllFields={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default EditJobApplication;
