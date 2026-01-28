# Plan de Acción: Refactor a Modales con Intercepting Routes en Next.js

## 1. Filosofía y Objetivo

**El Problema:** Navegar a una página nueva para un simple formulario de creación o edición es una mala experiencia de usuario (UX). Se pierde el contexto, se fuerza un full-page load y se siente lento. La solución inicial de "mostrar un modal con un state" es un desastre de arquitectura (un *anti-patrón*), ya que rompe la resiliencia de la URL y complica el manejo de estado.

**La Solución de Arquitecto:** Usaremos **Intercepting Routes** de Next.js. Esto nos da lo mejor de los dos mundos:
- **Para el Usuario:** Una experiencia fluida, mostrando formularios en modales (drawers) sin abandonar la página actual.
- **Para la Arquitectura:** Mantenemos URLs limpias y resilientes. Cada formulario sigue "viviendo" en su propia ruta, permitiendo refrescar la página, compartir el link y mantener un flujo de datos limpio (Server-Side).

## 2. Conceptos Clave (LEER O MORIR)

Antes de tocar una línea de código, tenés que entender esto:

- **Parallel Routes (Rutas Paralelas):** Es una feature de Next.js que nos permite renderizar más de una "página" en el mismo layout. Se definen creando carpetas con la convención `@nombre`. Por ejemplo, `src/app/@analytics/page.tsx`. El layout principal recibirá `@analytics` como un `prop` junto a `children`.

- **Intercepting Routes (Rutas Interceptadas):** Es una convención de carpetas que le dice a Next.js: "Che, cuando el usuario navegue a ESTA ruta, no vayas directamente. En vez de eso, mostrá el contenido de esa ruta en OTRO LADO (en una Ruta Paralela)".
  - `(.)` intercepta en el mismo nivel.
  - `(..)` intercepta un nivel hacia arriba.
  - `(...)` intercepta desde la raíz (`/app`). **Esta es la que usaremos.**

## 3. Plan de Acción Detallado

Vamos a tomar como ejemplo el módulo de **Proyectos**. El objetivo es que al estar en `/proyectos` y hacer clic en "Crear Proyecto", la URL cambie a `/proyectos/crear` pero se muestre un modal, sin navegar fuera de la lista.

### Paso 1: Modificar el Layout Principal para Soportar Rutas Paralelas

Tenemos que "hacerle lugar" al futuro modal en nuestro layout principal.

**Archivo:** `src/app/layout.tsx`

**Acción:** Vamos a crear un "slot" llamado `@modal`. El layout recibirá `props.children` (la página principal) y `props.modal` (el contenido de la ruta paralela).

```tsx
// src/app/layout.tsx

export default function RootLayout({
  children,
  modal, // <--- ¡NUEVO PROP!
}: {
  children: React.ReactNode;
  modal: React.ReactNode; // <--- ¡NUEVO PROP!
}) {
  return (
    <html lang="es">
      <body>
        {children} {/* La página principal que se está visitando */}
        {modal}    {/* El contenido de la ruta paralela (nuestro modal) */}
      </body>
    </html>
  );
}
```

### Paso 2: Crear el "Contenedor" de la Ruta Paralela

Ahora creamos la carpeta para nuestro slot `@modal`.

**Acción:**
1.  Creá una nueva carpeta en `src/app/@modal`.
2.  Dentro de `src/app/@modal`, creá un archivo `default.tsx`. Este archivo es CRÍTICO. Next.js lo renderizará cuando **ninguna** ruta esté siendo interceptada. Para nuestro caso, debe devolver `null` para que no se vea nada.

```tsx
// src/app/@modal/default.tsx

export default function Default() {
  return null;
}
```

### Paso 3: Reestructurar las Rutas de Creación/Edición

Acá está la magia. Vamos a duplicar la estructura de la ruta que queremos interceptar.

**Situación Actual (supuesta):**
- La página para crear un proyecto está en `src/app/proyectos/crear/page.tsx`.

**Acción:**
1.  **Mantener la ruta original:** El archivo `src/app/proyectos/crear/page.tsx` NO se borra. Esta será la página que se muestre si el usuario la carga directamente o refresca el navegador. Es nuestro "fallback".
2.  **Crear la ruta interceptada:** Creá la siguiente estructura de carpetas y archivo: `src/app/@modal/(...)proyectos/crear/page.tsx`.
    - `@modal`: Le dice a Next que esto va al slot `modal` en el layout.
    - `(...)`: Le dice que intercepte rutas desde la raíz del `app` directory.
    - `proyectos/crear/page.tsx`: Es la ruta específica que estamos interceptando.

**El contenido de `src/app/@modal/(...)proyectos/crear/page.tsx` será el formulario, pero envuelto en un componente de Modal/Drawer.**

```tsx
// src/app/@modal/(...)proyectos/crear/page.tsx
import { Modal } from "@/shared/components/ui/modal"; // Un componente Modal genérico que tenés que crear
import { ProyectoForm } from "@/app/proyectos/crear/_components/proyecto-form"; // El formulario en sí

export default function CrearProyectoModal() {
  return (
    <Modal title="Crear Nuevo Proyecto">
      <ProyectoForm />
    </Modal>
  );
}
```

*Nota: Es una buena práctica extraer el formulario (`ProyectoForm`) a su propio componente para poder reutilizarlo tanto en la página de fallback como en el modal.*

### Paso 4: Actualizar los Enlaces (`<Link>`)

Esto es lo más fácil y lo que demuestra el poder de esta arquitectura. No necesitás `onClick` ni manejar estados.

**Archivo:** `src/app/proyectos/page.tsx` (o donde esté el botón de "Crear").

**Acción:** Asegurate de que el botón/enlace para crear un proyecto sea un `<Link>` de `next/link` normal.

```tsx
// ANTES y DESPUÉS (el código no cambia)
import Link from 'next/link';

// ...
<Link href="/proyectos/crear">
  Crear Proyecto
</Link>
// ...
```

Next.js se encargará automáticamente de interceptar esta ruta y renderizar el contenido en el slot `@modal` porque la navegación se originó DENTRO de la aplicación.

### Paso 5: Implementar el Cierre del Modal

El usuario necesita una forma de cerrar el modal. Esto se hace con una navegación.

**Archivo:** Tu componente `Modal.tsx`.

**Acción:** El botón de cierre, o el click en el overlay de fondo, debe usar el `useRouter` de Next.js para navegar "hacia atrás".

```tsx
'use client'; // El componente Modal obviamente debe ser un Client Component

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export function Modal({ children, title }) {
  const router = useRouter();

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  // Opcional: Cerrar con la tecla Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onDismiss]);

  return (
    <div className="modal-overlay" onClick={onDismiss}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onDismiss}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
```

## 4. Resumen y Siguientes Pasos

1.  **Empezá por un solo módulo.** No intentes cambiar toda la aplicación de una. Tomá "Proyectos", como en el ejemplo.
2.  **Implementá el `RootLayout` y el `default.tsx` del modal.** Es la base para todo.
3.  **Creá un componente de Modal/Drawer genérico y reutilizable.**
4.  **Aplicá el patrón de intercepción** para la ruta de `crear`.
5.  **Verificá que todo funcione:**
    - La navegación desde el listado abre el modal.
    - La URL cambia.
    - El modal se cierra correctamente.
    - Recargar la página en la URL del modal (`/proyectos/crear`) te lleva a la página completa del formulario.
6.  **Replicá el patrón** para las rutas de `editar` y luego para los otros módulos.

Dejate de joder con `useState` para manejar la visibilidad de algo que tiene una URL. El estado MÁS importante de tu aplicación es la URL. Usala. Ponete las pilas y a laburar.