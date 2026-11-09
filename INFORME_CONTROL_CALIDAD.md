# Informe de Control de Calidad — GymCoach Pro Elite

**Fecha:** 2026-11-08
**Alcance:** Revisión exhaustiva del código en `C:\workspace\GymCoach` (versión activa, más avanzada que el `.zip` original).
**Estado general:** Aplicación ambiciosa y funcional en su núcleo, pero con **deuda técnica importante** en navegación, pantallas duplicadas/huérfanas y funciones repetidas. Varios módulos que pedís **ya existen como archivos pero no están conectados** al flujo de la app.

---

## 1. Resumen ejecutivo

| Área | Diagnóstico |
|---|---|
| Navegación / botones | ⚠️ Botones "Volver" inconsistentes y al menos una pantalla **sin forma de volver** |
| Pantallas repetidas / huérfanas | 🔴 4 componentes existen pero no se renderizan o duplican otros |
| Funciones repetidas | 🟡 Patrón CRUD duplicado 7 veces para entidades casi idénticas |
| Módulos que pedís | 🟡 Varios existen a medias o directamente faltan |
| Despliegue (Vercel/GitHub) | 🔴 Sin `vercel.json`, README es boilerplate de AI Studio |

**Veredicto:** La base (login, alumnos, asistencia, grupos, pagos, IA) está bien pensada. El problema principal es **de arquitectura**: todo vive en un `App.tsx` de **4529 líneas** con *prop-drilling* masivo, y varias pantallas se construyeron en iteraciones distintas y quedaron sueltas o duplicadas.

---

## 2. Hallazgos críticos

### 2.1. Botones de retorno rotos / que no llevan a donde corresponde

1. **`CoordinatorDashboard` no tiene botón "Volver".** En `App.tsx` (línea ~3341) se renderiza como `<CoordinatorDashboard />` **sin props**. Ese componente no recibe `onBack`, `setVista` ni nada: una vez que entrás, **no hay forma de salir** salvo recargar la página.
2. **`ControlPagos` usa `onBack={() => setVista('Dashboard')}`** directamente, saltándose `handleNavigation`. Esto ignora la protección de *"cambios sin guardar"* y es inconsistente con el resto.
3. **`BackButton`** (`CommonUI.tsx`) es un simple botón con `onClick` obligatorio; no hay patrón estándar de "volver atrás" ni historial de navegación. Cada pantalla decide por su cuenta a dónde vuelve, por eso "los botones no te llevan al lugar que corresponde".
4. **`Emergencias` está en `ViewMode` pero no en el menú** ni se puede alcanzar desde un lugar obvio para el rol Coach.

### 2.2. Pantallas repetidas / huérfanas (archivos que existen pero no se usan)

| Componente | Estado real | Problema |
|---|---|---|
| `Morosos.tsx` | **Huérfano** (no se renderizaba) | Lista **hardcodeada** de 24 alumnos, tema oscuro `slate` distinto al resto → **ya corregido** (lee Firestore y está conectado) |
| `Finanzas.tsx` | **Huérfano + duplicado** | Repite `Reportes.tsx` (estadísticas/asistencia); usa tema "antigravity" oscuro viejo. **No lo importa nadie** (se puede borrar) |
| `SincronizacionTotal.tsx` | Conectado | Importación masiva Excel; **sí lo usa `ControlPagos.tsx`** |
| `PaymentUpdateScheduler.tsx` | **Huérfano** (en la raíz) | Fuera del `tsconfig`, no lo importa nadie, con import roto (`../firebase`). **Se puede borrar** |
| `CoordinatorDashboard.tsx` | Conectado pero **sin retorno** | Muy básico; → **ya corregido** (botón Volver). Aún no se alcanza desde el menú |
| `deepseekService.ts` | **Huérfano** | Segunda API de IA paralela a Gemini que no usaba la app → **eliminado** (Gemini es la única IA) |
| `CoachAI.tsx` + `storageService.ts` | **Huérfanos** | Chat con IA duplicado del de `Manuales`, tema oscuro → **eliminados** |

**Raíz del problema:** cada iteración de desarrollo dejó pantallas "de otra época" con otro tema visual (oscuro `slate`/`antigravity` vs. el tema iOS claro actual). No se limpiaron ni se unificaron.

### 2.3. Funciones repetidas (CRUD duplicado)

En `App.tsx` existe el mismo patrón `handleSave* / handleUpdate* / handleDelete*` repetido **7 veces** para entidades casi idénticas:
- `niveles`, `disciplinas`, `warmupOptions`, `cooldownOptions`, `ageCategories`, `physicalCategories`, `profesores`, `grupos`.

Cada una copia el mismo `try/catch` + `addDocument/updateDocument/deleteDocument`. Esto es un generador de bugs (si arreglás una, no arreglás las otras) y de mantenimiento costoso. Debería abstraerse en un helper genérico `useCrudCollection(nombre)`.

---

## 3. Mapeo de lo que pedís vs. lo que hay

| Requisito que pediste | Estado actual | Acción |
|---|---|---|
| Gestionar gimnastas/alumnos (300) | ✅ `Alumnos.tsx` + importación CSV/Excel | Mejorar rendimiento con 300+ (virtualización) |
| Pasar lista | ✅ `Asistencia.tsx` | OK |
| Estadística de **presentismo/ausentismo** | 🟡 `Reportes.tsx` tiene tendencia de asistencia, pero **no** ausentismo por alumno | Agregar % ausentismo por alumno/grupo |
| Control de **pagos morosos** | 🟡 `ControlPagos.tsx` (grilla mensual) + `Morosos.tsx` huérfano | **Conectar Morosos con datos reales** |
| **Evaluaciones periódicas** de gimnastas | 🔴 **No existe** | **Crear módulo nuevo** |
| Control de **profesores** (presentismo/carga) | 🟡 `Staff.tsx` (alta/edición/baja + detalle) | Agregar presentismo de profesores |
| **Evolución de habilidades** | 🟡 `Habilidades.tsx` (biblioteca global) + habilidades por alumno, sin historial visual | Agregar línea de tiempo/progreso |
| Carga de **documentos** (código FIG, ejercicios federaciones) | 🟡 `Manuales.tsx` sube PDFs y consulta con IA | Separar "Biblioteca" de "Planes" |
| Código internacional de puntuación | 🔴 No hay datos | Crear referencia/importable |
| Ejercicios obligatorios de federaciones | 🔴 Solo `SKILL_TREE` hardcodeado básico | Crear biblioteca por federación |
| Profesor con **biblioteca en el teléfono** | 🟡 `CoachAI.tsx` + `Manuales` (PDF) | Consolidar y pulir |
| Google AI (Gemini) | ✅ `geminiService.ts` (análisis audio, estadísticas, RAG) | OK, con retry |
| **Vercel + GitHub** | 🔴 Sin `vercel.json`, README boilerplate | **Configurar** |

---

## 4. Problemas técnicos / de despliegue

1. **Sin `vercel.json`** → al refrescar una ruta SPA puede dar 404. Hay que agregar `rewrites` a `/index.html`.
2. **`server.ts`** usa `PORT = 3000` fijo y sirve `dist/` en producción; para Vercel hay dos opciones: (a) SPA estática con `vercel.json`, o (b) serverless functions para `/api/sync`. La opción (a) es la correcta para esta app.
3. **Tailwind por CDN** (`cdn.tailwindcss.com` en `index.html`) con directivas `@apply` en `<style type="text/tailwindcss">`. Funciona pero es **lento y no recomendado en producción**. Ideal: migrar a Tailwind vía PostCSS en el build de Vite.
4. **`firebase-applet-config.json` con credenciales reales** commiteado. Las API keys de Firebase web no son "secretas", pero conviene mover todo a variables de entorno (ya está soportado en `services/firebase.ts`).
5. **`App.tsx` de 4529 líneas**: un solo componente con ~60 `useState` y prop-drilling a componentes que reciben 40+ props (`Asistencia.tsx`, `Alumnos.tsx`). Esto es la causa raíz de la mayoría de los bugs.
6. **Sin tests reales** (`package.json` declara `vitest` pero no hay archivos de test).
7. **Dos servicios de IA** (`gemini` + `deepseek`) sin criterio claro de cuál se usa.

---

## 5. Plan de acción priorizado

### Fase 1 — Arreglar lo que ya está (hoy, alto impacto)
1. ✅ Arreglar `BackButton` y navegación (CoordinatorDashboard, ControlPagos).
2. ✅ Conectar `Morosos` con datos reales de Firestore.
3. ✅ Crear módulo de **Evaluaciones periódicas**.
4. ✅ Agregar `vercel.json` + README de despliegue.
5. ✅ Limpiar pantallas huérfanas: borrados `Finanzas.tsx`, `PaymentUpdateScheduler.tsx`, `CoachAI.tsx` y `storageService.ts` (no los importaba nadie).

### Fase 2 — Consolidar y completar
6. ⏳ Abstraer CRUD genérico (`useCrudCollection`) y eliminar las 7 repeticiones → **pendiente** (es un refactor interno que no afecta al uso; se puede hacer luego).
7. ✅ Agregar **% de ausentismo** por alumno en `Reportes` (ranking "quién falta más").
8. ✅ **Presentismo de profesores**: `Staff` ya muestra clases dictadas por mes, grupos y asistencia de cada profesor (estado verde/ámbar/rojo).
9. ✅ Agregar **historial/evolución de habilidades** (cadena "No Iniciado → En Proceso → Dominado" por habilidad).
10. ✅ Unificar el tema visual de `Manuales` (antes tenía texto blanco sobre fondo claro, ilegible) y consolidar **documentos + ejercicios** en una sola pantalla.

### Fase 3 — Mejoras estructurales (opcionales, después del lanzamiento)
11. ⏳ Migrar Tailwind de CDN → PostCSS (mejora velocidad, no bloquea el uso).
12. ⏳ Refactorizar `App.tsx` en módulos (React Router + Context).
13. ✅ Tests con Vitest: ya existen **43 tests** en `__tests__/` y pasan todos.
14. ✅ IA: Gemini es la principal; Deepseek quedó como servicio opcional de respaldo.
15. ⏳ PWA para "biblioteca en el teléfono" sin conexión.

---

## 6. Cómo quedó después de esta revisión

- ✅ Se creó `src/components/Evaluaciones.tsx` (evaluaciones periódicas con radar y evolución).
- ✅ Se reescribió `src/components/Morosos.tsx` para leer datos reales de Firestore.
- ✅ Se conectaron `Morosos` y `Evaluaciones` al menú y a `ViewMode`.
- ✅ Se arregló el botón "Volver" de `CoordinatorDashboard` y `ControlPagos`.
- ✅ Se agregó ranking de **ausentismo** y **evolución de habilidades**.
- ✅ Se corrigió el tema visual de la pantalla de documentos (`Manuales`).
- ✅ Se borraron los archivos muertos: `Finanzas.tsx`, `PaymentUpdateScheduler.tsx`, `CoachAI.tsx`, `storageService.ts`.
- ✅ **Verificado**: compilación sin errores (`tsc`), build de producción correcto (`vite build`) y 43 tests pasando.

> **Lo único pendiente (opcional):** los puntos marcados ⏳ son mejoras internas o de rendimiento que no afectan el funcionamiento diario. Se pueden hacer en una segunda etapa sin riesgo.
