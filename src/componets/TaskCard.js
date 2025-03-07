import React from 'react';
import { Tag } from 'antd';

const TaskCard = ({ task }) => {
  const statusColors = {
    'en progreso': 'blue',
    'en revision': 'orange',
    'en pausa': 'yellow',
    finalizada: 'green',
  };

  return (
    <div>
      <p><strong>Nombre:</strong> {task.name}</p>
      <p><strong>Descripción:</strong> {task.description}</p>
      <p><strong>Fecha de Finalización:</strong> {task.dueDate}</p>
      <p><strong>Categoría:</strong> {task.category}</p>
      <Tag color={statusColors[task.status]}>{task.status}</Tag>
    </div>
  );
};

export default TaskCard;