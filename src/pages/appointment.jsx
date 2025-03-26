import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, X, Save, Calendar, Clock } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

const AppointmentPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [borns, setBorns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredBorns, setFilteredBorns] = useState([]);
    const [bornSearchTerm, setBornSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAppointment, setCurrentAppointment] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedBornId, setSelectedBornId] = useState("");
    const [userRole, setUserRole] = useState("");

    const [feedbackForm, setFeedbackForm] = useState({
        babyId: '',
        appointmentId: '',
        weight: '',
        feedback: '',
        nextAppointmentDate: '',
        status: 'Healthy'
    });
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);

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
        fetchAppointments();
        fetchBorns();
    }, []);

    // Filter appointments based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredAppointments(appointments);
        } else {
            const filtered = appointments.filter(appointment => 
                appointment.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (appointment.born && 
                    (appointment.born.motherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (appointment.born.fatherName && appointment.born.fatherName.toLowerCase().includes(searchTerm.toLowerCase())))
            ));
            setFilteredAppointments(filtered);
        }
    }, [searchTerm, appointments]);

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

    const openModal = (appointment = null) => {
        setCurrentAppointment(appointment);
        setIsEditMode(!!appointment);
        setSelectedBornId(appointment?.bornId || "");
        setIsModalOpen(true);
        setBornSearchTerm("");
        
        if (appointment) {
            setFeedbackForm({
                babyId: appointment.born?.babies?.[0]?.id || '',
                appointmentId: appointment.id,
                weight: '',
                feedback: '',
                nextAppointmentDate: '',
                status: 'Healthy'
            });
        }
    };

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            const { data } = await axiosInstance.get("/appointments");
            
            if (!data || !data.appointments || !Array.isArray(data.appointments)) {
                setAppointments([]);
                setFilteredAppointments([]);
                return;
            }

            const appointmentsWithFeedback = await Promise.all(
                data.appointments.map(async (appointment) => {
                    try {
                        const feedbackRes = await axiosInstance.get(`/appointmentFeedbacks/${appointment.id}`);
                        return {
                            ...appointment,
                            feedback: feedbackRes.data || []
                        };
                    } catch (error) {
                        return {
                            ...appointment,
                            feedback: []
                        };
                    }
                })
            );

            setAppointments(appointmentsWithFeedback);
            setFilteredAppointments(appointmentsWithFeedback);
        } catch (err) {
            showAlert('error', err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const fetchBorns = async () => {
        try {
            const { data } = await axiosInstance.get("/borns");
            if (!data || !Array.isArray(data)) {
                setBorns([]);
                setFilteredBorns([]);
                return;
            }
            setBorns(data);
            setFilteredBorns(data);
        } catch (err) {
            showAlert('error', err.response?.data?.message || err.message);
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
                status: appointmentData.status
            };

            await axiosInstance.post("/appointments", payload);
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
                status: appointmentData.status
            };

            await axiosInstance.put(`/appointments/${id}`, payload);
            await fetchAppointments();
            setIsModalOpen(false);
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

    const showAlert = (icon, title) => {
        Swal.fire({
            icon,
            title,
            showConfirmButton: false,
            timer: 1500
        });
    };

    const confirmDelete = (appointment) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete appointment for ${appointment.purpose}? This action cannot be undone.`,
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
            bornId: formData.get("bornId") || null,
            date: formData.get("date"),
            time: formData.get("time"),
            purpose: formData.get("purpose"),
            status: formData.get("status")
        };

        if (currentAppointment) {
            updateAppointment(currentAppointment.id, appointmentData);
        } else {
            createAppointment(appointmentData);
        }
    };

    const submitFeedback = async () => {
        try {
            setIsLoading(true);
            await axiosInstance.post("/appointmentFeedbacks", feedbackForm);
            await fetchAppointments();
            setIsModalOpen(false);
            showAlert('success', 'Feedback added successfully!');
        } catch (err) {
            showAlert('error', err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString();
    };

    const isPediatrician = userRole === "pediatrition";

    return (
        <div className="bg-white min-h-screen p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-green-600">Appointments Management</h1>
                <p className="text-gray-600">Manage appointment records in the system</p>
            </div>
            
            {/* Filters and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
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
                {isLoading && (
                    <div className="p-4 text-center text-gray-500">
                        Loading...
                    </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-green-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Associated Born</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map((appointment) => (
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
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500">Not associated</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                appointment.status === "Scheduled" ? "bg-blue-100 text-blue-800" :
                                                appointment.status === "Completed" ? "bg-green-100 text-green-800" :
                                                "bg-yellow-100 text-yellow-800"
                                            }`}>
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
            </div>
            
            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-green-50 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
                            <h2 className="text-xl font-semibold text-green-700">
                                {currentAppointment ? 'Appointment Details' : 'New Appointment'}
                            </h2>
                            <button 
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setCurrentAppointment(null);
                                    setShowFeedbackForm(false);
                                }}
                                disabled={isLoading}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {currentAppointment ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-green-700 mb-3">Appointment Information</h3>
                                            <div className="space-y-2">
                                                <p><span className="font-semibold">Date:</span> {formatDate(currentAppointment.date)}</p>
                                                <p><span className="font-semibold">Time:</span> {currentAppointment.time}</p>
                                                <p><span className="font-semibold">Purpose:</span> {currentAppointment.purpose}</p>
                                                <p><span className="font-semibold">Status:</span> 
                                                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        currentAppointment.status === "Scheduled" ? "bg-blue-100 text-blue-800" :
                                                        currentAppointment.status === "Completed" ? "bg-green-100 text-green-800" :
                                                        "bg-yellow-100 text-yellow-800"
                                                    }`}>
                                                        {currentAppointment.status}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {currentAppointment.born && (
                                            <div>
                                                <h3 className="text-lg font-medium text-green-700 mb-3">Patient Information</h3>
                                                <div className="space-y-2">
                                                    <p><span className="font-semibold">Mother:</span> {currentAppointment.born.motherName}</p>
                                                    {currentAppointment.born.fatherName && (
                                                        <p><span className="font-semibold">Father:</span> {currentAppointment.born.fatherName}</p>
                                                    )}
                                                    <p><span className="font-semibold">Babies:</span> {currentAppointment.born.babyCount}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Feedback Section */}
                                    <div>
                                        <h3 className="text-lg font-medium text-green-700 mb-3">Feedback</h3>
                                        
                                        {currentAppointment.feedback && currentAppointment.feedback.length > 0 ? (
                                            <div className="space-y-4">
                                                {currentAppointment.feedback.map((fb, index) => (
                                                    <div key={index} className="bg-green-50 p-4 rounded">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <p><span className="font-semibold">Weight:</span> {fb.weight} kg</p>
                                                            <p><span className="font-semibold">Status:</span> {fb.status}</p>
                                                            <p><span className="font-semibold">Next Appointment:</span> {formatDate(fb.nextAppointmentDate)}</p>
                                                        </div>
                                                        <p className="mt-2"><span className="font-semibold">Notes:</span> {fb.feedback}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <>
                                                {isPediatrician && currentAppointment.status === "Completed" && (
                                                    <>
                                                        {showFeedbackForm ? (
                                                            <div className="bg-green-50 p-4 rounded space-y-4">
                                                                {/* Feedback form */}
                                                            </div>
                                                        ) : (
                                                            <div className="bg-green-50 p-4 rounded flex justify-between items-center">
                                                                <p className="text-gray-500">No feedback recorded yet</p>
                                                                <button
                                                                    onClick={() => {
                                                                        setFeedbackForm({
                                                                            babyId: currentAppointment.born?.babies?.[0]?.id || '',
                                                                            appointmentId: currentAppointment.id,
                                                                            weight: '',
                                                                            feedback: '',
                                                                            nextAppointmentDate: '',
                                                                            status: 'Healthy'
                                                                        });
                                                                        setShowFeedbackForm(true);
                                                                    }}
                                                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center"
                                                                >
                                                                    <Plus className="h-4 w-4 mr-1" />
                                                                    Add Feedback
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                
                                                {(!isPediatrician || currentAppointment.status !== "Completed") && (
                                                    <p className="text-gray-500">No feedback recorded yet</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                                            <input
                                                type="text"
                                                name="purpose"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
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