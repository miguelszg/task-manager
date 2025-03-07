import React, { useState, useEffect, useCallback } from 'react';
import { Button, Row, Col, Card, Statistic, Select, Popconfirm, FloatButton, message, Table, Modal, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, UserAddOutlined, UserSwitchOutlined } from '@ant-design/icons';
import TaskCard from '../componets/TaskCard';
import AddTaskModal from '../layouts/AddTaskModal';
import AddGroupModal from '../layouts/AddGroupModal';
import dayjs from 'dayjs';
import { groupService, userService } from '../services/apis'; 
import { taskService } from '../services/apis';

const { Option } = Select;
const { TabPane } = Tabs;

const statuses = ['en progreso', 'en revision', 'en pausa', 'finalizada'];

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [visibleTaskModal, setVisibleTaskModal] = useState(false);
  const [visibleGroupModal, setVisibleGroupModal] = useState(false);
  const [visibleUserRoleModal, setVisibleUserRoleModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState(2);
  const [activeTab, setActiveTab] = useState('1');
  const [userRole, setUserRole] = useState(2);

  const canEditTask = (task) => {
    return isAdmin || task.assignedTo._id === currentUserId;
  };
  
  const canDeleteTask = (task) => {
    return isAdmin || task.createdBy._id === currentUserId;
  };
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUserId(user._id);
      setIsAdmin(user.role === 1);
      setUserRole(user.role); // Guardamos el rol del usuario
    }
    
    // Detectar si el usuario está navegando hacia atrás
    window.addEventListener('popstate', handleBackNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleBackNavigation);
    };
  }, []);
  
  // Función para manejar la navegación hacia atrás
  const handleBackNavigation = () => {
    // Limpiar las credenciales cuando el usuario navega hacia atrás
    localStorage.removeItem('user');
    localStorage.removeItem('selectedGroupId');
  };
  
  // También podemos limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      // Esto se ejecutará cuando el componente se desmonte
      localStorage.removeItem('user');
      localStorage.removeItem('selectedGroupId');
    };
  }, []);

  // Cargar los usuarios (solo para administradores)
  useEffect(() => {
    if (isAdmin) {
      const loadUsers = async () => {
        try {
          const response = await userService.getAllUsers();
          if (response.success) {
            setUsers(response.users);
          }
        } catch (error) {
          console.error('Error al cargar usuarios:', error);
          message.error('Error al cargar la lista de usuarios');
        }
      };
      
      loadUsers();
      
      const userInterval = setInterval(loadUsers, 2000);
      
      return () => clearInterval(userInterval);
    }
  }, [isAdmin]);

  const loadUserGroups = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      try {
        const groupsResponse = await groupService.getUserGroups(user._id);
        if (groupsResponse.success) {
          setGroups(groupsResponse.groups);
        }
      } catch (error) {
        console.error('Error al cargar los grupos del usuario:', error);
      }
    }
  }, []);
  
  useEffect(() => {
    loadUserGroups();
    
    // Configurar intervalo para actualizar grupos cada 2 segundos
    const groupInterval = setInterval(loadUserGroups, 2000);
    
    return () => clearInterval(groupInterval);
  }, [loadUserGroups]);
  
  // Cargar tareas basadas en el grupo seleccionado con actualización automática
  const loadTasks = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    try {
      if (selectedGroup) {
        // Si hay un grupo seleccionado, cargar las tareas de ese grupo
        const response = await taskService.getGroupTasks(selectedGroup);
        if (response.success) {
          setTasks(response.tasks);
        }
      } else {
        // Si no hay grupo seleccionado, cargar todas las tareas del usuario
        const response = await taskService.getUserTasks(user._id);
        if (response.success) {
          setTasks(response.tasks);
        }
      }
    } catch (error) {
      console.error('Error al cargar las tareas:', error);
    }
  }, [selectedGroup]);
  
  useEffect(() => {
    loadTasks();
    
    // Configurar intervalo para actualizar tareas cada 2 segundos
    const taskInterval = setInterval(loadTasks, 2000);
    
    return () => clearInterval(taskInterval);
  }, [loadTasks]);

  // Obtener detalles del grupo seleccionado
  const fetchGroupDetails = useCallback(async () => {
    if (selectedGroup) {
      try {
        const response = await groupService.getGroupById(selectedGroup);
        if (response.success) {
          setGroup(response.group);
        }
      } catch (error) {
        console.error('Error al obtener los detalles del grupo:', error);
      }
    } else {
      setGroup(null);
    }
  }, [selectedGroup]);
  
  useEffect(() => {
    fetchGroupDetails();
    
    // Actualizar detalles del grupo cada 2 segundos
    const groupDetailsInterval = setInterval(fetchGroupDetails, 2000);
    
    return () => clearInterval(groupDetailsInterval);
  }, [fetchGroupDetails]);

  const onAddTask = async (newTask) => {
    try {
      const response = await taskService.createTask(newTask);
      if (response.success) {
        message.success('Tarea creada exitosamente');
        // La tarea se actualizará automáticamente en el próximo intervalo
        loadTasks();
      }
    } catch (error) {
      console.error('Error al crear la tarea:', error);
      message.error('Error al crear la tarea');
    }
  };

  const onAddGroup = async (newGroup) => {
    try {
      const response = await groupService.createGroup({
        name: newGroup.name,
        createdBy: currentUserId,
        members: newGroup.members.map((member) => member.id),
      });

      if (response.success) {
        message.success('Grupo creado exitosamente');
        setVisibleGroupModal(false);
        // El grupo se actualizará automáticamente en el próximo intervalo
        loadUserGroups();
      }
    } catch (error) {
      console.error('Error al crear el grupo:', error);
      message.error('Error al crear el grupo');
    }
  };

  const onChangeStatus = async (taskId, newStatus) => {
    try {
      const response = await taskService.updateTask(taskId, { status: newStatus });
      if (response.success) {
        message.success('Estado de la tarea actualizado');
        // La tarea se actualizará automáticamente en el próximo intervalo
      }
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      message.error('Error al actualizar la tarea');
    }
  };
  
  const onDeleteTask = async (taskId) => {
    try {
      const response = await taskService.deleteTask(taskId);
      if (response.success) {
        message.success('Tarea eliminada exitosamente');
        // La tarea se eliminará automáticamente en el próximo intervalo
      }
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      message.error('Error al eliminar la tarea');
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const getStatusPercentage = (status) => {
    const totalTasks = tasks.length;
    if (totalTasks === 0) return 0;
    const tasksInStatus = getTasksByStatus(status).length;
    return ((tasksInStatus / totalTasks) * 100).toFixed(2);
  };

  const handleGroupChange = (value) => {
    localStorage.setItem('selectedGroupId', value);
    setSelectedGroup(value);
  };

  const handleUpdateUserRole = async () => {
    if (!selectedUserId) {
      message.error('Por favor selecciona un usuario');
      return;
    }

    try {
      const response = await userService.updateUserRole(selectedUserId, selectedRole);
      if (response.success) {
        message.success('Rol de usuario actualizado exitosamente');
        setVisibleUserRoleModal(false);
        // Los usuarios se actualizarán automáticamente en el próximo intervalo
      }
    } catch (error) {
      console.error('Error al actualizar el rol del usuario:', error);
      message.error('Error al actualizar el rol');
    }
  };

  const userColumns = [
    {
      title: 'Usuario',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (role === 1 ? 'Administrador' : 'Usuario'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Button 
          onClick={() => {
            setSelectedUserId(record._id);
            setSelectedRole(record.role);
            setVisibleUserRoleModal(true);
          }}
          icon={<UserSwitchOutlined />}
        >
          Cambiar Rol
        </Button>
      ),
    },
  ];

  const renderTasks = () => (
    <>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        {statuses.map((status) => (
          <Col span={6} key={status}>
            <Card>
              <Statistic
                title={status.toUpperCase()}
                value={`${getStatusPercentage(status)}%`}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginBottom: '24px' }}>
        <h3>Selecciona un grupo para ver sus tareas:</h3>
        <Select
          placeholder="Selecciona un grupo"
          style={{ width: 300 }}
          onChange={handleGroupChange}
          value={selectedGroup}
          allowClear
        >
          {groups.map((group) => (
            <Option key={group._id} value={group._id}>
              {group.name}
            </Option>
          ))}
        </Select>
        
      </div>

      <Row gutter={16}>
        {statuses.map((status) => (
          <Col span={6} key={status}>
            <h3>{status.toUpperCase()}</h3>
            {getTasksByStatus(status).map((task) => (
            <Card
              key={task._id}
              style={{ marginBottom: '16px' }}
              actions={[
                <Select
                  defaultValue={task.status}
                  style={{ width: '100%' }}
                  onChange={(value) => onChangeStatus(task._id, value)}
                  disabled={!canEditTask(task)}
                >
                  {statuses.map((status) => (
                    <Option key={status} value={status}>
                      {status}
                    </Option>
                  ))}
                </Select>,
                <Popconfirm
                  title="¿Estás seguro de eliminar esta tarea?"
                  onConfirm={() => onDeleteTask(task._id)}
                  okText="Sí"
                  cancelText="No"
                  disabled={!canDeleteTask(task)}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={!canDeleteTask(task)}
                  />
                </Popconfirm>,
              ]}
            >
              <TaskCard task={task} />
            </Card>
          ))}
          </Col>
        ))}
      </Row>
    </>
  );

  const renderUserAdmin = () => {
    if (!isAdmin) return <div>No tienes permisos para ver esta sección</div>;
    
    return (
      <div>
        <h2>Administración de Usuarios</h2>
        <Table 
          dataSource={users} 
          columns={userColumns} 
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
        
        <Modal
          title="Cambiar Rol de Usuario"
          visible={visibleUserRoleModal}
          onOk={handleUpdateUserRole}
          onCancel={() => setVisibleUserRoleModal(false)}
        >
          <p>Selecciona el nuevo rol para el usuario:</p>
          <Select
            value={selectedRole}
            onChange={(value) => setSelectedRole(value)}
            style={{ width: '100%' }}
          >
            <Option value={1}>Administrador</Option>
            <Option value={2}>Usuario</Option>
          </Select>
        </Modal>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Gestión de Tareas" key="1">
          {renderTasks()}
        </TabPane>
        {isAdmin && (
          <TabPane tab="Administración de Usuarios" key="2">
            {renderUserAdmin()}
          </TabPane>
        )}
      </Tabs>

      {/* Botones flotantes solo habilitados para administradores (role 1) */}
      <FloatButton.Group shape="circle" style={{ right: 24, bottom: 24 }}>
        <FloatButton
          icon={<PlusOutlined />}
          onClick={() => setVisibleTaskModal(true)}
          tooltip="Agregar Tarea"
          disabled={userRole === 2} // Deshabilitar para usuarios normales
        />
        <FloatButton
          icon={<UserAddOutlined />}
          onClick={() => setVisibleGroupModal(true)}
          tooltip="Agregar Grupo"
          disabled={userRole === 2} // Deshabilitar para usuarios normales
        />
      </FloatButton.Group>

      <AddTaskModal
        visible={visibleTaskModal}
        onCancel={() => setVisibleTaskModal(false)}
        onAddTask={onAddTask}
        groups={groups}
        defaultGroup={selectedGroup}
      />

      <AddGroupModal
        visible={visibleGroupModal}
        onCancel={() => setVisibleGroupModal(false)}
        onAddGroup={onAddGroup}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default TaskManager;