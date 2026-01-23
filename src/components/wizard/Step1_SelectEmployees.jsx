import React, { useState, useMemo } from 'react';
import { useWizard, ENTRY_MODES } from '../../context/WizardContext';
import CSVUploadModal from '../CSVUploadModal';
import ColumnCustomizer, { DEFAULT_COLUMNS, getColumnConfig } from '../ColumnCustomizer';
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
    const [showCSVModal, setShowCSVModal] = useState(entryMode === ENTRY_MODES.CSV_EMPLOYEE_LIST);
    const [csvResult, setCsvResult] = useState(null);
    const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
    const [filtersVisible, setFiltersVisible] = useState(false);

    // Get unique values for filters
    const departments = useMemo(() => [...new Set(employees.map(e => e.department))], [employees]);
    const locations = useMemo(() => [...new Set(employees.map(e => e.workLocation))], [employees]);
    const statuses = useMemo(() => [...new Set(employees.map(e => e.status))], [employees]);

    // Filter employees
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const searchMatch = !searchTerm ||
                `${emp.legalFirstName} ${emp.legalLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.workEmail.toLowerCase().includes(searchTerm.toLowerCase());

            if (!searchMatch) return false;

            if (!filtersVisible) return true;

            const conditions = [];
            if (filters.department) conditions.push(emp.department === filters.department);
            if (filters.location) conditions.push(emp.workLocation === filters.location);
            if (filters.status) conditions.push(emp.status === filters.status);

            return conditions.length === 0 || conditions.every(c => c);
        });
    }, [employees, searchTerm, filters, filtersVisible]);

    const allFilteredSelected = filteredEmployees.length > 0 &&
        filteredEmployees.every(e => selectedEmployees.includes(e.id));

    const handleSelectAll = () => {
        if (allFilteredSelected) {
            const filteredIds = filteredEmployees.map(e => e.id);
            selectAllEmployees(selectedEmployees.filter(id => !filteredIds.includes(id)));
        } else {
            const newIds = [...new Set([...selectedEmployees, ...filteredEmployees.map(e => e.id)])];
            selectAllEmployees(newIds);
        }
    };

    const handleCSVUpload = (employeeIds) => {
        const result = importCSVEmployees(employeeIds);
        setCsvResult(result);
        setShowCSVModal(false);
    };

    // Format cell value
    const formatCellValue = (emp, colConfig) => {
        const value = emp[colConfig.field];
        if (value === undefined || value === null) return '—';

        switch (colConfig.format) {
            case 'currency':
                return typeof value === 'number' ? `$${value.toLocaleString()}` : value;
            case 'date':
                return value ? new Date(value).toLocaleDateString() : '—';
            case 'badge':
                return (
                    <span className={`badge ${value === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                        {value}
                    </span>
                );
            default:
                return value;
        }
    };

    const activeColumns = visibleColumns
        .map(colId => getColumnConfig(colId))
        .filter(Boolean);

    return (
        <div className="dashboard-view animate-fade-in">
            {/* Header Section */}
            <div className="dashboard-header">
                <div className="tabs-container">
                    <button className="dashboard-tab active">Employees</button>
                    <button className="dashboard-tab">Action Log</button>
                </div>

                <div className="dashboard-controls">
                    <div className="page-header">
                        <h2>Employees</h2>
                        <span className="employee-count-badge">
                            Showing {filteredEmployees.length} of {employees.length}
                        </span>
                    </div>

                    <div className="action-toolbar">
                        <div className="search-field-container">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            className={`icon-btn filter-btn ${filtersVisible ? 'active' : ''}`}
                            onClick={() => setFiltersVisible(!filtersVisible)}
                            title="Filter"
                        >
                            <span className="icon">T</span>
                        </button>

                        <button
                            className="btn btn-secondary btn-sm"
                            title="Export CSV"
                        >
                            Export CSV
                        </button>

                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowCSVModal(true)}
                        >
                            Import Employee Data
                        </button>

                        <button
                            className="icon-btn customize-btn"
                            onClick={() => setShowColumnCustomizer(true)}
                            title="Attributes"
                        >
                            <span className="icon">⚙</span>
                        </button>
                    </div>
                </div>

                {filtersVisible && (
                    <div className="active-filters-bar animate-slide-up">
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
                )}
            </div>

            {csvResult && (
                <div className={`alert ${csvResult.invalid > 0 ? 'alert-warning' : 'alert-success'}`}>
                    <span>
                        ✓ Imported {csvResult.valid} employees
                        {csvResult.invalid > 0 && ` (${csvResult.invalid} not found)`}
                    </span>
                </div>
            )}

            <div className="dashboard-content">
                <div className="bulk-actions-bar">
                    {selectedEmployees.length > 0 ? (
                        <div className="selection-active-state animate-fade-in">
                            <span className="selection-count">
                                {selectedEmployees.length} selected
                            </span>
                            <div className="selection-actions">
                                <button className="btn btn-primary btn-sm" onClick={nextStep}>
                                    Bulk Change →
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={clearEmployees}>
                                    Clear
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="placeholder-height"></div>
                    )}
                </div>

                <div className="table-container">
                    <table className="table dashboard-table">
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
                                {activeColumns.map(col => (
                                    <th key={col.id}>{col.label}</th>
                                ))}
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
                                    {activeColumns.map(col => (
                                        <td key={col.id}>{formatCellValue(emp, col)}</td>
                                    ))}
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
            </div>

            {showCSVModal && (
                <CSVUploadModal
                    type="employee_list"
                    onClose={() => setShowCSVModal(false)}
                    onUpload={handleCSVUpload}
                />
            )}

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
