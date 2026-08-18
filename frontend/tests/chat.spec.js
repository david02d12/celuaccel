/**
 * tests/chat.spec.js
 * Pruebas E2E del módulo de chat en tiempo real — CeluAccel
 *
 * Cubre: apertura del chat (usuario), envío de un mensaje de texto
 * y acceso del técnico al chat de un servicio.
 *
 * ⚠️  Reemplaza las credenciales de técnico antes de ejecutar:
 *      TECNICO_ID   → ID del técnico de prueba
 *      TECNICO_PASS → contraseña del técnico de prueba
 */
import { runQuery } from './utils/db-cleaner.js';

const USUARIO_ID   = 'maria@correo.com';
const USUARIO_PASS = '123456';
const TECNICO_ID   = 'carlos@correo.com';
const TECNICO_PASS = '123456';

async function loginComo(id, pass) {
  await browser.url('/');
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').waitForDisplayed({ timeout: 5000 });
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').setValue(id);
  await $('input[placeholder="Ingresa tu contraseña"]').setValue(pass);
  await $('button=Ingresar al Sistema').click();
  await $('h4.fw-bold').waitForDisplayed({ timeout: 8000 });
}

describe('Módulo de Chat — Usuario', () => {

  before(async () => {
    try {
      runQuery(`INSERT IGNORE INTO chat (ID_Usuario) VALUES ('maria@correo.com')`);
    } catch(e){}
  });

  after(async () => {
    try {
      runQuery(`DELETE FROM chat WHERE ID_Usuario = 'maria@correo.com'`);
    } catch(e){}
  });

  it('Usuario puede abrir la sección de chat', async () => {
    await loginComo(USUARIO_ID, USUARIO_PASS);

    const btnChat = await $('#btn-acc-chatVista');
    await btnChat.waitForExist({ timeout: 5000 });
    await btnChat.click();

    const pantallaChat = await $('input[placeholder*="Buscar chat"]');
    await pantallaChat.waitForDisplayed({ timeout: 6000 });
    expect(await pantallaChat.isDisplayed()).toBe(true);
  });

  it('Usuario puede escribir y enviar un mensaje de texto', async () => {
    await loginComo(USUARIO_ID, USUARIO_PASS);

    const btnChat = await $('#btn-acc-chatVista');
    await btnChat.waitForExist({ timeout: 5000 });
    await btnChat.click();

    // Selecciona el primer chat de la lista
    const chatItem = await $('div[style*="cursor: pointer"]');
    await chatItem.waitForExist({ timeout: 10000 });
    await chatItem.click();

    // Escribe en el campo de mensaje
    const inputMensaje = await $('#chat-input-mensaje');
    await inputMensaje.waitForExist({ timeout: 6000 });
    await inputMensaje.setValue('Hola, tengo una consulta sobre mi servicio.');

    // Wait until value is set (useful for React inputs)
    await browser.waitUntil(async () => (await inputMensaje.getValue()) === 'Hola, tengo una consulta sobre mi servicio.', { timeout: 5000 });

    // Envía el mensaje
    const btnEnviar = await $('#btn-enviar-mensaje');
    await btnEnviar.waitForClickable({ timeout: 5000 });
    await btnEnviar.click();

    // Wait until input is cleared (meaning message was sent successfully)
    await browser.waitUntil(async () => (await inputMensaje.getValue()) === '', { timeout: 10000 });

    // El mensaje debe aparecer en el historial del chat
    const mensaje = await $('//div[contains(text(),"Hola, tengo una consulta")]');
    await mensaje.waitForDisplayed({ timeout: 15000 });
    expect(await mensaje.isDisplayed()).toBe(true);
  });

});

describe('Módulo de Chat — Técnico', () => {

  it('Técnico puede acceder al módulo de chats', async () => {
    await loginComo(TECNICO_ID, TECNICO_PASS);

    const btnChats = await $('#btn-acc-chatVista');
    await btnChats.waitForExist({ timeout: 5000 });
    await btnChats.click();

    const contenido = await $('input[placeholder*="Buscar chat"]');
    await contenido.waitForDisplayed({ timeout: 6000 });
    expect(await contenido.isDisplayed()).toBe(true);
  });

});
