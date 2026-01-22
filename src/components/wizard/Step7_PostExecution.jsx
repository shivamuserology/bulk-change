import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import './Step7.css';

export default function Step7_PostExecution() {
    const {
        selectedEmployees,
        selectedFields,
        executionStatus,
        resetWizard,
        employees,
        fieldSchema,
        outcomeScenario
    } = useWizard();

    const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
    const [rollbackComplete, setRollbackComplete] = useState(false);

    const status = executionStatus?.status || 'success';
    const successCount = executionStatus?.successCount || selectedEmployees.length;
    const failedCount = executionStatus?.failedCount || 0;
    const tpaStatus = executionStatus?.tpaStatus || {
        slack: 'success',
        googleWorkspace: 'success',
        github: 'success'
    };

    const handleRollback = () => {
        setShowRollbackConfirm(false);
        // Simulate rollback
        setTimeout(() => {
            setRollbackComplete(true);
        }, 1000);
    };

    const allFields = fieldSchema.categories.flatMap(c => c.fields);
    const getFieldLabel = (fieldId) => allFields.find(f => f.id === fieldId)?.label || fieldId;

    return (
        <div className="step-container animate-fade-in">
            <div className="step-header">
                <div>
                    <h2>Execution Results</h2>
                    <p className="step-description">
                        Bulk change completed at {new Date().toLocaleTimeString()}
                    </p>
                </div>
            </div>

            {rollbackComplete ? (
                <div className="rollback-complete card">
                    <div className="card-body">
                        <div className="rollback-content">
                            <span className="rollback-icon">⏪</span>
                            <h3>Rollback Complete</h3>
                            <p>All changes have been reverted to their previous values.</p>
                            <button className="btn btn-primary" onClick={resetWizard}>
                                Start New Bulk Change
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Main Status */}
                    <div className={`result-status ${status}`}>
                        {status === 'success' && (
                            <>
                                <span className="status-icon">✅</span>
                                <div className="status-content">
                                    <h3>All Changes Applied Successfully</h3>
                                    <p>{successCount} employees updated</p>
                                </div>
                            </>
                        )}
                        {status === 'partial' && (
                            <>
                                <span className="status-icon">⚠️</span>
                                <div className="status-content">
                                    <h3>Partially Completed</h3>
                                    <p>{successCount} succeeded, {failedCount} failed</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Core System Results */}
                    <div className="result-section card">
                        <div className="card-header">
                            <h4>📊 Core System Updates</h4>
                        </div>
                        <div className="card-body">
                            <div className="result-grid">
                                <div className="result-item success">
                                    <span className="result-value">{successCount}</span>
                                    <span className="result-label">Employees Updated</span>
                                </div>
                                <div className="result-item">
                                    <span className="result-value">{selectedFields.length}</span>
                                    <span className="result-label">Fields Changed</span>
                                </div>
                            </div>

                            {failedCount > 0 && (
                                <div className="failed-section">
                                    <h5>❌ Failed Updates ({failedCount})</h5>
                                    <div className="failed-list">
                                        {executionStatus?.failedEmployees?.slice(0, 5).map(empId => {
                                            const emp = employees.find(e => e.id === empId);
                                            return (
                                                <div key={empId} className="failed-item">
                                                    <span>{emp ? `${emp.legalFirstName} ${emp.legalLastName}` : empId}</span>
                                                    <button className="btn btn-sm btn-secondary">Retry</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TPA Sync Status */}
                    <div className="result-section card">
                        <div className="card-header">
                            <h4>🔗 Third-Party App Sync</h4>
                        </div>
                        <div className="card-body">
                            <div className="tpa-grid">
                                <div className={`tpa-item ${tpaStatus.slack}`}>
                                    <span className="tpa-icon">💬</span>
                                    <span className="tpa-name">Slack</span>
                                    <span className={`tpa-status ${tpaStatus.slack}`}>
                                        {tpaStatus.slack === 'success' && '✓ Synced'}
                                        {tpaStatus.slack === 'pending' && '⏳ Pending'}
                                        {tpaStatus.slack === 'failed' && '❌ Failed'}
                                    </span>
                                </div>
                                <div className={`tpa-item ${tpaStatus.googleWorkspace}`}>
                                    <span className="tpa-icon">📧</span>
                                    <span className="tpa-name">Google Workspace</span>
                                    <span className={`tpa-status ${tpaStatus.googleWorkspace}`}>
                                        {tpaStatus.googleWorkspace === 'success' && '✓ Synced'}
                                        {tpaStatus.googleWorkspace === 'pending' && '⏳ Pending (ETA: 2hrs)'}
                                        {tpaStatus.googleWorkspace === 'failed' && '❌ Failed'}
                                    </span>
                                </div>
                                <div className={`tpa-item ${tpaStatus.github}`}>
                                    <span className="tpa-icon">🐙</span>
                                    <span className="tpa-name">GitHub</span>
                                    <span className={`tpa-status ${tpaStatus.github}`}>
                                        {tpaStatus.github === 'success' && '✓ Synced'}
                                        {tpaStatus.github === 'pending' && '⏳ Pending'}
                                        {tpaStatus.github === 'failed' && '❌ Failed'}
                                    </span>
                                    {tpaStatus.github === 'failed' && (
                                        <button className="btn btn-sm btn-secondary">Retry Sync</button>
                                    )}
                                </div>
                            </div>

                            {(tpaStatus.googleWorkspace === 'pending' || tpaStatus.github === 'pending') && (
                                <div className="alert alert-info mt-md">
                                    Some syncs are still in progress. Check back later for full status.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="result-section card">
                        <div className="card-header">
                            <h4>📋 Next Steps</h4>
                        </div>
                        <div className="card-body">
                            <ul className="next-steps-list">
                                <li>
                                    <span className="step-status scheduled">📧</span>
                                    <span>Employee notifications scheduled for 9:00 AM tomorrow</span>
                                </li>
                                <li>
                                    <span className="step-status pending">📝</span>
                                    <span>Manager notifications will be sent within 1 hour</span>
                                </li>
                                <li>
                                    <span className="step-status complete">✅</span>
                                    <span>Audit log updated with change details</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Rollback Section */}
                    <div className="rollback-section card">
                        <div className="card-header">
                            <h4>⏪ Rollback</h4>
                        </div>
                        <div className="card-body">
                            <p>
                                You can rollback this entire bulk change until the next payroll run (January 31, 2026).
                                This will revert all changes for all employees and notify connected systems.
                            </p>

                            {!showRollbackConfirm ? (
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowRollbackConfirm(true)}
                                >
                                    ⏪ Rollback All Changes
                                </button>
                            ) : (
                                <div className="rollback-confirm">
                                    <div className="alert alert-warning">
                                        <strong>Are you sure?</strong> This will revert all {successCount} employee changes
                                        and trigger sync to all connected systems.
                                    </div>
                                    <div className="confirm-actions">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setShowRollbackConfirm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-error"
                                            onClick={handleRollback}
                                        >
                                            Confirm Rollback
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* View Logs */}
                    <div className="logs-link">
                        <button className="btn btn-ghost">
                            📜 View Detailed Logs & Audit Trail
                        </button>
                    </div>

                    <div className="step-footer">
                        <button className="btn btn-primary btn-lg" onClick={resetWizard}>
                            ✨ Start New Bulk Change
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
