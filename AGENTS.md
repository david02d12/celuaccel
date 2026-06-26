# Session Context

## Bugs Fixed

### 1. Chat items show only avatar + time, no name/subtitle
- **Root Cause:** `item_chat.xml` had a `<View>` separator with `match_parent` width as the LAST child of a **horizontal** `LinearLayout`. In Android's measurement pass, a `match_parent` View consumes the full parent width, leaving 0 remaining space for the weighted `info` LinearLayout (`layout_weight="1"`, `layout_width="0dp"`). Result: the info column (containing `tvNombreChat` and `tvUltimoMensaje`) had 0dp width → invisible.
- **Fix:** Restructured layout with vertical outer LinearLayout containing the horizontal row + separator below.
- **Files:** `movil/app/src/main/res/layout/item_chat.xml`, `movil/app/build/.../item_chat.xml`

### 2. Error 400 creating products (role 3)
- **Root Cause:** Backend `producto.service.js` rejects falsy `Codigo_Producto`. App was sending `codigoProducto = ""`.
- **Fix:** Added explicit `etCodigoProducto` text field in `ProductoActivity.kt` and validated before create.
- **Files:** `movil/.../ProductoActivity.kt`, `movil/.../activity_productos.xml`

### 3. Error 400 creating categories (role 3)
- **Root Cause:** Backend `categoria.service.js` rejects falsy `ID_Categoria`. Table is not `AUTO_INCREMENT`. App was sending `idCategoria = null`.
- **Fix:** Added explicit `etIdCategoria` numeric input field in `CategoriaActivity.kt` and validated before create.
- **Files:** `movil/.../CategoriaActivity.kt`, `movil/.../activity_categorias.xml`

## Features Added

### Edit services on tap (role 3)
- `ListaServicioActivity.kt`: Added `editarServicio()` function; passes onClick → `ServicioActivity` with service data for roles 1/3
- `ServicioActivity.kt`: Reads Intent extras and pre-fills form fields when `ID_SERVICIO > 0`

### Chat improvements
- Backend `chat.dao.js`: JOIN with Servicio table to return `Servicio_Descripcion` and `Servicio_Movil`
- `Chat.kt`: `idUsuario` made `String?`; added `servicioDescripcion`, `servicioMovil` fields with `@SerializedName`
- `ChatAdapter.kt`: Robust fallbacks; avatar letter, name, subtitle (service info), and hora all set to non-empty strings

### 4. Product question → chat auto‑creation (role 2)
- `DetalleProductoActivity.kt`: When no session → shows dialog "Por favor, inicia sesión" with button to LoginActivity. When role 2 asks a question, also creates a Chat + sends first message, with dialog offering to open the chat.
- `SolicitarServicioActivity.kt`: After service creation (role 2), automatically creates a Chat linked to that service + sends first message with description. Dialog offers to open the chat.

### 5. API response models for chat/service creation
- `model/ChatResponse.kt`: Parses `{ message, id, existente }` from `POST /api/chats/crear`
- `model/ServicioResponse.kt`: Parses `{ message, id }` from `POST /api/servicios/agregar`
- `ApiService.kt`: `crearChat()` changed from `Call<Void>` to `Call<ChatResponse>`; `agregarServicio()` changed from `Call<Void>` to `Call<ServicioResponse>`
- `ChatListActivity.kt`: Updated `crearChat()` callback to use `ChatResponse`

## Key Notes
- Base URL: `http://10.1.195.6:3000/api/`
- Backend field names use PascalCase (e.g., `Codigo_Producto`, `ID_Categoria`, `ID_Servicio`)
- Must rebuild APK after source changes (intermediates in `app/build/` may need manual sync)
- Chat backend returns `{ message, id, existente }` on `POST /api/chats/crear`; `id` is the new (or existing) chat Codigo_Chat
- Service backend returns `{ message, id }` on `POST /api/servicios/agregar`; `id` is the new ID_Servicio
