import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apis';

const Register = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      // Utilizando el servicio de autenticación en lugar de axios directamente
      const response = await authService.register(values);
      console.log('Respuesta del servidor:', response);

      if (response.success) {
        message.success(response.message || 'Registro exitoso!');
        navigate('/'); // Redirige al login
      } else {
        message.error(response.message || 'Error al registrar');
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      if (error.response) {
        message.error(error.response.data.message || 'Error al registrar');
      } else {
        message.error('Error de conexión. Por favor, intenta de nuevo.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Registro</h1>
      <Form
        name="register"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Por favor ingresa tu nombre de usuario!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nombre de usuario" />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            {
              type: 'email',
              message: 'El correo no es válido!',
            },
            {
              required: true,
              message: 'Por favor ingresa tu correo!',
            },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Correo electrónico" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Por favor ingresa tu contraseña!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Registrarse
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center' }}>
        <p>
          ¿Ya tienes una cuenta?{' '}
          <a href="/">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Register;