import { useState } from "react";
import {
  Baby,
  Heart,
  Calendar,
  Users,
  BarChart2,
  TrendingUp,
  TrendingDown
} from "lucide-react";

function Dashboard() {
  const [timeRange, setTimeRange] = useState("This Month");
  
  const stats = [
    {
      title: "Total Births",
      value: "128",
      change: "+12% from last month",
      icon: <Baby className="h-8 w-8 text-green-600" />,
      trend: "up"
    },
    {
      title: "In NICU",
      value: "8",
      change: "-2 from yesterday",
      icon: <Heart className="h-8 w-8 text-red-500" />,
      trend: "down"
    },
    {
      title: "Scheduled Checkups",
      value: "24",
      change: "5 due today",
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      trend: "up"
    },
    {
      title: "New Admissions",
      value: "16",
      change: "+3 from yesterday",
      icon: <Users className="h-8 w-8 text-purple-500" />,
      trend: "up"
    }
  ];
  
  const recentBirths = [
    { 
      id: 1,
      babyName: "Baby Smith",
      time: new Date(Date.now() - 3600000).toLocaleString(),
      details: "3.4kg, Female"
    },
    { 
      id: 2,
      babyName: "Baby Johnson",
      time: new Date(Date.now() - 2 * 3600000).toLocaleString(),
      details: "3.2kg, Male" 
    },
    { 
      id: 3,
      babyName: "Baby Williams",
      time: new Date(Date.now() - 3 * 3600000).toLocaleString(),
      details: "2.9kg, Female" 
    },
    { 
      id: 4,
      babyName: "Baby Brown",
      time: new Date(Date.now() - 4 * 3600000).toLocaleString(),
      details: "3.7kg, Male" 
    }
  ];
  
  const recentPatients = [
    { name: "Emma Thompson", baby: "Female, 3.2kg", date: "2023-03-15", status: "Discharged" },
    { name: "Sophia Garcia", baby: "Male, 3.5kg", date: "2023-03-14", status: "In Care" },
    { name: "Olivia Martinez", baby: "Female, 2.9kg", date: "2023-03-14", status: "NICU" },
    { name: "Isabella Johnson", baby: "Male, 3.7kg", date: "2023-03-13", status: "Discharged" },
    { name: "Ava Williams", baby: "Female, 3.1kg", date: "2023-03-12", status: "Discharged" }
  ];

  return (
    <>
      <div className="mb-6 p-3">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 p-3">
        <div className="bg-white p-6 rounded-lg shadow-sm col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Birth Statistics</h3>
            <select 
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border-t border-gray-100 pt-4">
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <BarChart2 className="h-12 w-12 text-green-300 mr-2" />
              <p className="text-gray-500">Birth Statistics Chart</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Births</h3>
          <div className="space-y-4">
            {recentBirths.map((birth) => (
              <div key={birth.id} className="flex items-start space-x-3 border-b border-gray-100 pb-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Baby className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{birth.babyName}</p>
                  <p className="text-xs text-gray-500">{birth.time}</p>
                  <p className="text-xs text-gray-600 mt-1">{birth.details}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium">
            View All Records
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Recent Patients</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Baby Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Birth Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPatients.map((patient, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{patient.baby}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{patient.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        patient.status === "Discharged"
                          ? "bg-green-100 text-green-800"
                          : patient.status === "NICU"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-green-600 hover:text-green-900 mr-3">View</button>
                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Showing 5 of 25 entries</div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">Previous</button>
              <button className="px-3 py-1 bg-green-600 text-white rounded-md text-sm">Next</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, change, icon, trend }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <p className="text-xs text-gray-500">{change}</p>
          </div>
        </div>
        <div className="bg-green-50 h-12 w-12 rounded-lg flex items-center justify-center">{icon}</div>
      </div>
    </div>
  );
}

export default Dashboard;