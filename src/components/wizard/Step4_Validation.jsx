import React, { useState, useEffect } from 'react';
import { useWizard } from '../../context/WizardContext';
import './Step4.css';

export default function Step4_Validation() {
    const {
        selectedEmployees,
        selectedFields,
        validationResults,
        runValidation,
        nextStep,
        prevStep,
        employees
    } = useWizard();

    const [isValidating, setIsValidating] = useState(true);
    const [progress, setProgress] = useState(0);

    // Run validation on mount
    useEffect(() => {
        setIsValidating(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 150);

        setTimeout(() => {
            runValidation();
            setIsValidating(false);
        }, 1600);

        return () => clearInterval(interval);
    }, [runValidation]);

    const canProceed = validationResults &&
        (validationResults.status === 'success' || validationResults.status === 'warning') &&
        (validationResults.errors?.filter(e => e.blocking).length === 0);

    return (
        <div className="step-container animate-fade-in">
            <div className="step-header">
                <div>
                    <h2>Validation Analysis</h2>
                    <p className="step-description">
                        Analyzing {selectedEmployees.length} employees and {selectedFields.length} attributes for consistency.
                    </p>
                </div>
            </div>

            {isValidating ? (
                <div className="loading-hero">
                    <div className="modern-progress-large">
                        <div className="modern-progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <h3>Performing Validation Checks</h3>
                    <p>Connecting to downstream payroll and benefit systems...</p>

                    <div className="validation-pulse">
                        <div className={`pulse-item ${progress >= 20 ? 'done' : 'active'}`}>
                            <div className="dot"></div> Business Rules
                        </div>
                        <div className={`pulse-item ${progress >= 50 ? (progress >= 80 ? 'done' : 'active') : ''}`}>
                            <div className="dot"></div> Permissions
                        </div>
                        <div className={`pulse-item ${progress >= 80 ? 'active' : ''}`}>
                            <div className="dot"></div> Conflict Detection
                        </div>
                    </div>
                </div>
            ) : (
                <div className="validation-layout">

                    {/* Main Column */}
                    <div className="validation-main-column">

                        {/* Status Hero */}
                        <div className={`premium-status-hero ${validationResults.status}`}>
                            <div className="status-icon-large">
                                {validationResults.status === 'success' ? '✅' : validationResults.status === 'warning' ? '⚠️' : '❌'}
                            </div>
                            <div className="status-text-area">
                                <h3>
                                    {validationResults.status === 'success' && 'All Checks Passed'}
                                    {validationResults.status === 'warning' && 'Validation Warning'}
                                    {validationResults.status === 'error' && 'Validation Issues Found'}
                                </h3>
                                <p>
                                    {validationResults.status === 'success' && `${selectedEmployees.length} employees are ready for the update.`}
                                    {validationResults.status === 'warning' && 'Proceed with caution. Check high-priority warnings on the right.'}
                                    {validationResults.status === 'error' && `${validationResults.failedEmployees.length} employees encountered errors that require attention.`}
                                </p>
                            </div>
                        </div>

                        {/* Systems Checked */}
                        <div className="modern-systems-card">
                            <div className="card-header">
                                <h4>Systems Verified</h4>
                            </div>
                            <div className="systems-grid-modern">
                                <div className="system-tile">
                                    <span className="icon">💰</span>
                                    <span className="name">Payroll</span>
                                    <span className="check">✓</span>
                                </div>
                                <div className="system-tile">
                                    <span className="icon">🏥</span>
                                    <span className="name">Benefits</span>
                                    <span className="check">✓</span>
                                </div>
                                <div className="system-tile">
                                    <span className="icon">💻</span>
                                    <span className="name">Device Mgmt</span>
                                    <span className="check">✓</span>
                                </div>
                                <div className="system-tile">
                                    <span className="icon">💬</span>
                                    <span className="name">Slack</span>
                                    <span className="check">✓</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="validation-sidebar">
                        <div className="sidebar-header">
                            <h4>Issues & Alerts</h4>
                        </div>
                        <div className="sidebar-content">
                            {(!validationResults.errors?.length && !validationResults.warnings?.length) ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
                                    <p style={{ fontSize: '13px' }}>Clean slate! No issues detected.</p>
                                </div>
                            ) : (
                                <>
                                    {validationResults.errors?.map((error, idx) => (
                                        <div key={`err-${idx}`} className="sidebar-list-item error">
                                            <span className="item-badge error">{error.blocking ? 'Blocking' : 'Error'}</span>
                                            <h5>{error.type.replace(/_/g, ' ')}</h5>
                                            <p>{error.message}</p>
                                            <div className="affected-list">
                                                {error.employees.length} employees affected
                                            </div>
                                        </div>
                                    ))}
                                    {validationResults.warnings?.map((warning, idx) => (
                                        <div key={`warn-${idx}`} className="sidebar-list-item warning">
                                            <span className="item-badge warning">Warning</span>
                                            <h5>{warning.type.replace(/_/g, ' ')}</h5>
                                            <p>{warning.message}</p>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                </div>
            )}

            <div className="step-footer">
                <button className="btn btn-secondary" onClick={prevStep}>
                    ← Back
                </button>
                <div className="footer-actions">
                    {validationResults?.status === 'error' && validationResults.passedEmployees.length > 0 && (
                        <button className="btn btn-secondary" style={{ marginRight: '12px' }}>
                            Continue with {validationResults.passedEmployees.length} valid
                        </button>
                    )}
                    <button
                        className="btn btn-primary btn-lg"
                        disabled={isValidating || !canProceed}
                        onClick={nextStep}
                    >
                        Review & Confirm →
                    </button>
                </div>
            </div>
        </div>
    );
}
