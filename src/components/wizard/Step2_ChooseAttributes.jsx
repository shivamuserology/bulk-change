import React, { useState, useMemo } from 'react';
import CascadingMenu from '../common/CascadingMenu';
import { useWizard, PERMISSION_SCENARIOS } from '../../context/WizardContext';
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
        selectField,
        setSelectedFields,
        permissionScenario,
        getFieldPermission,
        nextStep,
        prevStep,
        selectedEmployees
    } = useWizard();

    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState(
        fieldSchema.categories.map(c => c.id)
    );

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const applyTemplate = (template) => {
        setSelectedFields(template.fields);
    };

    // Get permission for display
    const getPermissionBadge = (field) => {
        const permission = getFieldPermission(field);
        if (permission === 'full') return null;
        if (permission === 'approval_required') return { type: 'warning', label: 'Requires Approval' };
        if (permission === 'no_access') return { type: 'error', label: 'No Access' };
        return null;
    };

    // Filter by search
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return fieldSchema.categories;

        return fieldSchema.categories.map(cat => ({
            ...cat,
            fields: cat.fields.filter(f =>
                f.label.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(cat => cat.fields.length > 0);
    }, [fieldSchema, searchTerm]);

    // Count fields by permission
    const permissionSummary = useMemo(() => {
        const allFields = fieldSchema.categories.flatMap(c => c.fields);
        const selected = allFields.filter(f => selectedFields.includes(f.id));

        const full = selected.filter(f => getFieldPermission(f) === 'full').length;
        const approval = selected.filter(f => getFieldPermission(f) === 'approval_required').length;
        const blocked = selected.filter(f => getFieldPermission(f) === 'no_access').length;

        return { full, approval, blocked };
    }, [selectedFields, fieldSchema, getFieldPermission]);

    const hasBlockedFields = permissionSummary.blocked > 0;
    const needsApproval = permissionSummary.approval > 0;

    return (
        <div className="step-container animate-fade-in">
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

            {/* Permission Summary */}
            {selectedFields.length > 0 && (
                <div className="permission-summary">
                    {permissionSummary.full > 0 && (
                        <span className="perm-badge perm-full">
                            ✓ {permissionSummary.full} editable
                        </span>
                    )}
                    {permissionSummary.approval > 0 && (
                        <span className="perm-badge perm-approval">
                            ⏳ {permissionSummary.approval} need approval
                        </span>
                    )}
                    {permissionSummary.blocked > 0 && (
                        <span className="perm-badge perm-blocked">
                            🚫 {permissionSummary.blocked} blocked
                        </span>
                    )}
                </div>
            )}

            {/* Search */}
            <div className="field-search">
                <input
                    type="text"
                    className="form-input"
                    placeholder="Search fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Field Browser (Cascading Menu) */}
            <div className="field-browser" style={{ padding: 0, height: '400px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <CascadingMenu
                    mode="selection"
                    schema={{
                        ...fieldSchema,
                        categories: filteredCategories
                    }}
                    selectedItems={selectedFields}
                    onSelect={(itemId, type) => {
                        if (type === 'field') {
                            // Check permission
                            const field = fieldSchema.categories.flatMap(c => c.fields).find(f => f.id === itemId);
                            const permission = getFieldPermission(field);
                            if (permission !== 'no_access') {
                                selectField(itemId);
                            }
                        }
                    }}
                />
            </div>

            {hasBlockedFields && (
                <div className="alert alert-error">
                    <strong>Access Denied:</strong> You cannot modify some selected fields. They will be skipped.
                </div>
            )}

            {needsApproval && !hasBlockedFields && (
                <div className="alert alert-warning">
                    <strong>Approval Required:</strong> {permissionSummary.approval} field(s) will require approval before changes are applied.
                </div>
            )}

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
