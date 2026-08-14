/**
 * filtrarContenido.js
 * Middleware de moderación de contenido para mensajes de chat y comentarios.
 * Inspecciona req.body.Mensaje y/o req.body.Comentario antes de que lleguen
 * al controlador, rechazando contenido inapropiado con HTTP 400.
 */

// ─── Lista de palabras prohibidas (español) ──────────────────────────────────
// Amplía esta lista según las necesidades del proyecto.
const PALABRAS_PROHIBIDAS = [
    // Insultos comunes
    'idiota', 'imbécil', 'imbecil', 'estupido', 'estúpido', 'maldito',
    'maldita', 'imbeciles', 'tarado', 'tarada', 'pendejo', 'pendeja',
    'hdp', 'hp', 'mierda', 'puta', 'puto', 'hijueputa', 'gonorrea',
    'marica', 'malparido', 'malparida', 'maldicion', 'maldición',
    'bastardo', 'bastarda', 'cabrón', 'cabron', 'joder', 'coño',
    'culero', 'chingada', 'chingar', 'verga', 'perra', 'perro',
    // Spam / phishing
    'gana dinero', 'ganar dinero', 'hazte rico', 'click aqui', 'click aquí',
    'oferta exclusiva', 'gratis ahora', 'descuento especial', 'gana premios',
    'bitcoin gratis', 'cripto gratis', 'inversión segura', 'inversion segura',
    // Contenido adulto explícito
    'xxx', 'porno', 'pornografia', 'pornografía', 'sexo gratis',
];

// ─── Patrones de expresiones regulares ───────────────────────────────────────
const PATRONES = [
    // URLs (http/https/ftp o www.)
    {
        regex: /((https?|ftp):\/\/[^\s]+)|(www\.[^\s]+)/gi,
        mensaje: 'No se permiten enlaces (URLs) en los mensajes.',
    },
    // Repetición excesiva de un mismo carácter (≥ 6 veces seguidas)
    {
        regex: /(.)\1{5,}/gi,
        mensaje: 'El mensaje contiene repeticiones excesivas de caracteres.',
    },
    // Solo números / espacios (sin contenido real)
    {
        regex: /^[\d\s.,!?]+$/,
        mensaje: 'El mensaje debe contener texto significativo.',
    },
    // Números de teléfono / WhatsApp (posible spam de contacto externo)
    {
        regex: /\b(\+?\d[\d\s\-]{7,}\d)\b/,
        mensaje: 'No se permiten números de teléfono en los mensajes.',
    },
];

// ─── Longitudes permitidas ────────────────────────────────────────────────────
const MIN_LONGITUD = 3;
const MAX_LONGITUD = 1000;

/**
 * Analiza un texto y devuelve el motivo de rechazo, o null si es aceptable.
 * @param {string} texto
 * @returns {string|null}
 */
const analizarTexto = (texto) => {
    if (typeof texto !== 'string') return null;

    const textoLimpio = texto.trim();

    // Longitud mínima
    if (textoLimpio.length < MIN_LONGITUD) {
        return `El mensaje es demasiado corto (mínimo ${MIN_LONGITUD} caracteres).`;
    }

    // Longitud máxima
    if (textoLimpio.length > MAX_LONGITUD) {
        return `El mensaje supera el límite de ${MAX_LONGITUD} caracteres.`;
    }

    // Verificar palabras prohibidas (insensible a mayúsculas/tildes básico)
    const textoNormalizado = textoLimpio
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // quita tildes para comparar

    for (const palabra of PALABRAS_PROHIBIDAS) {
        const palabraNorm = palabra
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        // Busca la palabra como token completo (con límites de palabra)
        const regexPalabra = new RegExp(`\\b${palabraNorm.replace(/\s+/g, '\\s+')}\\b`, 'i');
        if (regexPalabra.test(textoNormalizado)) {
            return 'El mensaje contiene lenguaje inapropiado o spam.';
        }
    }

    // Verificar patrones de expresiones regulares
    for (const { regex, mensaje } of PATRONES) {
        if (regex.test(textoLimpio)) {
            // Resetear lastIndex si el regex tiene flag 'g'
            regex.lastIndex = 0;
            return mensaje;
        }
    }

    return null; // Texto aceptable
};

/**
 * Middleware de moderación de contenido.
 * Aplica a req.body.Mensaje (chat) y req.body.Comentario (reseñas).
 */
const filtrarContenido = (req, res, next) => {
    const campos = [
        { campo: 'Mensaje',    valor: req.body?.Mensaje },
        { campo: 'Comentario', valor: req.body?.Comentario },
    ];

    for (const { campo, valor } of campos) {
        if (!valor) continue; // Campo ausente → lo valida el servicio/controlador

        const motivo = analizarTexto(valor);
        if (motivo) {
            return res.status(400).json({
                error: motivo,
                campo,
                codigo: 'CONTENIDO_INAPROPIADO',
            });
        }
    }

    next();
};

module.exports = filtrarContenido;
