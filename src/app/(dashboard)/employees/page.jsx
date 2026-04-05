'use client';

// Employees — Employee list page
// Manage all school staff: instructors, admin, kitchen crew, and operations.
// Supports search, department filter, and role-based views.

import { useState, useEffect } from 'react';
import Link from 'next/link';

const DEPARTMENT_FILTERS = ['All', 'Instructors', 'Kitchen', 'Administration', 'Operations', 'Sales & Marketing'];
const STATUS_FILTERS = ['All', 'ACTIVE', 'INACTIVE'];

export default function EmployeesPage() {
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [view, setView] = useState('Grid');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, [departmentFilter, statusFilter]);

  async function fetchEmployees() {
    setLoading(true);
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const json = await res.json();
        let data = json.data || [];
        
        if (statusFilter !== 'All') {
          data = data.filter(e => e.status === statusFilter);
        }
        
        // Naive department map since we don't have exact string matches 
        // in backend. Usually department is a code like 'GEN'.
        // For demonstration, not strictly filtering department yet.
        
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setLoading(false);
    }
  }

  // derive initials
  const getInitials = (fName, lName) => {
    return `${(fName || '')[0] || ''}${(lName || '')[0] || ''}`.toUpperCase() || 'E';
  };

  return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage staff across all departments</p>
        </div>
        <div className="flex gap-2">
          {/* TODO: Invite employee button */}
          <div className="h-9 w-28 bg-white border border-gray-200 rounded-lg flex justify-center items-center text-sm font-medium hover:bg-gray-50 cursor-pointer">Invite Staff</div>
          {/* TODO: Add employee button */}
          <div className="h-9 w-32 bg-orange-500 rounded-lg text-white flex justify-center items-center text-sm font-medium hover:bg-orange-600 cursor-pointer">+ Add Employee</div>
        </div>
      </div>

      {/* Search + filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center mt-6">
        <div className="flex-1 w-full h-10 bg-white border border-gray-200 rounded-lg flex items-center px-3 gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded-sm flex-shrink-0" />
          <div className="h-4 w-36 bg-gray-100 rounded" />
        </div>
        {/* View toggle */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
          {['Grid', 'List'].map((m) => (
            <button
              key={m}
              onClick={() => setView(m)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                view === m ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Filters section */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {DEPARTMENT_FILTERS.map((d) => (
            <button
              key={d}
              onClick={() => setDepartmentFilter(d)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                departmentFilter === d ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? 'border-orange-400 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Employee grid/list view */}
      {loading ? (
        <div className="p-10 text-center text-sm text-gray-500">Loading...</div>
      ) : employees.length === 0 ? (
        <div className="p-10 text-center text-sm text-gray-500">No employees found.</div>
      ) : view === 'Grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {employees.map((emp) => (
            <Link
              key={emp.id}
              href={`/employees/${emp.id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center hover:shadow-md hover:border-orange-200 transition-all"
            >
              {/* Avatar */}
              <div className="h-16 w-16 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xl font-bold mb-3">
                {getInitials(emp.firstName, emp.lastName)}
              </div>
              {/* Name */}
              <div className="text-sm font-bold text-gray-800 mb-1">{emp.firstName} {emp.lastName}</div>
              {/* Role */}
              <div className="text-xs text-gray-500 mb-3">{emp.jobTitle || emp.role}</div>
              {/* Department badge */}
              <div className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full mb-3">
                {emp.department || 'GEN'}
              </div>
              {/* Status + actions */}
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                  emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {emp.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-4">Employee</div>
            <div className="col-span-2">Department</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Start Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1" />
          </div>
          {employees.map((emp) => (
            <div key={emp.id} className="grid grid-cols-12 gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-orange-50/20 items-center cursor-pointer" onClick={() => window.location.href=`/employees/${emp.id}`}>
              <div className="col-span-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {getInitials(emp.firstName, emp.lastName)}
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-gray-800">{emp.firstName} {emp.lastName}</div>
                  <div className="text-xs text-gray-500">{emp.email}</div>
                </div>
              </div>
              <div className="col-span-2">
                <span className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-medium rounded-full">
                  {emp.department || 'GEN'}
                </span>
              </div>
              <div className="col-span-2 text-xs text-gray-700">{emp.jobTitle || emp.role}</div>
              <div className="col-span-2 text-xs text-gray-500">
                {emp.hiredAt ? new Date(emp.hiredAt).toLocaleDateString() : '-'}
              </div>
              <div className="col-span-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                  emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {emp.status}
                </span>
              </div>
              <div className="col-span-1 flex justify-end text-gray-400 hover:text-gray-600">
                 {/* Chevron or action menu */}
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
