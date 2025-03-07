import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, Select } from 'antd';
import { useEffect } from 'react';
import '../services/apis';
import { groupService } from '../services/api2';

const { Option } = Select;

const AddTaskModal = ({ visible, onCancel, onAddTask }) => {
  const [form] = Form.useForm();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await groupService.getAllGroups();
        if (response.success) {
          setGroups(response.groups);
          console.log('Grupos obtenidos:', response.groups);
        }
      } catch (error) {
        console.error('Error al obtener los grupos:', error);
      }
    };
  
    fetchGroups();
  }, []);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
          console.error('Usuario no encontrado en el localStorage');
          return;
        }

        const taskData = {
          ...values,
          createdBy: user._id,
          dueDate: values.dueDate.format('YYYY-MM-DD'),
        };

        onAddTask(taskData);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const getGroupMembers = (groupId) => {
    const group = groups.find((group) => group._id === groupId);
    return group ? group.members : [];
  };

  return (
    <Modal
    title="Agregar Nueva Tarea"
    open={visible} 
    onOk={handleOk}
    onCancel={onCancel}
    okText="Agregar"
    cancelText="Cancelar"
    centered
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Nombre de la Tarea"
          rules={[{ required: true, message: 'Por favor ingresa el nombre de la tarea!' }]}
        >
          <Input placeholder="Nombre de la tarea" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descripción"
          rules={[{ required: true, message: 'Por favor ingresa una descripción!' }]}
        >
          <Input.TextArea placeholder="Descripción de la tarea" />
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="Fecha de Finalización"
          rules={[{ required: true, message: 'Por favor selecciona una fecha!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="category"
          label="Categoría"
          rules={[{ required: true, message: 'Por favor selecciona una categoría!' }]}
        >
          <Select placeholder="Selecciona una categoría">
            <Option value="trabajo">Trabajo</Option>
            <Option value="personal">Personal</Option>
            <Option value="estudio">Estudio</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Estatus"
          rules={[{ required: true, message: 'Por favor selecciona un estatus!' }]}
        >
          <Select placeholder="Selecciona un estatus">
            <Option value="en progreso">En Progreso</Option>
            <Option value="en revision">En Revisión</Option>
            <Option value="en pausa">En Pausa</Option>
            <Option value="finalizada">Finalizada</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="group"
          label="Grupo"
          rules={[{ required: true, message: 'Por favor selecciona un grupo!' }]}
        >
          <Select
            placeholder="Selecciona un grupo"
            onChange={(groupId) => setSelectedGroup(groupId)}
          >
            {groups.map((group) => (
              <Option key={group._id} value={group._id}>
                {group.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedGroup && (
          <Form.Item
            name="assignedTo"
            label="Asignar a"
            rules={[{ required: true, message: 'Por favor selecciona un integrante!' }]}
          >
            <Select placeholder="Selecciona un integrante">
              {getGroupMembers(selectedGroup).map((member) => (
                <Option key={member._id} value={member._id}>
                  {member.username}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default AddTaskModal;