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
