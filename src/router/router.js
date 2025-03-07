import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from '../pages/login';
import Register from '../pages/register';
import TaskManager from '../pages/taskManager';
import PrivateRoute from '../componets/PrivateRoute'; 

const RoutesComponent = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/task"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <TaskManager />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default RoutesComponent;