# Sticker Album App — Panini World Cup 2026

App móvil/web para organizar una colección de láminas del álbum **Panini FIFA World Cup 2026**. El proyecto permite llevar el control de láminas conseguidas, faltantes y repetidas; buscar láminas por código/nombre/equipo; generar un QR de intercambio con las repetidas; comparar QR de otros coleccionistas; y preparar una futura función de scanner de páginas del álbum.

> Estado actual: MVP funcional de frontend + catálogo real + flujo de intercambio por QR. El scanner automático por foto queda pendiente hasta tener fotos reales de las páginas para definir layouts y probar visión por computador.

---

## Tabla de contenidos

- [Objetivo del proyecto](#objetivo-del-proyecto)
- [Funcionalidades actuales](#funcionalidades-actuales)
- [Funcionalidades planeadas](#funcionalidades-planeadas)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Comandos útiles](#comandos-útiles)
- [Catálogo del álbum](#catálogo-del-álbum)
- [Persistencia de datos](#persistencia-de-datos)
- [QR de intercambio](#qr-de-intercambio)
- [Scanner del álbum](#scanner-del-álbum)
- [Pruebas en celular](#pruebas-en-celular)
- [Roadmap](#roadmap)
- [Notas importantes](#notas-importantes)

---

## Objetivo del proyecto

El objetivo es crear una app para coleccionistas de láminas que permita:

- Saber cuáles láminas faltan.
- Saber cuáles láminas ya se tienen.
- Llevar conteo de repetidas.
- Buscar rápidamente láminas por código, nombre o equipo.
- Facilitar intercambios usando QR.
- En el futuro, tomar foto de una página del álbum y detectar automáticamente qué espacios están ocupados.

El foco inicial está en iPhone, pero el proyecto se está desarrollando con una arquitectura que también permita Android y web.

---

## Funcionalidades actuales

### Onboarding

- Selección de mascota inicial.
- Registro de nombre.
- Selección de equipo favorito.
- Las mascotas se usan como elemento visual, especialmente en la barra inferior.

### Álbum

- Visualización por sección del álbum.
- Cada lámina inicia como faltante.
- Tocar una lámina permite marcarla como conseguida.
- Las láminas conseguidas permiten sumar o restar repetidas.
- Mantener presionada una lámina conseguida permite quitarla y volverla a faltante.
- Barra de progreso general.
- Contador de faltantes.
- Contador de repetidas.

### Búsqueda global

- Búsqueda en todo el álbum.
- Permite buscar por:
    - código: `COL20`, `ARG17`, `FRA20s`, etc.
    - nombre: `Luis Diaz`, `Messi`, `Official Ball`, etc.
    - equipo/sección: `Colombia`, `Argentina`, `FIFA World Cup 2026`, etc.
- Los resultados muestran:
    - código,
    - nombre,
    - sección/equipo con emoji o bandera,
    - estado actual.
- Desde los resultados se puede marcar una lámina como conseguida o modificar repetidas.

### Repetidas e intercambio

- Lista de repetidas con código, nombre y sección.
- Botones `+` y `-` para modificar repetidas.
- Lista de faltantes agrupada por sección.
- Botón para copiar lista de intercambio en texto.
- Generación de QR de intercambio con las láminas repetidas.
- Escaneo de QR con cámara usando navegador.
- Campo para pegar manualmente un código de intercambio.
- Comparación automática entre repetidas de otra persona y faltantes propios.
- Selección con chulito de las láminas que se desean agregar.
- Confirmación para agregar seleccionadas al álbum.
- Botón para deshacer el último agregado.

### Actividad

- Registro de acciones recientes.
- Muestra acciones como:
    - perfil creado/actualizado,
    - lámina agregada,
    - lámina quitada,
    - repetida agregada,
    - repetida quitada,
    - backup importado,
    - álbum reiniciado.
- Muestra inicialmente pocas acciones y permite ver más.

### Configuración

- Cambiar nombre.
- Cambiar mascota.
- Cambiar equipo favorito.
- Exportar colección como archivo `.json`.
- Importar colección desde backup.
- Reiniciar álbum con confirmación.
- Restablecer perfil.

---

## Funcionalidades planeadas

### Scanner asistido/manual

Primera versión del scanner:

1. Seleccionar sección.
2. Tomar o subir foto de una página.
3. Ver preview.
4. Marcar manualmente las láminas visibles.
5. Confirmar y guardar.

### Scanner automático por visión por computador

Versión futura:

1. Tomar foto de una página.
2. Corregir perspectiva.
3. Dividir la página en espacios del álbum.
4. Detectar si cada espacio está ocupado o vacío.
5. Mostrar resultado para confirmar.
6. Guardar automáticamente.

### Persistencia nativa con SQLite

Actualmente la app está preparada con repositorios para separar la persistencia del estado. La siguiente evolución es guardar datos en SQLite real cuando la app corra como app nativa.

---

## Stack tecnológico

- **React**
- **TypeScript**
- **Vite**
- **Capacitor** para empaquetar como app móvil
- **qrcode.react** para generación de QR
- **html5-qrcode** para lectura de QR desde cámara en navegador
- **CSS variables** para tema claro/oscuro
- **Repositorio de datos** sobre `appStorage`
- Futuro: **SQLite** mediante plugin de Capacitor
- Futuro: **OpenCV.js** o procesamiento con Canvas para scanner automático

---

## Estructura del proyecto

```txt
src/
  app/
    App.tsx

  components/
    BottomTabs.tsx
    Button.tsx
    Card.tsx
    EmptyState.tsx
    ProgressBar.tsx
    StatusPill.tsx
    qr/
      QrScanner.tsx

  core/
    activity/
      activity.types.ts
    album/
      album.types.ts
      albumProgress.ts
      stickerStatus.ts
    backup/
      backup.types.ts
    profile/
      profile.types.ts
    scanner/
      scanner.types.ts
    swaps/
      swapShare.ts
      swapShare.types.ts

  data/
    albums/
      worldCup2026/
        album.ts
        catalog.types.ts
        catalogParser.ts
        index.ts
        panini-wc-2026-catalog.json
        teams.ts
    mascots.ts
    theme.ts

  features/
    activity/
      ActivityScreen.tsx
    album/
      AlbumScreen.tsx
      StickerGrid.tsx
    onboarding/
      OnboardingScreen.tsx
    scanner/
      ScannerScreen.tsx
    search/
      SearchScreen.tsx
    settings/
      SettingsScreen.tsx
    swaps/
      SwapsScreen.tsx

  hooks/
    useAppState.ts

  repositories/
    activityRepository.ts
    backupRepository.ts
    profileRepository.ts
    settingsRepository.ts
    stickerRepository.ts

  services/
    database/
      schema.ts
      sqliteClient.ts
    storage/
      appStorage.ts
      browserStorage.ts
      sqliteKeyValueStorage.ts
      storage.types.ts
      storageKeys.ts

  main.tsx
  index.css
```

---

## Instalación

```bash
npm install
```

---

## Comandos útiles

### Desarrollo web

```bash
npm run dev
```

### Desarrollo web accesible en red local

```bash
npm run dev -- --host 0.0.0.0
```

### Build de producción

```bash
npm run build
```

### Preview de producción

```bash
npx vite preview --host 0.0.0.0
```

### Túnel HTTPS con Cloudflare

Modo dev:

```bash
npm run dev -- --host 0.0.0.0
npx cloudflared tunnel --url http://127.0.0.1:5173
```

Modo preview:

```bash
npm run build
npx vite preview --host 0.0.0.0
npx cloudflared tunnel --url http://127.0.0.1:4173
```

> En Windows conviene usar `127.0.0.1` en vez de `localhost`, porque algunos túneles intentan resolver `localhost` como IPv6 (`::1`) y pueden no encontrar el servidor de Vite.

---

## Catálogo del álbum

El proyecto usa un archivo JSON de catálogo real:

```txt
src/data/albums/worldCup2026/panini-wc-2026-catalog.json
```

El JSON contiene metadatos como:

- `source`
- `scrapedAt`
- `edition`
- `canonicalCount`
- `cutoffRule`
- `stickers`

Cada lámina tiene esta estructura base:

```json
{
  "code": "COL20",
  "name": "Luis Diaz",
  "team": "Colombia"
}
```

El parser convierte ese catálogo en el modelo interno `Album`, usando:

- `code` como ID de lámina,
- `name` como nombre visible,
- `team` como sección,
- `flag` calculado desde un mapa manual de secciones.

### Láminas especiales

Algunas secciones tienen más de 20 láminas porque el catálogo incluye variantes como:

```txt
GER2s
BEL15s
FRA20s
```

Esas variantes quedan dentro de la sección correspondiente porque el parser agrupa por `team`.

---

## Persistencia de datos

La persistencia está separada mediante repositorios:

```txt
profileRepository
stickerRepository
activityRepository
settingsRepository
backupRepository
```

Actualmente los repositorios usan `appStorage`, que decide el mecanismo real de almacenamiento.

### Estado actual

- En navegador: almacenamiento tipo `localStorage` mediante `browserStorage`.
- En app nativa: estructura preparada para usar SQLite mediante `sqliteKeyValueStorage`.

### Por qué repositorios

La idea es que las pantallas no sepan si los datos vienen de:

- `localStorage`,
- SQLite,
- archivo,
- backend,
- sincronización futura.

Así, más adelante se puede cambiar la implementación interna sin tocar las pantallas.

---

## QR de intercambio

El QR contiene solo la lista de códigos de láminas repetidas. No incluye cantidades para ahorrar espacio.

Formato conceptual:

```json
{
  "v": 1,
  "a": "world-cup-2026",
  "d": ["COL20", "ARG17", "FRA20s"]
}
```

El código real usa prefijo:

```txt
SA1:
```

Y codificación base64 URL-safe.

### Flujo de intercambio

1. Usuario A genera QR de repetidas.
2. Usuario B escanea el QR o pega el código.
3. La app compara repetidas de A contra faltantes de B.
4. La app muestra las láminas que le sirven a B.
5. B marca con chulito cuáles va a recibir.
6. B confirma y esas láminas se agregan a su álbum.
7. B puede deshacer el último agregado.

---

## Scanner del álbum

El scanner automático aún no está implementado.

La estrategia recomendada es esperar a tener fotos reales de todas las páginas para:

1. Entender el layout del álbum.
2. Definir coordenadas de cada espacio.
3. Probar detección de ocupado/vacío.
4. Ajustar thresholds.
5. Implementar confirmación manual.

### Datos necesarios para scanner automático

Para cada sección/página se necesitaría un layout como:

```ts
{
  sectionId: 'section-colombia',
  slots: [
    { stickerId: 'COL1', x: 0.05, y: 0.10, w: 0.20, h: 0.18 },
    { stickerId: 'COL2', x: 0.30, y: 0.10, w: 0.20, h: 0.18 }
  ]
}
```

Donde `x`, `y`, `w` y `h` son coordenadas relativas entre `0` y `1` sobre una página ya corregida.

### Pipeline futuro

```txt
foto
  → resize
  → detección/corrección de perspectiva
  → aplicar layout de slots
  → recortar cada espacio
  → clasificar ocupado/vacío/dudoso
  → confirmar manualmente
  → guardar en álbum
```

---

## Pruebas en celular

### iPhone por navegador

Para probar en iPhone sin Mac:

```bash
npm run dev -- --host 0.0.0.0
npx cloudflared tunnel --url http://127.0.0.1:5173
```

Abrir la URL HTTPS generada por Cloudflare en Safari.

### Android nativo

Cuando Android Studio funcione correctamente:

```bash
npm run build
npx cap sync android
npx cap open android
```

### iOS nativo

Para compilar/probar iOS nativo se necesita macOS + Xcode. En Windows se puede generar la carpeta `ios/`, pero no compilar ni correr la app iOS directamente.

---

## Roadmap

### Corto plazo

- Mejorar backup/import/export.
- Revisar persistencia con repositorios.
- Preparar scanner manual asistido.
- Agregar opción para guardar QR como imagen.
- Agregar opción de compartir usando Web Share API.

### Medio plazo

- Migrar `user_stickers` a tabla SQLite real.
- Migrar `activity_events` a tabla SQLite real.
- Implementar scanner manual con foto y selección de sección.
- Crear layouts para páginas reales del álbum.

### Largo plazo

- Scanner automático por visión por computador.
- Corrección de perspectiva.
- Detección de casillas ocupadas/vacías.
- Soporte para varios álbumes.
- Sincronización/backup en nube.
- Publicación en App Store / Play Store.

---

## Notas importantes

- El proyecto no depende de una IA externa para el flujo principal actual.
- El QR de intercambio no requiere backend ni internet después de cargar la app.
- El catálogo del álbum está incluido localmente como JSON.
- El scanner automático debe esperar a tener fotos reales para construir layouts confiables.
- La publicación en iOS requerirá acceso a Mac/Xcode o a un servicio de build en macOS.

---

## Estado actual resumido

```txt
✅ Frontend organizado
✅ Catálogo real integrado
✅ Onboarding
✅ Álbum por sección
✅ Búsqueda global
✅ Repetidas
✅ QR de intercambio
✅ Comparación de QR
✅ Confirmar/deshacer láminas recibidas
✅ Configuración
✅ Backup/import/export
✅ Repositorios de persistencia
⏳ SQLite real por tablas
⏳ Scanner manual
⏳ Scanner automático
⏳ Build nativo iOS/Android probado
```
