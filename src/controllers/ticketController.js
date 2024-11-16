const { Ticket, User } = require('../models');

class TicketController {
    // Create a new ticket
    async createTicket(req, res) {
        try {
            const { title, description, priority } = req.body;
            const ticket = await Ticket.create({
                title,
                description,
                priority,
                creatorId: req.user.id,
                status: 'open'
            });

            const ticketWithDetails = await Ticket.findByPk(ticket.id, {
                include: [
                    { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
                    { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }
                ]
            });

            res.status(201).json(ticketWithDetails);
        } catch (error) {
            console.error('Error creating ticket:', error);
            res.status(500).json({ error: 'Error creating ticket' });
        }
    }

    // Get all tickets
    async getAllTickets(req, res) {
        try {
            const tickets = await Ticket.findAll({
                include: [
                    { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
                    { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json(tickets);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            res.status(500).json({ error: 'Error fetching tickets' });
        }
    }

    // Get ticket by ID
    async getTicketById(req, res) {
        try {
            const ticket = await Ticket.findByPk(req.params.id, {
                include: [
                    { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
                    { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }
                ]
            });

            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }

            res.json(ticket);
        } catch (error) {
            console.error('Error fetching ticket:', error);
            res.status(500).json({ error: 'Error fetching ticket' });
        }
    }

    // Update ticket
    async updateTicket(req, res) {
        try {
            const ticket = await Ticket.findByPk(req.params.id);

            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }

            await ticket.update(req.body);

            const updatedTicket = await Ticket.findByPk(ticket.id, {
                include: [
                    { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
                    { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }
                ]
            });

            res.json(updatedTicket);
        } catch (error) {
            console.error('Error updating ticket:', error);
            res.status(500).json({ error: 'Error updating ticket' });
        }
    }

    // Delete ticket
    async deleteTicket(req, res) {
        try {
            const ticket = await Ticket.findByPk(req.params.id);

            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }

            // Only allow creator or admin to delete
            if (ticket.creatorId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to delete this ticket' });
            }

            await ticket.destroy();
            res.json({ message: 'Ticket deleted successfully' });
        } catch (error) {
            console.error('Error deleting ticket:', error);
            res.status(500).json({ error: 'Error deleting ticket' });
        }
    }

    // Assign ticket
    async assignTicket(req, res) {
        try {
            const { assigneeId } = req.body;
            const ticket = await Ticket.findByPk(req.params.id);

            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }

            const assignee = await User.findByPk(assigneeId);
            if (!assignee) {
                return res.status(404).json({ error: 'Assignee not found' });
            }

            await ticket.update({ 
                assigneeId,
                status: 'in_progress'
            });

            const updatedTicket = await Ticket.findByPk(ticket.id, {
                include: [
                    { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
                    { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }
                ]
            });

            res.json(updatedTicket);
        } catch (error) {
            console.error('Error assigning ticket:', error);
            res.status(500).json({ error: 'Error assigning ticket' });
        }
    }
}

const ticketController = new TicketController();
module.exports = ticketController;