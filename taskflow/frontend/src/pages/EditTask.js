import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { taskAPI } from '../utils/api';
import TaskForm from '../components/TaskForm';
import ConfirmModal from '../components/ConfirmModal';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateTask, deleteTask } = useTasks();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await taskAPI.getById(id);
        setTask(data.data);
      } catch {
        toast.error('Task not found');
        navigate('/tasks');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]); // eslint-disable-line

  const handleSubmit = async (data) => {
    setSubmitting(true);
    const result = await updateTask(id, data);
    setSubmitting(false);
    if (result.success) navigate('/tasks');
  };

  const handleDelete = async () => {
    const result = await deleteTask(id);
    if (result.success) navigate('/tasks');
  };

  if (loading) return <Spinner />;
  if (!task) return null;

  return (
    <div className="task-form-page fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>Edit Task</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Update the task details below.</p>
        </div>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => setShowDelete(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
          </svg>
          Delete
        </button>
      </div>

      <div className="card">
        <TaskForm
          initialData={task}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          loading={submitting}
        />
      </div>

      <ConfirmModal
        isOpen={showDelete}
        title="Delete Task"
        message={`Delete "${task.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default EditTask;
