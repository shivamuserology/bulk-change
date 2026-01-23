import React from 'react';
import CascadingMenu from '../common/CascadingMenu';
import './Step1.css'; // We'll share styles or create a new one if needed, keeping it simpler for now

const FilterPanel = ({ isOpen, onClose, filters, onFilterChange, schema, employeeData }) => {
    if (!isOpen) return null;

    const handleMenuSelect = (taskId, type, value) => {
        if (type === 'value') {
            // Value is the new array of selected values
            onFilterChange(taskId, value);
        }
    };

    return (
        <div className="filter-panel animate-slide-right">
            <div className="filter-panel-header">
                <h3>Filters</h3>
                <div className="filter-actions">
                    <button className="btn-link" onClick={() => onFilterChange(null, 'RESET')}>Clear all</button>
                    <button className="icon-btn close-btn" onClick={onClose}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div className="filter-panel-content" style={{ padding: 0, overflow: 'hidden' }}>
                <CascadingMenu
                    mode="filter"
                    schema={schema}
                    selectedItems={filters}
                    onSelect={handleMenuSelect}
                    employeeData={employeeData}
                />
            </div>
        </div>
    );
};

export default FilterPanel;
