export const config = {
  // ─── Runner ────────────────────────────────────────────────────────────────
  runner: 'local',

  // ─── Specs ─────────────────────────────────────────────────────────────────
  specs: ['./tests/**/*.spec.js'],
  exclude: [],

  // ─── Capacidades ───────────────────────────────────────────────────────────
  maxInstances: 1,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          // Elimina '--headless' si quieres ver el navegador abrirse
          // '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--window-size=1280,900',
        ],
      },
    },
  ],

  // ─── Timeouts ──────────────────────────────────────────────────────────────
  waitforTimeout: 10000,
  connectionRetryTimeout: 30000,
  connectionRetryCount: 3,

  // ─── Framework ─────────────────────────────────────────────────────────────
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 30000,
  },

  // ─── Reporters ─────────────────────────────────────────────────────────────
  reporters: ['spec'],

  // ─── Hooks ─────────────────────────────────────────────────────────────────
  baseUrl: 'http://localhost:5173',

  before() {
    // Aquí puedes agregar comandos personalizados si los necesitas
  },
};
