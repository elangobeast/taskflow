import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import TaskForm from '../components/TaskForm';

const CreateTask = () => {
  const navigate = useNavigate();
  const { createTask } = useTasks();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    const result = await createTask(data);
    setLoading(false);
    if (result.success) navigate('/tasks');
  };

  return (
    <div className="task-form-page fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, marginBottom: 6 }}>Create New Task</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Fill in the details below to add a new task.</p>
      </div>
      <div className="card">
        <TaskForm onSubmit={handleSubmit} submitLabel="Create Task →" loading={loading} />
      </div>
    </div>
  );
};

export default CreateTask;
