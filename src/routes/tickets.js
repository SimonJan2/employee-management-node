const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { auth, checkRole } = require('../middleware/auth');

// Create ticket
router.post('/', 
    auth, 
    (req, res) => ticketController.createTicket(req, res)
);

// Get all tickets
router.get('/', 
    auth, 
    (req, res) => ticketController.getAllTickets(req, res)
);

// Get ticket by ID
router.get('/:id', 
    auth, 
    (req, res) => ticketController.getTicketById(req, res)
);

// Update ticket
router.put('/:id', 
    auth, 
    (req, res) => ticketController.updateTicket(req, res)
);

// Delete ticket
router.delete('/:id', 
    auth, 
    (req, res) => ticketController.deleteTicket(req, res)
);

// Assign ticket
router.post('/:id/assign', 
    auth, 
    checkRole(['admin', 'manager']),
    (req, res) => ticketController.assignTicket(req, res)
);

module.exports = router;