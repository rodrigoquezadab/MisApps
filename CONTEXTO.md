# 📌 Documento de Contexto y Finalidad del Proyecto

## 1. Visión General
**Mis Proyectos de GitHub** (o *GitHub Projects Showcase*) es una plataforma web interactiva y moderna concebida como un **hub / portafolio centralizado en tiempo real**. Su objetivo principal es presentar de forma visual, elegante y organizada todos los proyectos, repositorios y desarrollos de software de **Rodrigo Quezada (`@rodrigoquezadab`)**, facilitando la exploración tanto a reclutadores y clientes potenciales como a desarrolladores y usuarios finales.

---

## 2. Finalidad y Propósito de la Aplicación

### 🎯 Problema que resuelve
En GitHub, los perfiles de usuario estándar suelen presentar listas estáticas o con opciones de filtrado limitadas. Para un visitante o reclutador resulta tedioso:
- Identificar cuáles proyectos tienen una **demo web en vivo**.
- Filtrar rápidamente proyectos construidos con un lenguaje o stack específico.
- Evaluar métricas clave de actividad (estrellas acumuladas, proyectos activos, forks).
- Disfrutar de una experiencia visual atractiva y fluida.

### 🚀 Solución planteada
Esta aplicación actúa como una **capa de presentación dinámica (Showcase)** sobre la API oficial de GitHub que:
1. **Centraliza y sintetiza** la información de los proyectos de forma automática y siempre actualizada.
2. **Prioriza el acceso a demos funcionales** para que cualquier usuario pueda interactuar con las aplicaciones con un solo clic.
3. **Ofrece herramientas de descubrimiento rápido**: buscador en tiempo real por palabras clave, filtros por tecnologías y ordenamiento inteligente.
4. **Garantiza una experiencia premium** mediante una interfaz moderna en modo oscuro, con efectos de desenfoque (*glassmorphism*), animaciones suaves y diseño completamente adaptativo (móvil, tablet y escritorio).

---

## 3. Público Objetivo y Casos de Uso

| Perfil de Usuario | Necesidad Principal | Beneficio en la Aplicación |
| :--- | :--- | :--- |
| **Reclutadores & Tech Leads** | Evaluar la experiencia técnica, calidad de código y proyectos destacados rápidamente. | Resumen de métricas globales, lenguaje predominante, enlaces directos a demos y código fuente. |
| **Usuarios Finales & Clientes** | Probar aplicaciones y herramientas desarrolladas. | Filtro *"Solo con Demo"* para interactuar de inmediato con las aplicaciones publicadas. |
| **Desarrolladores & Comunidad** | Conocer implementaciones, aprender de código abierto o contribuir. | Acceso directo a repositorios, badges de lenguaje, número de estrellas y bifurcaciones (forks). |

---

## 4. Arquitectura y Decisiones Técnicas

### 4.1. Enfoque "Zero-Build" / Jamstack Puro
- **Estructura Modular Limpia**: Código desacoplado en tres archivos principales: [`index.html`](file:///c:/Users/Rod/Desktop/code/MisApps/index.html) (estructura y accesibilidad), [`style.css`](file:///c:/Users/Rod/Desktop/code/MisApps/style.css) (diseño, efectos y animaciones) y [`app.js`](file:///c:/Users/Rod/Desktop/code/MisApps/app.js) (lógica reactiva y consumo de APIs).
- **Sin herramientas de compilación complejas**: No requiere `npm install`, Webpack o Vite para ejecutarse; puede correrse abriendo directamente el archivo o alojarse en cualquier servidor estático (GitHub Pages, Vercel, Netlify).

### 4.2. Stack Tecnológico
- **HTML5**: Marcado accesible con atributos ARIA y jerarquía semántica para SEO.
- **Tailwind CSS + CSS3 Vanilla (`style.css`)**: Sistema de diseño atómico y responsivo con paleta de colores personalizada en modo oscuro, efectos de desenfoque (*glassmorphism*) y *glows* ambientales.
- **Vanilla JavaScript ES6+ (`app.js`)**: Lógica reactiva para peticiones asíncronas (`fetch`), gestión de estado local en memoria, manipulación del DOM, control de modales y manejo seguro de `localStorage`.
- **Google Fonts (Outfit)**: Tipografía moderna y legible de alto impacto estético.
- **GitHub REST API v3**: Fuente de datos en vivo (`/users/{username}`, `/users/{username}/repos`, `/traffic`, `/pages`, `/languages`).

### 4.3. Resiliencia y Control de Límites de la API
- **Manejo de Rate Limit**: La API pública de GitHub permite hasta 60 consultas/hora por IP. La aplicación incluye un panel modal de configuración donde el usuario puede ingresar un *Personal Access Token (PAT)* opcional.
- **Privacidad Total**: Dicho token se almacena exclusivamente en el `localStorage` del navegador del cliente y nunca se envía a servidores intermediarios.
- **Feedback Visual y Estados**: Manejo de estados de carga con *Skeleton loaders* (`animate-pulse`), estado de error amigable con botón de reintento, y estado vacío (*empty state*) cuando no hay coincidencias de búsqueda.
- **Modal de Estadísticas y Tráfico**: Consulta bajo demanda (`/traffic/views`, `/traffic/clones`, `/traffic/popular/referrers`, `/pages`, `/languages`, `/commits`) para visualizar analítica de tráfico, estado del despliegue en Pages y barra gráfica de composición de lenguajes sin saturar la interfaz principal de las tarjetas.

---

## 5. Principios de Experiencia de Usuario (UI/UX)
- **Modo Oscuro Inmersivo**: Fondo `slate-950` con halos de luz difusa ambiental en tonos índigo y cian.
- **Micro-interacciones y Feedback Inmediato**: Las tarjetas de proyectos reaccionan al cursor con elevación y borde brillante (`glass-hover`).
- **Navegación Instantánea**: Filtros y búsquedas se procesan en memoria del cliente sin recargas de página.
- **Totalmente Responsivo**: Adaptación fluida desde teléfonos pequeños (320px) hasta pantallas ultrawide.

---

## 6. Mantenimiento y Extensiones Futuras
- Posibilidad de parametrizar el nombre de usuario mediante query params en la URL (`?user=usuario`).
- Integración de sistema de etiquetas personalizadas (tags / topics de GitHub).
- Soporte para paginación o scroll infinito si el número de repositorios supera los 100.
- Soporte para compartir tarjetas o filtros específicos mediante enlaces directos.
