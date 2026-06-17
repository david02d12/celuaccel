const { queryPromise } = require('./config/db');
async function run() {
    try {
        const noti = await queryPromise('DESCRIBE notificaciones');
        console.log('Notificaciones:', noti);
    } catch(e) {}
    process.exit(0);
}
run();
