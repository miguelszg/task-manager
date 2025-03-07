import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, List, Select } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { userService } from '../services/apis'; 

const { Option } = Select;

const AddGroupModal = ({ visible, onCancel, onAddGroup, currentUserId }) => {
  const [form] = Form.useForm();
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [users, setUsers] = useState([]);
 
  useEffect(() => {
    if (visible) {
      const fetchUsers = async () => {
        try {
          const response = await userService.getAllUsers();
          if (response.success) {
            setUsers(response.users.filter((user) => user._id !== currentUserId)); 
          }
        } catch (error) {
          console.error('Error al obtener usuarios:', error);
        }
      };
  
      fetchUsers();
    }
  }, [visible, currentUserId]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const membersWithDetails = selectedMembers.map((memberId) => {
          const member = users.find((m) => m._id === memberId);
          return { id: member._id, name: member.username };
        });

        onAddGroup({ ...values, members: membersWithDetails });
        form.resetFields();
        setSelectedMembers([]);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
    title="Agregar Grupo"
    open={visible} 
    onOk={handleOk}
    onCancel={onCancel}
    okText="Agregar"
    cancelText="Cancelar"
  >
      <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '8px' }}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre del Grupo"
            rules={[{ required: true, message: 'Por favor ingresa el nombre del grupo!' }]}
          >
            <Input placeholder="Nombre del grupo" />
          </Form.Item>

          <Form.Item
            name="members"
            label="Integrantes"
            rules={[{ required: true, message: 'Por favor selecciona al menos un integrante!' }]}
          >
            <Select
              mode="multiple"
              placeholder="Selecciona los integrantes"
              value={selectedMembers}
              onChange={(values) => setSelectedMembers(values)}
              style={{ width: '100%' }}
            >
              {users.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.username}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Integrantes Seleccionados">
            <List
              dataSource={selectedMembers.map((id) => users.find((user) => user._id === id))}
              renderItem={(user) => (
                <List.Item>
                  {user?.username}
                </List.Item>
              )}
              style={{ marginTop: '8px' }}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AddGroupModal;