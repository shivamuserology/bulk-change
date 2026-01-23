import React, { useState, useMemo } from 'react';
import './Step1.css'; // We'll share styles or create a new one if needed, keeping it simpler for now

const FilterPanel = ({ isOpen, onClose, filters, onFilterChange, schema, employeeData }) => {
    // Helper to calculate available counts for options
    const getOptionCounts = (fieldId) => {
        const counts = {};
        employeeData.forEach(emp => {
            const val = emp[fieldId];
            if (val) {
                counts[val] = (counts[val] || 0) + 1;
            }
        });
        return counts;
    };

    const handleCheckboxChange = (fieldId, value) => {
        const currentValues = filters[fieldId] || [];
        let newValues;

        if (currentValues.includes(value)) {
            newValues = currentValues.filter(v => v !== value);
        } else {
            newValues = [...currentValues, value];
        }

        onFilterChange(fieldId, newValues);
    };

    const clearAll = () => {
        // Pass empty object or reset all keys
        // We'll reset by passing a special signal or just iterating
        // Ideally the parent handles 'reset'
        // For now, we'll iterate known keys? Or let parent handle "clear"
        // Let's assume onFilterChange handles null to clear, or we emit a clear event.
        // Actually, let's just emit empty arrays for everything or let parent handle "setFilters({})"
        // We'll define a clear prop or just use onFilterChange for each key?
        // Better: let parent expose a clearAll function.
        // For MVP here, let's assume we pass { } to parent if supported, or loop.
        // I'll stick to 'onFilterReset' prop.
    };

    if (!isOpen) return null;

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

            <div className="filter-panel-content">
                {schema.categories.map(category => (
                    <div key={category.id} className="filter-category">
                        <div className="category-title">{category.name}</div>
                        <div className="category-fields">
                            {category.fields.map(field => {
                                // Only show filterable fields (e.g. dropdowns, or maybe everything?)
                                // For MVP, let's focus on 'dropdown' types as they are easiest to facet.
                                // The user request implies filtering on attributes within these categories.
                                if (field.type !== 'dropdown') return null;

                                const counts = getOptionCounts(field.id);

                                return (
                                    <div key={field.id} className="filter-field-group">
                                        <div className="field-label">{field.label}</div>
                                        <div className="option-list">
                                            {field.options?.map(option => (
                                                <label key={option} className="checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        checked={(filters[field.id] || []).includes(option)}
                                                        onChange={() => handleCheckboxChange(field.id, option)}
                                                    />
                                                    <span className="checkbox-label">{option}</span>
                                                    <span className="count-badge">{counts[option] || 0}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FilterPanel;
