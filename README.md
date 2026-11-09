# GymCoach Pro Elite 🤸‍♀️✨

**Sistema de Gestión Integral para Escuela de Gimnasia Artística (UNLP)**  
*Repositorio oficial: [profesunlp-sys/gymcoach-pro-elite](https://github.com/profesunlp-sys/gymcoach-pro-elite)*

---

## 📋 Arquitectura & Configuración de Firebase

La aplicación está conectada directamente al proyecto de producción **`gymcoachpro-c0c8e`** mediante el SDK Web de Firebase con las siguientes colecciones en Firestore:
1. `alumnos`: Padrón de atletas, notas FIG, historial biomecánico y datos de contacto.
2. `pagosGimnasia`: Registro exhaustivo de cobros mensuales y aranceles (Marzo a Noviembre).
3. `asistencias`: Pases de lista diarios por grupo y horario.
4. `profesoresGimnasia`: Padrón del cuerpo docente y entrenadores.
5. `asignacionesGimnasia`: Mapeo de docentes a grupos y pedanas.

---

## 👥 Roles y Permisos por Correo Electrónico

El sistema implementa control de acceso basado en roles (RBAC) automático mediante Login con Google:

| Email | Rol Asignado | Módulos Visibles |
| :--- | :--- | :--- |
| **`profesunlp@gmail.com`** | **Coordinador** | **Inicio (con métricas de recaudación), Pagos (6 pestañas), Atletas, Aparatos y Pase de lista.** |
| **`mi.xt1032@gmail.com`** (y cualquier otro) | **Profesor / Entrenador** | **Atletas, Aparatos y Pase de lista.** *(Completamente restringido de pagos y recaudación).* |

---

## 💳 Módulo de Pagos (Exclusivo Coordinador)

Estructurado en **6 pestañas completas**:
1. **Resumen**: Métricas de recaudación anual y mensual, matrículas percibidas y gráfico evolutivo en barras con `recharts`.
2. **Estado de Pagos (Matriz Mar-Nov)**: Grilla completa de meses (Marzo a Noviembre) donde cada celda indica si el alumno está al día (✓) o adeuda (✕). Permite filtrar por deudores, por horario y registrar cobros en un toque.
3. **Alumnos**: Detalle de historial de pagos por atleta con saldo adeudado y estado de cuenta.
4. **Grupos**: Agrupamiento por horario y días con importe acumulado y porcentaje al día.
5. **Profesores**: Desempeño y porcentaje de cuotas al día por docente a cargo.
6. **Informes**: Resumen para secretaría y botón para descargar planilla oficial en CSV.
- **📂 Cargar datos desde JSON**: Modal para subir archivos `.json` o pegar estructuras con los campos requeridos: `documento, apellido_nombre, importe, mes, mes_numero, fecha_pago, matricula, codigo, rango_etario, horario_completo, dias_semana`.

---

## 📈 Ficha Técnica con Recharts

En la ventana **Ficha Deportiva & Evolución FIG (`GymnastDetailModal`)**:
- Se integró la librería **`recharts`** con un gráfico de líneas y áreas que muestra la evolución de los puntajes en **Salto, Paralelas, Viga y Suelo** a lo largo del tiempo (Marzo, Mayo, Julio, Septiembre, Noviembre).
- Filtro interactivo para aislar un aparato específico o comparar todos a la vez.

---

## 🤸‍♀️ Aparatos & Código FIG

- Calculadora oficial con catálogo de habilidades técnicas (A, B, C, D, E, F).
- Deducciones por faltas leves (-0.10), medias (-0.30), graves (-0.50) y caídas (-1.00).
- Guardado inmediato de la nueva nota en el documento del alumno en Firestore.

---

## 📝 Pase de Lista

- Diseñado para su uso ágil desde teléfono móvil en el suelo del gimnasio.
- Estados: `Presente`, `Ausente`, `Tarde` y `Justificado`.
- Botón **"Todos Presentes"** y guardado directo en la colección `asistencias`.

---

## 💻 Ejecución Local

```bash
npm install
npm run dev
```
Dev server activo en `http://localhost:3000`.
Build para producción con `npm run build`.
