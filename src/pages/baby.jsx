"use client"

import { useState } from "react"
import { Baby, Search, PlusCircle, Filter, X, User, ChevronDown, ChevronUp } from "lucide-react"

function NewBaby() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({
    status: { all: true, discharged: false, inCare: false, nicu: false },
    gender: { all: true, male: false, female: false },
    date: { today: false, thisWeek: true, thisMonth: false, custom: false },
  })

  const [newBabyData, setNewBabyData] = useState({
    motherName: "",
    motherAge: "",
    fatherName: "",
    fatherAge: "",
    address: "",
    phone: "",
    email: "",
    babyName: "",
    gender: "",
    birthDate: "",
    birthTime: "",
    weight: "",
    height: "",
    bloodType: "",
    deliveryType: "Normal",
    notes: "",
  })

  // Sample data for the baby records
  const babyRecords = [
    {
      id: 1,
      babyName: "Baby Smith",
      motherName: "Emma Smith",
      gender: "Female",
      birthDate: "2023-03-15",
      birthTime: "08:45",
      weight: "3.2",
      status: "Discharged",
      doctor: "Dr. Johnson",
    },
    {
      id: 2,
      babyName: "Baby Garcia",
      motherName: "Sophia Garcia",
      gender: "Male",
      birthDate: "2023-03-14",
      birthTime: "14:30",
      weight: "3.5",
      status: "In Care",
      doctor: "Dr. Williams",
    },
    {
      id: 3,
      babyName: "Baby Martinez",
      motherName: "Olivia Martinez",
      gender: "Female",
      birthDate: "2023-03-14",
      birthTime: "10:15",
      weight: "2.9",
      status: "NICU",
      doctor: "Dr. Brown",
    },
    {
      id: 4,
      babyName: "Baby Johnson",
      motherName: "Isabella Johnson",
      gender: "Male",
      birthDate: "2023-03-13",
      birthTime: "16:20",
      weight: "3.7",
      status: "Discharged",
      doctor: "Dr. Davis",
    },
    {
      id: 5,
      babyName: "Baby Williams",
      motherName: "Ava Williams",
      gender: "Female",
      birthDate: "2023-03-12",
      birthTime: "09:50",
      weight: "3.1",
      status: "Discharged",
      doctor: "Dr. Miller",
    },
  ]

  const handleFilterChange = (category, item) => {
    if (item === "all") {
      setFilters({
        ...filters,
        [category]: Object.keys(filters[category]).reduce((acc, key) => {
          acc[key] = key === "all"
          return acc
        }, {}),
      })
    } else {
      const newFilters = {
        ...filters,
        [category]: { ...filters[category], [item]: !filters[category][item], all: false },
      }

      // If no specific filters are selected, set 'all' back to true
      const hasActiveFilters = Object.keys(newFilters[category])
        .filter((key) => key !== "all")
        .some((key) => newFilters[category][key])

      if (!hasActiveFilters) {
        newFilters[category].all = true
      }

      setFilters(newFilters)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewBabyData({ ...newBabyData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    showAlert("Success!", "New baby record has been added successfully.", "success")
    setNewBabyData({
      motherName: "",
      motherAge: "",
      fatherName: "",
      fatherAge: "",
      address: "",
      phone: "",
      email: "",
      babyName: "",
      gender: "",
      birthDate: "",
      birthTime: "",
      weight: "",
      height: "",
      bloodType: "",
      deliveryType: "Normal",
      notes: "",
    })
    setShowModal(false)
  }

  // Simple alert function (replace with SweetAlert in production)
  const showAlert = (title, message, type) => {
    const alertDiv = document.createElement("div")
    alertDiv.className = "fixed inset-0 flex items-center justify-center z-50"

    alertDiv.innerHTML = `
      <div class="fixed inset-0 bg-black opacity-50"></div>
      <div class="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-auto z-10">
        <div class="flex items-center mb-4 ${type === "success" ? "text-green-500" : "text-red-500"}">
          ${
            type === "success"
              ? '<svg class="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>'
              : '<svg class="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>'
          }
          <h3 class="text-lg font-medium">${title}</h3>
        </div>
        <p class="text-gray-700 mb-4">${message}</p>
        <div class="text-right">
          <button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onclick="this.parentElement.parentElement.parentElement.remove()">OK</button>
        </div>
      </div>
    `

    document.body.appendChild(alertDiv)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Newborn Records</h1>
          <p className="text-sm text-gray-500">Manage and add new baby records</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add New Baby
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, ID, or mother's name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 mr-2 text-gray-500" />
            Filters
            {showFilters ? (
              <ChevronUp className="w-4 h-4 ml-2 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.all}
                      onChange={() => handleFilterChange("status", "all")}
                      className="rounded text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span className="text-sm text-gray-600">All</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.discharged}
                      onChange={() => handleFilterChange("status", "discharged")}
                      className="rounded text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span className="text-sm text-gray-600">Discharged</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.inCare}
                      onChange={() => handleFilterChange("status", "inCare")}
                      className="rounded text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span className="text-sm text-gray-600">In Care</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.nicu}
                      onChange={() => handleFilterChange("status", "nicu")}
                      className="rounded text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span className="text-sm text-gray-600">NICU</span>
                  </label>
                </div>
              </div>

              {/* Gender Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Gender</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.gender.all}
                      onChange={() => handleFilterChange("gender", "all")}
                      className="rounded text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span className="text-sm text-gray-600">All</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.gender.male}
                      onChange={() => handleFilterChange("gender", "male")}
                      className="rounded text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span className="text-sm text-gray-600">Male</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.gender.female}
                      onChange={() => handleFilterChange("gender", "female")}
                      className="rounded text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span className="text-sm text-gray-600">Female</span>
                  </label>
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Date</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.date.today}
                      onChange={() => handleFilterChange("date", "today")}
                      className="rounded text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span className="text-sm text-gray-600">Today</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.date.thisWeek}
                      onChange={() => handleFilterChange("date", "thisWeek")}
                      className="rounded text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span className="text-sm text-gray-600">This Week</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.date.thisMonth}
                      onChange={() => handleFilterChange("date", "thisMonth")}
                      className="rounded text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span className="text-sm text-gray-600">This Month</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.date.custom}
                      onChange={() => handleFilterChange("date", "custom")}
                      className="rounded text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span className="text-sm text-gray-600">Custom Range</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Date Range (conditionally shown) */}
            {filters.date.custom && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Filter Actions */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setFilters({
                    status: { all: true, discharged: false, inCare: false, nicu: false },
                    gender: { all: true, male: false, female: false },
                    date: { today: false, thisWeek: true, thisMonth: false, custom: false },
                  })
                }}
              >
                Reset
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Baby Records Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Baby Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Baby Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mother's Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Birth Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {babyRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Baby className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{record.babyName}</div>
                        <div className="text-sm text-gray-500">ID: #{record.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.motherName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.gender}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.birthDate}</div>
                    <div className="text-sm text-gray-500">{record.birthTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.weight}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === "Discharged"
                          ? "bg-green-100 text-green-800"
                          : record.status === "NICU"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.doctor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-green-600 hover:text-green-900 mr-3">View</button>
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Showing 5 of 24 entries</div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">Previous</button>
              <button className="px-3 py-1 bg-green-600 text-white rounded-md text-sm">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Baby Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Baby Record</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Parent Information */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-700 flex items-center">
                        <User className="h-5 w-5 mr-2 text-green-600" />
                        Parent Information
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                        <input
                          type="text"
                          name="motherName"
                          value={newBabyData.motherName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Age</label>
                        <input
                          type="number"
                          name="motherAge"
                          value={newBabyData.motherAge}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                        <input
                          type="text"
                          name="fatherName"
                          value={newBabyData.fatherName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Father's Age</label>
                        <input
                          type="number"
                          name="fatherAge"
                          value={newBabyData.fatherAge}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                          name="address"
                          value={newBabyData.address}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={newBabyData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={newBabyData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Baby Information */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-700 flex items-center">
                        <Baby className="h-5 w-5 mr-2 text-green-600" />
                        Baby Information
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Baby's Name (Optional)</label>
                        <input
                          type="text"
                          name="babyName"
                          value={newBabyData.babyName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          name="gender"
                          value={newBabyData.gender}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                          <input
                            type="date"
                            name="birthDate"
                            value={newBabyData.birthDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Birth Time</label>
                          <input
                            type="time"
                            name="birthTime"
                            value={newBabyData.birthTime}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                          <input
                            type="number"
                            step="0.01"
                            name="weight"
                            value={newBabyData.weight}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                          <input
                            type="number"
                            step="0.1"
                            name="height"
                            value={newBabyData.height}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                        <select
                          name="bloodType"
                          value={newBabyData.bloodType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select Blood Type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                        <select
                          name="deliveryType"
                          value={newBabyData.deliveryType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        >
                          <option value="Normal">Normal</option>
                          <option value="C-Section">C-Section</option>
                          <option value="Assisted">Assisted</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          name="notes"
                          value={newBabyData.notes}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      Save Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewBaby

