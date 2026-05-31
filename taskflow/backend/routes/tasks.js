const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// All task routes are protected
router.use(protect);

// @route   GET /api/tasks
// @desc    Get all tasks for current user (with search, filter, sort)
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      status,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    // Build query
    const queryObj = { createdBy: req.user._id };

    if (status && status !== 'all') queryObj.status = status;
    if (priority && priority !== 'all') queryObj.priority = priority;
    if (search) {
      queryObj.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(queryObj).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Task.countDocuments(queryObj),
    ]);

    // Get counts per status for dashboard stats
    const statusCounts = await Task.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
    statusCounts.forEach(({ _id, count }) => {
      stats[_id] = count;
    });

    res.status(200).json({
      success: true,
      data: tasks,
      total,
      stats,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post(
  '/',
  [
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description max 1000 chars'),
    body('status').optional().isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const task = await Task.create({
        ...req.body,
        createdBy: req.user._id,
      });

      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description max 1000 chars'),
    body('status').optional().isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );

      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tasks/:id/status
// @desc    Update task status only (for drag-and-drop)
// @access  Private
router.put('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['todo', 'in-progress', 'review', 'done'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/tasks
// @desc    Delete all completed tasks
// @access  Private
router.delete('/', async (req, res, next) => {
  try {
    const result = await Task.deleteMany({ createdBy: req.user._id, status: 'done' });
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} completed tasks deleted`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
