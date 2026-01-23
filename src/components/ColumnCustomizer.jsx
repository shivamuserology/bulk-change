import React, { useState, useMemo } from 'react';
import './ColumnCustomizer.css';

const MAX_COLUMNS = 8;

// Define available columns with their display labels and field mappings
const AVAILABLE_COLUMNS = [
    // Employment
    { id: 'department', label: 'Department', category: 'Employment', field: 'department' },
    { id: 'title', label: 'Title', category: 'Employment', field: 'title' },
    { id: 'workLocation', label: 'Work Location', category: 'Employment', field: 'workLocation' },
    { id: 'compensation', label: 'Compensation', category: 'Employment', field: 'compensation', format: 'currency' },
    { id: 'manager', label: 'Manager', category: 'Employment', field: 'manager' },
    { id: 'workEmail', label: 'Work Email', category: 'Employment', field: 'workEmail' },
    { id: 'team', label: 'Team', category: 'Employment', field: 'team' },
    // Personal
    { id: 'preferredName', label: 'Preferred Name', category: 'Personal', field: 'preferredName' },
    { id: 'personalEmail', label: 'Personal Email', category: 'Personal', field: 'personalEmail' },
    { id: 'personalPhone', label: 'Personal Phone', category: 'Personal', field: 'personalPhone' },
    { id: 'homeCity', label: 'Home City', category: 'Personal', field: 'homeCity' },
    { id: 'homeState', label: 'Home State', category: 'Personal', field: 'homeState' },
    // Additional
    { id: 'employeeId', label: 'Employee ID', category: 'Additional', field: 'id' },
    { id: 'citizenship', label: 'Citizenship', category: 'Additional', field: 'citizenship' },
    { id: 'workAuthorization', label: 'Work Authorization', category: 'Additional', field: 'workAuthorization' },
    // Status
    { id: 'status', label: 'Status', category: 'Status', field: 'status', format: 'badge' },
    { id: 'startDate', label: 'Start Date', category: 'Status', field: 'startDate', format: 'date' },
];

export const DEFAULT_COLUMNS = ['department', 'title', 'workLocation', 'status'];

export default function ColumnCustomizer({ selectedColumns, onColumnsChange, onClose }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [localColumns, setLocalColumns] = useState(selectedColumns);

    // Group columns by category
    const categorizedColumns = useMemo(() => {
        const filtered = AVAILABLE_COLUMNS.filter(col =>
            col.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            col.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.reduce((acc, col) => {
            if (!acc[col.category]) acc[col.category] = [];
            acc[col.category].push(col);
            return acc;
        }, {});
    }, [searchTerm]);

    const toggleColumn = (colId) => {
        setLocalColumns(prev => {
            if (prev.includes(colId)) {
                return prev.filter(id => id !== colId);
            } else {
                if (prev.length >= MAX_COLUMNS) return prev;
                return [...prev, colId];
            }
        });
    };

    const handleApply = () => {
        onColumnsChange(localColumns);
        onClose();
    };

    const handleReset = () => {
        setLocalColumns(DEFAULT_COLUMNS);
    };

    const isOverLimit = localColumns.length >= MAX_COLUMNS;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="column-customizer-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Configure Attributes</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="customizer-content">
                    <div className="customizer-search">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search attributes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="selection-info">
                        <span className={`column-count ${isOverLimit ? 'at-limit' : ''}`}>
                            {localColumns.length} / {MAX_COLUMNS} columns selected
                        </span>
                        {isOverLimit && (
                            <span className="limit-warning">
                                ⚠ Maximum columns reached
                            </span>
                        )}
                    </div>

                    <div className="field-categories">
                        {Object.entries(categorizedColumns).map(([category, columns]) => (
                            <div key={category} className="field-category">
                                <h4 className="category-header">{category}</h4>
                                <div className="field-list">
                                    {columns.map(col => {
                                        const isSelected = localColumns.includes(col.id);
                                        const isDisabled = !isSelected && isOverLimit;
                                        return (
                                            <label
                                                key={col.id}
                                                className={`field-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    disabled={isDisabled}
                                                    onChange={() => toggleColumn(col.id)}
                                                />
                                                <span className="field-label">{col.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={handleReset}>
                        ↺ Reset to Default
                    </button>
                    <div className="footer-actions">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleApply}>
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Export helper to get column config by id
export function getColumnConfig(colId) {
    return AVAILABLE_COLUMNS.find(c => c.id === colId);
}

export { AVAILABLE_COLUMNS };
