const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all complaints (with filters)
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    let query = 'SELECT c.*, u.name as user_name, u.email as user_email FROM complaints c JOIN users u ON c.user_id = u.id';
    const conditions = [];

    // If student, only show their own complaints
    if (req.user.role === 'student') {
      conditions.push('c.user_id = ?');
    }

    if (status) {
      conditions.push('c.status = ?');
    }
    if (category) {
      conditions.push('c.category = ?');
    }
    if (priority) {
      conditions.push('c.priority = ?');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY c.created_at DESC';

    const params = [];
    if (req.user.role === 'student') {
      params.push(req.user.id);
    }
    if (status) params.push(status);
    if (category) params.push(category);
    if (priority) params.push(priority);

    const [complaints] = await db.pool.query(query, params);
    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single complaint
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    let query = 'SELECT c.*, u.name as user_name, u.email as user_email FROM complaints c JOIN users u ON c.user_id = u.id WHERE c.id = ?';
    const params = [id];

    if (req.user.role === 'student') {
      query += ' AND c.user_id = ?';
      params.push(req.user.id);
    }

    const [complaints] = await db.pool.query(query, params);

    if (complaints.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaints[0]);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create complaint
router.post('/',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').optional().isString(),
    body('priority').optional().isIn(['low', 'medium', 'high'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, category, priority } = req.body;

      const [result] = await db.pool.query(
        'INSERT INTO complaints (user_id, title, description, category, priority) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, title, description, category || null, priority || 'medium']
      );

      const [complaints] = await db.pool.query(
        'SELECT c.*, u.name as user_name, u.email as user_email FROM complaints c JOIN users u ON c.user_id = u.id WHERE c.id = ?',
        [result.insertId]
      );

      res.status(201).json(complaints[0]);
    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update complaint status (Admin only)
router.patch('/:id/status',
  authenticate,
  authorize('admin'),
  [
    body('status').isIn(['pending', 'in_progress', 'resolved', 'rejected', 'withdrawn']).withMessage('Invalid status'),
    body('admin_response').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, admin_response } = req.body;

      await db.pool.query(
        'UPDATE complaints SET status = ?, admin_response = ? WHERE id = ?',
        [status, admin_response || null, id]
      );

      const [complaints] = await db.pool.query(
        'SELECT c.*, u.name as user_name, u.email as user_email FROM complaints c JOIN users u ON c.user_id = u.id WHERE c.id = ?',
        [id]
      );

      res.json(complaints[0]);
    } catch (error) {
      console.error('Update complaint error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Withdraw complaint (Student only)
router.patch('/:id/withdraw',
  authenticate,
  authorize('student'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [complaints] = await db.pool.query(
        'SELECT id, user_id, status FROM complaints WHERE id = ?',
        [id]
      );

      if (complaints.length === 0) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      if (complaints[0].user_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      if (complaints[0].status === 'withdrawn') {
        return res.status(400).json({ message: 'Complaint already withdrawn' });
      }

      await db.pool.query(
        'UPDATE complaints SET status = ? WHERE id = ?',
        ['withdrawn', id]
      );

      const [updated] = await db.pool.query(
        'SELECT c.*, u.name as user_name, u.email as user_email FROM complaints c JOIN users u ON c.user_id = u.id WHERE c.id = ?',
        [id]
      );

      res.json(updated[0]);
    } catch (error) {
      console.error('Withdraw complaint error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete complaint
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if complaint exists and belongs to user (or user is admin)
    const [complaints] = await db.pool.query('SELECT user_id FROM complaints WHERE id = ?', [id]);

    if (complaints.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (req.user.role !== 'admin' && complaints[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await db.pool.query('DELETE FROM complaints WHERE id = ?', [id]);
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
