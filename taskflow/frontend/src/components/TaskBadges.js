import React from 'react';
import { format, isPast, isToday } from 'date-fns';

export const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const STATUS_COLORS = {
  todo: 'badge-todo',
  'in-progress': 'badge-in-progress',
  review: 'badge-review',
  done: 'badge-done',
};

export const PRIORITY_COLORS = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  urgent: 'badge-urgent',
};

export const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_COLORS[status] || 'badge-todo'}`}>
    {STATUS_LABELS[status] || status}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`badge ${PRIORITY_COLORS[priority] || 'badge-medium'}`}>
    {PRIORITY_LABELS[priority] || priority}
  </span>
);

export const DueDate = ({ date }) => {
  if (!date) return null;
  const d = new Date(date);
  const overdue = isPast(d) && !isToday(d);
  const today = isToday(d);
  return (
    <span className={`due-date ${overdue ? 'overdue' : ''}`} style={today ? { color: 'var(--yellow)', fontWeight: 600 } : {}}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      {overdue ? '⚠ ' : ''}{today ? 'Today' : format(d, 'MMM d')}
    </span>
  );
};
