const { auth, checkRole } = require('../../../../src/middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('Should authenticate valid token', async () => {
    const token = 'valid.token.here';
    const decoded = { id: '123', role: 'admin' };

    req.header.mockReturnValue(`Bearer ${token}`);
    jwt.verify.mockReturnValue(decoded);

    await auth(req, res, next);

    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });
});