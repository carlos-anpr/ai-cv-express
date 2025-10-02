import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import JobApplicationForm from '../components/JobApplicationForm';
import LocalDatabase from '@/services/LocalDatabase';
import { validateJobApplication } from '@/services/types';
import { toast } from 'sonner';

function NewJobApplication() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [resumeInfo, setResumeInfo] = useState(null);
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
  });
  const [errors, setErrors] = useState({});

  const loadResumeInfo = React.useCallback(async () => {
    try {
      const response = await LocalDatabase.GetResumeById(resumeId);
      setResumeInfo(response.data);
    } catch (error) {
      console.error('❌ Error cargando información del CV:', error);
      toast.error('Error al cargar la información del CV');
    }
  }, [resumeId]);

  useEffect(() => {
    loadResumeInfo();
  }, [loadResumeInfo]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Crear datos de candidatura con validación
      const applicationData = {
        resumeId,
        userEmail:
          user?.primaryEmailAddress?.emailAddress || 'user@example.com',
        companyName: formData.companyName?.trim(),
        jobTitle: formData.jobTitle?.trim(),
        jobDescription: formData.jobDescription?.trim(),
        location: formData.location?.trim(),
        salary: formData.salary ? parseFloat(formData.salary) : null,
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
        coverLetterGenerated: false,
        interviewSimulated: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Validar datos
      validateJobApplication(applicationData);

      setLoading(true);
      const response = await LocalDatabase.CreateJobApplication(
        applicationData
      );
      console.log('✅ Candidatura creada:', response.data);

      toast.success('Candidatura creada correctamente');
      navigate(
        `/dashboard/resume/${resumeId}/job-applications/${response.data.id}`
      );
    } catch (error) {
      console.error('❌ Error creando candidatura:', error);

      // Si el error contiene información de validación, extraer errores específicos
      if (error.message.includes('Campos obligatorios faltantes')) {
        const missingFields = error.message.split(': ')[1].split(', ');
        const fieldErrors = {};
        missingFields.forEach((field) => {
          fieldErrors[field] = 'Este campo es obligatorio';
        });
        setErrors(fieldErrors);
      }

      toast.error('Error al crear la candidatura: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const determineCandidateLevel = () => {
    // Lógica simple para determinar el nivel del candidato
    // Basado en la experiencia del CV y la descripción del trabajo
    if (!resumeInfo?.experience) return 'entry';

    const experienceYears = resumeInfo.experience.length;
    const jobDescLower = formData.jobDescription.toLowerCase();

    if (
      experienceYears >= 5 ||
      jobDescLower.includes('senior') ||
      jobDescLower.includes('lead')
    ) {
      return 'senior';
    } else if (
      experienceYears >= 2 ||
      jobDescLower.includes('mid') ||
      jobDescLower.includes('junior')
    ) {
      return 'mid';
    }

    return 'entry';
  };

  const handleGoBack = () => {
    navigate(`/dashboard/resume/${resumeId}/job-applications`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Nueva Candidatura
          </h1>
          <p className="text-gray-600 mt-2">
            {resumeInfo?.firstName && resumeInfo?.lastName
              ? `CV de ${resumeInfo.firstName} ${resumeInfo.lastName}`
              : 'Crear una nueva candidatura de trabajo'}
          </p>
        </div>
      </div>

      {/* Formulario mejorado por pasos */}
      <JobApplicationForm
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        loading={loading}
        errors={errors}
        submitLabel="Crear Candidatura"
        showAllFields={false} // Mostrar formulario por pasos
      />
    </div>
  );
}

export default NewJobApplication;
