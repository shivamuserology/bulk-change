import React, { useState, useMemo } from 'react';
import { useWizard, PERMISSION_SCENARIOS } from '../../context/WizardContext';
import './Step5.css';

export default function Step5_ReviewConfirm() {
    const {
        selectedEmployees,
        selectedFields,
        fieldValues,
        effectiveDate,
        customDate,
        employees,
        fieldSchema,
        permissionScenario,
        getFieldPermission,
        nextStep,
        prevStep,
        saveDraft
    } = useWizard();

    const [notifications, setNotifications] = useState({
        notifyEmployeesAction: true,
        notifyEmployeesChange: false
    });
    const [expandedSections, setExpandedSections] = useState(['changes', 'impact']);

    const toggleSection = (section) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const allFields = fieldSchema.categories.flatMap(c => c.fields);
    const getFieldLabel = (fieldId) => allFields.find(f => f.id === fieldId)?.label || fieldId;
    const getFieldObj = (fieldId) => allFields.find(f => f.id === fieldId);

    // Check for approval required
    const fieldsNeedingApproval = useMemo(() => {
        return selectedFields.filter(fieldId => {
            const field = getFieldObj(fieldId);
            return field && getFieldPermission(field) === 'approval_required';
        });
    }, [selectedFields, getFieldPermission]);

    const needsApproval = fieldsNeedingApproval.length > 0 &&
        permissionScenario !== PERMISSION_SCENARIOS.FULL_ACCESS;

    // Format effective date
    const formatEffectiveDate = () => {
        switch (effectiveDate) {
            case 'immediate': return 'Immediately upon execution';
            case 'next_pay_period': return 'February 1, 2026 (Start of next pay period)';
            case 'next_month': return 'February 1, 2026 (First of next month)';
            case 'custom': return customDate || 'Custom date';
            default: return effectiveDate;
        }
    };

    // Format value for display
    const formatValue = (fieldId) => {
        const val = fieldValues[fieldId];
        if (!val) return 'Not set';

        if (val.type === 'set') {
            return val.value || 'Not set';
        } else if (val.type === 'increase') {
            return `+${val.value}${val.isPercent ? '%' : ''}`;
        } else if (val.type === 'decrease') {
            return `-${val.value}${val.isPercent ? '%' : ''}`;
        }
        return val.value;
    };

    const handleSaveDraft = () => {
        const draftId = saveDraft();
        alert(`Draft saved! ID: ${draftId}`);
    };

    return (
        <div className="step-container animate-fade-in">
            <div className="step-header">
                <div>
                    <h2>Review & Confirm</h2>
                    <p className="step-description">
                        Review all changes before {needsApproval ? 'submitting for approval' : 'execution'}
                    </p>
                </div>
                <div className="step-actions">
                    <button className="btn btn-secondary" onClick={handleSaveDraft}>
                        💾 Save as Draft
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="summary-stats">
                <div className="stat-card">
                    <span className="stat-value">{selectedEmployees.length}</span>
                    <span className="stat-label">Employees</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{selectedFields.length}</span>
                    <span className="stat-label">Fields</span>
                </div>
                <div className="stat-card date">
                    <span className="stat-value">📅</span>
                    <span className="stat-label">{formatEffectiveDate()}</span>
                </div>
            </div>

            {/* Changes Section */}
            <div className="review-section">
                <button
                    className="section-header"
                    onClick={() => toggleSection('changes')}
                >
                    <span className="section-toggle">
                        {expandedSections.includes('changes') ? '▼' : '▶'}
                    </span>
                    <h4>Field Changes</h4>
                    <span className="section-count">{selectedFields.length} fields</span>
                </button>

                {expandedSections.includes('changes') && (
                    <div className="section-content">
                        {selectedFields.map(fieldId => {
                            const field = getFieldObj(fieldId);
                            const permission = field ? getFieldPermission(field) : 'full';

                            return (
                                <div key={fieldId} className="change-row">
                                    <div className="change-field">
                                        <span className="field-name">{getFieldLabel(fieldId)}</span>
                                        {permission === 'approval_required' && (
                                            <span className="badge badge-warning">Needs Approval</span>
                                        )}
                                    </div>
                                    <div className="change-value">
                                        <span className="value-type">
                                            {fieldValues[fieldId]?.type === 'set' && 'Set to'}
                                            {fieldValues[fieldId]?.type === 'increase' && 'Increase by'}
                                            {fieldValues[fieldId]?.type === 'decrease' && 'Decrease by'}
                                        </span>
                                        <span className="value-text">{formatValue(fieldId)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Impact Section */}
            <div className="review-section">
                <button
                    className="section-header"
                    onClick={() => toggleSection('impact')}
                >
                    <span className="section-toggle">
                        {expandedSections.includes('impact') ? '▼' : '▶'}
                    </span>
                    <h4>Downstream Impact</h4>
                </button>

                {expandedSections.includes('impact') && (
                    <div className="section-content">
                        <div className="impact-grid">
                            <div className="impact-item">
                                <span className="impact-icon">💰</span>
                                <span className="impact-name">Payroll</span>
                                <span className="impact-status update">Will Update</span>
                            </div>
                            <div className="impact-item">
                                <span className="impact-icon">🏥</span>
                                <span className="impact-name">Benefits</span>
                                <span className="impact-status review">May Trigger Review</span>
                            </div>
                            <div className="impact-item">
                                <span className="impact-icon">💬</span>
                                <span className="impact-name">Slack</span>
                                <span className="impact-status update">Will Sync</span>
                            </div>
                            <div className="impact-item">
                                <span className="impact-icon">📧</span>
                                <span className="impact-name">Google Workspace</span>
                                <span className="impact-status update">Will Sync</span>
                            </div>
                            <div className="impact-item">
                                <span className="impact-icon">🐙</span>
                                <span className="impact-name">GitHub</span>
                                <span className="impact-status none">No Changes</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Employee Action Required */}
            <div className="review-section">
                <button
                    className="section-header"
                    onClick={() => toggleSection('employee_actions')}
                >
                    <span className="section-toggle">
                        {expandedSections.includes('employee_actions') ? '▼' : '▶'}
                    </span>
                    <h4>Employee Action Required</h4>
                </button>

                {expandedSections.includes('employee_actions') && (
                    <div className="section-content">
                        <div className="alert alert-info">
                            If location changes apply, employees may need to update their tax forms and home address.
                        </div>
                    </div>
                )}
            </div>

            {/* Notifications */}
            <div className="notifications-section card">
                <div className="card-header">
                    <h4>📧 Notifications</h4>
                </div>
                <div className="card-body">
                    <label className="notification-option">
                        <input
                            type="checkbox"
                            checked={notifications.notifyEmployeesAction}
                            onChange={(e) => setNotifications(n => ({ ...n, notifyEmployeesAction: e.target.checked }))}
                        />
                        <div className="notification-content">
                            <span className="notification-title">Notify employees of required actions</span>
                            <span className="notification-desc">Remind employees what they need to update</span>
                        </div>
                    </label>

                    <label className="notification-option">
                        <input
                            type="checkbox"
                            checked={notifications.notifyEmployeesChange}
                            onChange={(e) => setNotifications(n => ({ ...n, notifyEmployeesChange: e.target.checked }))}
                        />
                        <div className="notification-content">
                            <span className="notification-title">Notify employees of changes made</span>
                            <span className="notification-desc">Inform employees about the update</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Approval Workflow */}
            {needsApproval && (
                <div className="approval-section card">
                    <div className="card-header">
                        <h4>🔐 Approval Required</h4>
                    </div>
                    <div className="card-body">
                        <p>The following fields require approval before execution:</p>
                        <div className="approval-fields">
                            {fieldsNeedingApproval.map(fieldId => (
                                <span key={fieldId} className="badge badge-warning">
                                    {getFieldLabel(fieldId)}
                                </span>
                            ))}
                        </div>
                        <div className="approval-info">
                            <p>
                                <strong>Finance Team</strong> will be notified for Compensation changes.
                                <br />
                                <strong>Equity Admin</strong> will be notified for Equity changes.
                            </p>
                            <p className="text-muted">
                                You'll be notified when approved or if changes are requested.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="step-footer">
                <button className="btn btn-secondary" onClick={prevStep}>
                    ← Back
                </button>
                <button
                    className="btn btn-accent btn-lg"
                    onClick={nextStep}
                >
                    {needsApproval ? '🔐 Submit for Approval' : '🚀 Execute Changes'}
                </button>
            </div>
        </div>
    );
}
