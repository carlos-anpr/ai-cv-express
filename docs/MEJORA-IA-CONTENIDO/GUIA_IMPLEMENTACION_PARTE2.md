# Guía de Implementación - Parte 2

## ✏️ FASE 4: Integración en Experience

### Paso 4.1: Modificar RichTextEditor.jsx

**Archivo**: `src/dashboard/resume/components/RichTextEditor.jsx`

**Cambios a realizar**:

```javascript
// AÑADIR IMPORTS AL INICIO
import { useAIContentEnhancement } from './../../../hooks/useAIContentEnhancement';
import AIOptionsDialog from './AIOptionsDialog';
import AIPreviewPanel from './AIPreviewPanel';

// DENTRO DEL COMPONENTE, DESPUÉS DE LOS ESTADOS EXISTENTES
const {
  isLoading: isEnhancing,
  showOptions,
  showPreview,
  improvedContent,
  setShowOptions,
  setShowPreview,
  detectMode,
  enhanceExperience,
  applyImprovedContent,
  cancelImprovement,
  regenerateContent,
} = useAIContentEnhancement();

// DETECTAR MODO DEL BOTÓN
const contentMode = detectMode(value);
const aiButtonText =
  contentMode === 'enhance' ? 'Mejorar con IA' : 'Generar con IA';

// MODIFICAR GenerateSummaryFromAI PARA MANEJAR AMBOS MODOS
const handleAIAction = async () => {
  if (!resumeInfo?.experience[index]?.title) {
    toast('Por favor añade el título del puesto');
    return;
  }

  if (contentMode === 'enhance') {
    // Mostrar opciones de mejora
    setShowOptions(true);
  } else {
    // Generar desde cero (comportamiento actual)
    await generateFromScratch();
  }
};

// FUNCIÓN PARA GENERAR DESDE CERO (CÓDIGO EXISTENTE)
const generateFromScratch = async () => {
  setLoading(true);
  const prompt = PROMPT.replace(
    '{positionTitle}',
    resumeInfo.experience[index].title
  );

  try {
    const chatSession = AIChatSession();
    const result = await chatSession.sendMessage(prompt);
    const resp = JSON.parse(result.response?.text());

    const listaItems = resp?.points
      .map((elemento) => `<li>${elemento}</li>`)
      .join('');
    const listaHTML = `<ul>${listaItems}</ul>`;

    setValue(listaHTML);
    onRichTextEditorChange({ target: { value: listaHTML } });
  } catch (error) {
    console.error('Error generating:', error);
    toast.error('Error al generar contenido');
  } finally {
    setLoading(false);
  }
};

// HANDLER PARA SELECCIÓN DE OPCIÓN
const handleOptionSelect = async (option) => {
  const jobTitle = resumeInfo.experience[index].title;
  const companyName = resumeInfo.experience[index].companyName || 'la empresa';

  try {
    await enhanceExperience(value, jobTitle, companyName, option);
  } catch (error) {
    console.error('Error:', error);
  }
};

// HANDLER PARA APLICAR CONTENIDO MEJORADO
const handleApplyImproved = () => {
  const newContent = applyImprovedContent();
  setValue(newContent);
  onRichTextEditorChange({ target: { value: newContent } });
  toast.success('Contenido mejorado aplicado');
};

// HANDLER PARA REGENERAR
const handleRegenerate = async () => {
  const jobTitle = resumeInfo.experience[index].title;
  const companyName = resumeInfo.experience[index].companyName || 'la empresa';

  try {
    await regenerateContent('experience', value, jobTitle, companyName);
  } catch (error) {
    console.error('Error:', error);
  }
};

// MODIFICAR EL RETURN
return (
  <div>
    <div className="flex justify-between my-2">
      <label className="text-xs">Resumen</label>
      <Button
        variant="outline"
        size="sm"
        onClick={handleAIAction}
        disabled={loading || isEnhancing}
        className="flex gap-2 border-primary text-primary"
      >
        {loading || isEnhancing ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <>
            <WandSparkles className="h-4 w-4" /> {aiButtonText}
          </>
        )}
      </Button>
    </div>

    <EditorProvider>
      <Editor
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onRichTextEditorChange(e);
        }}
      >
        <Toolbar>
          <BtnBold />
          <BtnItalic />
          <BtnUnderline />
          <BtnStrikeThrough />
          <Separator />
          <BtnNumberedList />
          <BtnBulletList />
          <Separator />
          <BtnLink />
        </Toolbar>
      </Editor>
    </EditorProvider>

    {/* Diálogo de opciones */}
    <AIOptionsDialog
      isOpen={showOptions}
      onClose={() => setShowOptions(false)}
      onSelect={handleOptionSelect}
      title="¿Cómo quieres mejorar tu experiencia?"
      options={[
        {
          id: 'improve',
          icon: '✨',
          label: 'Mejorar puntos actuales',
          description: 'Hace tu descripción más profesional',
        },
        {
          id: 'expand',
          icon: '📈',
          label: 'Ampliar con más detalles',
          description: 'Añade contexto y métricas sugeridas',
        },
        {
          id: 'reorganize',
          icon: '🔄',
          label: 'Reorganizar profesionalmente',
          description: 'Ordena por impacto y relevancia',
        },
      ]}
    />

    {/* Panel de preview */}
    <AIPreviewPanel
      isOpen={showPreview}
      title="✨ Experiencia Mejorada"
      content={improvedContent}
      originalContent={value}
      onApply={handleApplyImproved}
      onRegenerate={handleRegenerate}
      onCancel={() => {
        cancelImprovement();
        setShowPreview(false);
      }}
      isLoading={isEnhancing}
      showComparison={true}
    />
  </div>
);
```

### Paso 4.2: Testing de Experience

**Escenarios de Testing**:

1. **Campo Vacío**

   - ✅ Botón muestra "Generar con IA"
   - ✅ Genera 5-7 puntos clave
   - ✅ Puntos se insertan en el editor

2. **Con Contenido**

   - ✅ Botón muestra "Mejorar con IA"
   - ✅ Muestra 3 opciones de mejora
   - ✅ Cada opción produce resultado diferente
   - ✅ Preview muestra comparación

3. **Aplicar Mejora**
   - ✅ Reemplaza contenido en el editor
   - ✅ Muestra toast de confirmación
   - ✅ Se puede deshacer con Cancelar

---

## 🎯 FASE 5: Integración en Skills

### Paso 5.1: Crear SkillsGeneratorInput.jsx

**Ubicación**: `src/dashboard/resume/components/SkillsGeneratorInput.jsx`

```javascript
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { WandSparkles, LoaderCircle } from 'lucide-react';

const SkillsGeneratorInput = ({
  value,
  onChange,
  onGenerate,
  isLoading,
  placeholder,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-2 block">
          💡 Describe tus habilidades
        </label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            placeholder ||
            'Ejemplo: Domino Node.js a nivel experto, React con conocimientos básicos, TypeScript nivel intermedio, Docker y Kubernetes para despliegue...'
          }
          className="min-h-[120px]"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Describe tus habilidades en lenguaje natural y la IA las clasificará
          automáticamente
        </p>
      </div>

      <Button
        onClick={onGenerate}
        disabled={isLoading || !value || value.trim().length < 10}
        className="w-full"
      >
        {isLoading ? (
          <>
            <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
            Generando habilidades...
          </>
        ) : (
          <>
            <WandSparkles className="h-4 w-4 mr-2" />
            Generar Habilidades con IA
          </>
        )}
      </Button>
    </div>
  );
};

export default SkillsGeneratorInput;
```

### Paso 5.2: Crear GeneratedSkillsPreview.jsx

**Ubicación**: `src/dashboard/resume/components/GeneratedSkillsPreview.jsx`

```javascript
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rating } from '@smastrom/react-rating';
import { Check, X, Trash2, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const GeneratedSkillsPreview = ({
  isOpen,
  skills,
  onApply,
  onEdit,
  onRemove,
  onCancel,
}) => {
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editingSkill, setEditingSkill] = React.useState(null);

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditingSkill({ ...skills[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingSkill) {
      onEdit(editingIndex, editingSkill);
      setEditingIndex(null);
      setEditingSkill(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingSkill(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✨ Habilidades Generadas</DialogTitle>
          <DialogDescription>
            Se han generado {skills.length} habilidades. Puedes editarlas o
            eliminarlas antes de aplicar.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-950/20"
            >
              {editingIndex === index ? (
                <>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={editingSkill.name}
                      onChange={(e) =>
                        setEditingSkill({
                          ...editingSkill,
                          name: e.target.value,
                        })
                      }
                      placeholder="Nombre de la habilidad"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Nivel:</span>
                      <Rating
                        style={{ maxWidth: 120 }}
                        value={editingSkill.rating}
                        onChange={(v) =>
                          setEditingSkill({ ...editingSkill, rating: v })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveEdit}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-semibold">{skill.name}</div>
                    <Rating
                      style={{ maxWidth: 120 }}
                      value={skill.rating}
                      readOnly
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(index)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}

          {skills.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay habilidades para mostrar
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={onApply}
            disabled={skills.length === 0}
            className="flex-1 sm:flex-none"
          >
            <Check className="h-4 w-4 mr-2" />
            Aplicar Todas ({skills.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GeneratedSkillsPreview;
```

### Paso 5.3: Modificar Skills.jsx

**Archivo**: `src/dashboard/resume/components/forms/Skills.jsx`

```javascript
// AÑADIR IMPORTS
import { useState as useStateReact } from 'react';
import { useSkillsGenerator } from '../../../../hooks/useSkillsGenerator';
import SkillsGeneratorInput from '../SkillsGeneratorInput';
import GeneratedSkillsPreview from '../GeneratedSkillsPreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// DENTRO DEL COMPONENTE, DESPUÉS DE LOS ESTADOS EXISTENTES
const [mode, setMode] = useStateReact('manual'); // 'manual' | 'ai'

const {
  isLoading: isGenerating,
  generatedSkills,
  showPreview,
  skillsDescription,
  setSkillsDescription,
  generateSkills,
  editGeneratedSkill,
  removeGeneratedSkill,
  applyGeneratedSkills,
  cancelGeneration,
} = useSkillsGenerator();

// HANDLER PARA GENERAR SKILLS
const handleGenerateSkills = async () => {
  if (!resumeInfo?.jobTitle) {
    toast.error('Por favor añade primero el título del puesto');
    return;
  }

  await generateSkills(skillsDescription, resumeInfo.jobTitle);
};

// HANDLER PARA APLICAR SKILLS GENERADAS
const handleApplySkills = () => {
  const newSkills = applyGeneratedSkills();
  setSkillsList([...skillsList, ...newSkills]);
  setSkillsDescription('');
  toast.success(`${newSkills.length} habilidades añadidas`);
};

// MODIFICAR EL RETURN
return (
  <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
    <h2 className="font-bold text-lg">Habilidades</h2>
    <p>Añade tus principales habilidades profesionales</p>

    <Tabs value={mode} onValueChange={setMode} className="mt-5">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manual">✏️ Manual</TabsTrigger>
        <TabsTrigger value="ai">🤖 Generar con IA</TabsTrigger>
      </TabsList>

      <TabsContent value="manual" className="mt-5">
        <div>
          {skillsList?.map((item, index) => (
            <div
              key={index}
              className="flex justify-between mb-2 border rounded-lg p-3"
            >
              <div className="flex-1 mr-3">
                <label className="text-xs">Nombre</label>
                <Input
                  className="w-full"
                  defaultValue={item.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs block mb-1">Nivel</label>
                <Rating
                  style={{ maxWidth: 120 }}
                  value={item.rating}
                  onChange={(v) => handleChange(index, 'rating', v)}
                />
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="ai" className="mt-5">
        <SkillsGeneratorInput
          value={skillsDescription}
          onChange={setSkillsDescription}
          onGenerate={handleGenerateSkills}
          isLoading={isGenerating}
        />
      </TabsContent>
    </Tabs>

    <div className="flex justify-between mt-5">
      {mode === 'manual' && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={AddNewSkills}
            className="text-primary"
          >
            + Añadir Más Habilidad
          </Button>
          <Button
            variant="outline"
            onClick={RemoveSkills}
            className="text-primary"
          >
            - Eliminar
          </Button>
        </div>
      )}
      {mode === 'ai' && <div />}
      <Button disabled={loading} onClick={() => onSave()}>
        {loading ? <LoaderCircle className="animate-spin" /> : 'Guardar'}
      </Button>
    </div>

    {/* Preview de skills generadas */}
    <GeneratedSkillsPreview
      isOpen={showPreview}
      skills={generatedSkills}
      onApply={handleApplySkills}
      onEdit={editGeneratedSkill}
      onRemove={removeGeneratedSkill}
      onCancel={cancelGeneration}
    />
  </div>
);
```

**IMPORTANTE**: Necesitarás añadir el componente Tabs de shadcn/ui si no existe:

```bash
npx shadcn@latest add tabs
```

### Paso 5.4: Testing de Skills

**Escenarios de Testing**:

1. **Modo Manual**

   - ✅ Funciona igual que antes
   - ✅ Añadir/eliminar skills funciona

2. **Modo IA - Generación**

   - ✅ Input de descripción funciona
   - ✅ Botón deshabilitado con menos de 10 caracteres
   - ✅ Genera skills con nombre y rating correcto
   - ✅ Preview muestra todas las skills

3. **Modo IA - Edición**

   - ✅ Puede editar nombre y rating
   - ✅ Puede eliminar skills individuales
   - ✅ Aplicar añade al listado existente

4. **Parsing Inteligente**
   - ✅ "Experto" → 5 estrellas
   - ✅ "Intermedio" → 3 estrellas
   - ✅ "Básico" → 2 estrellas
   - ✅ Normaliza nombres (nodejs → Node.js)

---

## 🧪 FASE 6: Testing Final y Documentación

### Paso 6.1: Testing de Integración

**Flujo Completo a Probar**:

1. **Crear Nuevo CV**

   ```
   1. Crear nuevo CV
   2. Añadir detalles personales
   3. Añadir título de puesto
   4. Ir a Summary → Generar con IA
   5. Añadir experiencia → Generar con IA
   6. Añadir skills → Generar con IA
   7. Verificar todo se guarda correctamente
   ```

2. **Editar CV Existente**

   ```
   1. Abrir CV existente con contenido
   2. Verificar botones muestran "Mejorar con IA"
   3. Probar mejora de summary
   4. Probar mejora de experience
   5. Añadir más skills con IA
   6. Guardar y verificar persistencia
   ```

3. **Casos Edge**
   ```
   1. Sin título de puesto → Mostrar error
   2. Texto muy corto → Usar modo generar
   3. Texto muy largo → Truncar o manejar
   4. Sin conexión → Manejar error gracefully
   5. API error → Mostrar mensaje apropiado
   ```

### Paso 6.2: Checklist de Calidad

- [ ] **Performance**

  - [ ] No hay lag en la UI durante generación
  - [ ] Loading states son claros
  - [ ] Transiciones son suaves

- [ ] **UX**

  - [ ] Botones tienen estados disabled correctos
  - [ ] Mensajes de error son claros
  - [ ] Toasts informan correctamente
  - [ ] Diálogos se cierran correctamente

- [ ] **Accesibilidad**

  - [ ] Keyboard navigation funciona
  - [ ] Labels están presentes
  - [ ] Contrast ratios son adecuados
  - [ ] Screen readers pueden navegar

- [ ] **Responsive**
  - [ ] Funciona en mobile (320px+)
  - [ ] Funciona en tablet (768px+)
  - [ ] Funciona en desktop (1024px+)
  - [ ] Diálogos son responsive

### Paso 6.3: Documentación de Usuario

Ver: [MANUAL_USUARIO.md](./MANUAL_USUARIO.md)

---

## 🔧 Solución de Problemas Comunes

### Problema 1: "Cannot read property 'jobTitle' of undefined"

**Solución**:

```javascript
// Siempre verificar que resumeInfo existe
if (!resumeInfo?.jobTitle) {
  toast.error('Por favor añade primero el título del puesto');
  return;
}
```

### Problema 2: Preview no se muestra

**Solución**:

```javascript
// Verificar que setShowPreview se llama correctamente
setShowPreview(true); // No olvidar esto después de la generación
```

### Problema 3: Skills duplicadas

**Solución**:

```javascript
// Filtrar duplicados antes de aplicar
const handleApplySkills = () => {
  const newSkills = applyGeneratedSkills();
  const existingNames = new Set(skillsList.map((s) => s.name.toLowerCase()));
  const uniqueSkills = newSkills.filter(
    (s) => !existingNames.has(s.name.toLowerCase())
  );
  setSkillsList([...skillsList, ...uniqueSkills]);
};
```

### Problema 4: HTML no se renderiza correctamente

**Solución**:

```javascript
// Usar dangerouslySetInnerHTML correctamente
<div dangerouslySetInnerHTML={{ __html: content }} />
// O asegurar que el contenido es HTML válido
```

### Problema 5: API rate limiting

**Solución**:

```javascript
// Añadir debouncing y caché
const debouncedGenerate = debounce(generateSkills, 1000);
```

---

## 📚 Recursos Adicionales

### Documentos Relacionados

- [RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md)
- [DISEÑO_DETALLADO.md](./DISEÑO_DETALLADO.md)
- [ARQUITECTURA_TECNICA.md](./ARQUITECTURA_TECNICA.md)
- [MANUAL_USUARIO.md](./MANUAL_USUARIO.md)

### APIs y Librerías

- [Gemini AI Documentation](https://ai.google.dev/gemini-api/docs)
- [Shadcn UI Components](https://ui.shadcn.com/)
- [React Simple WYSIWYG](https://github.com/megahertz/react-simple-wysiwyg)
- [React Rating](https://github.com/smastrom/react-rating)

---

## ✅ Checklist Final de Implementación

### Servicios y Hooks

- [ ] AIContentEnhancer.js
- [ ] enhancementPrompts.js
- [ ] skillsPrompts.js
- [ ] useAIContentEnhancement.js
- [ ] useSkillsGenerator.js

### Componentes UI

- [ ] AIOptionsDialog.jsx
- [ ] AIPreviewPanel.jsx
- [ ] SkillsGeneratorInput.jsx
- [ ] GeneratedSkillsPreview.jsx

### Integraciones

- [ ] Summary.jsx modificado
- [ ] RichTextEditor.jsx modificado
- [ ] Skills.jsx modificado

### Testing

- [ ] Testing unitario de servicios
- [ ] Testing de componentes
- [ ] Testing de integración E2E
- [ ] Testing en diferentes navegadores
- [ ] Testing responsive

### Documentación

- [ ] Documentación técnica completa
- [ ] Manual de usuario
- [ ] Comentarios en código
- [ ] README actualizado

---

**Estado**: ✅ Documentación Completa  
**Fecha**: 3 de Octubre, 2025  
**Próximo Paso**: Comenzar implementación siguiendo esta guía
