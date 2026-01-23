import React, { useState, useMemo } from 'react';
import { useWizard } from '../../context/WizardContext';
import LayeredPanel from '../common/LayeredPanel';
import SelectionContextBar from '../common/SelectionContextBar';
import './Step2.css';

// Templates for common bulk changes
const TEMPLATES = [
    {
        id: 'annual_merit',
        name: 'Annual Merit Increase',
        description: 'Compensation, Title, Level changes',
        fields: ['compensation', 'title', 'targetBonus']
    },
    {
        id: 'promotion',
        name: 'Promotion Package',
        description: 'Title, Department, Manager, Compensation',
        fields: ['title', 'department', 'manager', 'compensation', 'equity']
    },
    {
        id: 'relocation',
        name: 'Office Relocation',
        description: 'Work Location, related fields',
        fields: ['workLocation']
    }
];

export default function Step2_ChooseAttributes() {
    const {
        fieldSchema,
        selectedFields,
        setSelectedFields,
        nextStep,
        prevStep,
        selectedEmployees, // IDs
        employees,         // All data
        filters,
        getFieldPermission
    } = useWizard();

    const applyTemplate = (template) => {
        setSelectedFields(template.fields);
    };

    // Helper to get selected field permissions
    const getFieldBadgeClass = (fieldId) => {
        // Find field in schema
        for (const cat of fieldSchema.categories) {
            const field = cat.fields.find(f => f.id === fieldId);
            if (field) {
                const perm = getFieldPermission(field);
                if (perm === 'approval_required') return 'chip-warning';
                if (perm === 'no_access') return 'chip-error';
                return 'chip-success';
            }
        }
        return 'chip-neutral';
    };

    const getFieldLabel = (fieldId) => {
        for (const cat of fieldSchema.categories) {
            const field = cat.fields.find(f => f.id === fieldId);
            if (field) return field.label;
        }
        return fieldId;
    };

    // Generate and download CSV
    const handleDownloadPreview = () => {
        if (!selectedEmployees.length) return;

        // Header row
        const headers = ['Employee ID', 'Name', ...selectedFields.map(getFieldLabel)];

        // Data rows
        const rows = selectedEmployees.map(empId => {
            const emp = employees.find(e => e.id === empId);
            if (!emp) return [];

            const row = [
                emp.id,
                `${emp.legalFirstName} ${emp.legalLastName}`
            ];

            selectedFields.forEach(fieldId => {
                row.push(emp[fieldId] || '');
            });
            return row;
        });

        // CSV String
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Trigger Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('button');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `preview_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="step-container animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="step-header">
                <div>
                    <h2>Choose Attributes</h2>
                    <p className="step-description">
                        Select which fields to update for {selectedEmployees.length} employees
                    </p>
                </div>
            </div>

            {/* Context Bar */}
            <SelectionContextBar
                count={selectedEmployees.length}
                totalCount={employees.length}
                filters={filters}
                onDownload={handleDownloadPreview}
            />

            {/* Selected Attributes Summary (Grouped) */}
            {selectedFields.length > 0 && (
                <div className="selected-attributes-summary">
                    <div className="summary-header">
                        <span className="summary-label">Selected Attributes ({selectedFields.length})</span>
                    </div>
                    <div className="summary-groups">
                        {fieldSchema.categories.map(cat => {
                            const catFields = selectedFields.filter(fid =>
                                cat.fields.some(f => f.id === fid)
                            );

                            if (catFields.length === 0) return null;

                            return (
                                <div key={cat.id} className="attribute-group">
                                    <div className="group-name">{cat.name}</div>
                                    <div className="group-chips">
                                        {catFields.map(fieldId => (
                                            <span key={fieldId} className={`attribute-chip ${getFieldBadgeClass(fieldId)}`}>
                                                {getFieldLabel(fieldId)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Templates */}
            {!selectedFields.length && (
                <div className="templates-section">
                    <h4>Quick Templates</h4>
                    <div className="templates-grid">
                        {TEMPLATES.map(template => (
                            <button
                                key={template.id}
                                className="template-card"
                                onClick={() => applyTemplate(template)}
                            >
                                <span className="template-name">{template.name}</span>
                                <span className="template-desc">{template.description}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Selection Area - Using LayeredPanel */}
            <div style={{ flex: 1, minHeight: 0, marginBottom: '20px' }}>
                <LayeredPanel
                    mode="selection"
                    type="inline"
                    schema={fieldSchema}
                    selected={selectedFields}
                    onChange={setSelectedFields}
                />
            </div>

            <div className="ready-to-download-section">
                <div className="download-summary-card">
                    <div className="download-summary-info">
                        <strong>Ready to download:</strong>
                        <span>{selectedEmployees.length} employees with {selectedFields.length} attributes</span>
                    </div>
                </div>
            </div>

            <div className="step-footer">
                <button className="btn btn-secondary" onClick={prevStep}>
                    ← Back
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-ghost" onClick={nextStep}>
                        Continue with Manual Entry
                    </button>
                    <button
                        className="btn btn-primary btn-lg download-continue-btn"
                        disabled={selectedFields.length === 0}
                        onClick={() => {
                            handleDownloadPreview();
                            nextStep();
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download & Continue →
                    </button>
                </div>
            </div>
        </div>
    );
}
