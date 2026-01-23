import React, { useState } from 'react';
import { useWizard, ENTRY_MODES } from '../../context/WizardContext';
import Table from '../Table';
import CSVUploadModal from '../CSVUploadModal';
import './Step1.css';

const Step1_SelectEmployees = () => {
    const {
        employees,
        selectedEmployees,
        selectEmployee,
        selectAllEmployees,
        clearEmployees,
        nextStep,
        entryMode
    } = useWizard();

    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [activeTab, setActiveTab] = useState('employees');

    // Filter employees based on search
    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            selectAllEmployees(filteredEmployees.map(e => e.id));
        } else {
            clearEmployees();
        }
    };

    const handleBulkChange = () => {
        nextStep();
    };

    return (
        <div className="step-container dashboard-view">
            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`dashboard-tab ${activeTab === 'employees' ? 'active' : ''}`}
                    onClick={() => setActiveTab('employees')}
                >
                    Employees
                </button>
                <button
                    className={`dashboard-tab ${activeTab === 'change_requests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('change_requests')}
                >
                    Action Log <span className="tab-badge">12</span>
                </button>
            </div>

            {/* Dashboard Controls */}
            <div className="dashboard-controls">
                <div className="page-header">
                    <h2>
                        Employees <span className="subtitle-count">· Showing {filteredEmployees.length} of {employees.length}</span>
                    </h2>
                </div>

                <div className="action-toolbar">
                    <div className="search-field-container">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Employee or designated approver"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className="icon-btn filter-btn" title="Filter">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                    </button>

                    <button className="btn btn-secondary btn-export">
                        Export CSV
                    </button>

                    <button
                        className="btn btn-secondary btn-import"
                        onClick={() => setShowUploadModal(true)}
                    >
                        Import Employee Data
                    </button>
                </div>
            </div>

            {/* Active Filters Bar (Placeholder for now) */}
            {/* <div className="active-filters-bar"> ... </div> */}

            {/* Main Content Area */}
            <div className="dashboard-content">
                {/* Bulk Actions Bar (Sticky) */}
                <div className="bulk-actions-bar">
                    {selectedEmployees.length > 0 && (
                        <div className="selection-active-state">
                            <span>{selectedEmployees.length} employees selected</span>
                            <div className="selection-actions">
                                <button className="btn btn-ghost" onClick={clearEmployees}>Clear Selection</button>
                                <button className="btn btn-primary" onClick={handleBulkChange}>
                                    Bulk Change ⚡
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="dashboard-table-container">
                    <Table
                        data={filteredEmployees}
                        selectedIds={selectedEmployees}
                        onSelect={selectEmployee}
                        onSelectAll={handleSelectAll}
                        allSelected={filteredEmployees.length > 0 && selectedEmployees.length === filteredEmployees.length}
                    />
                </div>
            </div>

            {/* Modals */}
            {showUploadModal && (
                <CSVUploadModal onClose={() => setShowUploadModal(false)} />
            )}
        </div>
    );
};

export default Step1_SelectEmployees;
