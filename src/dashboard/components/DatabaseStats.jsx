import React, { useEffect, useState } from 'react';
import { Database, FileText, Briefcase, Mail, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { db } from '@/services/IndexedDBService';
import DatabaseBackupService from '@/services/DatabaseBackupService';

function DatabaseStats() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    resumes: 0,
    applications: 0,
    coverLetters: 0,
    orphanData: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      try {
        const userEmail = user.primaryEmailAddress.emailAddress;

        // Obtener estadísticas
        const resumes = await db.resumes
          .where('userEmail')
          .equals(userEmail)
          .count();

        const applications = await db.jobApplications
          .where('userEmail')
          .equals(userEmail)
          .count();

        const coverLetters = await db.coverLetters
          .where('userEmail')
          .equals(userEmail)
          .count();

        // Detectar datos huérfanos
        const resumesList = await db.resumes
          .where('userEmail')
          .equals(userEmail)
          .toArray();

        const resumeIds = resumesList.map((r) => r.id);
        const resumeDocumentIds = resumesList.map((r) => r.documentId);

        const allApplications = await db.jobApplications
          .where('userEmail')
          .equals(userEmail)
          .toArray();

        const orphanApps = allApplications.filter(
          (app) =>
            !resumeIds.includes(app.resumeId) &&
            !resumeDocumentIds.includes(app.resumeDocumentId)
        );

        const applicationIds = allApplications.map((a) => a.id);

        const allLetters = await db.coverLetters
          .where('userEmail')
          .equals(userEmail)
          .toArray();

        const orphanLetters = allLetters.filter(
          (letter) =>
            (!letter.jobApplicationId ||
              !applicationIds.includes(letter.jobApplicationId)) &&
            (!letter.resumeId || !resumeIds.includes(letter.resumeId))
        );

        setStats({
          resumes,
          applications,
          coverLetters,
          orphanData: orphanApps.length + orphanLetters.length,
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (loading || stats.resumes === 0) return null;

  return (
    <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.resumes}</p>
            <p className="text-xs text-muted-foreground">CVs</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100">
            <Briefcase className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.applications}</p>
            <p className="text-xs text-muted-foreground">Candidaturas</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <Mail className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.coverLetters}</p>
            <p className="text-xs text-muted-foreground">Cartas</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              stats.orphanData > 0 ? 'bg-orange-100' : 'bg-gray-100'
            }`}
          >
            {stats.orphanData > 0 ? (
              <AlertCircle className="w-4 h-4 text-orange-600" />
            ) : (
              <Database className="w-4 h-4 text-gray-600" />
            )}
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.orphanData}</p>
            <p className="text-xs text-muted-foreground">
              {stats.orphanData > 0 ? 'Datos huérfanos' : 'Base limpia'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatabaseStats;
