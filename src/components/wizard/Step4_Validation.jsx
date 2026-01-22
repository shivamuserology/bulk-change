import React, { useState, useEffect } from 'react';
import { useWizard } from '../../context/WizardContext';
import './Step4.css';

export default function Step4_Validation() {
    const {
        selectedEmployees,
        selectedFields,
        fieldValues,
        validationResults,
        runValidation,
        outcomeScenario,
        nextStep,
        prevStep,
        employees,
        fieldSchema
    } = useWizard();

    const [isValidating, setIsValidating] = useState(true);
    const [progress, setProgress] = useState(0);

    // Run validation on mount
    useEffect(() => {
        setIsValidating(true);
        setProgress(0);

        // Simulate validation progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 150);

        // Run actual validation after animation
        setTimeout(() => {
            runValidation();
            setIsValidating(false);
        }, 1600);

        return () => clearInterval(interval);
    }, [runValidation]);

    const allFields = fieldSchema.categories.flatMap(c => c.fields);
    const getFieldLabel = (fieldId) => allFields.find(f => f.id === fieldId)?.label || fieldId;

    const canProceed = validationResults &&
        (validationResults.status === 'success' || validationResults.status === 'warning') &&
        (validationResults.errors?.filter(e => e.blocking).length === 0);

    return (
        <div className="step-container animate-fade-in">
            <div className="step-header">
                <div>
                    <h2>Validation</h2>
                    <p className="step-description">
                        Checking {selectedEmployees.length} employees and {selectedFields.length} fields for issues
                    </p>
                </div>
            </div>

            {isValidating ? (
                <div className="validation-loading card">
                    <div className="card-body">
                        <div className="validation-progress">
                            <div className="loader"></div>
                            <h3>Running Validation Checks...</h3>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <div className="validation-steps">
                                <div className={`val-step ${progress >= 20 ? 'done' : ''}`}>
                                    ✓ Checking business rules
                                </div>
                                <div className={`val-step ${progress >= 40 ? 'done' : ''}`}>
                                    ✓ Validating permissions
                                </div>
                                <div className={`val-step ${progress >= 60 ? 'done' : ''}`}>
                                    ✓ Checking downstream systems
                                </div>
                                <div className={`val-step ${progress >= 80 ? 'done' : ''}`}>
                                    ✓ Verifying third-party apps
                                </div>
                                <div className={`val-step ${progress >= 100 ? 'done' : ''}`}>
                                    ✓ Detecting conflicts
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="validation-results">
                    {/* Status Summary */}
                    <div className={`validation-status ${validationResults.status}`}>
                        {validationResults.status === 'success' && (
                            <>
                                <span className="status-icon">✅</span>
                                <div className="status-content">
                                    <h3>All Checks Passed</h3>
                                    <p>{selectedEmployees.length} employees ready for update</p>
                                </div>
                            </>
                        )}
                        {validationResults.status === 'warning' && (
                            <>
                                <span className="status-icon">⚠️</span>
                                <div className="status-content">
                                    <h3>Passed with Warnings</h3>
                                    <p>Review warnings below before proceeding</p>
                                </div>
                            </>
                        )}
                        {validationResults.status === 'error' && (
                            <>
                                <span className="status-icon">❌</span>
                                <div className="status-content">
                                    <h3>Validation Issues Found</h3>
                                    <p>{validationResults.failedEmployees.length} employees have issues</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Errors */}
                    {validationResults.errors?.length > 0 && (
                        <div className="validation-section">
                            <h4>❌ Errors</h4>
                            {validationResults.errors.map((error, idx) => (
                                <div key={idx} className={`validation-item error ${error.blocking ? 'blocking' : ''}`}>
                                    <div className="val-item-header">
                                        <span className="val-type">{error.type.replace(/_/g, ' ')}</span>
                                        {error.blocking && <span className="badge badge-error">Blocking</span>}
                                    </div>
                                    <p className="val-message">{error.message}</p>
                                    {error.employees.length > 0 && (
                                        <div className="val-employees">
                                            Affected: {error.employees.map(id => {
                                                const emp = employees.find(e => e.id === id);
                                                return emp ? `${emp.legalFirstName} ${emp.legalLastName} (${id})` : id;
                                            }).join(', ')}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Warnings */}
                    {validationResults.warnings?.length > 0 && (
                        <div className="validation-section">
                            <h4>⚠️ Warnings</h4>
                            {validationResults.warnings.map((warning, idx) => (
                                <div key={idx} className="validation-item warning">
                                    <div className="val-item-header">
                                        <span className="val-type">{warning.type.replace(/_/g, ' ')}</span>
                                    </div>
                                    <p className="val-message">{warning.message}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Passed Summary */}
                    {validationResults.passedEmployees?.length > 0 && (
                        <div className="validation-section">
                            <h4>✅ Validated Successfully</h4>
                            <div className="passed-summary">
                                <span className="passed-count">{validationResults.passedEmployees.length}</span>
                                <span className="passed-label">employees ready</span>
                            </div>
                        </div>
                    )}

                    {/* Systems Checked */}
                    <div className="systems-checked card">
                        <div className="card-header">
                            <h4>Systems Verified</h4>
                        </div>
                        <div className="card-body">
                            <div className="systems-grid">
                                <div className="system-check success">
                                    <span className="system-icon">💰</span>
                                    <span className="system-name">Payroll</span>
                                    <span className="system-status">✓</span>
                                </div>
                                <div className="system-check success">
                                    <span className="system-icon">🏥</span>
                                    <span className="system-name">Benefits</span>
                                    <span className="system-status">✓</span>
                                </div>
                                <div className="system-check success">
                                    <span className="system-icon">💻</span>
                                    <span className="system-name">Device Mgmt</span>
                                    <span className="system-status">✓</span>
                                </div>
                                <div className="system-check success">
                                    <span className="system-icon">💬</span>
                                    <span className="system-name">Slack</span>
                                    <span className="system-status">✓</span>
                                </div>
                                <div className="system-check success">
                                    <span className="system-icon">📧</span>
                                    <span className="system-name">Google</span>
                                    <span className="system-status">✓</span>
                                </div>
                                <div className="system-check success">
                                    <span className="system-icon">🐙</span>
                                    <span className="system-name">GitHub</span>
                                    <span className="system-status">✓</span>
                                </div>
                            </div>
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
                        <button className="btn btn-secondary">
                            Continue with {validationResults.passedEmployees.length} valid employees
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
