import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, X, Save, ClipboardList } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [babies, setBabies] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userRole, setUserRole] = useState("");

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

  // Get user role from cookie on component mount
  useEffect(() => {
    const role = Cookies.get("role");
    setUserRole(role || "");
  }, []);

  // Fetch all data on component mount
  useEffect(() => {
    fetchFeedbacks();
    fetchBabies();
    fetchAppointments();
  }, []);

  // Filter feedbacks based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFeedbacks(feedbacks);
    } else {
      const filtered = feedbacks.filter(feedback => {
        const searchLower = searchTerm.toLowerCase();
        
        const feedbackText = feedback.feedback ? feedback.feedback.toLowerCase() : '';
        const statusText = feedback.status ? feedback.status.toLowerCase() : '';
        const babyName = feedback.baby?.name ? feedback.baby.name.toLowerCase() : '';
        const appointmentPurpose = feedback.appointment?.purpose ? feedback.appointment.purpose.toLowerCase() : '';
        
        return (
            feedbackText.includes(searchLower) ||
            statusText.includes(searchLower) ||
            babyName.includes(searchLower) ||
            appointmentPurpose.includes(searchLower)
        );
      });
      setFilteredFeedbacks(filtered);
    }
  }, [searchTerm, feedbacks]);

  // Fetch feedback records
  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get("/appointmentFeedbacks");
      
      const enhancedFeedbacks = await Promise.all(
        data.map(async (feedback) => {
          let babyData = null;
          let appointmentData = null;
          
          if (feedback.babyId) {
            try {
              const babyResponse = await axiosInstance.get(`/babies/${feedback.babyId}`);
              babyData = babyResponse.data;
            } catch (error) {
              console.error("Error fetching baby data:", error);
            }
          }
          
          if (feedback.appointmentId) {
            try {
              const appointmentResponse = await axiosInstance.get(`/appointments/${feedback.appointmentId}`);
              appointmentData = appointmentResponse.data;
            } catch (error) {
              console.error("Error fetching appointment data:", error);
            }
          }
          
          return {
            ...feedback,
            baby: babyData,
            appointment: appointmentData
          };
        })
      );
      
      setFeedbacks(enhancedFeedbacks);
      setFilteredFeedbacks(enhancedFeedbacks);
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch baby records
  const fetchBabies = async () => {
    try {
      const { data } = await axiosInstance.get("/babies");
      setBabies(data || []);
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    }
  };

  // Fetch appointment records
  const fetchAppointments = async () => {
    try {
      const { data } = await axiosInstance.get("/appointments");
      setAppointments(data?.appointments || []);
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    }
  };

  // Create new feedback
  const createFeedback = async (feedbackData) => {
    try {
      setIsLoading(true);
      const payload = {
        babyId: feedbackData.babyId,
        appointmentId: feedbackData.appointmentId,
        weight: feedbackData.weight,
        feedback: feedbackData.feedback,
        nextAppointmentDate: feedbackData.nextAppointmentDate,
        status: feedbackData.status
      };

      await axiosInstance.post("/appointmentFeedbacks", payload);
      await fetchFeedbacks();
      setIsModalOpen(false);
      showAlert('success', 'Feedback created successfully!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update feedback
  const updateFeedback = async (id, feedbackData) => {
    try {
      setIsLoading(true);
      const payload = {
        babyId: feedbackData.babyId,
        appointmentId: feedbackData.appointmentId,
        weight: feedbackData.weight,
        feedback: feedbackData.feedback,
        nextAppointmentDate: feedbackData.nextAppointmentDate,
        status: feedbackData.status
      };

      await axiosInstance.put(`/appointmentFeedbacks/${id}`, payload);
      await fetchFeedbacks();
      setIsModalOpen(false);
      showAlert('success', 'Feedback updated successfully!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete feedback
  const deleteFeedback = async (id) => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/appointmentFeedbacks/${id}`);
      await fetchFeedbacks();
      showAlert('success', 'Feedback deleted successfully!');
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
  const confirmDelete = (feedback) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete feedback for ${feedback.baby?.name || 'this baby'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteFeedback(feedback.id);
      }
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const feedbackData = {
      babyId: formData.get("babyId"),
      appointmentId: formData.get("appointmentId"),
      weight: parseFloat(formData.get("weight")),
      feedback: formData.get("feedback"),
      nextAppointmentDate: formData.get("nextAppointmentDate"),
      status: formData.get("status")
    };

    if (currentFeedback) {
      updateFeedback(currentFeedback.id, feedbackData);
    } else {
      createFeedback(feedbackData);
    }
  };

  // Open modal for viewing/editing
  const openModal = (feedback = null) => {
    setCurrentFeedback(feedback);
    setIsEditMode(!!feedback);
    setIsModalOpen(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if user is Pediatrition
  const isPediatrition = userRole === "pediatrition";

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-600">Appointment Feedbacks</h1>
        <p className="text-gray-600">Manage appointment feedback records</p>
      </div>
      
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search feedbacks..."
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
            New Feedback
          </button>
        )}
      </div>
      
      {/* Feedbacks Table */}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Baby</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Appointment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Feedback</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Next Appointment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                {isPediatrition && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {feedback.baby ? (
                        <div className="text-sm font-medium text-gray-900">
                          {feedback.baby.name}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Not associated</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {feedback.appointment ? (
                        <div className="text-sm text-gray-900">
                          {feedback.appointment.purpose}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Not associated</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{feedback.weight} kg</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {feedback.feedback}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {feedback.nextAppointmentDate ? formatDate(feedback.nextAppointmentDate) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        feedback.status === "Healthy" ? "bg-green-100 text-green-800" :
                        feedback.status === "Follow-up" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {feedback.status}
                      </span>
                    </td>
                    {isPediatrition && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          className="text-green-600 hover:text-green-900"
                          onClick={() => openModal(feedback)}
                          disabled={isLoading}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 ml-3"
                          onClick={() => confirmDelete(feedback)}
                          disabled={isLoading}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isPediatrition ? "7" : "6"} className="px-6 py-4 text-center text-gray-500">
                    {isLoading ? 'Loading...' : 'No feedbacks found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-green-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-green-700">
                {isEditMode ? 'Edit Feedback' : 'New Feedback'}
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentFeedback(null);
                  setIsEditMode(false);
                }}
                disabled={isLoading}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baby *</label>
                <select
                  name="babyId"
                  defaultValue={currentFeedback?.babyId || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Baby</option>
                  {babies.map((baby) => (
                    <option key={baby.id} value={baby.id}>
                      {baby.name} (ID: {baby.id})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment *</label>
                <select
                  name="appointmentId"
                  defaultValue={currentFeedback?.appointmentId || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Appointment</option>
                  {appointments.map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {appointment.purpose} (ID: {appointment.id})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  defaultValue={currentFeedback?.weight || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback *</label>
                <textarea
                  name="feedback"
                  defaultValue={currentFeedback?.feedback || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Appointment Date</label>
                <input
                  type="date"
                  name="nextAppointmentDate"
                  defaultValue={currentFeedback?.nextAppointmentDate || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  name="status"
                  defaultValue={currentFeedback?.status || "Healthy"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="Healthy">Healthy</option>
                  <option value="Follow-up">Follow-up Needed</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              
              <div className="border-t border-gray-200 pt-4 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentFeedback(null);
                    setIsEditMode(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 flex items-center"
                  disabled={isLoading}
                >
                  <Save className="h-5 w-5 mr-1" />
                  {isLoading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;