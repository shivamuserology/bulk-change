import React, { useState, useMemo } from 'react';
import { useWizard, ENTRY_MODES } from '../../context/WizardContext';
import CSVUploadModal from '../CSVUploadModal';
import ColumnCustomizer, { DEFAULT_COLUMNS, getColumnConfig } from '../ColumnCustomizer';
import LayeredPanel from '../common/LayeredPanel'; // Use unified panel
import fieldSchema from '../../data/fieldSchema.json';
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
        importCSVEmployees,
        filters,    // From context
        setFilters  // From context
    } = useWizard();

    const [searchTerm, setSearchTerm] = useState('');

    // Filters state now in context

    const [showCSVModal, setShowCSVModal] = useState(entryMode === ENTRY_MODES.CSV_EMPLOYEE_LIST);
    const [csvResult, setCsvResult] = useState(null);
    const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
    const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);

    // Initial load: no need to pre-calculate unique values since FilterPanel handles it or we pass data

    const activeFilterCount = useMemo(() => {
        let count = 0;
        Object.values(filters).forEach(vals => {
            if (Array.isArray(vals)) count += vals.length;
        });
        return count;
    }, [filters]);

    const handleFilterChange = (fieldId, value) => {
        if (fieldId === null && value === 'RESET') {
            setFilters({});
            return;
        }

        const newFilters = { ...filters };
        if (!value || (Array.isArray(value) && value.length === 0)) {
            delete newFilters[fieldId];
        } else {
            newFilters[fieldId] = value;
        }

        setFilters(newFilters);
    };

    // Filter employees
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const searchMatch = !searchTerm ||
                `${emp.legalFirstName} ${emp.legalLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.workEmail.toLowerCase().includes(searchTerm.toLowerCase());

            if (!searchMatch) return false;

            // Checked against all active filters
            // filters is map of { fieldId: [val1, val2] }
            // need matched on OR within field, AND across fields
            const activeFilterKeys = Object.keys(filters);
            if (activeFilterKeys.length === 0) return true;

            return activeFilterKeys.every(fieldId => {
                const selectedOptions = filters[fieldId];
                if (!selectedOptions || selectedOptions.length === 0) return true;

                const empValue = emp[fieldId];
                return selectedOptions.includes(empValue);
            });
        });
    }, [employees, searchTerm, filters]);

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

    // Helper to get field label
    const getFieldLabel = (fieldId) => {
        for (const category of fieldSchema.categories) {
            const field = category.fields.find(f => f.id === fieldId);
            if (field) return field.label;
        }
        return fieldId;
    };

    const removeFilterValue = (fieldId, value) => {
        const currentValues = filters[fieldId] || [];
        const newValues = currentValues.filter(v => v !== value);
        handleFilterChange(fieldId, newValues);
    };

    const renderActiveFilters = () => {
        const activeKeys = Object.keys(filters);
        if (activeKeys.length === 0) return null;

        return (
            <div className="active-filters-container animate-slide-down">
                {activeKeys.map(fieldId => {
                    const values = filters[fieldId];
                    if (!values || values.length === 0) return null;
                    const label = getFieldLabel(fieldId);

                    return values.map(value => (
                        <div key={`${fieldId}-${value}`} className="filter-chip">
                            <span className="chip-label">
                                <span className="chip-field-name">{label}:</span> {value}
                            </span>
                            <button
                                className="chip-remove-btn"
                                onClick={() => removeFilterValue(fieldId, value)}
                                title="Remove filter"
                            >
                                ×
                            </button>
                        </div>
                    ));
                })}
                <button
                    className="clear-all-filters-btn"
                    onClick={() => handleFilterChange(null, 'RESET')}
                >
                    Clear All
                </button>
            </div>
        );
    };

    return (
        <div className="dashboard-view animate-fade-in">
            <div className="view-content-wrapper">
                {/* Filter Sidebar (Left Panel Overlay) */}
                {filtersPanelOpen && (
                    <div className="filter-overlay-wrapper">
                        <LayeredPanel
                            mode="filter"
                            type="overlay"
                            schema={fieldSchema}
                            selected={filters}
                            onChange={handleFilterChange}
                            onClose={() => setFiltersPanelOpen(false)}
                            data={employees}
                        />
                    </div>
                )}

                <div className="main-work-area">
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
                                    <span className="search-icon">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search employees..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <button
                                    className={`icon-btn filter-btn ${filtersPanelOpen ? 'active' : ''}`}
                                    onClick={() => setFiltersPanelOpen(!filtersPanelOpen)}
                                    title="Filter"
                                >
                                    <span className="icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                        </svg>
                                    </span>
                                    {activeFilterCount > 0 && (
                                        <span className="filter-badge">{activeFilterCount}</span>
                                    )}
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
                                    <span className="icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="3"></circle>
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                        {renderActiveFilters()}
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
                                        <button className="btn btn-secondary-inverse btn-sm">
                                            Download
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
                                    setFilters({});
                                }}>
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
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
