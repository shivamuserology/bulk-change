import React, { useState, useMemo } from 'react';
import { useWizard, ENTRY_MODES } from '../../context/WizardContext';
import CSVUploadModal from '../CSVUploadModal';
import './Step3.css';

export default function Step3_SpecifyValues() {
    const {
        employees,
        selectedEmployees,
        selectedFields,
        fieldSchema,
        fieldValues,
        setFieldValue,
        effectiveDate,
        setEffectiveDate,
        customDate,
        nextStep,
        prevStep,
        entryMode
    } = useWizard();

    const [showCSVModal, setShowCSVModal] = useState(false);
    const [activeTab, setActiveTab] = useState('uniform'); // 'uniform' | 'cohorts'

    // Get selected field objects
    const allFields = useMemo(() =>
        fieldSchema.categories.flatMap(c => c.fields),
        [fieldSchema]
    );

    const selectedFieldObjects = useMemo(() =>
        allFields.filter(f => selectedFields.includes(f.id)),
        [allFields, selectedFields]
    );

    // Get selected employees data
    const selectedEmployeeData = useMemo(() =>
        employees.filter(e => selectedEmployees.includes(e.id)),
        [employees, selectedEmployees]
    );

    // Handle value change
    const handleValueChange = (fieldId, type, value, isPercent = false) => {
        setFieldValue(fieldId, { type, value, isPercent });
    };

    // Render input based on field type
    const renderFieldInput = (field) => {
        const currentValue = fieldValues[field.id] || { type: 'set', value: '' };

        return (
            <div className="field-value-row" key={field.id}>
                <div className="field-value-header">
                    <span className="field-value-label">{field.label}</span>
                    <span className="field-current-values">
                        Current: {getUniqueCurrentValues(field)}
                    </span>
                </div>

                <div className="field-value-controls">
                    <select
                        className="form-input form-select value-type-select"
                        value={currentValue.type}
                        onChange={(e) => handleValueChange(field.id, e.target.value, currentValue.value, currentValue.isPercent)}
                    >
                        <option value="set">Set to value</option>
                        {field.type === 'currency' || field.type === 'number' ? (
                            <>
                                <option value="increase">Increase by</option>
                                <option value="decrease">Decrease by</option>
                            </>
                        ) : null}
                        {field.type === 'text' && (
                            <option value="replace">Find & Replace</option>
                        )}
                    </select>

                    {field.type === 'dropdown' ? (
                        <select
                            className="form-input form-select"
                            value={currentValue.value}
                            onChange={(e) => handleValueChange(field.id, currentValue.type, e.target.value)}
                        >
                            <option value="">Select value...</option>
                            {field.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : field.type === 'currency' || field.type === 'number' ? (
                        <div className="numeric-input-group">
                            <input
                                type="number"
                                className="form-input"
                                placeholder={currentValue.type === 'set' ? 'New value' : 'Amount'}
                                value={currentValue.value}
                                onChange={(e) => handleValueChange(field.id, currentValue.type, e.target.value, currentValue.isPercent)}
                            />
                            {(currentValue.type === 'increase' || currentValue.type === 'decrease') && (
                                <label className="percent-toggle">
                                    <input
                                        type="checkbox"
                                        checked={currentValue.isPercent}
                                        onChange={(e) => handleValueChange(field.id, currentValue.type, currentValue.value, e.target.checked)}
                                    />
                                    <span>%</span>
                                </label>
                            )}
                            {field.type === 'currency' && <span className="input-prefix">$</span>}
                        </div>
                    ) : field.type === 'date' ? (
                        <input
                            type="date"
                            className="form-input"
                            value={currentValue.value}
                            onChange={(e) => handleValueChange(field.id, currentValue.type, e.target.value)}
                        />
                    ) : (
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter new value..."
                            value={currentValue.value}
                            onChange={(e) => handleValueChange(field.id, currentValue.type, e.target.value)}
                        />
                    )}
                </div>
            </div>
        );
    };

    // Get unique current values for a field
    const getUniqueCurrentValues = (field) => {
        const values = selectedEmployeeData.map(e => e[field.id]).filter(Boolean);
        const unique = [...new Set(values)];
        if (unique.length === 0) return 'N/A';
        if (unique.length === 1) return String(unique[0]);
        if (unique.length <= 3) return unique.join(', ');
        return `${unique.length} different values`;
    };

    const handleCSVUpload = (data) => {
        // Apply values from CSV
        setShowCSVModal(false);
    };

    // Check if all fields have values
    const allFieldsHaveValues = selectedFields.every(fieldId =>
        fieldValues[fieldId]?.value !== undefined && fieldValues[fieldId]?.value !== ''
    );

    return (
        <div className="step-container animate-fade-in">
            <div className="step-header">
                <div>
                    <h2>Specify New Values</h2>
                    <p className="step-description">
                        Define new values for {selectedFields.length} fields across {selectedEmployees.length} employees
                    </p>
                </div>
            </div>

            {/* Offline Edit Path (CSV Upload) */}
            <div className="csv-upload-prompt card">
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="csv-icon-circle">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <polyline points="9 15 12 18 15 15"></polyline>
                            </svg>
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '16px' }}>Uploaded Edited File?</h4>
                            <p style={{ margin: 0, fontSize: '13px', opacity: 0.7 }}>If you edited your downloaded template, upload it here to import all values at once.</p>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCSVModal(true)}
                    >
                        Upload Edited CSV
                    </button>
                </div>
            </div>

            <div className="separator-with-text">
                <span>OR MANUAL ENTRY</span>
            </div>

            {/* Value Input Mode Tabs */}
            <div className="value-mode-tabs">
                <button
                    className={`mode-tab ${activeTab === 'uniform' ? 'active' : ''}`}
                    onClick={() => setActiveTab('uniform')}
                >
                    Uniform Values
                </button>
                <button
                    className={`mode-tab ${activeTab === 'cohorts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cohorts')}
                >
                    Sub-Cohorts
                </button>
            </div>

            {activeTab === 'uniform' ? (
                <div className="values-form card">
                    <div className="card-body">
                        {selectedFieldObjects.map(field => renderFieldInput(field))}
                    </div>
                </div>
            ) : (
                <div className="cohorts-section card">
                    <div className="card-body">
                        <div className="cohort-info">
                            <p>Create sub-groups with different values for each group.</p>
                            <button className="btn btn-secondary">
                                + Create Sub-Cohort
                            </button>
                        </div>
                        <div className="cohort-placeholder">
                            <p>No sub-cohorts created yet. All {selectedEmployees.length} employees will receive uniform values.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Effective Date */}
            <div className="effective-date-section card">
                <div className="card-header">
                    <h4>📅 Effective Date</h4>
                </div>
                <div className="card-body">
                    <div className="date-options">
                        <label className="date-option">
                            <input
                                type="radio"
                                name="effectiveDate"
                                checked={effectiveDate === 'immediate'}
                                onChange={() => setEffectiveDate('immediate')}
                            />
                            <div className="date-option-content">
                                <span className="date-option-title">Immediately</span>
                                <span className="date-option-desc">Changes apply upon execution</span>
                            </div>
                        </label>

                        <label className="date-option">
                            <input
                                type="radio"
                                name="effectiveDate"
                                checked={effectiveDate === 'next_pay_period'}
                                onChange={() => setEffectiveDate('next_pay_period')}
                            />
                            <div className="date-option-content">
                                <span className="date-option-title">Start of Next Pay Period</span>
                                <span className="date-option-desc">February 1, 2026</span>
                            </div>
                        </label>

                        <label className="date-option">
                            <input
                                type="radio"
                                name="effectiveDate"
                                checked={effectiveDate === 'next_month'}
                                onChange={() => setEffectiveDate('next_month')}
                            />
                            <div className="date-option-content">
                                <span className="date-option-title">First of Next Month</span>
                                <span className="date-option-desc">February 1, 2026</span>
                            </div>
                        </label>

                        <label className="date-option">
                            <input
                                type="radio"
                                name="effectiveDate"
                                checked={effectiveDate === 'custom'}
                                onChange={() => setEffectiveDate('custom')}
                            />
                            <div className="date-option-content">
                                <span className="date-option-title">Specific Date</span>
                                {effectiveDate === 'custom' && (
                                    <input
                                        type="date"
                                        className="form-input custom-date-input"
                                        value={customDate || ''}
                                        onChange={(e) => setEffectiveDate('custom', e.target.value)}
                                    />
                                )}
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="step-footer">
                <button className="btn btn-secondary" onClick={prevStep}>
                    ← Back
                </button>
                <button
                    className="btn btn-primary btn-lg"
                    onClick={nextStep}
                >
                    Validate Changes →
                </button>
            </div>

            {showCSVModal && (
                <CSVUploadModal
                    type="template"
                    onClose={() => setShowCSVModal(false)}
                    onUpload={handleCSVUpload}
                />
            )}
        </div>
    );
}
