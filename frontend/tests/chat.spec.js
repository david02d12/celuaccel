import { runQuery } from './utils/db-cleaner.js';
import { loginComo } from './utils/login-helper.js';

const USUARIO_ID   = 'maria@correo.com';
const USUARIO_PASS = '123456';
const TECNICO_ID   = 'carlos@correo.com';
const TECNICO_PASS = '123456';


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

    const chatItem = await $('div[style*="cursor: pointer"]');
    await chatItem.waitForExist({ timeout: 10000 });
    await chatItem.click();

    const inputMensaje = await $('#chat-input-mensaje');
    await inputMensaje.waitForExist({ timeout: 6000 });
    await inputMensaje.setValue('Hola, tengo una consulta sobre mi servicio.');

    await browser.waitUntil(async () => (await inputMensaje.getValue()) === 'Hola, tengo una consulta sobre mi servicio.', { timeout: 5000 });

    const btnEnviar = await $('#btn-enviar-mensaje');
    await btnEnviar.waitForClickable({ timeout: 5000 });
    await btnEnviar.click();

    await browser.waitUntil(async () => (await inputMensaje.getValue()) === '', { timeout: 10000 });

    const mensaje = await $('//div[contains(text(),"Hola, tengo una consulta")]');
    await mensaje.waitForDisplayed({ timeout: 15000 });
    expect(await mensaje.isDisplayed()).toBe(true);
  });
  it('Probar el decremento del conteo de mensajes pendientes tras leer una conversación', async () => {
    // 1. Insertamos un mensaje pendiente (no leído) en el chat de Maria
    await runQuery(`
      INSERT INTO mensajes (Codigo_Chat, ID_Usuario, Mensaje, Estado) 
      SELECT Codigo_Chat, 'carlos@correo.com', 'Mensaje de prueba pendiente', 0 
      FROM chat WHERE ID_Usuario = 'maria@correo.com' LIMIT 1
    `);

    // 2. Iniciamos sesión
    await loginComo(USUARIO_ID, USUARIO_PASS);

    // 3. Verificamos que el badge del menú lateral exista (solo se renderiza si hay mensajes > 0)
    const badgeSidebar = await $('#nav-chatVista .badge');
    await badgeSidebar.waitForExist({ timeout: 15000 });

    // 4. Entramos a la vista de chat desde el panel rápido
    const btnChat = await $('#btn-acc-chatVista');
    await btnChat.waitForExist({ timeout: 5000 });
    await btnChat.click();

    // 5. Hacemos clic en la conversación (esto dispara la lectura en el backend)
    const chatItem = await $('div[style*="cursor: pointer"]');
    await chatItem.waitForExist({ timeout: 10000 });
    await chatItem.click();

    // Damos un momento al servidor para procesar la petición PUT
    await browser.pause(1500);

    // Refrescamos la página para forzar el re-render y saltarnos los 15s de espera del polling
    await browser.refresh();

    // 6. Comprobamos que el badge de pendientes ha desaparecido
    const badgeAfter = await $('#nav-chatVista .badge');
    await badgeAfter.waitForExist({ reverse: true, timeout: 5000 });
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
