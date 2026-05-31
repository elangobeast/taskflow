import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUSES = ['todo', 'in-progress', 'review', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const TaskForm = ({ initialData = {}, onSubmit, submitLabel = 'Save Task', loading = false }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    status: initialData.status || 'todo',
    priority: initialData.priority || 'medium',
    dueDate: initialData.dueDate ? initialData.dueDate.slice(0, 10) : '',
    tags: initialData.tags || [],
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.title.trim() || form.title.length < 3) errs.title = 'Title must be at least 3 characters';
    if (form.description.length > 1000) errs.description = 'Description too long (max 1000 chars)';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (tag && !form.tags.includes(tag) && form.tags.length < 8) {
        setForm((p) => ({ ...p, tags: [...p.tags, tag] }));
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && form.tags.length) {
      setForm((p) => ({ ...p, tags: p.tags.slice(0, -1) }));
    }
  };

  const removeTag = (tag) => {
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = { ...form, dueDate: form.dueDate || null };
    await onSubmit(payload);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      {/* Title */}
      <div className="form-group">
        <label className="form-label">Task Title *</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className={`form-input ${errors.title ? 'error' : ''}`}
          placeholder="What needs to be done?"
          maxLength={100}
        />
        {errors.title && <span className="form-error">⚠ {errors.title}</span>}
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{form.title.length}/100</span>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className={`form-input ${errors.description ? 'error' : ''}`}
          placeholder="Add more details about this task…"
          rows={4}
          maxLength={1000}
        />
        {errors.description && <span className="form-error">⚠ {errors.description}</span>}
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{form.description.length}/1000</span>
      </div>

      {/* Status & Priority */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="form-input">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'todo' ? 'To Do' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange} className="form-input">
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date */}
      <div className="form-group">
        <label className="form-label">Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="form-input"
          min={new Date().toISOString().slice(0, 10)}
        />
      </div>

      {/* Tags */}
      <div className="form-group">
        <label className="form-label">Tags</label>
        <div className="tags-input-container" onClick={() => document.getElementById('tag-input').focus()}>
          {form.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              #{tag}
              <button type="button" onClick={() => removeTag(tag)}>×</button>
            </span>
          ))}
          <input
            id="tag-input"
            className="tags-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={form.tags.length === 0 ? 'Add tags (press Enter)…' : ''}
          />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Press Enter or comma to add tags. Max 8 tags.</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Saving…
            </>
          ) : submitLabel}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
