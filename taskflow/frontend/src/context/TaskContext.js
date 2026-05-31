import React, { createContext, useContext, useState, useCallback } from 'react';
import { taskAPI } from '../utils/api';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ todo: 0, 'in-progress': 0, review: 0, done: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchTasks = useCallback(async (customFilters) => {
    setLoading(true);
    try {
      const params = { ...filters, ...customFilters };
      // Remove 'all' values
      Object.keys(params).forEach((k) => params[k] === 'all' && delete params[k]);
      const { data } = await taskAPI.getAll(params);
      setTasks(data.data);
      setStats(data.stats);
      setTotal(data.total);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTask = useCallback(async (taskData) => {
    try {
      const { data } = await taskAPI.create(taskData);
      setTasks((prev) => [data.data, ...prev]);
      setStats((prev) => ({ ...prev, [data.data.status]: (prev[data.data.status] || 0) + 1 }));
      setTotal((prev) => prev + 1);
      toast.success('Task created!');
      return { success: true, task: data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    try {
      const { data } = await taskAPI.update(id, taskData);
      setTasks((prev) => prev.map((t) => (t._id === id ? data.data : t)));
      toast.success('Task updated!');
      return { success: true, task: data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const updateTaskStatus = useCallback(async (id, status) => {
    const oldTask = tasks.find((t) => t._id === id);
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)));
    if (oldTask) {
      setStats((prev) => ({
        ...prev,
        [oldTask.status]: Math.max(0, (prev[oldTask.status] || 0) - 1),
        [status]: (prev[status] || 0) + 1,
      }));
    }
    try {
      await taskAPI.updateStatus(id, status);
    } catch (error) {
      // Revert on error
      setTasks((prev) => prev.map((t) => (t._id === id ? oldTask : t)));
      if (oldTask) {
        setStats((prev) => ({
          ...prev,
          [status]: Math.max(0, (prev[status] || 0) - 1),
          [oldTask.status]: (prev[oldTask.status] || 0) + 1,
        }));
      }
      toast.error('Failed to update status');
    }
  }, [tasks]);

  const deleteTask = useCallback(async (id) => {
    const task = tasks.find((t) => t._id === id);
    try {
      await taskAPI.delete(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      if (task) {
        setStats((prev) => ({ ...prev, [task.status]: Math.max(0, (prev[task.status] || 0) - 1) }));
        setTotal((prev) => Math.max(0, prev - 1));
      }
      toast.success('Task deleted');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
      return { success: false };
    }
  }, [tasks]);

  const clearCompleted = useCallback(async () => {
    try {
      const { data } = await taskAPI.clearCompleted();
      setTasks((prev) => prev.filter((t) => t.status !== 'done'));
      setStats((prev) => ({ ...prev, done: 0 }));
      toast.success(data.message);
    } catch (error) {
      toast.error('Failed to clear completed tasks');
    }
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks, stats, total, loading, filters,
        setFilters, fetchTasks, createTask, updateTask,
        updateTaskStatus, deleteTask, clearCompleted,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};
