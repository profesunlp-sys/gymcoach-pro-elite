# GymCoach Pro Elite

Aplicación de gestión integral para escuelas de gimnasia artística (~300 alumnas/alumnos). Permite gestionar gimnastas, pasar lista, controlar pagos y morosos, evaluar el progreso técnico, administrar profesores, y consultar documentos (código FIG, ejercicios de federaciones) con asistencia de IA.

## Funcionalidades

- 👥 **Alumnos/Gimnastas**: alta, edición, importación masiva CSV/Excel, deduplicación, contacto de familias, alertas.
- ✅ **Asistencia**: pasar lista por grupo, exportar a CSV/Excel, estadísticas de presentismo y **ausentismo** (ranking de quién falta más).
- 💳 **Pagos y Morosos**: grilla anual de cuotas, importación de pagos, detección de morosos.
- 📊 **Evaluaciones**: evaluaciones periódicas por gimnasta con radar y evolución en el tiempo.
- 🏅 **Habilidades**: biblioteca global + progreso individual con **historial de evolución** (No Iniciado → En Proceso → Dominado).
- 👩‍🏫 **Profesores/Staff**: alta, edición, baja, detalle de grupos y clases, control de actividad mensual.
- 📚 **Documentos**: carga de PDFs (código internacional de puntuación, ejercicios obligatorios de federaciones) y consulta con IA (RAG).
- 🤖 **IA (Gemini)**: análisis de clases por voz, insights de estadísticas, respuestas sobre documentos.

## Stack

- React 19 + TypeScript + Vite
- Firebase (Firestore + Auth)
- Tailwind CSS, Recharts, Framer Motion
- Gemini AI (`@google/genai`)

## Requisitos previos

- Node.js 18+
- Una cuenta de [Firebase](https://console.firebase.google.com) con Firestore y Auth habilitados.
- (Opcional) una API key de [Google AI Studio](https://aistudio.google.com) para Gemini.

## Configuración local

1. Clonar e instalar dependencias:

   ```bash
   npm install
   ```

2. Crear `.env.local` a partir de `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

3. Completar las variables en `.env.local`:

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_GEMINI_API_KEY=...
   ```

   > Alternativa: podés editar `firebase-applet-config.json` con tu configuración de Firebase. Las variables de entorno tienen prioridad.

4. Ejecutar en desarrollo:

   ```bash
   npm run dev
   ```

5. Build de producción:

   ```bash
   npm run build
   ```

## Despliegue en Vercel

### Opción A — Importar desde GitHub (recomendado)

1. Subí el proyecto a GitHub:

   ```bash
   git init
   git add .
   git commit -m "GymCoach Pro Elite"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/gymcoach-pro-elite.git
   git push -u origin main
   ```

2. En [vercel.com](https://vercel.com) → **New Project** → importá el repo `gymcoach-pro-elite`.

3. Vercel detectará Vite automáticamente (ya está configurado en `vercel.json`). Si no, configurá:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Agregá las **Environment Variables** en Vercel (Project Settings → Environment Variables):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GEMINI_API_KEY`

5. Deploy. Listo. 🎉

### Opción B — CLI de Vercel

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # producción
```

### Importante: dominio autorizado en Firebase

El `authDomain` de Firebase debe ser el original (`TU_PROYECTO.firebaseapp.com`), **no** el dominio de Vercel. Luego agregá el dominio de Vercel en **Firebase Console → Authentication → Settings → Authorized domains**.

## Estructura del proyecto

```
├── App.tsx                  # Componente principal (enrutamiento por estado)
├── index.tsx                # Punto de entrada React
├── index.html               # HTML base (Tailwind por CDN)
├── types.ts                 # Tipos TypeScript
├── constants.tsx            # SKILL_TREE, disciplinas, niveles
├── services/
│   ├── firebase.ts          # Config y helpers de Firestore
│   └── geminiService.ts     # Integración Gemini (voz, RAG, stats)
├── src/components/
│   ├── Dashboard.tsx        # Pantalla principal
│   ├── Alumnos.tsx          # Gestión de gimnastas
│   ├── Asistencia.tsx       # Pase de lista
│   ├── ControlPagos.tsx     # Control de pagos
│   ├── Morosos.tsx          # Deudores de cuota
│   ├── Evaluaciones.tsx     # Evaluaciones periódicas
│   ├── Habilidades.tsx      # Biblioteca de habilidades
│   ├── Staff.tsx            # Gestión de profesores
│   ├── Reportes.tsx         # Estadísticas e informes
│   ├── Manuales.tsx         # Documentos + base de conocimiento
│   └── ...
└── vercel.json              # Configuración de Vercel
```

## Cómo subir el proyecto a GitHub (paso a paso, sin saber programar)

> Antes de subir, el archivo `.gitignore` ya se encarga de **no** subir la carpeta `node_modules` (los archivos de instalación), la carpeta `dist` (el build) ni tu archivo `.env.local` (tus claves secretas). Solo se sube el código.

**Paso 1 — Instalar Git**
Entrá a [git-scm.com](https://git-scm.com/downloads), descargá Git para Windows e instalalo dando "Siguiente" a todo.

**Paso 2 — Crear un repositorio vacío en GitHub**
1. Entrá a [github.com](https://github.com) y registrate (o iniciá sesión).
2. Arriba a la derecha tocá el botón **+** y elegí **New repository**.
3. Poné un nombre, por ejemplo `gymcoach-pro-elite`.
4. Dejalo **Público** o **Privado** (como prefieras) y tocá **Create repository**. No marques ninguna casilla de "README".

**Paso 3 — Subir la carpeta desde tu computadora**
1. Abrí la carpeta `C:\workspace\GymCoach` en el Explorador de Windows.
2. Hacé **clic derecho** en un espacio vacío de la carpeta y elegí **"Git Bash Here"** (o **"Open Git Bash here"**).
3. Se abre una ventana negra. Pegá estos comandos **uno por uno**, presionando Enter después de cada uno:

```bash
git init
git add .
git commit -m "Primera versión de GymCoach Pro"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/gymcoach-pro-elite.git
git push -u origin main
```

> En el último comando, cambiá `TU_USUARIO` por tu nombre de usuario real de GitHub. Te va a pedir usuario y contraseña (o token). Listo, tu código queda en GitHub.

**Paso 4 — (Opcional) Conectar a Vercel**
1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión con tu cuenta de GitHub.
2. Tocá **New Project** y elegí tu repositorio `gymcoach-pro-elite`.
3. Vercel detecta todo solo. Tocá **Deploy** y esperá 1-2 minutos.
4. Cuando termine, te da una dirección web (ej. `https://gymcoach-pro-elite.vercel.app`) para usar la app desde el teléfono.

> ⚠️ En Vercel, en **Settings → Environment Variables**, agregá `VITE_GEMINI_API_KEY` con tu clave de Google AI Studio para que funcione la IA. (La clave de Firebase ya está dentro del proyecto y no es secreta.)

## Roadmap de mejoras

Ver [INFORME_CONTROL_CALIDAD.md](./INFORME_CONTROL_CALIDAD.md) para el detalle completo del control de calidad y el plan priorizado.
