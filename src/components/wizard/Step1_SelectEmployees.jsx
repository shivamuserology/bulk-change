import React, { useState, useMemo } from 'react';
import { useWizard, ENTRY_MODES } from '../../context/WizardContext';
import CSVUploadModal from '../CSVUploadModal';
import './Step1.css';

export default function Step1_SelectEmployees() {
    const {
        employees,
        selectedEmployees,
        selectEmployee,
        selectAllEmployees,
        clearEmployees,
        nextStep,
        entryMode,
        importCSVEmployees
    } = useWizard();

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        department: '',
        location: '',
        status: ''
    });
    const [filterMode, setFilterMode] = useState('AND');
    const [showCSVModal, setShowCSVModal] = useState(entryMode === ENTRY_MODES.CSV_EMPLOYEE_LIST);
    const [csvResult, setCsvResult] = useState(null);

    // Get unique values for filters
    const departments = useMemo(() => [...new Set(employees.map(e => e.department))], [employees]);
    const locations = useMemo(() => [...new Set(employees.map(e => e.workLocation))], [employees]);
    const statuses = useMemo(() => [...new Set(employees.map(e => e.status))], [employees]);

    // Filter employees
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            // Search term
            const searchMatch = !searchTerm ||
                `${emp.legalFirstName} ${emp.legalLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.workEmail.toLowerCase().includes(searchTerm.toLowerCase());

            if (!searchMatch) return false;

            // Filters
            const conditions = [];
            if (filters.department) conditions.push(emp.department === filters.department);
            if (filters.location) conditions.push(emp.workLocation === filters.location);
            if (filters.status) conditions.push(emp.status === filters.status);

            if (conditions.length === 0) return true;

            if (filterMode === 'AND') {
                return conditions.every(c => c);
            } else {
                return conditions.some(c => c);
            }
        });
    }, [employees, searchTerm, filters, filterMode]);

    const allFilteredSelected = filteredEmployees.length > 0 &&
        filteredEmployees.every(e => selectedEmployees.includes(e.id));

    const handleSelectAll = () => {
        if (allFilteredSelected) {
            // Deselect all filtered
            const filteredIds = filteredEmployees.map(e => e.id);
            selectAllEmployees(selectedEmployees.filter(id => !filteredIds.includes(id)));
        } else {
            // Select all filtered (add to existing)
            const newIds = [...new Set([...selectedEmployees, ...filteredEmployees.map(e => e.id)])];
            selectAllEmployees(newIds);
        }
    };

    const handleCSVUpload = (employeeIds) => {
        const result = importCSVEmployees(employeeIds);
        setCsvResult(result);
        setShowCSVModal(false);
    };

    return (
        <div className="step-container animate-fade-in">
            <div className="step-header">
                <div>
                    <h2>Select Employees</h2>
                    <p className="step-description">
                        Choose employees to include in this bulk change
                    </p>
                </div>
                <div className="step-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowCSVModal(true)}
                    >
                        📥 Upload CSV
                    </button>
                </div>
            </div>

            {csvResult && (
                <div className={`alert ${csvResult.invalid > 0 ? 'alert-warning' : 'alert-success'}`}>
                    <span>
                        ✓ Imported {csvResult.valid} employees
                        {csvResult.invalid > 0 && ` (${csvResult.invalid} not found)`}
                    </span>
                </div>
            )}

            <div className="filter-bar">
                <div className="search-box">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search by name, ID, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select
                        className="form-input form-select"
                        value={filters.department}
                        onChange={(e) => setFilters(f => ({ ...f, department: e.target.value }))}
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <select
                        className="form-input form-select"
                        value={filters.location}
                        onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))}
                    >
                        <option value="">All Locations</option>
                        {locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>

                    <select
                        className="form-input form-select"
                        value={filters.status}
                        onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                    >
                        <option value="">All Statuses</option>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="filter-mode-toggle">
                    <button
                        className={`filter-mode-btn ${filterMode === 'AND' ? 'active' : ''}`}
                        onClick={() => setFilterMode('AND')}
                    >
                        AND
                    </button>
                    <button
                        className={`filter-mode-btn ${filterMode === 'OR' ? 'active' : ''}`}
                        onClick={() => setFilterMode('OR')}
                    >
                        OR
                    </button>
                </div>
            </div>

            <div className="selection-summary">
                <span>
                    Showing {filteredEmployees.length} of {employees.length} employees
                </span>
                <span className="selection-count">
                    {selectedEmployees.length} selected
                </span>
                {selectedEmployees.length > 0 && (
                    <button className="btn btn-ghost btn-sm" onClick={clearEmployees}>
                        Clear all
                    </button>
                )}
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}>
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={allFilteredSelected}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Title</th>
                            <th>Location</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map(emp => (
                            <tr
                                key={emp.id}
                                className={selectedEmployees.includes(emp.id) ? 'selected' : ''}
                                onClick={() => selectEmployee(emp.id)}
                            >
                                <td onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        checked={selectedEmployees.includes(emp.id)}
                                        onChange={() => selectEmployee(emp.id)}
                                    />
                                </td>
                                <td>
                                    <div className="employee-cell">
                                        <div className="employee-avatar">
                                            {emp.legalFirstName[0]}{emp.legalLastName[0]}
                                        </div>
                                        <div>
                                            <div className="employee-name">
                                                {emp.legalFirstName} {emp.legalLastName}
                                            </div>
                                            <div className="employee-email">{emp.workEmail}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{emp.department}</td>
                                <td>{emp.title}</td>
                                <td>{emp.workLocation}</td>
                                <td>
                                    <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                                        {emp.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredEmployees.length === 0 && (
                <div className="empty-state">
                    <p>No employees match your filters</p>
                    <button className="btn btn-secondary" onClick={() => {
                        setSearchTerm('');
                        setFilters({ department: '', location: '', status: '' });
                    }}>
                        Clear filters
                    </button>
                </div>
            )}

            <div className="step-footer">
                <div></div>
                <button
                    className="btn btn-primary btn-lg"
                    disabled={selectedEmployees.length === 0}
                    onClick={nextStep}
                >
                    Continue with {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} →
                </button>
            </div>

            {showCSVModal && (
                <CSVUploadModal
                    type="employee_list"
                    onClose={() => setShowCSVModal(false)}
                    onUpload={handleCSVUpload}
                />
            )}
        </div>
    );
}
