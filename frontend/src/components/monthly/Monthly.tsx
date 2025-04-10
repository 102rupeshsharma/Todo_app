import React, { useState } from 'react';
import './Monthly.css'

interface Task {
  id: number;
  title: string;
  description: string;
  frequency: string;
  due_date: string;
  due_time: string;
}
interface DailyProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskDeleted: () => void;
  onEdit: (task: Task) => void
}

export const Monthly: React.FC<DailyProps> = ({
  tasks,
  setTasks,
  onTaskDeleted,
  onEdit,

}) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const monthlyTasks = tasks.filter(
    (task) => task.frequency.toLowerCase() === "monthly"
  );

  const handleDelete = async (taskId: number) => {
    setDeletingId(taskId);
    try {
      const res = await fetch(`${apiUrl}/delete_task/${taskId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
        onTaskDeleted();
      } else {
        const data = await res.json();
        console.error('Failed to delete task:', data.message);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="monthly-tasks">
      <div className='task-header'><p> Monthly Tasks</p></div>
      {monthlyTasks.length === 0 ? (
        <p className="no-tasks">No daily tasks yet.</p>
      ) : (
        <div className="task-grid">
          {monthlyTasks.map((task) => (
            <div key={task.id} className="task-card">

              <div className="task-content">
                <h3 className="task-title">{task.title}</h3>
                <p className="task-desc">{task.description}</p>
              </div>

              <div className="date_time-action_btn">
                <div className="task-datetime">
                  <span>{task.due_date} </span>
                  <span>{task.due_time}</span>
                </div>

                <div className="task-actions">
                  <button
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingId === task.id}
                    className="delete-btn"
                  >
                    {deletingId === task.id ? 'Deleting...' : 'Delete'}
                  </button>

                  <button
                    className="edit-btn"
                    onClick={() => onEdit(task)}
                  >
                    Edit
                  </button>

                  <button className="share-btn" disabled>
                    Share
                  </button>
                </div>
              </div>
            </div>

          ))}
        </div>
      )}
    </div>
  );
};
