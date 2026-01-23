import React, { useState, useMemo, useEffect } from 'react';
import './LayeredPanel.css';

/**
 * LayeredPanel Component
 * 
 * @param {string} mode - 'filter' (3-col) | 'selection' (2-col)
 * @param {string} type - 'overlay' | 'inline'
 * @param {Object} schema - Field schema with categories and fields
 * @param {Object} selected - Current selection state
 * @param {Function} onChange - Handler for changes
 * @param {Function} onClose - Handler for closing (overlay mode)
 * @param {Array} data - Employee data for counts (filter mode)
 */
const LayeredPanel = ({
    mode = 'filter',
    type = 'overlay',
    schema,
    selected = {},
    onChange,
    onClose,
    data = []
}) => {
    const [activeCategory, setActiveCategory] = useState(schema.categories[0]?.id);
    const [activeField, setActiveField] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Reset active field when category changes
    useEffect(() => {
        if (mode === 'filter') {
            const category = schema.categories.find(c => c.id === activeCategory);
            if (category && category.fields.length > 0) {
                // Auto-select first field for smoother UX in filter mode? 
                // Or let user choose. Let's let user choose but maybe default to null.
            }
        }
    }, [activeCategory, mode, schema]);

    // Helper to get counts
    const getCategoryCount = (categoryId) => {
        if (mode === 'selection') {
            const cat = schema.categories.find(c => c.id === categoryId);
            if (!cat) return 0;
            // Count selected fields in this category
            const selectedFields = Array.isArray(selected) ? selected : []; // In selection mode, selected is array of fieldIds
            return cat.fields.filter(f => selectedFields.includes(f.id)).length;
        }
        return null;
    };

    const getFieldCount = (fieldId) => {
        if (mode === 'filter') {
            // Count of active filters for this field
            const filters = selected[fieldId];
            return filters ? filters.length : 0;
        }
        return null;
    };

    const getUniqueValues = (fieldId) => {
        if (!data || data.length === 0) return [];
        const values = data.map(item => item[fieldId]).filter(val => val !== null && val !== undefined);
        const unique = [...new Set(values)].sort();
        // Return object with value and count
        return unique.map(val => ({
            value: val,
            count: values.filter(v => v === val).length
        }));
    };

    const activeCategoryData = schema.categories.find(c => c.id === activeCategory);

    // Filter fields based on search if needed, or just list them
    const displayedFields = activeCategoryData ? activeCategoryData.fields : [];

    // Values for 3rd column
    const fieldValues = useMemo(() => {
        if (mode === 'filter' && activeField) {
            return getUniqueValues(activeField);
        }
        return [];
    }, [activeField, data, mode]);

    const handleFieldSelect = (fieldId) => {
        if (mode === 'filter') {
            setActiveField(fieldId);
        } else {
            // Toggle selection
            const currentSelected = Array.isArray(selected) ? selected : [];
            const isSelected = currentSelected.includes(fieldId);
            const newSelected = isSelected
                ? currentSelected.filter(id => id !== fieldId)
                : [...currentSelected, fieldId];
            onChange(newSelected);
        }
    };

    const handleValueToggle = (value) => {
        const currentFilters = selected[activeField] || [];
        const isSelected = currentFilters.includes(value);
        let newFilters;
        if (isSelected) {
            newFilters = currentFilters.filter(v => v !== value);
        } else {
            newFilters = [...currentFilters, value];
        }
        onChange(activeField, newFilters);
    };

    return (
        <div className={`layered-panel-container ${type}`}>
            {type === 'overlay' && (
                <button className="panel-close-btn" onClick={onClose}>×</button>
            )}

            {/* COL 1: Categories */}
            <div className="panel-column col-1">
                <div className="panel-header">
                    <h3>Categories</h3>
                </div>
                <div className="panel-list">
                    {schema.categories.map(cat => (
                        <div
                            key={cat.id}
                            className={`list-item ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            <span>{cat.name}</span>
                            {mode === 'selection' && (
                                <span className="item-count">{getCategoryCount(cat.id)}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* COL 2: Attributes/Fields */}
            <div className="panel-column col-2">
                <div className="panel-header">
                    <h3>Attributes</h3>
                </div>
                {/* Search could go here */}
                <div className="panel-list">
                    {displayedFields.map(field => {
                        const isSelected = mode === 'selection' && (Array.isArray(selected) ? selected.includes(field.id) : false);
                        const isActive = mode === 'filter' && activeField === field.id;
                        const count = getFieldCount(field.id);

                        if (mode === 'selection') {
                            return (
                                <label key={field.id} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleFieldSelect(field.id)}
                                        disabled={field.readOnly} // Handle permissions if passed
                                    />
                                    <span className="checkbox-label">{field.label}</span>
                                    {field.readOnly && <span className="badge badge-xs">Read-only</span>}
                                </label>
                            );
                        } else {
                            return (
                                <div
                                    key={field.id}
                                    className={`list-item ${isActive ? 'active' : ''}`}
                                    onClick={() => handleFieldSelect(field.id)}
                                >
                                    <span>{field.label}</span>
                                    {count > 0 && <span className="item-count">{count}</span>}
                                    <span style={{ color: '#ccc' }}>›</span>
                                </div>
                            );
                        }
                    })}
                </div>
            </div>

            {/* COL 3: Values (Only for Filter mode) */}
            {mode === 'filter' && (
                <div className="panel-column col-3">
                    <div className="panel-header">
                        <h3>Values</h3>
                        {activeField && (
                            <button
                                className="btn-link"
                                style={{ fontSize: '11px' }}
                                onClick={() => onChange(activeField, [])} // Clear specific field
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    {activeField ? (
                        <>
                            <div className="panel-search">
                                <input
                                    type="text"
                                    placeholder="Search values..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="panel-list">
                                {fieldValues
                                    .filter(fv => fv.value.toString().toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(fv => {
                                        const isChecked = selected[activeField]?.includes(fv.value);
                                        return (
                                            <label key={fv.value} className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    checked={!!isChecked}
                                                    onChange={() => handleValueToggle(fv.value)}
                                                />
                                                <span className="checkbox-label">{fv.value}</span>
                                                <span className="item-count">{fv.count}</span>
                                            </label>
                                        );
                                    })
                                }
                                {fieldValues.length === 0 && (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                        No values found
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#999', marginTop: '40px' }}>
                            Select an attribute to view values
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LayeredPanel;
