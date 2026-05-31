import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { StatusBadge, PriorityBadge, DueDate, STATUS_LABELS } from '../components/TaskBadges';
import Spinner from '../components/Spinner';

const COLUMNS = ['todo', 'in-progress', 'review', 'done'];

const COLUMN_COLORS = {
  todo: 'var(--text-muted)',
  'in-progress': 'var(--blue)',
  review: 'var(--yellow)',
  done: 'var(--green)',
};

const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: bg, color }}>{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, stats, loading, fetchTasks, updateTaskStatus } = useTasks();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks({ sortBy: 'createdAt', sortOrder: 'desc' });
  }, []); // eslint-disable-line

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    await updateTaskStatus(draggableId, destination.droppableId);
  };

  const getColumnTasks = (status) => tasks.filter((t) => t.status === status);

  const totalTasks = Object.values(stats).reduce((a, b) => a + b, 0);
  const completionRate = totalTasks > 0 ? Math.round((stats.done / totalTasks) * 100) : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading && tasks.length === 0) return <Spinner />;

  return (
    <div className="fade-in">
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, marginBottom: 4 }}>
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          You have{' '}
          <strong style={{ color: 'var(--accent)' }}>
            {(stats.todo || 0) + (stats['in-progress'] || 0)}
          </strong>{' '}
          active tasks to tackle today.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total Tasks" value={totalTasks} icon="📋" color="var(--blue)" bg="var(--blue-light)" />
        <StatCard label="To Do" value={stats.todo || 0} icon="○" color="var(--text-muted)" bg="var(--bg-secondary)" />
        <StatCard label="In Progress" value={stats['in-progress'] || 0} icon="⚡" color="var(--blue)" bg="var(--blue-light)" />
        <StatCard label="In Review" value={stats.review || 0} icon="👁" color="var(--yellow)" bg="var(--yellow-light)" />
        <StatCard label="Done" value={stats.done || 0} icon="✓" color="var(--green)" bg="var(--green-light)" />
      </div>

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="card" style={{ marginBottom: 24, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Overall Progress</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{completionRate}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionRate}%` }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            {stats.done || 0} of {totalTasks} tasks completed
          </p>
        </div>
      )}

      {/* Kanban Board */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18 }}>Kanban Board</h3>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/tasks/new')}>
          + New Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No tasks yet</h3>
          <p style={{ marginBottom: 16 }}>Create your first task to get started</p>
          <button className="btn btn-primary" onClick={() => navigate('/tasks/new')}>
            Create Task
          </button>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board">
            {COLUMNS.map((col) => {
              const colTasks = getColumnTasks(col);
              return (
                <div key={col} className="kanban-column">
                  <div className="kanban-column-header">
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLUMN_COLORS[col], flexShrink: 0 }} />
                    <span className="kanban-column-title">{STATUS_LABELS[col]}</span>
                    <span className="kanban-count">{colTasks.length}</span>
                  </div>

                  <Droppable droppableId={col}>
                    {(provided, snapshot) => (
                      <div
                        className="kanban-tasks"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          background: snapshot.isDraggingOver ? 'rgba(232,93,58,0.05)' : 'transparent',
                          borderRadius: 8,
                          transition: 'background 0.15s',
                          padding: 4,
                          margin: -4,
                        }}
                      >
                        {colTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className={`kanban-task ${snap.isDragging ? 'dragging' : ''}`}
                                onClick={() => navigate(`/tasks/${task._id}/edit`)}
                              >
                                <div className="kanban-task-title">{task.title}</div>
                                <div className="kanban-task-meta">
                                  <PriorityBadge priority={task.priority} />
                                  {task.dueDate && <DueDate date={task.dueDate} />}
                                </div>
                                {task.tags?.length > 0 && (
                                  <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    {task.tags.slice(0, 3).map((tag) => (
                                      <span key={tag} className="tag-chip" style={{ fontSize: 11 }}>#{tag}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colTasks.length === 0 && (
                          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                            Drop here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default Dashboard;
