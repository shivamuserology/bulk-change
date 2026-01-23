import React, { useState, useMemo } from 'react';
import { useWizard } from '../../context/WizardContext';
import LayeredPanel from '../common/LayeredPanel';
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
        selectedEmployees
    } = useWizard();

    const applyTemplate = (template) => {
        setSelectedFields(template.fields);
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

            {/* Templates */}
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

            <div className="step-footer">
                <button className="btn btn-secondary" onClick={prevStep}>
                    ← Back
                </button>
                <button
                    className="btn btn-primary btn-lg"
                    disabled={selectedFields.length === 0}
                    onClick={nextStep}
                >
                    Continue with {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} →
                </button>
            </div>
        </div>
    );
}
