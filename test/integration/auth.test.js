const request = require('supertest');
const app = require('../../../src/app');
const { User } = require('../../../src/models');

describe('Authentication Tests', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'test@example.com',
      password: await User.hashPassword('password123'),
      firstName: 'Test',
      lastName: 'User',
      role: 'employee'
    });
  });

  test('Should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });

  test('Should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
  });
});