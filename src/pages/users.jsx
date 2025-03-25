import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, User, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [healthCenters, setHealthCenters] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const token = Cookies.get('token');

  
  // Form state
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    role: {
      data_manager: false,
      head_of_community_workers_at_helth_center: false,
      pediatrition: false,
      admin: false
    },
    gender: 'Male',
    address: '',
    healthCenterId: ''
  });

  // Fetch users and health centers on component mount
  useEffect(() => {
    fetchUsers();
    fetchHealthCenters();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('https://digitalbackend-uobz.onrender.com/api/v1/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Correctly access the users array from the response
      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
      console.log(response.data.users); // Log the actual users data
    } catch (error) {
      console.error("Error fetching users:", error);
      showAlert('error', error.response?.data?.message || 'Failed to load users');
    }
  };


  const fetchHealthCenters = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('https://digitalbackend-uobz.onrender.com/api/v1/healthcenters', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Make sure to access the correct data property from the response
      setHealthCenters(response.data || []);
    } catch (error) {
      console.error("Error fetching health centers:", error);
      showAlert('error', error.response?.data?.message || 'Failed to load health centers');
    }
  };
  

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        `${user.firstname} ${user.lastname}`.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role: {
        ...prev.role,
        [role]: !prev.role[role]
      }
    }));
  };

  const resetForm = () => {
    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      role: {
        data_manager: false,
        head_of_community_workers_at_helth_center: false,
        pediatrition: false,
        admin: false
      },
      gender: 'Male',
      address: '',
      healthCenterId: ''
    });
  };

  const showAlert = (icon, title) => {
    Swal.fire({
      icon,
      title,
      showConfirmButton: false,
      timer: 1500
    });
  };

  const handleAddUser = async () => {
    try {
      if (!formData.firstname || !formData.lastname || !formData.email || !formData.healthCenterId) {
        showAlert('error', 'Please fill all required fields');
        return;
      }
  
      const token = Cookies.get('token'); // Get token from cookies
      const selectedRoles = Object.entries(formData.role)
        .filter(([_, selected]) => selected)
        .map(([role]) => role);
  
      const userToAdd = {
        ...formData,
        role: selectedRoles.join('/'),
      };
  
      const response = await axios.post(
        'https://digitalbackend-uobz.onrender.com/api/v1/users/addUser',
        userToAdd,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const newUser = { id: response.data.id || Date.now(), ...userToAdd };
  
      setUsers((prev) => [...prev, newUser]);
      setFilteredUsers((prev) => [...prev, newUser]);
  
      setIsAddModalOpen(false);
      resetForm();
      showAlert('success', 'User added successfully');
    } catch (error) {
      console.error("Error adding user:", error);
      showAlert('error', error.response?.data?.message || 'Failed to add user');
    }
  };
  

  const handleViewUser = (user) => {
    setCurrentUser(user);
    
    // Convert role string to object
    const roles = user.role.split('/');
    const roleObject = {
      data_manager: roles.includes('data_manager'),
      head_of_community_workers_at_helth_center: roles.includes('head_of_community_workers_at_helth_center'),
      pediatrition: roles.includes('pediatrition'),
      admin: roles.includes('admin')
    };
    
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      role: roleObject,
      gender: user.gender,
      address: user.address || '',
      healthCenterId: user.healthCenterId || ''
    });
    
    setIsViewModalOpen(true);
    setIsEditMode(false);
  };

  const handleUpdateUser = async () => {
    try {
      if (!currentUser) return;
  
      if (!formData.firstname || !formData.lastname || !formData.email || !formData.healthCenterId) {
        showAlert('error', 'Please fill all required fields');
        return;
      }
  
      const token = Cookies.get('token'); // Get token from cookies
      const selectedRoles = Object.entries(formData.role)
        .filter(([_, selected]) => selected)
        .map(([role]) => role);
  
      const userToUpdate = {
        ...formData,
        role: selectedRoles.join('/'),
      };
  
      await axios.put(
        `https://digitalbackend-uobz.onrender.com/api/v1/users/update/${currentUser.id}`,
        userToUpdate,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const updatedUsers = users.map((user) =>
        user.id === currentUser.id ? { ...user, ...userToUpdate } : user
      );
  
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
  
      setIsViewModalOpen(false);
      resetForm();
      setCurrentUser(null);
      showAlert('success', 'User updated successfully');
    } catch (error) {
      console.error("Error updating user:", error);
      showAlert('error', error.response?.data?.message || 'Failed to update user');
    }
  };
  

  const handleDeleteUser = (userId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = Cookies.get('token'); // Get token from cookies
  
          await axios.delete(`https://digitalbackend-uobz.onrender.com/api/v1/users/delete/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          const updatedUsers = users.filter((user) => user.id !== userId);
          setUsers(updatedUsers);
          setFilteredUsers(updatedUsers);
  
          showAlert('success', 'User deleted successfully');
        } catch (error) {
          console.error("Error deleting user:", error);
          showAlert('error', error.response?.data?.message || 'Failed to delete user');
        }
      }
    });
  };
  

  const getHealthCenterName = (id) => {
    if (!id) return 'Not assigned';
    const center = healthCenters.find(center => center.id === id);
    return center ? center.name : 'Unknown';
  };

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-600">User Management</h1>
        <p className="text-gray-600">Manage system users</p>
      </div>
      
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
        >
          <Plus size={18} />
          Add New User
        </button>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
  filteredUsers.map((user) => (
    <tr key={user.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-green-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.firstname} {user.lastname}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.phone}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {user.role.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <button 
          className="text-green-600 hover:text-green-900"
          onClick={() => handleViewUser(user)}
        >
          <Eye size={18} />
        </button>
        <button 
          className="text-red-600 hover:text-red-900 ml-3"
          onClick={() => handleDeleteUser(user.id)}
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
      No users found
    </td>
  </tr>
)}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-green-300 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-green-700">Add New User</h2>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Health Center*</label>
                <select
                  name="healthCenterId"
                  value={formData.healthCenterId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Health Center</option>
                  {healthCenters.map(center => (
                    <option key={center.id} value={center.id}>
                      {center.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Role*</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="role_data_manager"
                      checked={formData.role.data_manager}
                      onChange={() => handleRoleChange('data_manager')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="role_data_manager" className="ml-2 block text-sm text-gray-700">
                      Data Manager
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="role_head"
                      checked={formData.role.head_of_community_workers_at_helth_center}
                      onChange={() => handleRoleChange('head_of_community_workers_at_helth_center')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="role_head" className="ml-2 block text-sm text-gray-700">
                      Head of Community Workers at Health Center
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="role_pediatrition"
                      checked={formData.role.pediatrition}
                      onChange={() => handleRoleChange('pediatrition')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="role_pediatrition" className="ml-2 block text-sm text-gray-700">
                      Pediatrician
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="role_admin"
                      checked={formData.role.admin}
                      onChange={() => handleRoleChange('admin')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="role_admin" className="ml-2 block text-sm text-gray-700">
                      Admin
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={handleAddUser}
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* View/Edit User Modal */}
      {isViewModalOpen && currentUser && (
        <div className="fixed inset-0 bg-green-300 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-green-700">
                {isEditMode ? 'Edit User' : 'User Details'}
              </h2>
              <div className="flex items-center gap-2">
                {!isEditMode && (
                  <button 
                    className="text-green-600 hover:text-green-900"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit size={20} />
                  </button>
                )}
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setIsEditMode(false);
                    setCurrentUser(null);
                  }}
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                ) : (
                  <p className="text-gray-800">{currentUser.firstname}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                ) : (
                  <p className="text-gray-800">{currentUser.lastname}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditMode ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                ) : (
                  <p className="text-gray-800">{currentUser.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-800">{currentUser.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                {isEditMode ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-800">{currentUser.gender}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-800">{currentUser.address}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Health Center</label>
                {isEditMode ? (
                  <select
                    name="healthCenterId"
                    value={formData.healthCenterId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select Health Center</option>
                    {healthCenters.map(center => (
                      <option key={center.id} value={center.id}>
                        {center.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-800">{getHealthCenterName(currentUser.healthCenterId)}</p>
                )}
              </div>
              
              <div className={isEditMode ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                {isEditMode ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="view_role_data_manager"
                        checked={formData.role.data_manager}
                        onChange={() => handleRoleChange('data_manager')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="view_role_data_manager" className="ml-2 block text-sm text-gray-700">
                        Data Manager
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="view_role_head"
                        checked={formData.role.head_of_community_workers_at_helth_center}
                        onChange={() => handleRoleChange('head_of_community_workers_at_helth_center')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="view_role_head" className="ml-2 block text-sm text-gray-700">
                        Head of Community Workers at Health Center
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="view_role_pediatrition"
                        checked={formData.role.pediatrition}
                        onChange={() => handleRoleChange('pediatrition')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="view_role_pediatrition" className="ml-2 block text-sm text-gray-700">
                        Pediatrician
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="view_role_admin"
                        checked={formData.role.admin}
                        onChange={() => handleRoleChange('admin')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="view_role_admin" className="ml-2 block text-sm text-gray-700">
                        Admin
                      </label>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-800">
                    {currentUser.role.split('_').join(' ')}
                  </p>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setIsEditMode(false);
                  setCurrentUser(null);
                }}
              >
                {isEditMode ? 'Cancel' : 'Close'}
              </button>
              {isEditMode && (
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  onClick={handleUpdateUser}
                >
                  Update User
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}