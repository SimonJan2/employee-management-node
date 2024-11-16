const { TicketService } = require('../../../../src/services/ticketService');
const { Ticket, User } = require('../../../../src/models');

jest.mock('../../../src/models');

describe('Ticket Service', () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
    jest.clearAllMocks();
  });

  test('Should create ticket', async () => {
    const ticketData = {
      title: 'Test Ticket',
      description: 'Test Description',
      priority: 'high',
      creatorId: '123'
    };

    Ticket.create.mockResolvedValue({
      id: '456',
      ...ticketData
    });

    const result = await ticketService.createTicket(ticketData);

    expect(Ticket.create).toHaveBeenCalledWith(ticketData);
    expect(result).toHaveProperty('id', '456');
    expect(result).toHaveProperty('title', 'Test Ticket');
  });
});
