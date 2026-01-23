import React, { useState, useMemo } from 'react';
import { useWizard, ENTRY_MODES } from '../../context/WizardContext';
import ColumnCustomizer, { DEFAULT_COLUMNS, getColumnConfig } from '../ColumnCustomizer';
import './Step1.css';

export default function Step1_SelectEmployees() {
    const {
        employees,
        selectedEmployees,
        setSelectedEmployees,
        setCurrentStep,
        entryMode,
        setEntryMode,
        setImportCSVComplete
    } = useWizard();

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        department: '',
        status: '',
        workLocation: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
    const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
    const [activeTab, setActiveTab] = useState('employees');

    // Get unique values for filters
    const filterOptions = useMemo(() => ({
        departments: [...new Set(employees.map(e => e.department))].sort(),
        statuses: [...new Set(employees.map(e => e.status))].sort(),
        locations: [...new Set(employees.map(e => e.workLocation))].sort()
    }), [employees]);

    // Filter employees
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch = !searchTerm ||
                emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.workEmail?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDepartment = !filters.department || emp.department === filters.department;
            const matchesStatus = !filters.status || emp.status === filters.status;
            const matchesLocation = !filters.workLocation || emp.workLocation === filters.workLocation;

            return matchesSearch && matchesDepartment && matchesStatus && matchesLocation;
        });
    }, [employees, searchTerm, filters]);

    // Selection handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedEmployees(filteredEmployees.map(emp => emp.id));
        } else {
            setSelectedEmployees([]);
        }
    };

    const handleSelectEmployee = (employeeId) => {
        setSelectedEmployees(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    const isAllSelected = filteredEmployees.length > 0 &&
        filteredEmployees.every(emp => selectedEmployees.includes(emp.id));

    const handleBulkChange = () => {
        if (selectedEmployees.length > 0) {
            setCurrentStep(2);
        }
    };

    const handleExportCSV = () => {
        const headers = ['Name', 'Email', 'Department', 'Title', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredEmployees.map(emp =>
                [emp.name, emp.workEmail, emp.department, emp.title, emp.status].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees.csv';
        a.click();
    };

    const handleImportData = () => {
        setEntryMode(ENTRY_MODES.CSV_COMPLETE);
        setImportCSVComplete(false);
    };

    // Get active columns config
    const activeColumns = visibleColumns
        .map(colId => getColumnConfig(colId))
        .filter(Boolean);

    const renderCellValue = (employee, column) => {
        const value = employee[column.field];
        if (!value) return '-';

        if (column.format === 'currency') {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
        }
        if (column.format === 'date') {
            return new Date(value).toLocaleDateString();
        }
        if (column.format === 'badge') {
            return <span className={`status-badge status-${value.toLowerCase()}`}>{value}</span>;
        }
        return value;
    };

    return (
        <div className="dashboard-view">
            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`dashboard-tab ${activeTab === 'employees' ? 'active' : ''}`}
                    onClick={() => setActiveTab('employees')}
                >
                    Employees
                </button>
                <button
                    className={`dashboard-tab ${activeTab === 'changelog' ? 'active' : ''}`}
                    onClick={() => setActiveTab('changelog')}
                >
                    Change Log
                </button>
            </div>

            {/* Header Row - Matching Rippling Design */}
            <div className="dashboard-header-row">
                <div className="header-title">
                    <span className="header-title-text">Employees</span>
                    <span className="header-title-separator">·</span>
                    <span className="header-title-count">Showing {filteredEmployees.length} of {employees.length}</span>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Employee or designated approver"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className={`filter-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        title="Filter"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                    </button>
                    <button className="action-btn" onClick={handleExportCSV}>
                        Export CSV
                    </button>
                    <button className="action-btn primary" onClick={handleImportData}>
                        Import Employee Data
                    </button>
                    <button
                        className="icon-btn customize-btn"
                        onClick={() => setShowColumnCustomizer(true)}
                        title="Attributes"
                    >
                        ⚙️
                    </button>
                </div>
            </div>

            {/* Active Filters */}
            {showFilters && (
                <div className="filters-row">
                    <select
                        value={filters.department}
                        onChange={(e) => setFilters(f => ({ ...f, department: e.target.value }))}
                    >
                        <option value="">All Departments</option>
                        {filterOptions.departments.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                    >
                        <option value="">All Statuses</option>
                        {filterOptions.statuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <select
                        value={filters.workLocation}
                        onChange={(e) => setFilters(f => ({ ...f, workLocation: e.target.value }))}
                    >
                        <option value="">All Locations</option>
                        {filterOptions.locations.map(l => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Employee Table */}
            <div className="dashboard-content">
                {/* Bulk Actions Bar */}
                {selectedEmployees.length > 0 && (
                    <div className="bulk-actions-bar">
                        <div className="selection-active-state">
                            <span>{selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected</span>
                            <div className="selection-actions">
                                <button className="btn btn-ghost" onClick={() => setSelectedEmployees([])}>
                                    Clear
                                </button>
                                <button className="btn btn-primary" onClick={handleBulkChange}>
                                    Bulk Change →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="table-wrapper">
                    <table className="data-table dashboard-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>Employee</th>
                                {activeColumns.map(col => (
                                    <th key={col.id}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(employee => (
                                <tr
                                    key={employee.id}
                                    className={selectedEmployees.includes(employee.id) ? 'selected' : ''}
                                >
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.includes(employee.id)}
                                            onChange={() => handleSelectEmployee(employee.id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="employee-cell">
                                            <div className="employee-avatar">
                                                {employee.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="employee-name">{employee.name}</div>
                                                <div className="employee-email">{employee.workEmail}</div>
                                            </div>
                                        </div>
                                    </td>
                                    {activeColumns.map(col => (
                                        <td key={col.id}>{renderCellValue(employee, col)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Column Customizer Modal */}
            {showColumnCustomizer && (
                <ColumnCustomizer
                    selectedColumns={visibleColumns}
                    onColumnsChange={setVisibleColumns}
                    onClose={() => setShowColumnCustomizer(false)}
                />
            )}
        </div>
    );
}
