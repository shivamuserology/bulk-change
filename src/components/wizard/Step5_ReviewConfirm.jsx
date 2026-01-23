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

    const allFields = useMemo(() => fieldSchema.categories.flatMap(c => c.fields), [fieldSchema]);
    const getFieldLabel = (fieldId) => allFields.find(f => f.id === fieldId)?.label || fieldId;
    const getFieldObj = (fieldId) => allFields.find(f => f.id === fieldId);

    // Filter fields needing approval
    const fieldsNeedingApproval = useMemo(() => {
        return selectedFields.filter(fieldId => {
            const field = getFieldObj(fieldId);
            return field && getFieldPermission(field) === 'approval_required';
        });
    }, [selectedFields, getFieldPermission, allFields]);

    const needsApproval = fieldsNeedingApproval.length > 0 &&
        permissionScenario !== PERMISSION_SCENARIOS.FULL_ACCESS;

    // Formatting
    const formatEffectiveDate = () => {
        switch (effectiveDate) {
            case 'immediate': return 'Immediately';
            case 'next_pay_period': return 'Feb 1, 2026';
            case 'next_month': return 'Feb 1, 2026';
            case 'custom': return customDate || 'Custom date';
            default: return effectiveDate;
        }
    };

    const formatValue = (fieldId) => {
        const val = fieldValues[fieldId];
        if (!val) return 'Default/Unchanged';
        if (val.type === 'set') return val.value || 'Not set';
        if (val.type === 'increase') return `+${val.value}${val.isPercent ? '%' : ''}`;
        if (val.type === 'decrease') return `-${val.value}${val.isPercent ? '%' : ''}`;
        return val.value || 'Not set';
    };

    const handleSaveDraft = () => {
        saveDraft();
        alert('Draft saved successfully!');
    };

    return (
        <div className="step-container animate-fade-in">
            {/* Nav Header */}
            <div className="step-header" style={{ marginBottom: '24px' }}>
                <button className="btn btn-secondary btn-sm" onClick={prevStep}>
                    ← Back
                </button>
                <div style={{ textAlign: 'center', flex: 1 }}>
                    <h2 style={{ margin: 0 }}>Review Changes</h2>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleSaveDraft} style={{ color: 'var(--plum-deep)' }}>
                    💾 Save Draft
                </button>
            </div>

            <div className="step5-dashboard">

                {/* Stats Row */}
                <div className="step5-stats-row">
                    <div className="stat-tile">
                        <div className="icon">👥</div>
                        <div className="content">
                            <span className="value">{selectedEmployees.length}</span>
                            <span className="label">Employees</span>
                        </div>
                    </div>
                    <div className="stat-tile">
                        <div className="icon">📝</div>
                        <div className="content">
                            <span className="value">{selectedFields.length}</span>
                            <span className="label">Attributes</span>
                        </div>
                    </div>
                    <div className="stat-tile">
                        <div className="icon">📅</div>
                        <div className="content">
                            <span className="value">{formatEffectiveDate()}</span>
                            <span className="label">Effective Date</span>
                        </div>
                    </div>
                </div>

                {/* Left Column: Change Log */}
                <div className="change-log-card">
                    <div className="log-header">
                        <h4>Proposed Field Changes</h4>
                    </div>
                    <div className="log-content">
                        {selectedFields.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No field changes selected.</p>
                        ) : (
                            selectedFields.map(fieldId => (
                                <div key={fieldId} className="log-item">
                                    <div className="log-field-info">
                                        <span className="log-field-label">{getFieldLabel(fieldId)}</span>
                                        {getFieldPermission(getFieldObj(fieldId)) === 'approval_required' && (
                                            <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 'bold' }}>⚠️ NEEDS APPROVAL</span>
                                        )}
                                    </div>
                                    <div className="log-change-detail">
                                        <span className="value-pill">Current Values</span>
                                        <span className="value-arrow">→</span>
                                        <span className="value-pill new">{formatValue(fieldId)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <div className="review-sidebar">

                    {/* Impact Map */}
                    <div className="sidebar-card">
                        <div className="sidebar-card-header">
                            <h5>Downstream Sync</h5>
                        </div>
                        <div className="sidebar-card-body">
                            <div className="impact-tiles-grid">
                                <div className="impact-tile-small">
                                    <span className="icon">💰</span>
                                    <span className="name">Payroll</span>
                                    <span className="status">Auto-update</span>
                                </div>
                                <div className="impact-tile-small">
                                    <span className="icon">🏥</span>
                                    <span className="name">Benefits</span>
                                    <span className="status">Syncing</span>
                                </div>
                                <div className="impact-tile-small">
                                    <span className="icon">💬</span>
                                    <span className="name">Slack</span>
                                    <span className="status">Provision</span>
                                </div>
                                <div className="impact-tile-small">
                                    <span className="icon">📧</span>
                                    <span className="name">Google</span>
                                    <span className="status">Syncing</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="sidebar-card">
                        <div className="sidebar-card-header">
                            <h5>Communication</h5>
                        </div>
                        <div className="sidebar-card-body">
                            <div className="notify-item" onClick={() => setNotifications(n => ({ ...n, notifyEmployeesAction: !n.notifyEmployeesAction }))}>
                                <input type="checkbox" checked={notifications.notifyEmployeesAction} readOnly />
                                <div className="notify-text">
                                    <h6>Notify Employees</h6>
                                    <p>Send instructions for required tax/form updates.</p>
                                </div>
                            </div>
                            <div className="notify-item" onClick={() => setNotifications(n => ({ ...n, notifyEmployeesChange: !n.notifyEmployeesChange }))}>
                                <input type="checkbox" checked={notifications.notifyEmployeesChange} readOnly />
                                <div className="notify-text">
                                    <h6>Announcement</h6>
                                    <p>Inform employees that these changes have been applied.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Approval Box if needed */}
                    {needsApproval && (
                        <div className="sidebar-card" style={{ borderColor: '#f59e0b', background: '#fffbeb' }}>
                            <div className="sidebar-card-header" style={{ background: '#fef3c7' }}>
                                <h5 style={{ color: '#92400e' }}>Approval Required</h5>
                            </div>
                            <div className="sidebar-card-body">
                                <p style={{ fontSize: '11px', color: '#92400e', margin: 0 }}>
                                    Your team (Finance/Equity) will be notified to review restricted fields before execution.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Final Execution Section */}
                <div className="execution-controls">
                    <h3>Confirm & Finish</h3>
                    <p>
                        {needsApproval
                            ? "All changes will be queued for approval. Notifications will be sent once reviewed."
                            : `You are about to update ${selectedEmployees.length} employee records. This action cannot be undone.`}
                    </p>
                    <button className="btn-execute" onClick={nextStep}>
                        {needsApproval ? 'Submit for Approval' : '🚀 Execute Changes'}
                    </button>
                </div>

            </div>
        </div>
    );
}
