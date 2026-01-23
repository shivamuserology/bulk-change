import React, { useState, useMemo, useEffect } from 'react';
import './CascadingMenu.css';

/**
 * CascadingMenu Component
 * 
 * Supports two modes:
 * - 'filter': 3 columns (Category -> Field -> Values)
 * - 'selection': 2 columns (Category -> Fields)
 */
const CascadingMenu = ({
    mode = 'filter', // 'filter' | 'selection'
    schema,
    selectedItems = {}, // Format depends on mode: { fieldId: [val1, val2] } for filter, [fieldId1, fieldId2] for selection
    onSelect, // (item, type, parent) => void
    employeeData = [],
    columnHeaders = ['Category', 'Attribute', 'Values']
}) => {
    // Selection state for navigation (not data selection)
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedField, setSelectedField] = useState(null);

    // Initialize selection to first category if none selected
    useEffect(() => {
        if (!selectedCategory && schema?.categories?.length > 0) {
            setSelectedCategory(schema.categories[0]);
        }
    }, [schema, selectedCategory]);

    // -- Helpers --

    const getOptionCounts = useMemo(() => {
        if (mode !== 'filter' || !selectedField) return {};

        // Count occurrences of each value for the selected field
        const counts = {};
        employeeData.forEach(emp => {
            const val = emp[selectedField.id];
            // Handle null/undefined as strings if needed, or skip
            const key = val === null || val === undefined ? 'Blank' : val;
            counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
    }, [employeeData, selectedField, mode]);

    const getSelectedCountForCategory = (category) => {
        if (mode === 'selection') {
            // Count selected fields in this category
            return category.fields.filter(f => selectedItems.includes(f.id)).length;
        } else {
            // Count active filters in this category
            let count = 0;
            category.fields.forEach(f => {
                if (selectedItems[f.id] && selectedItems[f.id].length > 0) {
                    count++;
                }
            });
            return count;
        }
    };

    const isFieldActive = (fieldId) => {
        if (mode === 'selection') {
            return selectedItems.includes(fieldId);
        } else {
            return selectedItems[fieldId] && selectedItems[fieldId].length > 0;
        }
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setSelectedField(null); // Reset field selection when category changes
    };

    const handleFieldClick = (field) => {
        if (mode === 'selection') {
            // In selection mode, clicking a field toggles its selection directly
            onSelect(field.id, 'field');
        } else {
            // In filter mode, clicking a field opens the Value column
            setSelectedField(field);
        }
    };

    const handleValueToggle = (value) => {
        if (mode !== 'filter' || !selectedField) return;

        const currentValues = selectedItems[selectedField.id] || [];
        let newValues;

        if (currentValues.includes(value)) {
            newValues = currentValues.filter(v => v !== value);
        } else {
            newValues = [...currentValues, value];
        }

        onSelect(selectedField.id, 'value', newValues);
    };

    // -- Rendering --

    // Col 1: Categories
    const renderCategories = () => (
        <div className="menu-column">
            <div className="column-header">{columnHeaders[0]}</div>
            <div className="column-content">
                {schema.categories.map(category => {
                    const count = getSelectedCountForCategory(category);
                    return (
                        <div
                            key={category.id}
                            className={`menu-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(category)}
                        >
                            <span>{category.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {count > 0 && <span className="count-badge">{count}</span>}
                                <span className="arrow">›</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // Col 2: Fields
    const renderFields = () => (
        <div className="menu-column">
            <div className="column-header">{columnHeaders[1]}</div>
            <div className="column-content">
                {!selectedCategory ? (
                    <div className="column-empty-state">Select a category</div>
                ) : (
                    selectedCategory.fields.map(field => {
                        if (mode === 'selection') {
                            // Checkbox item for Selection Mode
                            const isSelected = selectedItems.includes(field.id);
                            return (
                                <label key={field.id} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleFieldClick(field)}
                                    />
                                    <span className="label">{field.label}</span>
                                </label>
                            );
                        } else {
                            // Nav item for Filter Mode
                            const isActive = isFieldActive(field.id);
                            const selectedCount = selectedItems[field.id]?.length || 0;

                            return (
                                <div
                                    key={field.id}
                                    className={`menu-item ${selectedField?.id === field.id ? 'active' : ''}`}
                                    onClick={() => handleFieldClick(field)}
                                >
                                    <span>{field.label}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {selectedCount > 0 && <span className="count-badge">{selectedCount}</span>}
                                        <span className="arrow">›</span>
                                    </div>
                                </div>
                            );
                        }
                    })
                )}
            </div>
        </div>
    );

    // Col 3: Values (Only for Filter Mode)
    const renderValues = () => {
        if (mode === 'selection') return null;

        return (
            <div className="menu-column">
                <div className="column-header">{columnHeaders[2]}</div>
                <div className="column-content">
                    {!selectedField ? (
                        <div className="column-empty-state">Select an attribute</div>
                    ) : (
                        selectedField.options ? (
                            // Use defined options if available
                            selectedField.options.map(opt => {
                                const val = typeof opt === 'object' ? opt.value : opt;
                                const label = typeof opt === 'object' ? opt.label : opt;
                                const isSelected = (selectedItems[selectedField.id] || []).includes(val);
                                const count = getOptionCounts[val];

                                return (
                                    <label key={val} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleValueToggle(val)}
                                        />
                                        <span className="label">{label}</span>
                                        {count !== undefined && <span className="count-badge">{count}</span>}
                                    </label>
                                );
                            })
                        ) : (
                            // Infer active values from data? 
                            // For this MVP, we might only support fields with options or show a placeholder for text fields
                            <div className="column-empty-state">
                                No pre-defined options.
                                {/* Future: Add text search or range input here */}
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`cascading-menu ${mode === 'selection' ? 'selection-mode' : ''}`}>
            {renderCategories()}
            {renderFields()}
            {renderValues()}
        </div>
    );
};

export default CascadingMenu;
