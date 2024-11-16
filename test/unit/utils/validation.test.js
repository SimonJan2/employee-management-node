const { validateTicket, validateUser } = require('../../../../src/utils/validation');

describe('Validation Utils', () => {
  test('Should validate ticket data', () => {
    const validTicket = {
      title: 'Valid Ticket',
      description: 'Valid Description',
      priority: 'high'
    };

    const invalidTicket = {
      title: '',
      priority: 'invalid'
    };

    expect(validateTicket(validTicket)).toBe(true);
    expect(validateTicket(invalidTicket)).toBe(false);
  });
});