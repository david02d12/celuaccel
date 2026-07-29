/**
 * upload.middleware.js
 * EP-005: Middleware Multer para el envío de adjuntos/evidencias en el chat.
 * Acepta imágenes y documentos PDF hasta 5 MB.
 */

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Directorio de subida: backend/uploads/chat/
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'chat');

// Crea el directorio si no existe
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ── Configuración de almacenamiento ──────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, ext)
            .replace(/[^a-z0-9]/gi, '_')
            .substring(0, 40);
        cb(null, `${timestamp}_${baseName}${ext}`);
    },
});

// ── Filtro de tipos de archivo permitidos ─────────────────────────────────────
const TIPOS_PERMITIDOS = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
];

const fileFilter = (_req, file, cb) => {
    if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(
            `Tipo de archivo no permitido: ${file.mimetype}. ` +
            'Solo se aceptan imágenes (JPG, PNG, WEBP, GIF) y PDFs.'
        ), false);
    }
};

// ── Instancia del middleware ──────────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB máximo
        files: 3,                  // Máximo 3 archivos por envío
    },
});

module.exports = upload;
