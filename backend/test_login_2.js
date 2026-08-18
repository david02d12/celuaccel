const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/login', {
      user: '1022922817',
      password: '1022922817'
    });
    console.log("Admin OK", res.data);
  } catch (err) {
    console.error("Admin FAIL", err.response ? err.response.data : err.message);
  }
  
  try {
    const res = await axios.post('http://localhost:3000/api/login', {
      user: 'maria@correo.com',
      password: '123456'
    });
    console.log("User OK", res.data);
  } catch (err) {
    console.error("User FAIL", err.response ? err.response.data : err.message);
  }
}
test();
