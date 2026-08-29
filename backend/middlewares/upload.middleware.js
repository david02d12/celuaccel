/**
 * middlewares/upload.middleware.js
 * Middleware Multer para el envío de adjuntos en el chat de CeluAccel.
 *
 * Configura el almacenamiento de archivos subidos por los usuarios
 * (imágenes y documentos PDF) al directorio backend/uploads/chat/.
 *
 * Restricciones:
 *   - Tipos permitidos: JPEG, PNG, WEBP, GIF, PDF
 *   - Tamaño máximo por archivo: 5 MB
 *   - Máximo de archivos por envío: 3
 *
 * Naming de archivos: {timestamp}_{nombre_saneado}.{ext}
 * Los archivos quedan accesibles en: GET /uploads/chat/{nombre}
 *
 * Uso en una ruta:
 *   router.post('/mensajes/adjunto', validarToken, upload.array('adjuntos', 3), controller.subirAdjunto);
 */
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'chat');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

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

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 3,
    },
});

module.exports = upload;
