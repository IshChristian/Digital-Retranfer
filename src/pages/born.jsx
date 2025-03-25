import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, X, Save, Baby } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

const BabiesPage = () => {
  const [babies, setBabies] = useState([]);
  const [borns, setBorns] = useState([]);
  const [filteredBorns, setFilteredBorns] = useState([]);
  const [filteredBabies, setFilteredBabies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bornSearchTerm, setBornSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBaby, setCurrentBaby] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBornId, setSelectedBornId] = useState("");
  const [userRole, setUserRole] = useState(Cookies.get('role') || '');

  // Check if user has Pediatrition role
  const isPediatrition = userRole === 'pediatrition';

  // Setup axios instance with token
  const API_URL = "https://digitalbackend-uobz.onrender.com/api/v1";
  const token = Cookies.get("token");
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchBorns();
    fetchBabies();
  }, []);

  // Filter borns based on search term
  useEffect(() => {
    if (bornSearchTerm.trim() === "") {
      setFilteredBorns(borns);
    } else {
      const filtered = borns.filter(born => 
        born.motherName.toLowerCase().includes(bornSearchTerm.toLowerCase()) ||
        (born.fatherName && born.fatherName.toLowerCase().includes(bornSearchTerm.toLowerCase())) ||
        born.motherNationalId.toLowerCase().includes(bornSearchTerm.toLowerCase())
      );
      setFilteredBorns(filtered);
    }
  }, [bornSearchTerm, borns]);

  // Filter babies based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBabies(babies);
    } else {
      const filtered = babies.filter(baby => 
        baby.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBabies(filtered);
    }
  }, [searchTerm, babies]);

  // Fetch born records
  const fetchBorns = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get("/borns");
      setBorns(data || []);
      setFilteredBorns(data || []);
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch baby records
  const fetchBabies = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get("/babies");
      setBabies(data || []);
      setFilteredBabies(data || []);
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new baby
  const createBaby = async (babyData) => {
    try {
      setIsLoading(true);
      const payload = {
        name: babyData.name,
        gender: babyData.gender,
        birthWeight: babyData.birthWeight,
        dischargebirthWeight: babyData.dischargebirthWeight,
        medications: babyData.medications
      };

      if (babyData.bornId && babyData.bornId.trim() !== "") {
        payload.bornId = babyData.bornId;
      }

      await axiosInstance.post("/babies", payload);
      await fetchBabies();
      setIsModalOpen(false);
      showAlert('success', 'Baby created successfully!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update baby
  const updateBaby = async (id, babyData) => {
    try {
      setIsLoading(true);
      const payload = {
        name: babyData.name,
        gender: babyData.gender,
        birthWeight: babyData.birthWeight,
        dischargebirthWeight: babyData.dischargebirthWeight,
        medications: babyData.medications
      };

      if (babyData.bornId && babyData.bornId.trim() !== "") {
        payload.bornId = babyData.bornId;
      }

      await axiosInstance.put(`/babies/${id}`, payload);
      await fetchBabies();
      setIsModalOpen(false);
      showAlert('success', 'Baby updated successfully!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete baby
  const deleteBaby = async (id) => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/babies/${id}`);
      await fetchBabies();
      showAlert('success', 'Baby deleted successfully!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show alert
  const showAlert = (icon, title) => {
    Swal.fire({
      icon,
      title,
      showConfirmButton: false,
      timer: 1500
    });
  };

  // Confirm delete
  const confirmDelete = (baby) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete baby ${baby.name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBaby(baby.id);
      }
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const babyData = {
      bornId: formData.get("bornId") || "",
      name: formData.get("name"),
      gender: formData.get("gender"),
      birthWeight: parseFloat(formData.get("birthWeight")),
      dischargebirthWeight: parseFloat(formData.get("dischargebirthWeight")),
      medications: formData.get("medications").split(",").map(m => m.trim()).filter(m => m),
    };

    if (currentBaby) {
      updateBaby(currentBaby.id, babyData);
    } else {
      createBaby(babyData);
    }
  };

  // Open modal for viewing/editing
  const openModal = (baby = null) => {
    setCurrentBaby(baby);
    setIsEditMode(!!baby);
    setSelectedBornId(baby?.bornId || "");
    setIsModalOpen(true);
    setBornSearchTerm("");
  };

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-600">Babies Management</h1>
        <p className="text-gray-600">Manage baby records in the system</p>
      </div>
      
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search by baby name..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        {isPediatrition && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            onClick={() => openModal()}
            disabled={isLoading}
          >
            <Plus size={18} />
            Add New Baby
          </button>
        )}
      </div>
      
      {/* Babies Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading && (
          <div className="p-4 text-center text-gray-500">
            Loading...
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Birth Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Discharge Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Medications</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBabies.length > 0 ? (
                filteredBabies.map((baby) => (
                  <tr key={baby.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Baby size={16} className="text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{baby.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        baby.gender === "Male" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                      }`}>
                        {baby.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {baby.birthWeight} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {baby.dischargebirthWeight} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {baby.medications?.join(", ") || "None"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={() => openModal(baby)}
                        disabled={isLoading}
                      >
                        <Eye size={18} />
                      </button>
                      {isPediatrition && (
                        <>
                          <button 
                            className="text-green-600 hover:text-green-900 ml-3"
                            onClick={() => {
                              openModal(baby);
                              setIsEditMode(true);
                            }}
                            disabled={isLoading}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 ml-3"
                            onClick={() => confirmDelete(baby)}
                            disabled={isLoading}
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {isLoading ? 'Loading...' : 'No babies found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-green-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-green-700">
                {isEditMode ? 'Edit Baby' : 'New Baby'}
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentBaby(null);
                  setIsEditMode(false);
                }}
                disabled={isLoading}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Born Record (Optional)</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Search born records..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={bornSearchTerm}
                    onChange={(e) => setBornSearchTerm(e.target.value)}
                  />
                  <select
                    name="bornId"
                    value={selectedBornId}
                    onChange={(e) => setSelectedBornId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isEditMode}
                  >
                    <option value="">Select Born Record (Optional)</option>
                    {filteredBorns.map((born) => (
                      <option key={born.id} value={born.id}>
                        {born.motherName} {born.fatherName ? `& ${born.fatherName}` : ''} (ID: {born.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={currentBaby?.name || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  name="gender"
                  defaultValue={currentBaby?.gender || "Male"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="birthWeight"
                  defaultValue={currentBaby?.birthWeight || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="dischargebirthWeight"
                  defaultValue={currentBaby?.dischargebirthWeight || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medications (comma separated)</label>
                <input
                  type="text"
                  name="medications"
                  defaultValue={currentBaby?.medications?.join(", ") || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="border-t border-gray-200 pt-4 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentBaby(null);
                    setIsEditMode(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                {isPediatrition && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 flex items-center"
                    disabled={isLoading}
                  >
                    <Save className="h-5 w-5 mr-1" />
                    {isLoading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update' : 'Add')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BabiesPage;