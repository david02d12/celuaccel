/**
 * config/profanity.js
 * Utilidades de detección de lenguaje inapropiado para CeluAccel.
 *
 * Usa la librería @2toad/profanity con soporte para inglés y español.
 * Es consumido por filtrarContenido.js para validar mensajes de chat y comentarios.
 *
 * Exporta:
 *   - detectarMalasPalabras(texto): devuelve array con las palabras encontradas
 *   - contieneMalasPalabras(texto): devuelve true/false
 */
const { Profanity, profaneWords } = require('@2toad/profanity');
const filtro = new Profanity({ languages: ['en', 'es'] });

/**
 * Detecta qué malas palabras contiene el texto.
 * @param {string} texto
 * @returns {string[]} Lista de palabras encontradas (vacía si el texto es limpio)
 */
const detectarMalasPalabras = (texto) => {
    if (!texto || typeof texto !== 'string') return [];
    const textoLower = texto.toLowerCase();
    const encontradas = [];

    for (const [, palabras] of profaneWords) {
        for (const p of palabras) {
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
