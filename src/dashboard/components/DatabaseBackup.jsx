import React, { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
  FileJson,
  ArrowRight,
  Info,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/clerk-react';
import DatabaseBackupService from '@/services/DatabaseBackupService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const MAX_BACKUP_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function DatabaseBackup() {
  const { user } = useUser();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [exportStats, setExportStats] = useState(null);
  const [importStats, setImportStats] = useState(null);
  const [cleanStats, setCleanStats] = useState(null);
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [importProgress, setImportProgress] = useState(0);

  // Exportar base de datos
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportStats(null);

      const stats = await DatabaseBackupService.downloadBackup(
        user?.primaryEmailAddress?.emailAddress
      );

      setExportStats(stats);
      toast.success('¡Backup exportado exitosamente!', {
        description: `Se exportaron ${stats.resumes} CVs, ${stats.applications} candidaturas y ${stats.coverLetters} cartas.`,
      });
    } catch (error) {
      console.error('Error exportando:', error);
      toast.error('Error al exportar', {
        description: error.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > MAX_BACKUP_FILE_SIZE_BYTES) {
      toast.error('Archivo demasiado grande', {
        description: 'El backup no puede superar 5 MB.',
      });
      event.target.value = '';
      return;
    }

    try {
      setIsImporting(true);
      setImportProgress(10);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          setImportProgress(30);

          // Validar archivo
          const validation = await DatabaseBackupService.validateBackupFile(
            content
          );

          setImportProgress(50);

          if (!validation.valid) {
            toast.error('Archivo inválido', {
              description: validation.error,
            });
            setIsImporting(false);
            return;
          }

          // Detectar duplicados
          const duplicates = await DatabaseBackupService.detectDuplicates(
            validation.data,
            user?.primaryEmailAddress?.emailAddress
          );

          setImportProgress(70);

          if (duplicates.hasDuplicates) {
            // Mostrar diálogo de duplicados
            setDuplicateInfo(duplicates);
            setPendingImport(validation.data);
            setShowDuplicatesDialog(true);
            setIsImporting(false);
          } else {
            // Importar directamente si no hay duplicados
            await performImport(validation.data, {
              skipDuplicates: false,
              generateNewIds: false,
            });
          }
        } catch (error) {
          console.error('Error procesando archivo:', error);
          toast.error('Error al procesar archivo', {
            description: error.message,
          });
          setIsImporting(false);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error leyendo archivo:', error);
      toast.error('Error al leer archivo', {
        description: error.message,
      });
      setIsImporting(false);
    }
  };

  // Realizar importación
  const performImport = async (data, options) => {
    try {
      setIsImporting(true);
      setImportProgress(80);

      const results = await DatabaseBackupService.importDatabase(
        data,
        user?.primaryEmailAddress?.emailAddress,
        options
      );

      setImportProgress(100);
      setImportStats(results);

      const totalImported =
        results.resumes.imported +
        results.jobApplications.imported +
        results.coverLetters.imported;

      const totalSkipped =
        results.resumes.skipped +
        results.jobApplications.skipped +
        results.coverLetters.skipped;

      toast.success('¡Importación completada!', {
        description: `${totalImported} elementos importados, ${totalSkipped} omitidos.`,
      });

      // Limpiar estado
      setTimeout(() => {
        setImportProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Error importando:', error);
      toast.error('Error al importar', {
        description: error.message,
      });
    } finally {
      setIsImporting(false);
      setShowDuplicatesDialog(false);
      setPendingImport(null);
      setDuplicateInfo(null);
    }
  };

  // Limpiar datos huérfanos
  const handleClean = async () => {
    try {
      setIsCleaning(true);
      setCleanStats(null);

      const results = await DatabaseBackupService.cleanOrphanData(
        user?.primaryEmailAddress?.emailAddress
      );

      setCleanStats(results);

      const total =
        results.orphanApplications +
        results.orphanLetters +
        results.orphanSimulations;

      if (total > 0) {
        toast.success('Limpieza completada', {
          description: `Se eliminaron ${total} elementos huérfanos.`,
        });
      } else {
        toast.info('Base de datos limpia', {
          description: 'No se encontraron datos huérfanos.',
        });
      }
    } catch (error) {
      console.error('Error limpiando:', error);
      toast.error('Error al limpiar', {
        description: error.message,
      });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Copias de Seguridad
              </h1>
              <p className="text-sm text-muted-foreground">
                Exporta e importa tus datos de forma segura
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Info Banner */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">
            Información importante
          </AlertTitle>
          <AlertDescription className="text-blue-800">
            Las exportaciones limpian automáticamente datos huérfanos. Las
            importaciones detectan duplicados y te permiten elegir cómo
            gestionarlos.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Exportar */}
          <div className="group relative p-8 transition-all duration-300 border rounded-2xl border-border bg-background hover:border-black/20 hover:shadow-lg">
            <div className="inline-flex items-center justify-center mb-6 p-2.5 rounded-xl bg-secondary transition-colors group-hover:bg-black/5">
              <Download className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </div>

            <h3 className="mb-3 text-xl font-semibold">Exportar Datos</h3>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              Descarga una copia de seguridad completa de todos tus CVs,
              candidaturas y cartas de presentación. Se eliminan automáticamente
              los datos huérfanos.
            </p>

            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-black text-white hover:bg-black/90"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Base de Datos
                </>
              )}
            </Button>

            {exportStats && (
              <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900 mb-2">
                      ¡Exportación exitosa!
                    </p>
                    <div className="space-y-1 text-sm text-green-800">
                      <p>✓ {exportStats.resumes} CVs exportados</p>
                      <p>
                        ✓ {exportStats.applications} candidaturas exportadas
                      </p>
                      <p>✓ {exportStats.coverLetters} cartas exportadas</p>
                      {exportStats.orphanApplicationsRemoved > 0 && (
                        <p className="text-orange-700">
                          ⚠ {exportStats.orphanApplicationsRemoved} candidaturas
                          huérfanas eliminadas
                        </p>
                      )}
                      {exportStats.orphanLettersRemoved > 0 && (
                        <p className="text-orange-700">
                          ⚠ {exportStats.orphanLettersRemoved} cartas huérfanas
                          eliminadas
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Importar */}
          <div className="group relative p-8 transition-all duration-300 border rounded-2xl border-border bg-background hover:border-black/20 hover:shadow-lg">
            <div className="inline-flex items-center justify-center mb-6 p-2.5 rounded-xl bg-secondary transition-colors group-hover:bg-black/5">
              <Upload className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </div>

            <h3 className="mb-3 text-xl font-semibold">Importar Datos</h3>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              Restaura una copia de seguridad anterior. Se detectan
              automáticamente los duplicados y puedes elegir cómo gestionarlos.
            </p>

            <label htmlFor="import-file">
              <Button
                disabled={isImporting}
                className="w-full bg-black text-white hover:bg-black/90"
                asChild
              >
                <span className="cursor-pointer">
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar Archivo
                    </>
                  )}
                </span>
              </Button>
            </label>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isImporting}
            />

            {importProgress > 0 && importProgress < 100 && (
              <div className="mt-4">
                <Progress value={importProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Procesando archivo... {importProgress}%
                </p>
              </div>
            )}

            {importStats && (
              <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900 mb-2">
                      ¡Importación completada!
                    </p>
                    <div className="space-y-1 text-sm text-green-800">
                      <p>
                        ✓ {importStats.resumes.imported} CVs importados (
                        {importStats.resumes.skipped} omitidos)
                      </p>
                      <p>
                        ✓ {importStats.jobApplications.imported} candidaturas
                        importadas ({importStats.jobApplications.skipped}{' '}
                        omitidas)
                      </p>
                      <p>
                        ✓ {importStats.coverLetters.imported} cartas importadas
                        ({importStats.coverLetters.skipped} omitidas)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Limpiar datos huérfanos */}
          <div className="group relative p-8 transition-all duration-300 border rounded-2xl border-border bg-background hover:border-black/20 hover:shadow-lg md:col-span-2">
            <div className="inline-flex items-center justify-center mb-6 p-2.5 rounded-xl bg-secondary transition-colors group-hover:bg-black/5">
              <Trash2 className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </div>

            <h3 className="mb-3 text-xl font-semibold">
              Limpiar Datos Huérfanos
            </h3>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              Elimina candidaturas y cartas de presentación que no están
              asociadas a ningún CV. Esta operación es irreversible, se
              recomienda hacer una exportación antes.
            </p>

            <Button
              onClick={handleClean}
              disabled={isCleaning}
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              {isCleaning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Limpiando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar Ahora
                </>
              )}
            </Button>

            {cleanStats && (
              <div className="mt-6 p-4 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-900 mb-2">
                      Limpieza completada
                    </p>
                    <div className="space-y-1 text-sm text-orange-800">
                      <p>
                        🗑️ {cleanStats.orphanApplications} candidaturas
                        huérfanas eliminadas
                      </p>
                      <p>
                        🗑️ {cleanStats.orphanLetters} cartas huérfanas
                        eliminadas
                      </p>
                      <p>
                        🗑️ {cleanStats.orphanSimulations} simulaciones huérfanas
                        eliminadas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <FileJson className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium">Formato JSON</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Los backups se guardan en formato JSON para fácil portabilidad y
              lectura.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-medium">Limpieza Auto</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Las exportaciones limpian automáticamente datos que no están
              asociados a ningún CV.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h4 className="font-medium">Detección de Duplicados</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Al importar, se detectan duplicados y puedes elegir omitirlos o
              importarlos con nuevos IDs.
            </p>
          </div>
        </div>
      </div>

      {/* Diálogo de duplicados */}
      <Dialog
        open={showDuplicatesDialog}
        onOpenChange={setShowDuplicatesDialog}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Duplicados Detectados
            </DialogTitle>
            <DialogDescription>
              Se encontraron elementos que ya existen en tu base de datos. Elige
              cómo deseas proceder:
            </DialogDescription>
          </DialogHeader>

          {duplicateInfo && (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <p className="font-medium text-orange-900 mb-2">
                  Resumen de duplicados:
                </p>
                <ul className="space-y-1 text-sm text-orange-800">
                  {duplicateInfo.summary.resumes > 0 && (
                    <li>• {duplicateInfo.summary.resumes} CVs duplicados</li>
                  )}
                  {duplicateInfo.summary.jobApplications > 0 && (
                    <li>
                      • {duplicateInfo.summary.jobApplications} candidaturas
                      duplicadas
                    </li>
                  )}
                  {duplicateInfo.summary.coverLetters > 0 && (
                    <li>
                      • {duplicateInfo.summary.coverLetters} cartas duplicadas
                    </li>
                  )}
                </ul>
              </div>

              {/* Detalles de CVs duplicados */}
              {duplicateInfo.duplicates.resumes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">CVs duplicados:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {duplicateInfo.duplicates.resumes.map((dup, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-secondary/50 text-sm"
                      >
                        <p className="font-medium">
                          {dup.importItem.title || 'Sin título'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {dup.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detalles de candidaturas duplicadas */}
              {duplicateInfo.duplicates.jobApplications.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Candidaturas duplicadas:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {duplicateInfo.duplicates.jobApplications.map(
                      (dup, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-secondary/50 text-sm"
                        >
                          <p className="font-medium">{dup.value}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDuplicatesDialog(false);
                setPendingImport(null);
                setDuplicateInfo(null);
                setIsImporting(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                performImport(pendingImport, {
                  skipDuplicates: true,
                  generateNewIds: false,
                });
              }}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Omitir Duplicados
            </Button>
            <Button
              className="bg-black text-white hover:bg-black/90"
              onClick={() => {
                performImport(pendingImport, {
                  skipDuplicates: false,
                  generateNewIds: true,
                });
              }}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Importar con Nuevos IDs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DatabaseBackup;
