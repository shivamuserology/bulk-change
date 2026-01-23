import React, { useState, useMemo } from 'react';
import { useWizard, ENTRY_MODES } from '../../context/WizardContext';
import CSVUploadModal from '../CSVUploadModal';
import ColumnCustomizer, { DEFAULT_COLUMNS, getColumnConfig } from '../ColumnCustomizer';
import LayeredPanel from '../common/LayeredPanel';
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
        filters,
        setFilters,
        actionLog,
        addActionLogEntry
    } = useWizard();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'action_log'
    const [expandedLogs, setExpandedLogs] = useState([]);

    const [showCSVModal, setShowCSVModal] = useState(entryMode === ENTRY_MODES.CSV_EMPLOYEE_LIST);
    const [csvResult, setCsvResult] = useState(null);
    const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
    const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);

    const toggleLogExpansion = (logId) => {
        setExpandedLogs(prev =>
            prev.includes(logId) ? prev.filter(id => id !== logId) : [...prev, logId]
        );
    };

    const handleSingleEdit = (emp, field) => {
        const newValue = prompt(`Edit ${field.label} for ${emp.legalFirstName}:`, emp[field.id]);
        if (newValue !== null) {
            addActionLogEntry({
                type: 'single_change',
                summary: `Updated ${field.label} for ${emp.legalFirstName}`,
                details: {
                    employeeId: emp.id,
                    employeeName: `${emp.legalFirstName} ${emp.legalLastName}`,
                    field: field.id,
                    oldValue: emp[field.id],
                    newValue: newValue
                }
            });
            alert('Single change logged (prototype).');
        }
    };

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

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const searchMatch = !searchTerm ||
                `${emp.legalFirstName} ${emp.legalLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.workEmail.toLowerCase().includes(searchTerm.toLowerCase());

            if (!searchMatch) return false;

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

    const getFieldLabel = (fieldId) => {
        for (const category of fieldSchema.categories) {
            const field = category.fields.find(f => f.id === fieldId);
            if (field) return field.label;
        }
        return fieldId;
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
                                onClick={() => {
                                    const currentValues = filters[fieldId] || [];
                                    const newValues = currentValues.filter(v => v !== value);
                                    handleFilterChange(fieldId, newValues);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ));
                })}
                <button className="clear-all-filters-btn" onClick={() => handleFilterChange(null, 'RESET')}>
                    Clear All
                </button>
            </div>
        );
    };

    return (
        <div className="dashboard-view animate-fade-in">
            <div className="view-content-wrapper">
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
                    <div className="dashboard-header">
                        <div className="tabs-container">
                            <button
                                className={`dashboard-tab ${activeTab === 'employees' ? 'active' : ''}`}
                                onClick={() => setActiveTab('employees')}
                            >
                                Employees
                            </button>
                            <button
                                className={`dashboard-tab ${activeTab === 'action_log' ? 'active' : ''}`}
                                onClick={() => setActiveTab('action_log')}
                            >
                                Action Log {actionLog.length > 0 && <span className="tab-count">{actionLog.length}</span>}
                            </button>
                        </div>

                        {activeTab === 'employees' ? (
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
                                    >
                                        <span className="icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                            </svg>
                                        </span>
                                        {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
                                    </button>

                                    <button className="btn btn-secondary btn-sm">Export CSV</button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setShowCSVModal(true)}>Import Employee Data</button>
                                    <button className="icon-btn customize-btn" onClick={() => setShowColumnCustomizer(true)}>
                                        <span className="icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="3"></circle>
                                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                                {renderActiveFilters()}
                            </div>
                        ) : (
                            <div className="page-header">
                                <h2>Action Log</h2>
                                <p className="text-muted">A history of changes performed in this session.</p>
                            </div>
                        )}
                    </div>

                    <div className="dashboard-content">
                        {activeTab === 'employees' ? (
                            <>
                                <div className="bulk-actions-bar">
                                    {selectedEmployees.length > 0 ? (
                                        <div className="selection-active-state animate-fade-in">
                                            <span className="selection-count">{selectedEmployees.length} selected</span>
                                            <div className="selection-actions">
                                                <button className="btn btn-primary btn-sm" onClick={nextStep}>Bulk Change →</button>
                                                <button className="btn btn-secondary-inverse btn-sm">Download</button>
                                                <button className="btn btn-ghost btn-sm" onClick={clearEmployees}>Clear</button>
                                            </div>
                                        </div>
                                    ) : <div className="placeholder-height"></div>}
                                </div>

                                <div className="table-container">
                                    <table className="table dashboard-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: 40 }}>
                                                    <input type="checkbox" className="checkbox" checked={allFilteredSelected} onChange={handleSelectAll} />
                                                </th>
                                                <th>Employee</th>
                                                {activeColumns.map(col => <th key={col.id}>{col.label}</th>)}
                                                <th style={{ width: 40 }}></th>
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
                                                        <input type="checkbox" className="checkbox" checked={selectedEmployees.includes(emp.id)} onChange={() => selectEmployee(emp.id)} />
                                                    </td>
                                                    <td>
                                                        <div className="employee-cell">
                                                            <div className="employee-avatar">{emp.legalFirstName[0]}{emp.legalLastName[0]}</div>
                                                            <div>
                                                                <div className="employee-name">{emp.legalFirstName} {emp.legalLastName}</div>
                                                                <div className="employee-email">{emp.workEmail}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {activeColumns.map(col => (
                                                        <td key={col.id} onDoubleClick={() => handleSingleEdit(emp, col)}>{formatCellValue(emp, col)}</td>
                                                    ))}
                                                    <td className="actions-cell">
                                                        <button className="icon-btn" title="Edit" onClick={(e) => { e.stopPropagation(); handleSingleEdit(emp, activeColumns[0]); }}>
                                                            ✏️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="action-log-view animate-fade-in">
                                {actionLog.length === 0 ? (
                                    <div className="empty-state">
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                                        <h3>No actions logged yet</h3>
                                        <p>Execute bulk or single changes to see them in this session's log.</p>
                                    </div>
                                ) : (
                                    <div className="log-list">
                                        {actionLog.map(log => (
                                            <div key={log.id} className={`log-entry-wrapper ${expandedLogs.includes(log.id) ? 'is-expanded' : ''}`}>
                                                <div className="log-entry-main" onClick={() => toggleLogExpansion(log.id)}>
                                                    <div className="log-icon-circle">
                                                        {log.type === 'bulk_change' ? '📦' : '👤'}
                                                    </div>
                                                    <div className="log-summary-content">
                                                        <div className="log-top-row">
                                                            <span className="log-title">{log.summary}</span>
                                                            <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                        </div>
                                                        <div className="log-meta">
                                                            <span className={`status-pill ${log.status}`}>
                                                                ● {log.status === 'reverted' ? 'Reverted' : 'Success'}
                                                            </span>
                                                            <span className="type-pill">{log.type.replace('_', ' ')}</span>

                                                            {/* Only showing revert for the latest non-reverted bulk/single change */}
                                                            {idx === 0 && log.status !== 'reverted' && log.type !== 'revert' && (
                                                                <button
                                                                    className="btn-revert-sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (confirm('Are you sure you want to revert this action?')) {
                                                                            revertAction(log.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    ↩ Revert Action
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="log-toggle-icon">
                                                        {expandedLogs.includes(log.id) ? '−' : '+'}
                                                    </div>
                                                </div>
                                                {expandedLogs.includes(log.id) && (
                                                    <div className="log-entry-details animate-slide-down">
                                                        {log.type === 'revert' ? (
                                                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                                                                This action un-did changes from event ID: {log.details.revertedLogId}
                                                            </p>
                                                        ) : (
                                                            <div className="details-grid">
                                                                {log.type === 'bulk_change' ? (
                                                                    <>
                                                                        <div className="detail-box wide">
                                                                            <label>Impact Summary</label>
                                                                            <div className="impact-stats-mini">
                                                                                <div className="mini-stat"><strong>{log.details.employeeCount}</strong> Employees</div>
                                                                                <div className="mini-stat"><strong>{log.details.fields.length}</strong> Attributes</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="detail-box">
                                                                            <label>Attributes Modified</label>
                                                                            <div className="field-pills">
                                                                                {log.details.fields.map(f => <span key={f} className="field-pill">{getFieldLabel(f)}</span>)}
                                                                            </div>
                                                                        </div>
                                                                        <div className="detail-box">
                                                                            <label>Effective Date</label>
                                                                            <span>{log.details.effectiveDate}</span>
                                                                        </div>
                                                                        <div className="detail-box wide">
                                                                            <label>System Sync Status</label>
                                                                            <div className="sync-status-row">
                                                                                <span>Payroll ✓</span>
                                                                                <span>Benefits ✓</span>
                                                                                <span>Slack ✓</span>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="comparison-card">
                                                                            <div className="comp-header">
                                                                                <span className="comp-emp">{log.details.employeeName}</span>
                                                                                <span className="comp-field">{getFieldLabel(log.details.field)}</span>
                                                                            </div>
                                                                            <div className="comp-body">
                                                                                <div className="comp-side old">
                                                                                    <label>Before</label>
                                                                                    <span>{log.details.oldValue || '—'}</span>
                                                                                </div>
                                                                                <div className="comp-arrow">→</div>
                                                                                <div className="comp-side new">
                                                                                    <label>After</label>
                                                                                    <span>{log.details.newValue}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showCSVModal && <CSVUploadModal type="employee_list" onClose={() => setShowCSVModal(false)} onUpload={handleCSVUpload} />}
            {showColumnCustomizer && <ColumnCustomizer selectedColumns={visibleColumns} onColumnsChange={setVisibleColumns} onClose={() => setShowColumnCustomizer(false)} />}
        </div>
    );
}
