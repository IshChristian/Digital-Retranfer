import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Calendar,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

const AppointmentPage = () => {
  // State declarations remain the same
  const [appointments, setAppointments] = useState([]);
  const [borns, setBorns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bornSearchTerm, setBornSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBornId, setSelectedBornId] = useState('');
  const [userRole, setUserRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const [feedbackForm, setFeedbackForm] = useState({
    babyId: '',
    appointmentId: '',
    weight: '',
    feedback: '',
    nextAppointmentDate: '',
    status: 'Healthy',
  });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Use environment variable for API base URL
  const API_BASE_URL = import.meta.env.API_KEY;
  const token = Cookies.get('token');

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  // Helper Functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${timeString || ''}`;
  };

  const showAlert = (icon, title) => {
    Swal.fire({
      icon,
      title,
      showConfirmButton: false,
      timer: 1500,
    });
  };

  // Data Fetching
  useEffect(() => {
    const role = Cookies.get('role');
    setUserRole(role || '');
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchBorns();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/appointments');

      if (!data || !data.appointments || !Array.isArray(data.appointments)) {
        setAppointments([]);
        return;
      }

      const transformedAppointments = data.appointments.map((appointment) => ({
        id: appointment.id,
        bornId: appointment.bornId,
        date: appointment.date,
        time: appointment.time,
        purpose: appointment.purpose,
        status: appointment.status,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        born: appointment.birthRecord
          ? {
              id: appointment.birthRecord.id,
              dateOfBirth: appointment.birthRecord.dateOfBirth,
              motherName: appointment.birthRecord.motherName,
              motherPhone: appointment.birthRecord.motherPhone,
              motherNationalId: appointment.birthRecord.motherNationalId,
              fatherName: appointment.birthRecord.fatherName,
              fatherPhone: appointment.birthRecord.fatherPhone,
              fatherNationalId: appointment.birthRecord.fatherNationalId,
              babyCount: appointment.birthRecord.babyCount,
              deliveryType: appointment.birthRecord.deliveryType,
              status: appointment.birthRecord.status,
              babies: Array.from({ length: appointment.birthRecord.babyCount }, (_, i) => ({
                id: `${appointment.birthRecord.id}-${i}`,
                name: `Baby ${i + 1}`,
              })),
            }
          : null,
        feedback: appointment.appointmentFeedback || [],
      }));

      setAppointments(transformedAppointments);
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBorns = useMemo(() => {
    if (bornSearchTerm.trim() === '') {
      return borns;
    }
    return borns.filter(
      (born) =>
        born.motherName.toLowerCase().includes(bornSearchTerm.toLowerCase()) ||
        (born.fatherName && born.fatherName.toLowerCase().includes(bornSearchTerm.toLowerCase())) ||
        born.motherNationalId.toLowerCase().includes(bornSearchTerm.toLowerCase()) ||
        (born.fatherNationalId &&
          born.fatherNationalId.toLowerCase().includes(bornSearchTerm.toLowerCase()))
    );
  }, [bornSearchTerm, borns]);

  const fetchBorns = async () => {
    try {
      const { data } = await axiosInstance.get('/borns');
      setBorns(data || []);
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    }
  };

  // Sorting and Filtering
  const requestSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronsUpDown size={16} className="ml-1 inline" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp size={16} className="ml-1 inline" />
    ) : (
      <ChevronDown size={16} className="ml-1 inline" />
    );
  };

  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = [...appointments];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((appointment) => {
        const matchesAppointment =
          appointment.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.status.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBorn =
          appointment.born &&
          (appointment.born.motherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (appointment.born.fatherName &&
              appointment.born.fatherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            appointment.born.motherNationalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (appointment.born.fatherNationalId &&
              appointment.born.fatherNationalId.toLowerCase().includes(searchTerm.toLowerCase())));

        return matchesAppointment || matchesBorn;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter);
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        if (startDate && endDate) {
          return appointmentDate >= startDate && appointmentDate <= endDate;
        } else if (startDate) {
          return appointmentDate >= startDate;
        } else if (endDate) {
          return appointmentDate <= endDate;
        }
        return true;
      });
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key.includes('born.')) {
          const bornKey = sortConfig.key.split('.')[1];
          aValue = a.born ? a.born[bornKey] || '' : '';
          bValue = b.born ? b.born[bornKey] || '' : '';
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [appointments, searchTerm, statusFilter, dateRange, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAppointments.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedAppointments, currentPage, itemsPerPage]);

  // Modal and Form Handling
  const openModal = (appointment = null) => {
    setCurrentAppointment(appointment);
    setIsEditMode(!!appointment);
    setSelectedBornId(appointment?.bornId || '');
    setIsModalOpen(true);
    setBornSearchTerm('');
    setShowFeedbackForm(false);

    if (appointment) {
      setFeedbackForm({
        babyId: appointment.born?.babies?.[0]?.id || '',
        appointmentId: appointment.id,
        weight: '',
        feedback: '',
        nextAppointmentDate: '',
        status: 'Healthy',
      });
    }
  };

  const createAppointment = async (appointmentData) => {
    try {
      setIsLoading(true);
      const payload = {
        bornId: appointmentData.bornId || null,
        date: appointmentData.date,
        time: appointmentData.time,
        purpose: appointmentData.purpose,
        status: appointmentData.status,
      };

      await axiosInstance.post('/appointments', payload);
      await fetchAppointments();
      setIsModalOpen(false);
      showAlert('success', 'Appointment created successfully!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointment = async (id, appointmentData) => {
    try {
      setIsLoading(true);
      const payload = {
        bornId: appointmentData.bornId || null,
        date: appointmentData.date,
        time: appointmentData.time,
        purpose: appointmentData.purpose,
        status: appointmentData.status,
      };

      await axiosInstance.put(`/appointments/${id}`, payload);
      await fetchAppointments();
      setIsModalOpen(false);
      setIsEditMode(false);
      showAlert('success', 'Appointment updated successfully!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/appointments/${id}`);
      await fetchAppointments();
      showAlert('success', 'Appointment deleted successfully!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (appointment) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete appointment for ${appointment.purpose}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAppointment(appointment.id);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const appointmentData = {
      bornId: formData.get('bornId') || null,
      date: formData.get('date'),
      time: formData.get('time'),
      purpose: formData.get('purpose'),
      status: formData.get('status'),
    };

    currentAppointment
      ? updateAppointment(currentAppointment.id, appointmentData)
      : createAppointment(appointmentData);
  };

  const submitFeedback = async () => {
    try {
      setIsLoading(true);
      const payload = {
        babyId: feedbackForm.babyId,
        appointmentId: feedbackForm.appointmentId,
        weight: parseFloat(feedbackForm.weight),
        feedback: feedbackForm.feedback,
        status: feedbackForm.status,
        nextAppointmentDate: feedbackForm.nextAppointmentDate || null,
      };

      await axiosInstance.post('/appointmentFeedbacks', payload);
      await fetchAppointments();
      setShowFeedbackForm(false);
      showAlert('success', 'Feedback saved successfully!');
      setFeedbackForm({
        // babyId: '',
        appointmentId: '',
        weight: '',
        feedback: '',
        nextAppointmentDate: '',
        status: 'Healthy',
      });
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to save feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const isPediatrician = userRole === 'pediatrition';

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-600">Appointments Management</h1>
        <p className="text-gray-600">Manage appointment records in the system</p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by name, ID, or purpose..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          <div className="w-full md:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Start date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <span className="flex items-center">to</span>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="End date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>

        {isPediatrician && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            onClick={() => openModal()}
            disabled={isLoading}
          >
            <Plus size={18} />
            New Appointment
          </button>
        )}
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading && <div className="p-4 text-center text-gray-500">Loading...</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center">
                    Date & Time
                    {getSortIcon('date')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('purpose')}
                >
                  <div className="flex items-center">
                    Purpose
                    {getSortIcon('purpose')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('born.motherName')}
                >
                  <div className="flex items-center">
                    Associated Born
                    {getSortIcon('born.motherName')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Calendar size={16} className="text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(appointment.date)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.purpose}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.born ? (
                        <div className="text-sm text-gray-900">
                          {appointment.born.motherName}
                          {appointment.born.fatherName && ` & ${appointment.born.fatherName}`}
                          <div className="text-xs text-gray-500">
                            {appointment.born.motherNationalId}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Not associated</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.status === 'Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : appointment.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => openModal(appointment)}
                        disabled={isLoading}
                      >
                        <Eye size={18} />
                      </button>
                      {isPediatrician && (
                        <button
                          className="text-red-600 hover:text-red-900 ml-3"
                          onClick={() => confirmDelete(appointment)}
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
                    {isLoading ? 'Loading...' : 'No appointments found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAndSortedAppointments.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredAndSortedAppointments.length)}
              </span>{' '}
              of <span className="font-medium">{filteredAndSortedAppointments.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded-md ${currentPage === page ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-green-50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-green-700">
                {currentAppointment
                  ? isEditMode
                    ? 'Edit Appointment'
                    : 'Appointment Details'
                  : 'New Appointment'}
              </h2>
              <div className="flex items-center gap-2">
                {currentAppointment && isPediatrician && !isEditMode && (
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
                    setIsModalOpen(false);
                    setCurrentAppointment(null);
                    setShowFeedbackForm(false);
                    setIsEditMode(false);
                  }}
                  disabled={isLoading}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {currentAppointment ? (
                isEditMode ? (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Associated Born Record
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search by mother/father name or national ID..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                            value={bornSearchTerm}
                            onChange={(e) => setBornSearchTerm(e.target.value)}
                          />
                          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        </div>
                        <select
                          name="bornId"
                          value={selectedBornId}
                          onChange={(e) => setSelectedBornId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select a born record (optional)</option>
                          {filteredBorns.map((born) => (
                            <option key={born.id} value={born.id}>
                              {born.motherName} (ID: {born.motherNationalId})
                              {born.fatherName &&
                                ` & ${born.fatherName} (ID: ${born.fatherNationalId})`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          name="date"
                          defaultValue={currentAppointment.date}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time *
                        </label>
                        <input
                          type="time"
                          name="time"
                          defaultValue={currentAppointment.time}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Purpose *
                        </label>
                        <input
                          type="text"
                          name="purpose"
                          defaultValue={currentAppointment.purpose}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status *
                        </label>
                        <select
                          name="status"
                          defaultValue={currentAppointment.status}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-6">
                      <button
                        type="button"
                        onClick={() => setIsEditMode(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-green-700 mb-3">
                          Appointment Information
                        </h3>
                        <div className="space-y-2">
                          <p>
                            <span className="font-semibold">Date:</span>{' '}
                            {formatDate(currentAppointment.date)}
                          </p>
                          <p>
                            <span className="font-semibold">Time:</span> {currentAppointment.time}
                          </p>
                          <p>
                            <span className="font-semibold">Purpose:</span>{' '}
                            {currentAppointment.purpose}
                          </p>
                          <p>
                            <span className="font-semibold">Status:</span>
                            <span
                              className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                currentAppointment.status === 'Scheduled'
                                  ? 'bg-blue-100 text-blue-800'
                                  : currentAppointment.status === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {currentAppointment.status}
                            </span>
                          </p>
                        </div>
                      </div>

                      {currentAppointment.born && (
                        <div>
                          <h3 className="text-lg font-medium text-green-700 mb-3">
                            Patient Information
                          </h3>
                          <div className="space-y-2">
                            <p>
                              <span className="font-semibold">Mother:</span>{' '}
                              {currentAppointment.born.motherName}
                            </p>
                            {currentAppointment.born.fatherName && (
                              <p>
                                <span className="font-semibold">Father:</span>{' '}
                                {currentAppointment.born.fatherName}
                              </p>
                            )}
                            <p>
                              <span className="font-semibold">Babies:</span>{' '}
                              {currentAppointment.born.babyCount}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Feedback Section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium text-green-700">Feedback</h3>
                        {isPediatrician &&
                          currentAppointment.status === 'Completed' &&
                          !showFeedbackForm && (
                            <button
                              onClick={() => {
                                setFeedbackForm({
                                  babyId: currentAppointment.born?.babies?.[0]?.id || '',
                                  appointmentId: currentAppointment.id,
                                  weight: '',
                                  feedback: '',
                                  nextAppointmentDate: '',
                                  status: 'Healthy',
                                });
                                setShowFeedbackForm(true);
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              {currentAppointment.feedback?.length
                                ? 'Add More Feedback'
                                : 'Add Feedback'}
                            </button>
                          )}
                      </div>

                      {showFeedbackForm && (
                        <div className="mt-4 bg-green-50 p-4 rounded-lg">
                          <h4 className="text-lg font-medium text-green-700 mb-4">
                            {feedbackForm.id ? 'Edit Feedback' : 'Add New Feedback'}
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Weight */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current Weight (kg) *
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={feedbackForm.weight}
                                onChange={(e) =>
                                  setFeedbackForm({ ...feedbackForm, weight: e.target.value })
                                }
                                required
                              />
                            </div>

                            {/* Status */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status *
                              </label>
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={feedbackForm.status}
                                onChange={(e) =>
                                  setFeedbackForm({ ...feedbackForm, status: e.target.value })
                                }
                                required
                              >
                                <option value="Healthy">Healthy</option>
                                <option value="Needs Follow-up">Needs Follow-up</option>
                                <option value="Referred">Referred</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </div>

                            {/* Next Appointment Date */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Next Appointment Date
                              </label>
                              <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={feedbackForm.nextAppointmentDate}
                                onChange={(e) =>
                                  setFeedbackForm({
                                    ...feedbackForm,
                                    nextAppointmentDate: e.target.value,
                                  })
                                }
                              />
                            </div>

                            {/* Feedback Notes */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                              </label>
                              <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={3}
                                placeholder="Enter feedback notes..."
                                value={feedbackForm.feedback}
                                onChange={(e) =>
                                  setFeedbackForm({ ...feedbackForm, feedback: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          {/* Form Actions */}
                          <div className="flex justify-end gap-3 mt-4">
                            <button
                              type="button"
                              onClick={() => setShowFeedbackForm(false)}
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={submitFeedback}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
                              disabled={!feedbackForm.weight || !feedbackForm.status || isLoading}
                            >
                              {isLoading ? (
                                <span className="flex items-center gap-2">
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Saving...
                                </span>
                              ) : (
                                'Save Feedback'
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Existing feedback display */}
                      {currentAppointment.feedback?.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {currentAppointment.feedback.map((fb, index) => (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-lg border border-green-100"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">Feedback #{index + 1}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(fb.createdAt)}
                                  </p>
                                </div>
                                {isPediatrician && (
                                  <button
                                    className="text-green-600 hover:text-green-800"
                                    onClick={() => {
                                      setFeedbackForm({
                                        ...fb,
                                        babyId:
                                          fb.babyId ||
                                          currentAppointment.born?.babies?.[0]?.id ||
                                          '',
                                        appointmentId: currentAppointment.id,
                                      });
                                      setShowFeedbackForm(true);
                                    }}
                                  >
                                    <Edit size={16} />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <p>
                                  <span className="font-semibold">Weight:</span> {fb.weight} kg
                                </p>
                                <p>
                                  <span className="font-semibold">Status:</span> {fb.status}
                                </p>
                                {fb.nextAppointmentDate && (
                                  <p>
                                    <span className="font-semibold">Next Appointment:</span>{' '}
                                    {formatDate(fb.nextAppointmentDate)}
                                  </p>
                                )}
                              </div>
                              {fb.feedback && (
                                <p className="mt-2">
                                  <span className="font-semibold">Notes:</span> {fb.feedback}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Associated Born Record
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by mother/father name or national ID..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                          value={bornSearchTerm}
                          onChange={(e) => setBornSearchTerm(e.target.value)}
                        />
                        <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                      </div>
                      <select
                        name="bornId"
                        value={selectedBornId}
                        onChange={(e) => setSelectedBornId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select a born record (optional)</option>
                        {filteredBorns.map((born) => (
                          <option key={born.id} value={born.id}>
                            {born.motherName} (ID: {born.motherNationalId})
                            {born.fatherName &&
                              ` & ${born.fatherName} (ID: ${born.fatherNationalId})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <input
                        type="date"
                        name="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                      <input
                        type="time"
                        name="time"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purpose *
                      </label>
                      <input
                        type="text"
                        name="purpose"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <select
                        name="status"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Appointment'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;
