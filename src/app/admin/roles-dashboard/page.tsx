'use client';

import { 
  Users, 
  FileSpreadsheet, 
  Database, 
  BarChart2, 
  FileText, 
  Activity, 
  Settings, 
  Shield, 
  UserCheck 
} from 'lucide-react';

export default function RolesDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Roles Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage roles and permissions from a central location.</p>
      
      {/* Roles Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-800">Total Roles</h3>
          <p className="text-3xl font-bold">10</p>
          <p className="text-sm text-blue-600">+2 from last month</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-800">Active Roles</h3>
          <p className="text-3xl font-bold">8</p>
          <p className="text-sm text-green-600">+1 from last month</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <h3 className="text-lg font-medium text-purple-800">Inactive Roles</h3>
          <p className="text-3xl font-bold">2</p>
          <p className="text-sm text-purple-600">-1 from last month</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
          <h3 className="text-lg font-medium text-amber-800">Pending Roles</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-amber-600">No pending roles</p>
        </div>
      </div>
      
      {/* Main Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Role Management Section */}
        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Role Management</h2>
          </div>
          <p className="text-gray-600 mb-4">View, edit, and manage roles and permissions</p>
          <div className="space-y-2">
            <a href="/admin/roles" className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center">
              Manage Roles
            </a>
            <a href="/admin/permissions" className="block px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center">
              Permission Management
            </a>
            <a href="/admin/role-assignments" className="block px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center">
              Assign Roles
            </a>
          </div>
        </div>
        
        {/* Role Creation Section */}
        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold">Role Creation</h2>
          </div>
          <p className="text-gray-600 mb-4">Create new roles and manage role templates</p>
          <div className="space-y-2">
            <a href="/admin/create-role" className="block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-center">
              Create Role
            </a>
            <a href="/admin/role-templates" className="block px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center">
              Role Templates
            </a>
          </div>
        </div>
        
        {/* Role Analytics Section */}
        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <BarChart2 className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold">Role Analytics</h2>
          </div>
          <p className="text-gray-600 mb-4">View role analytics and generate reports</p>
          <div className="space-y-2">
            <a href="/admin/role-analytics" className="block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-center">
              Role Analytics Dashboard
            </a>
            <a href="/admin/role-reports" className="block px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center">
              Reporting Tools
            </a>
          </div>
        </div>
        
        {/* Role Security Section */}
        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold">Role Security</h2>
          </div>
          <p className="text-gray-600 mb-4">Configure role security settings and integrations</p>
          <div className="space-y-2">
            <a href="/admin/role-security" className="block px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 text-center">
              Role Security Settings
            </a>
            <a href="/admin/role-auditing" className="block px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center">
              Role Auditing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}