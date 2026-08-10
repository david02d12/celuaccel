const { Profanity, profaneWords } = require('@2toad/profanity');
const filtro = new Profanity({ languages: ['en', 'es'] });

/**
 * Detecta qué malas palabras contiene el texto.
 * Devuelve un array con las palabras encontradas (vacío si el texto es limpio).
 * @param {string} texto
 * @returns {string[]}
 */
const detectarMalasPalabras = (texto) => {
    if (!texto || typeof texto !== 'string') return [];
    const textoLower = texto.toLowerCase();
    const encontradas = [];

    for (const [, palabras] of profaneWords) {
        for (const p of palabras) {
            // Escapar caracteres especiales de regex
            const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp('\\b' + escaped + '\\b', 'i');
            if (regex.test(textoLower) && !encontradas.includes(p)) {
                encontradas.push(p);
            }
        }
    }

    return encontradas;
};

/**
 * Devuelve true si el texto contiene al menos una mala palabra.
 * @param {string} texto
 * @returns {boolean}
 */
const contieneMalasPalabras = (texto) => filtro.exists(texto);

module.exports = { detectarMalasPalabras, contieneMalasPalabras };
