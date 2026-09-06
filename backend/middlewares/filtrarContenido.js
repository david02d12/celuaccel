/**
 * middlewares/filtrarContenido.js
 * Middleware de moderación de contenido para CeluAccel.
 *
 * Se aplica a las rutas de mensajes de chat y comentarios antes de que
 * el request llegue al controlador. Rechaza con HTTP 400 cualquier contenido
 * que contenga:
 *   - Palabras ofensivas o spam (lista PALABRAS_PROHIBIDAS)
 *   - URLs o enlaces externos
 *   - Repetición excesiva de caracteres (>= 6 seguidos)
 *   - Mensajes solo numéricos sin texto real
 *   - Números de teléfono (posible contacto externo no autorizado)
 *   - Mensajes demasiado cortos (< 3 caracteres) o largos (> 1000 caracteres)
 *
 * Campos que inspecciona: req.body.Mensaje y req.body.Comentario
 * Si el campo no está presente, lo deja pasar (lo valida el servicio).
 *
 * Uso en una ruta:
 *   router.post('/mensajes/agregar', validarToken, filtrarContenido, mensajeController.agregar);
 */

const PALABRAS_PROHIBIDAS = [
    'idiota', 'imbécil', 'imbecil', 'estupido', 'estúpido', 'maldito',
    'maldita', 'imbeciles', 'tarado', 'tarada', 'pendejo', 'pendeja',
    'hdp', 'hp', 'mierda', 'puta', 'puto', 'hijueputa', 'gonorrea',
    'marica', 'malparido', 'malparida', 'maldicion', 'maldición',
    'bastardo', 'bastarda', 'cabrón', 'cabron', 'joder', 'coño',
    'culero', 'chingada', 'chingar', 'verga', 'perra', 'perro',
    'gana dinero', 'ganar dinero', 'hazte rico', 'click aqui', 'click aquí',
    'oferta exclusiva', 'gratis ahora', 'descuento especial', 'gana premios',
    'bitcoin gratis', 'cripto gratis', 'inversión segura', 'inversion segura',
    'xxx', 'porno', 'pornografia', 'pornografía', 'sexo gratis',
];

const PATRONES = [
    {
        regex: /((https?|ftp):\/\/[^\s]+)|(www\.[^\s]+)/gi,
        mensaje: 'No se permiten enlaces (URLs) en los mensajes.',
    },
    {
        regex: /(.)\\1{5,}/gi,
        mensaje: 'El mensaje contiene repeticiones excesivas de caracteres.',
    },
    {
        regex: /^[\d\s.,!?]+$/,
        mensaje: 'El mensaje debe contener texto significativo.',
    },
    {
        regex: /\b(\+?\d[\d\s\-]{7,}\d)\b/,
        mensaje: 'No se permiten números de teléfono en los mensajes.',
    },
];

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

    if (textoLimpio.length < MIN_LONGITUD) {
        return `El mensaje es demasiado corto (mínimo ${MIN_LONGITUD} caracteres).`;
    }

    if (textoLimpio.length > MAX_LONGITUD) {
        return `El mensaje supera el límite de ${MAX_LONGITUD} caracteres.`;
    }

    const textoNormalizado = textoLimpio
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    for (const palabra of PALABRAS_PROHIBIDAS) {
        const palabraNorm = palabra
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        const regexPalabra = new RegExp(`\\b${palabraNorm.replace(/\s+/g, '\\s+')}\\b`, 'i');
        if (regexPalabra.test(textoNormalizado)) {
            return 'El mensaje contiene lenguaje inapropiado o spam.';
        }
    }

    for (const { regex, mensaje } of PATRONES) {
        if (regex.test(textoLimpio)) {
            regex.lastIndex = 0;
            return mensaje;
        }
    }

    return null;
};

/**
 * Middleware de moderación.
 * Aplica a req.body.Mensaje (chat) y req.body.Comentario (reseñas).
 */
const filtrarContenido = (req, res, next) => {
    const campos = [
        { campo: 'Mensaje',    valor: req.body?.Mensaje },
        { campo: 'Comentario', valor: req.body?.Comentario },
    ];

    for (const { campo, valor } of campos) {
        if (!valor) continue;

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
