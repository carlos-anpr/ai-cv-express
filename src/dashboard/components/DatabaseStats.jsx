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
    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* CVs */}
      <div className="group relative p-4 transition-all duration-300 border rounded-xl border-border bg-background hover:border-black/20 hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center p-2 rounded-lg bg-secondary transition-colors group-hover:bg-black/5">
            <FileText className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">{stats.resumes}</p>
            <p className="text-xs text-muted-foreground">CVs</p>
          </div>
        </div>
      </div>

      {/* Candidaturas */}
      <div className="group relative p-4 transition-all duration-300 border rounded-xl border-border bg-background hover:border-black/20 hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center p-2 rounded-lg bg-secondary transition-colors group-hover:bg-black/5">
            <Briefcase className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">
              {stats.applications}
            </p>
            <p className="text-xs text-muted-foreground">Candidaturas</p>
          </div>
        </div>
      </div>

      {/* Cartas */}
      <div className="group relative p-4 transition-all duration-300 border rounded-xl border-border bg-background hover:border-black/20 hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center p-2 rounded-lg bg-secondary transition-colors group-hover:bg-black/5">
            <Mail className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">
              {stats.coverLetters}
            </p>
            <p className="text-xs text-muted-foreground">Cartas</p>
          </div>
        </div>
      </div>

      {/* Base de datos */}
      <div
        className={`group relative p-4 transition-all duration-300 border rounded-xl border-border bg-background hover:shadow-md ${
          stats.orphanData > 0
            ? 'hover:border-orange-300'
            : 'hover:border-black/20'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
              stats.orphanData > 0
                ? 'bg-orange-50 group-hover:bg-orange-100'
                : 'bg-secondary group-hover:bg-black/5'
            }`}
          >
            {stats.orphanData > 0 ? (
              <AlertCircle
                className="w-4 h-4 text-orange-600"
                strokeWidth={1.5}
              />
            ) : (
              <Database className="w-4 h-4 text-foreground" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">
              {stats.orphanData}
            </p>
            <p
              className={`text-xs ${
                stats.orphanData > 0
                  ? 'text-orange-600'
                  : 'text-muted-foreground'
              }`}
            >
              {stats.orphanData > 0 ? 'Huérfanos' : 'Limpia'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatabaseStats;
