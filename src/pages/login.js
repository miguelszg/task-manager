import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apis'; 

const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await authService.login(values); 
      if (response.success) {
        message.success('Inicio de sesión exitoso!');
  
        localStorage.setItem('user', JSON.stringify(response.user)); 
        localStorage.setItem('isAuthenticated', true); 
        console.log(response.user);
  
        navigate('/task'); 
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Error al iniciar sesión');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Iniciar Sesión</h1>
      <Form
        name="login"
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Por favor ingresa tu nombre de usuario!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nombre de usuario" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Por favor ingresa tu contraseña!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Iniciar sesión
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center' }}>
        <p>
          ¿No tienes una cuenta?{' '}
          <a href="/register">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Login;