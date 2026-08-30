# 🌟 Mis Proyectos de GitHub | Showcase & Dashboard

<div align="center">

[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![GitHub API](https://img.shields.io/badge/GitHub-REST_API_v3-181717?logo=github)](https://docs.github.com/rest)
[![Diseño: Tailwind CSS](https://img.shields.io/badge/Estilos-Tailwind_CSS-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JS-Vanilla_ES6+-f7df1e?logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Estado](https://img.shields.io/badge/Estado-100%25_Funcional-emerald)]()

**Explora, filtra y prueba mis aplicaciones y repositorios en tiempo real con una experiencia visual moderna y fluida.**

[✨ Probar la Aplicación](#-cómo-empezar-a-usar-la-aplicación) • [🎯 Características](#-características-principales) • [💡 Guía de Usuario](#-guía-rápida-para-el-usuario) • [❓ Preguntas Frecuentes](#-preguntas-frecuentes-faq)

</div>

---

## 📖 ¿Qué es esta aplicación?

**Mis Proyectos de GitHub** es un panel interactivo diseñado para que cualquier persona (visitantes, clientes, reclutadores o desarrolladores) pueda **descubrir, probar e interactuar fácilmente** con los proyectos creados por **[Rodrigo Quezada (@rodrigoquezadab)](https://github.com/rodrigoquezadab)**.

En lugar de navegar por una lista técnica y estática, esta aplicación te ofrece un escaparate visual que se actualiza automáticamente con datos en vivo directamente desde GitHub.

---

## 🎯 Características Principales

- ⚡ **Datos en Tiempo Real**: Estadísticas actualizadas (proyectos totales, estrellas, forks y lenguaje principal).
- 🌐 **Acceso Inmediato a Demos**: Identifica y abre al instante las aplicaciones que tienen versión web desplegada y lista para usar.
- 🔍 **Buscador Inteligente**: Encuentra proyectos en milisegundos escribiendo palabras clave, nombres o tecnologías.
- 🏷️ **Filtros por Tecnología**: Filtra por JavaScript, HTML, TypeScript, Python o cualquiera de los lenguajes utilizados.
- 🎛️ **Ordenamiento Personalizado**: Ordena los proyectos por los más recientes, más populares (estrellas), con más actividad o por orden alfabético.
- 📊 **Modal de Métricas y Tráfico**: Consulta analítica de tráfico (vistas, visitantes únicos, clones), estado de despliegue en GitHub Pages, desglose porcentual de lenguajes y último commit de cada repositorio con un solo clic.
- 🌙 **Diseño Oscuro Premium**: Interfaz cuidada con estética *glassmorphism*, animaciones sutiles y total adaptación a teléfonos móviles, tablets y computadoras.

---

## 💡 Guía Rápida para el Usuario

### 1. 🔍 Buscar un proyecto específico
* En la barra de búsqueda superior, escribe cualquier término (ej: *portfolio*, *bot*, *react*, *api*). Los resultados se filtrarán al instante mientras escribes.

### 2. 🌐 Ver únicamente proyectos con Demo en vivo
* Activa el interruptor **"Solo con Demo"** para ver únicamente las aplicaciones interactivas que puedes probar directamente en tu navegador sin instalar nada.

### 3. 🏷️ Filtrar por Lenguaje o Tecnología
* Haz clic en el menú desplegable **"Todos los lenguajes"** y selecciona la tecnología de tu interés (JavaScript, CSS, etc.).

### 4. 🔀 Ordenar los proyectos
* Usa el selector de orden para organizar las tarjetas según:
  * **Más recientes**: Proyectos actualizados recientemente.
  * **Más estrellas ⭐**: Proyectos más valorados por la comunidad.
  * **Más forks 🍴**: Proyectos con más bifurcaciones.
  * **Nombre (A-Z)**: Orden alfabético.

### 5. 🚀 Acciones Rápidas en cada Tarjeta
* Cada tarjeta de proyecto cuenta con 3 botones:
  * **Código 📦**: Abre el código fuente en GitHub para que puedas revisarlo o clonarlo.
  * **Stats 📊**: Abre una ventana modal con el tráfico de visitas, clones, estado de GitHub Pages, gráfica de lenguajes y última actividad.
  * **Ver Demo 🚀**: Te redirige a la aplicación funcional desplegada en la web.

---

## 🚀 ¿Cómo empezar a usar la aplicación?

Dado que es una aplicación web ligera y 100% en el navegador (sin necesidad de instalaciones complejas):

### Opción 1: Abrir directamente (La más rápida)
1. Descarga o clona este repositorio en tu computadora.
2. Haz **doble clic en el archivo [`index.html`](file:///c:/Users/Rod/Desktop/code/MisApps/index.html)** para abrirlo en Chrome, Edge, Firefox, Safari o tu navegador preferido.

### Opción 2: Usar un servidor local
Si prefieres correrlo en un entorno de desarrollo local:

```bash
# Usando Node.js / npx
npx serve .

# O usando Python
python -m http.server 8000
```
Luego abre `http://localhost:3000` o `http://localhost:8000` en tu navegador.

---

## ⚙️ Configuración Opcional (Token de GitHub)

La API pública de GitHub permite hasta **60 consultas por hora** por conexión a internet. Si usas mucho la aplicación o estás en una red compartida y alcanzas este límite:

1. Haz clic en el icono de **Configuración ⚙️** en la esquina superior derecha.
2. Pega un *Personal Access Token* (Token de Acceso Personal) de GitHub (un token público sin permisos especiales es suficiente).
3. Haz clic en **Guardar Token**.

> 🔒 **Tu privacidad es 100% segura**: El token se guarda únicamente en la memoria de tu navegador (`localStorage`) y nunca se comparte ni se envía a ningún servidor externo.

---

## ❓ Preguntas Frecuentes (FAQ)

<details>
<summary><b>¿Necesito instalar Node.js o librerías para ver la aplicación?</b></summary>
No. La aplicación funciona con tecnologías web nativas. Puedes abrir el archivo <code>index.html</code> directamente en cualquier navegador moderno.
</details>

<details>
<summary><b>¿Por qué algunos proyectos no tienen el botón "Ver Demo"?</b></summary>
El botón "Ver Demo" solo aparece en los proyectos que tienen una página web publicada (a través de GitHub Pages, Vercel, Netlify, etc.) configurada en su repositorio.
</details>

<details>
<summary><b>¿Los datos de los proyectos están actualizados?</b></summary>
Sí. Cada vez que cargas o refrescas la página, la aplicación consulta la API oficial de GitHub para mostrar el conteo exacto de repositorios, estrellas, forks y descripciones en tiempo real.
</details>

---

## 👨‍💻 Sobre el Desarrollador

Desarrollado con dedicación por **Rodrigo Quezada**:

- 🐙 **GitHub**: [@rodrigoquezadab](https://github.com/rodrigoquezadab)
- 📍 **Ubicación**: Chile
- 💼 **Perfil Profesional**: Desarrollador de Software

---

## 📝 Licencia

Este proyecto está bajo la Licencia [MIT](https://opensource.org/licenses/MIT). Eres libre de usarlo, adaptarlo y personalizarlo para tu propio portafolio.
