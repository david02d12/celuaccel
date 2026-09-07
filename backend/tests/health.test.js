const request = require('supertest');
const { app } = require('../server');

describe('Health Check API', () => {
  it('Debería retornar status ok y timestamp', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
