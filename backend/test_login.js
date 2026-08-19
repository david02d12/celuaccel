const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/usuarios/login', {
      id_correo: '1022922817',
      contrasena: '1022922817'
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
