# PROMPT PARA REDISEÑAR LA APP GYMCOACH PRO ELITE

Sos un diseñador experto en interfaces de usuario (UI/UX). Necesito que rediseñes por completo la interfaz de una aplicación web de gestión para una escuela de gimnasia artística. La app ya existe y es funcional, pero la interfaz actual es **confusa, recargada y poco intuitiva**. Quiero que la transformes en una interfaz **minimalista, amigable, intuitiva y moderna**, sin perder ninguna de sus funciones.

---

## QUÉ ES LA APP

GymCoach Pro Elite es una aplicación para gestionar una escuela de gimnasia artística con aproximadamente 300 alumnas y alumnos (gimnastas). La usan dos tipos de personas:

1. **Entrenadores/Profesores (Coach):** pasan lista, registran clases, evalúan el progreso técnico de las gimnastas y consultan documentos.
2. **Coordinador/a (Coordinator):** hace todo lo anterior, y además controla pagos, morosos, profesores y estadísticas generales.

Es una app **pensada para el teléfono (móvil primero)**, con un estilo actual tipo iOS (fondos claros, tarjetas redondeadas, sombras suaves).

---

## ENTIDADES DE DATOS (lo que maneja la app)

- **Alumnos/Gimnastas:** nombre, DNI, edad, fecha de nacimiento, disciplina (GAF, GAM, Trampolín, Rítmica), nivel, grupo, contacto de familiares, observaciones médicas, alertas.
- **Grupos:** nombre, días de entrenamiento, horario, profesor a cargo, rango de edad.
- **Clases:** fecha, grupo, horario, profesor, fases de la clase (inicial / principal / final), objetivos, observaciones, habilidades trabajadas.
- **Asistencia:** registro diario de quién estuvo presente o ausente.
- **Pagos:** cuotas mensuales (de marzo a noviembre) por alumna.
- **Habilidades:** ejercicios por aparato (Suelo, Viga, Paralelas, Salto, Anillas, Arzones, Barra Fija) con estado (No Iniciado, En Proceso, Dominado, Elite) y un historial de evolución.
- **Evaluaciones:** evaluaciones periódicas por gimnasta, con puntajes de 0 a 10 en fuerza, flexibilidad, técnica, resistencia y coordinación.
- **Profesores:** nombre, grupos a cargo, clases dictadas.
- **Documentos:** archivos PDF (código internacional de puntuación, ejercicios obligatorios de federaciones) que se pueden consultar con inteligencia artificial.

---

## PANTALLAS Y FUNCIONES ACTUALES

### 1. Inicio de sesión (Login)
- Entrar con Google o con email y contraseña.
- Registrar un usuario nuevo.
- Recuperar contraseña olvidada.

### 2. Pantalla principal (Dashboard)
- Saludo con el nombre de la persona y la fecha de hoy.
- Próximas clases del día.
- Alertas importantes (gimnastas con avisos).
- Resumen rápido: total de alumnas, presentes hoy, pagos al día.

### 3. Alumnos (lista)
- Ver la lista de gimnastas con búsqueda y filtros (por grupo, nivel, edad, condición física).
- Agregar, editar y eliminar alumnas.
- Importar la lista desde un archivo Excel o CSV.
- Eliminar alumnas duplicadas.

### 4. Detalle de una Alumna
- Pestañas: Progreso (habilidades), Asistencia, Biometría, Contacto, Pagos.
- Gestionar habilidades: agregar, editar, eliminar, marcar como favorita y ver su evolución.
- Ver biometría (gráfico de radar: fuerza, flexibilidad, técnica, resistencia, coordinación).
- Comentarios del entrenador.
- Datos de contacto de la familia.
- Historial de asistencia y pagos.

### 5. Asistencia (pasar lista)
- Elegir un grupo.
- Marcar presente o ausente a cada alumna.
- Ver estadísticas del grupo.
- Exportar la lista a Excel o CSV.
- Análisis automático con IA.

### 6. Clases
- Crear una clase (escribiendo el formulario o dictándola por voz, que la IA la interpreta).
- Formulario con las fases: inicial, principal y final.
- Ver historial de clases.
- Ver el detalle de una clase.

### 7. Grupos (horarios)
- Crear, editar y eliminar grupos.
- Asignar profesor, días de entrenamiento, horario y rango de edad.

### 8. Control de Pagos
- Ver una grilla anual (de marzo a noviembre) por alumna.
- Marcar cada cuota como pagada o no pagada.
- Importar pagos desde un Excel.

### 9. Morosos (deudores)
- Lista de alumnas que deben cuotas.
- Filtrar por grupo.
- Ver cuántas cuotas debe cada una.

### 10. Evaluaciones
- Elegir una alumna.
- Crear una evaluación con 5 puntajes (fuerza, flexibilidad, técnica, resistencia, coordinación).
- Ver un gráfico de radar del estado actual.
- Ver la evolución en el tiempo (gráfico de líneas).
- Ver el historial de evaluaciones.

### 11. Habilidades (biblioteca de ejercicios)
- Biblioteca general de ejercicios ordenados por aparato.
- Agregar, editar y eliminar ejercicios.

### 12. Profesores (Staff)
- Lista de profesores.
- Agregar, editar y eliminar profesores.
- Ver detalle de un profesor: clases del mes, grupos a cargo, cantidad de alumnos, habilidades trabajadas.

### 13. Estadísticas (Reportes)
- Tendencia de asistencia de los últimos días.
- Ranking de ausentismo (quién falta más).
- Reportes por grupo.
- Reporte de biometría.
- Exportar a PDF.

### 14. Documentos (Centro Técnico)
- Subir archivos PDF.
- Chatear con la IA para hacer preguntas sobre los documentos.
- Ver ejercicios ordenados por disciplina y nivel.

### 15. Emergencias
- Ver contactos de emergencia.

### 16. Ajustes (Configuración)
- Perfil de usuario.
- Preferencias.
- Copia de seguridad (exportar todos los datos).

---

## CÓMO SE NAVEGA HOY

- **Barra inferior** (en el teléfono): Inicio, Alumnos, Grupos, Asistencia y un botón "Más".
- **Menú "Más opciones"**: una grilla con Asistencia, Grupos, Estadísticas, Documentos, Staff, Habilidades, Pagos, Morosos y Evaluaciones.
- Botones "Volver" en las pantallas secundarias.

---

## PROBLEMAS ACTUALES QUE QUIERO RESOLVER

1. La navegación es confusa: no se entiende dónde está cada cosa.
2. Hay pantallas repetidas o con funciones mezcladas.
3. Algunos botones no llevan a donde uno espera.
4. El diseño está recargado: demasiadas tarjetas, textos, íconos y colores.
5. No es intuitivo para una persona que no es experta en tecnología.

---

## LO QUE QUIERO LOGRAR

- **Minimalista:** pocos elementos, mucho espacio en blanco, sin ruido visual.
- **Intuitivo:** que cualquier persona entienda qué hacer sin que le expliquen nada.
- **Amigable:** colores suaves, textos claros y simples, íconos fáciles de entender.
- **Móvil primero:** pensado para usarse con una mano en el teléfono.
- **Organizado:** agrupar las funciones de forma lógica. Por ejemplo, en secciones como: "Diario" (asistencia y clases), "Dinero" (pagos y morosos), "Progreso" (habilidades y evaluaciones) y "Administración" (alumnos, grupos, profesores, documentos, estadísticas).
- **Mantener TODAS las funciones actuales:** solo reorganizar y simplificar la interfaz, sin quitar nada.

---

## QUÉ TE PIDO

Rediseñá la interfaz completa de esta app. Proponé:

1. Una nueva estructura de navegación (menos pantallas o mejor agrupadas).
2. El diseño de cada pantalla principal (descripción visual detallada o wireframe en texto).
3. Una paleta de colores y una tipografía limpias.
4. Cómo deberían verse los botones, tarjetas, formularios y listas.
5. Cualquier simplificación que haga la app más fácil de usar.
