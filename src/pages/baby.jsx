
import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Check, 
  AlertTriangle,
  Save,
  Baby,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import Swal from 'sweetalert2';
import axios from "axios";
import Cookies from "js-cookie";

const BornPage = () => {
  const [borns, setBorns] = useState([]);
  const [filteredBorns, setFilteredBorns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ 
    key: 'dateOfBirth', 
    direction: 'desc' 
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSorting, setShowSorting] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Address data states
  const [sectors, setSectors] = useState([]);
  const [cells, setCells] = useState([]);
  const [villages, setVillages] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBorn, setCurrentBorn] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Role-based access
  const [userRole, setUserRole] = useState(Cookies.get('role') || '');
  
  const [formData, setFormData] = useState({
    dateOfBirth: new Date().toISOString().split('T')[0],
    healthCenterId: "",
    motherName: "",
    motherPhone: "",
    motherNationalId: "",
    fatherNationalId: "",
    fatherName: "",
    fatherPhone: "",
    babyCount: 1,
    deliveryType: "Normal",
    leave: "yes",
    status: "go home",
    sector_id: "",
    cell_id: "",
    village_id: "",
    babies: [
      {
        name: "",
        gender: "Male",
        birthWeight: 0,
        dischargebirthWeight: 0,
        medications: []
      }
    ],
  });

  const sortedAndFilteredBorns = useMemo(() => {
    let result = [...filteredBorns];
  
    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(born => born.leave === filterStatus);
    }
  
    // Sorting
    result.sort((a, b) => {
      if (sortConfig.key) {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  
    return result;
  }, [filteredBorns, sortConfig, filterStatus]);
  
  // Pagination calculations
  const paginatedBorns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredBorns.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredBorns, currentPage, itemsPerPage]);
  

  // Setup axios instance with token
  const API_URL = "https://digitalbackend-uobz.onrender.com/api/v1/borns";
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
    fetchAddressData();
    fetchHealthCenters();
  }, []);


  // Total pages calculation
  const totalPages = Math.ceil(sortedAndFilteredBorns.length / itemsPerPage);

  // Fetch all born records
  const fetchBorns = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get("/");
      setBorns(data || []);
      setFilteredBorns(data || []);
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch address data (sectors, cells, villages)
  const fetchAddressData = async () => {
    try {
      const response = await axios.get('https://digitalbackend-uobz.onrender.com/api/v1/address/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = response.data;
      const sectorsData = [];
      
      if (data?.data?.length) {
        data.data.forEach((province) => {
          province.districts?.forEach((district) => {
            district.sectors?.forEach((sector) => {
              sectorsData.push({
                id: sector.id,
                name: sector.name,
                cells: sector.cells || []
              });
            });
          });
        });
      }
      
      setSectors(sectorsData);
      
      // If there are sectors, get cells from first sector by default
      if (sectorsData.length > 0) {
        const firstSector = sectorsData[0];
        setCells(firstSector.cells || []);
        
        // If there are cells, get villages from first cell by default
        if (firstSector.cells.length > 0) {
          setVillages(firstSector.cells[0].villages || []);
        }
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    }
  };

  // Fetch health centers
  const fetchHealthCenters = async () => {
    try {
      const response = await axios.get(
        'https://digitalbackend-uobz.onrender.com/api/v1/healthcenters',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Check for duplicate IDs
      const ids = response.data.map(hc => hc.id);
      if (new Set(ids).size !== ids.length) {
        console.error("Duplicate health center IDs found!", ids);
      }
      
      setHealthCenters(response.data || []);
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    }
  };

  // Sorting handler
  // Sorting handler
const handleSort = (key) => {
  setSortConfig(prev => ({
    key,
    direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
  }));
  setCurrentPage(1);
};

// Enhanced search handler
const handleSearch = (e) => {
  const value = e.target.value;
  setSearchTerm(value);
  setCurrentPage(1);
  
  if (value.trim() === '') {
    setFilteredBorns(borns);
  } else {
    const filtered = borns.filter(born => 
      born.motherName.toLowerCase().includes(value.toLowerCase()) ||
      (born.babies && born.babies.some(baby => 
        baby.name.toLowerCase().includes(value.toLowerCase())
      )) ||
      born.motherPhone.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBorns(filtered);
  }
};

/// Pagination handlers
const goToFirstPage = () => setCurrentPage(1);
const goToLastPage = () => setCurrentPage(totalPages);
const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));

  // Handle sector change
  const handleSectorChange = (e) => {
    const sectorId = e.target.value;
    const selectedSector = sectors.find(s => s.id == sectorId);
    const sectorCells = selectedSector?.cells || [];
    
    setCells(sectorCells);
    setVillages([]);
    
    setFormData({
      ...formData,
      sector_id: sectorId,
      cell_id: "",
      village_id: ""
    });
  };

  // Handle cell change
  const handleCellChange = (e) => {
    const cellId = e.target.value;
    const selectedCell = cells.find(c => c.id == cellId);
    const cellVillages = selectedCell?.villages || [];
    
    setVillages(cellVillages);
    
    setFormData({
      ...formData,
      cell_id: cellId,
      village_id: ""
    });
  };

  // Handle village change
  const handleVillageChange = (e) => {
    setFormData({
      ...formData,
      village_id: e.target.value
    });
  };

  // Create new born record
  const createBorn = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/", formData);
      
      if (response.status === 201) {
        await fetchBorns();
        setIsAddModalOpen(false);
        resetForm();
        showAlert('success', 'Born record added successfully');
      }
    } catch (err) {
      console.error("Error creating born record:", err);
      showAlert('error', err.response?.data?.message || 
               err.message || 'Failed to create born record');
    } finally {
      setIsLoading(false);
    }
  };

  // Update born record
  const updateBorn = async () => {
    if (!currentBorn?.id) return;
    
    try {
      setIsLoading(true);
      const dataToSend = {
        ...formData,
        babies: formData.babies.map(baby => ({
          ...baby,
          medications: baby.medications || []
        }))
      };
      
      const response = await axiosInstance.put(`/${currentBorn.id}`, dataToSend);
      
      if (response.status === 200) {
        await fetchBorns();
        setIsEditMode(false);
        setIsViewModalOpen(false);
        showAlert('success', 'Born record updated successfully');
      }
    } catch (err) {
      console.error("Error updating born record:", err);
      showAlert('error', err.response?.data?.message || 
               err.message || 'Failed to update born record');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete born record
  const deleteBorn = async () => {
    if (!currentBorn?.id) return;
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/${currentBorn.id}`);
      await fetchBorns();
      setIsDeleteModalOpen(false);
      setIsViewModalOpen(false);
      setCurrentBorn(null);
      showAlert('success', 'Born record deleted successfully');
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = async (born) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get(`/${born.id}`);
      
      const normalizedData = {
        ...data,
        babies: data.babies || [{
          name: "",
          gender: "Male",
          birthWeight: 0,
          dischargebirthWeight: 0,
          medications: []
        }],
        medications: data.medications || []
      };
      
      setCurrentBorn(normalizedData);
      setFormData(normalizedData);
      setIsViewModalOpen(true);
      setIsEditMode(false);
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (born) => {
    setCurrentBorn(born);
    setIsDeleteModalOpen(true);
  };

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      dateOfBirth: new Date().toISOString().split('T')[0],
      healthCenterId: healthCenters.length > 0 ? healthCenters[0].id : "",
      motherName: "",
      motherPhone: "",
      motherNationalId: "",
      fatherNationalId: "",
      fatherName: "",
      fatherPhone: "",
      babyCount: 1,
      deliveryType: "Normal",
      leave: "yes",
      status: "go home",
      sector_id: sectors.length > 0 ? sectors[0].id : "",
      cell_id: cells.length > 0 ? cells[0].id : "",
      village_id: villages.length > 0 ? villages[0].id : "",
      babies: [
        {
          name: "",
          gender: "Male",
          birthWeight: 0,
          dischargebirthWeight: 0,
          medications: []
        }
      ],
    });
  };

  // Add another baby to the form
  const addBaby = () => {
    setFormData({
      ...formData,
      babyCount: formData.babyCount + 1,
      babies: [
        ...formData.babies,
        {
          name: "",
          gender: "Male",
          birthWeight: 0,
          dischargebirthWeight: 0,
          medications: []
        }
      ]
    });
  };

  // Remove a baby from the form
  const removeBaby = (index) => {
    if (formData.babies.length <= 1) return;
    
    const updatedBabies = formData.babies.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      babyCount: formData.babyCount - 1,
      babies: updatedBabies
    });
  };

  // Add medication
  const addMedication = (babyIndex) => {
    setFormData(prev => {
      const updatedBabies = [...prev.babies];
      updatedBabies[babyIndex] = {
        ...updatedBabies[babyIndex],
        medications: [
          ...(updatedBabies[babyIndex].medications || []),
          { name: "", dose: "", frequency: "" }
        ]
      };
      return {
        ...prev,
        babies: updatedBabies
      };
    });
  };

  // Remove medication
  const removeMedication = (babyIndex, medIndex) => {
    setFormData(prev => {
      const updatedBabies = [...prev.babies];
      const updatedMedications = updatedBabies[babyIndex].medications.filter((_, index) => index !== medIndex);
      
      updatedBabies[babyIndex] = {
        ...updatedBabies[babyIndex],
        medications: updatedMedications
      };
      
      return {
        ...prev,
        babies: updatedBabies
      };
    });
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle baby information changes
  const handleBabyChange = (babyIndex, e) => {
    const { name, value } = e.target;
    const updatedBabies = [...formData.babies];
    updatedBabies[babyIndex] = {
      ...updatedBabies[babyIndex],
      [name]: value
    };
    
    setFormData({
      ...formData,
      babies: updatedBabies
    });
  };

  // Handle medication changes
  const handleMedicationChange = (babyIndex, medIndex, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedBabies = [...prev.babies];
      const updatedMedications = [...updatedBabies[babyIndex].medications];
      
      updatedMedications[medIndex] = {
        ...updatedMedications[medIndex],
        [name]: value
      };
      
      updatedBabies[babyIndex] = {
        ...updatedBabies[babyIndex],
        medications: updatedMedications
      };
      
      return {
        ...prev,
        babies: updatedBabies
      };
    });
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

  // Get name from ID
  const getNameFromId = (id, array) => {
    const item = array.find(item => item.id == id);
    return item ? item.name : id;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if user has Pediatrition role
  const isPediatrition = userRole === 'pediatrition';

  return (
    <div className="bg-white min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-600">Born Records Management</h1>
        <p className="text-gray-600">Manage born records in the system</p>
      </div>
      
      {/* Advanced Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search by name, phone..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ease-in-out"
            value={searchTerm}
            onChange={handleSearch}
            aria-label="Search"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>

        {/* Status Filter */}
        {/* Status Filter */}
      <div className="relative">
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setShowSorting(false); // Hide sorting when filter is applied
          }}
          className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ease-in-out"
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="yes">Discharged</option>
          <option value="no">Not Discharged</option>
        </select>
      </div>

      {/* Sorting Options */}
      <div className="relative">
        <button
          onClick={() => setShowSorting(!showSorting)}
          className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ease-in-out"
          aria-label="Toggle sorting options"
        >
          Sort Options
        </button>
        {showSorting && (
          <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 p-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-green-700 mb-2">Sort by:</span>
              {['dateOfBirth', 'motherName', 'leave'].map((key) => (
                <label key={key} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={sortConfig.key === key}
                    onChange={() => handleSort(key)}
                    className="rounded text-green-600 focus:ring-green-500"
                    aria-label={`Sort by ${key}`}
                  />
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  {sortConfig.key === key && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {isPediatrition && (
      <button
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
        onClick={() => {
          resetForm();
          setIsAddModalOpen(true);
        }}
        disabled={isLoading}
      >
        <Plus size={18} />
        New Born
      </button>
    )}
  </div>
      
      {/* Born Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer hover:bg-green-100"
                  onClick={() => handleSort('dateOfBirth')}
                >
                  Date 
                  {sortConfig.key === 'dateOfBirth' && (
                    <span className="ml-2">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer hover:bg-green-100"
                  onClick={() => handleSort('motherName')}
                >
                  Mother
                  {sortConfig.key === 'motherName' && (
                    <span className="ml-2">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                  Babies
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer hover:bg-green-100"
                  onClick={() => handleSort('leave')}
                >
                  Leave Status
                  {sortConfig.key === 'leave' && (
                    <span className="ml-2">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBorns.length > 0 ? (
                paginatedBorns.map((born) => (
                  <tr key={born.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(born.dateOfBirth)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{born.motherName}</div>
                      <div className="text-sm text-gray-500">{born.motherPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{born.babyCount} baby/babies</div>
                      <div className="text-sm text-gray-500">
                        {born.babies?.map((baby, index) => (
                          <span key={`baby-${index}-${baby.name}`} className="mr-2">
                            {baby.name} ({baby.gender})
                            {index < born.babies.length - 1 ? "," : ""}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        born.leave === "yes" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {born.leave}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={() => handleViewDetails(born)}
                        disabled={isLoading}
                      >
                        <Eye size={18} />
                      </button>
                      {isPediatrition && (
                        <button 
                          className="text-red-600 hover:text-red-900 ml-3"
                          onClick={() => handleDeleteConfirm(born)}
                          disabled={isLoading}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {isLoading ? 'Loading...' : 'No born records found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-50">
          <div className="text-sm text-gray-700 mb-2 md:mb-0">
            Showing {' '}
            {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, sortedAndFilteredBorns.length)} {' '}
            of {sortedAndFilteredBorns.length} records
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={goToFirstPage} 
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronsLeft size={18} />
            </button>
            <button 
              onClick={goToPreviousPage} 
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 py-2 bg-green-100 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={goToNextPage} 
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
            <button 
              onClick={goToLastPage} 
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Add Born Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-green-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-green-700">Add New Born Record</h2>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isLoading}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <EditForm 
                formData={formData} 
                handleChange={handleChange}
                handleBabyChange={handleBabyChange}
                handleMedicationChange={handleMedicationChange}
                addBaby={addBaby}
                removeBaby={removeBaby}
                addMedication={addMedication}
                removeMedication={removeMedication}
                sectors={sectors}
                cells={cells}
                villages={villages}
                healthCenters={healthCenters}
                handleSectorChange={handleSectorChange}
                handleCellChange={handleCellChange}
                handleVillageChange={handleVillageChange}
              />
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
                onClick={createBorn}
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Born Record Modal */}
      {isViewModalOpen && currentBorn && (
  <div className="fixed inset-0 bg-green-50 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-green-700">
          {isEditMode ? 'Edit Born Record' : 'Born Record Details'}
        </h2>
        <div className="flex items-center gap-2">
          {!isEditMode && isPediatrition && (
            <button 
              className="text-green-600 hover:text-green-900"
              onClick={() => setIsEditMode(true)}
              disabled={isLoading}
            >
              <Edit size={20} />
            </button>
          )}
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={() => {
              setIsViewModalOpen(false);
              setIsEditMode(false);
              setCurrentBorn(null);
            }}
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {isEditMode ? (
          <div className="space-y-4">
            {/* Simplified edit form for the modal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Status</label>
              <select
                name="leave"
                value={formData.leave}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            
            {/* Add other fields as needed */}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
              <p className="text-gray-800">{currentBorn.motherName}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Status</label>
              <p className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                currentBorn.leave === "yes" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}>
                {currentBorn.leave}
              </p>
            </div>
            
            {/* Add other fields as needed */}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
        <button
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setIsViewModalOpen(false);
            setIsEditMode(false);
            setCurrentBorn(null);
          }}
          disabled={isLoading}
        >
          {isEditMode ? 'Cancel' : 'Close'}
        </button>
        {isEditMode && isPediatrition && (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
            onClick={updateBorn}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Record'}
          </button>
        )}
      </div>
    </div>
  </div>
)}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-green-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle className="h-8 w-8 mr-2" />
              <h2 className="text-xl font-bold">Confirm Delete</h2>
            </div>
            
            <p className="mb-6">
              Are you sure you want to delete the record for <span className="font-semibold">{currentBorn?.motherName}</span>? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={deleteBorn}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : (
                  <>
                    <Trash2 className="h-5 w-5 mr-1" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// View-only details component
const ViewDetails = ({ born, sectors, cells, villages, healthCenters, getNameFromId }) => {
  if (!born) return <div>No data available</div>;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-green-700 mb-3">Mother Information</h3>
          <div className="bg-green-50 p-4 rounded">
            <p className="mb-2"><span className="font-semibold">Name:</span> {born.motherName}</p>
            <p className="mb-2"><span className="font-semibold">Phone:</span> {born.motherPhone}</p>
            <p className="mb-2"><span className="font-semibold">National ID:</span> {born.motherNationalId}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-green-700 mb-3">Father Information</h3>
          <div className="bg-green-50 p-4 rounded">
            <p className="mb-2"><span className="font-semibold">Name:</span> {born.fatherName}</p>
            <p className="mb-2"><span className="font-semibold">Phone:</span> {born.fatherPhone}</p>
            <p className="mb-2"><span className="font-semibold">National ID:</span> {born.fatherNationalId}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-green-700 mb-3">Delivery Information</h3>
        <div className="bg-green-50 p-4 rounded grid grid-cols-1 md:grid-cols-3 gap-4">
          <p><span className="font-semibold">Date of Birth:</span> {new Date(born.dateOfBirth).toLocaleDateString()}</p>
          <p><span className="font-semibold">Delivery Type:</span> {born.deliveryType}</p>
          <p><span className="font-semibold">Health Center:</span> {getNameFromId(born.healthCenterId, healthCenters)}</p>
          <p><span className="font-semibold">Leave Status:</span> {born.leave}</p>
          <p><span className="font-semibold">Status:</span> {born.status}</p>
          <p><span className="font-semibold">Baby Count:</span> {born.babyCount}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-green-700 mb-3">Location</h3>
        <div className="bg-green-50 p-4 rounded grid grid-cols-1 md:grid-cols-3 gap-4">
          <p><span className="font-semibold">Sector:</span> {getNameFromId(born.sector_id, sectors)}</p>
          <p><span className="font-semibold">Cell:</span> {getNameFromId(born.cell_id, cells)}</p>
          <p><span className="font-semibold">Village:</span> {getNameFromId(born.village_id, villages)}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-green-700 mb-3">Babies</h3>
        <div className="space-y-4">
          {born.babies?.map((baby, index) => (
            <div key={`baby-${index}-${baby.name}`} className="bg-green-50 p-4 rounded">
              <h4 className="font-semibold text-green-800 mb-2">Baby {index + 1}: {baby.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <p><span className="font-semibold">Gender:</span> {baby.gender}</p>
                <p><span className="font-semibold">Birth Weight:</span> {baby.birthWeight} kg</p>
                <p><span className="font-semibold">Discharge Weight:</span> {baby.dischargebirthWeight} kg</p>
              </div>
              
              <h5 className="font-semibold text-green-800 mb-2">Medications</h5>
              {baby.medications?.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="text-left py-2 px-3">Medication</th>
                      <th className="text-left py-2 px-3">Dose</th>
                      <th className="text-left py-2 px-3">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {baby.medications.map((med, medIndex) => (
                      <tr key={`med-${medIndex}`}>
                        <td className="py-2 px-3">{med.name || '-'}</td>
                        <td className="py-2 px-3">{med.dose || '-'}</td>
                        <td className="py-2 px-3">{med.frequency || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No medications recorded</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Edit form component
const EditForm = ({ 
  formData, 
  handleChange, 
  handleBabyChange, 
  handleMedicationChange,
  addBaby,
  removeBaby,
  addMedication,
  removeMedication,
  sectors,
  cells,
  villages,
  healthCenters,
  handleSectorChange,
  handleCellChange,
  handleVillageChange
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-green-700 mb-3">Mother Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name *</label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Phone *</label>
              <input
                type="text"
                name="motherPhone"
                value={formData.motherPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's National ID *</label>
              <input
                type="text"
                name="motherNationalId"
                value={formData.motherNationalId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-green-700 mb-3">Father Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Phone</label>
              <input
                type="text"
                name="fatherPhone"
                value={formData.fatherPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's National ID</label>
              <input
                type="text"
                name="fatherNationalId"
                value={formData.fatherNationalId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-green-700 mb-3">Delivery Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type *</label>
            <select
              name="deliveryType"
              value={formData.deliveryType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="Normal">Normal</option>
              <option value="C-section">C-section</option>
              <option value="Assisted">Assisted</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Health Center *</label>
            <select
              name="healthCenterId"
              value={formData.healthCenterId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              {healthCenters.map((hc, index) => (
  <option key={`hc-${hc.id}-${index}`} value={hc.id}>{hc.name}</option>
))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Status *</label>
            <select
              name="leave"
              value={formData.leave}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="go home">Go Home</option>
              <option value="referred">Referred</option>
              <option value="hospitalized">Hospitalized</option>
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-green-700 mb-3">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
            <select
              name="sector_id"
              value={formData.sector_id}
              onChange={handleSectorChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              {sectors.map((sector) => (
                <option key={`sector-${sector.id}`} value={sector.id}>{sector.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cell *</label>
            <select
              name="cell_id"
              value={formData.cell_id}
              onChange={handleCellChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={!formData.sector_id}
            >
              <option value="">Select Cell</option>
              {cells.map((cell) => (
                <option key={`cell-${cell.id}`} value={cell.id}>{cell.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Village *</label>
            <select
              name="village_id"
              value={formData.village_id}
              onChange={handleVillageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={!formData.cell_id}
            >
              <option value="">Select Village</option>
              {villages.map((village) => (
                <option key={`village-${village.id}`} value={village.id}>{village.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-green-700">Baby Information</h3>
          <button
            type="button"
            onClick={addBaby}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Another Baby
          </button>
        </div>
        
        {formData.babies.map((baby, babyIndex) => (
          <div key={`baby-form-${babyIndex}`} className="mb-6 p-4 bg-green-50 rounded">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-green-800">Baby {babyIndex + 1}</h4>
              {formData.babies.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBaby(babyIndex)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={baby.name}
                  onChange={(e) => handleBabyChange(babyIndex, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  name="gender"
                  value={baby.gender}
                  onChange={(e) => handleBabyChange(babyIndex, e)}
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
                  value={baby.birthWeight}
                  onChange={(e) => handleBabyChange(babyIndex, e)}
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
                  value={baby.dischargebirthWeight}
                  onChange={(e) => handleBabyChange(babyIndex, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-green-800">Medications</h5>
                <button
                  type="button"
                  onClick={() => addMedication(babyIndex)}
                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Medication
                </button>
              </div>
              
              {(baby.medications?.length > 0) ? (
                <table className="w-full">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="text-left py-2 px-3">Medication</th>
                      <th className="text-left py-2 px-3">Dose</th>
                      <th className="text-left py-2 px-3">Frequency</th>
                      <th className="text-left py-2 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {baby.medications.map((med, medIndex) => (
                      <tr key={`med-${medIndex}`}>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            name="name"
                            value={med.name}
                            onChange={(e) => handleMedicationChange(babyIndex, medIndex, e)}
                            className="w-full p-1 text-sm border rounded"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            name="dose"
                            value={med.dose}
                            onChange={(e) => handleMedicationChange(babyIndex, medIndex, e)}
                            className="w-full p-1 text-sm border rounded"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            name="frequency"
                            value={med.frequency}
                            onChange={(e) => handleMedicationChange(babyIndex, medIndex, e)}
                            className="w-full p-1 text-sm border rounded"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <button
                            type="button"
                            onClick={() => removeMedication(babyIndex, medIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No medications recorded</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BornPage;