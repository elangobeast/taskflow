import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { StatusBadge, PriorityBadge, DueDate } from '../components/TaskBadges';
import ConfirmModal from '../components/ConfirmModal';
import Spinner from '../components/Spinner';

const TaskList = () => {
  const navigate = useNavigate();
  const { tasks, total, loading, filters, setFilters, fetchTasks, updateTaskStatus, deleteTask, clearCompleted } = useTasks();
  const [search, setSearch] = useState(filters.search || '');
  const [deleteId, setDeleteId] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [filters]); // eslint-disable-line

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== filters.search) setFilters((p) => ({ ...p, search }));
    }, 350);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  const handleFilterChange = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
  };

  const handleStatusToggle = (task) => {
    const next = task.status === 'done' ? 'todo' : 'done';
    updateTaskStatus(task._id, next);
  };

  const handleDelete = async () => {
    await deleteTask(deleteId);
    setDeleteId(null);
  };

  const hasDone = tasks.some((t) => t.status === 'done');

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="task-list-header">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/tasks/new')}>
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="filter-row" style={{ marginBottom: 20 }}>
        <select className="filter-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>

        <select className="filter-select" value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)}>
          <option value="all">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select className="filter-select" value={`${filters.sortBy}:${filters.sortOrder}`} onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split(':');
          setFilters((p) => ({ ...p, sortBy, sortOrder }));
        }}>
          <option value="createdAt:desc">Newest First</option>
          <option value="createdAt:asc">Oldest First</option>
          <option value="dueDate:asc">Due Date ↑</option>
          <option value="dueDate:desc">Due Date ↓</option>
          <option value="priority:desc">High Priority First</option>
        </select>

        {hasDone && (
          <button className="btn btn-secondary btn-sm" onClick={() => setShowClearModal(true)}>
            Clear Completed
          </button>
        )}
      </div>

      {/* Task count */}
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
        {loading ? 'Loading…' : `${total} task${total !== 1 ? 's' : ''} found`}
      </p>

      {/* Task list */}
      {loading && tasks.length === 0 ? (
        <Spinner />
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No tasks found</h3>
          <p>Try adjusting your filters or create a new task</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/tasks/new')}>
            + Create Task
          </button>
        </div>
      ) : (
        <div className="slide-in">
          {tasks.map((task) => (
            <div key={task._id} className="task-row" onClick={() => navigate(`/tasks/${task._id}/edit`)}>
              {/* Checkbox */}
              <div
                className={`task-row-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleStatusToggle(task); }}
                title={task.status === 'done' ? 'Mark as todo' : 'Mark as done'}
              >
                {task.status === 'done' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: 12, height: 12 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>

              <div className="task-row-content">
                <div className={`task-row-title ${task.status === 'done' ? 'done' : ''}`}>{task.title}</div>
                <div className="task-row-meta">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {task.dueDate && <DueDate date={task.dueDate} />}
                  {task.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="tag-chip" style={{ fontSize: 11 }}>#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="task-row-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => navigate(`/tasks/${task._id}/edit`)}
                  title="Edit task"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  style={{ color: 'var(--red)' }}
                  onClick={() => setDeleteId(task._id)}
                  title="Delete task"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
      />

      <ConfirmModal
        isOpen={showClearModal}
        title="Clear Completed Tasks"
        message="This will permanently delete all tasks marked as Done. Continue?"
        onConfirm={() => { clearCompleted(); setShowClearModal(false); }}
        onCancel={() => setShowClearModal(false)}
        confirmText="Clear All"
      />
    </div>
  );
};

export default TaskList;
