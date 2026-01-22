import React, { useState, useEffect } from 'react';
import { useWizard } from '../../context/WizardContext';
import './Step6.css';

export default function Step6_Execute() {
    const {
        selectedEmployees,
        selectedFields,
        executeChanges,
        executionStatus,
        nextStep,
        prevStep
    } = useWizard();

    const [isExecuting, setIsExecuting] = useState(false);
    const [canCancel, setCanCancel] = useState(true);
    const [cancelled, setCancelled] = useState(false);

    const startExecution = async () => {
        setIsExecuting(true);
        setCancelled(false);
        setCanCancel(true);

        await executeChanges();

        setIsExecuting(false);

        // Auto-advance after success
        setTimeout(() => {
            nextStep();
        }, 1500);
    };

    const handleCancel = () => {
        setCancelled(true);
        setCanCancel(false);
        // In real app, would send cancel signal to backend
    };

    // Disable cancel after 50% progress
    useEffect(() => {
        if (executionStatus?.progress > 50) {
            setCanCancel(false);
        }
    }, [executionStatus?.progress]);

    return (
        <div className="step-container animate-fade-in">
            <div className="step-header">
                <div>
                    <h2>Execute Changes</h2>
                    <p className="step-description">
                        Applying changes to {selectedEmployees.length} employees
                    </p>
                </div>
            </div>

            {!isExecuting && !executionStatus ? (
                <div className="execution-start card">
                    <div className="card-body">
                        <div className="execution-ready">
                            <span className="ready-icon">🚀</span>
                            <h3>Ready to Execute</h3>
                            <p>
                                This will apply {selectedFields.length} field changes to {selectedEmployees.length} employees.
                                Changes will be propagated to all connected systems.
                            </p>
                            <div className="execution-warnings">
                                <div className="alert alert-info">
                                    <strong>Estimated time:</strong> ~{Math.ceil(selectedEmployees.length * 0.1)} seconds
                                </div>
                            </div>
                            <button
                                className="btn btn-accent btn-lg"
                                onClick={startExecution}
                            >
                                🚀 Execute Now
                            </button>
                        </div>
                    </div>
                </div>
            ) : isExecuting ? (
                <div className="execution-progress card">
                    <div className="card-body">
                        <div className="progress-container">
                            <div className="progress-header">
                                <span className="loader"></span>
                                <h3>Executing Changes...</h3>
                            </div>

                            <div className="progress-bar-large">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${executionStatus?.progress || 0}%` }}
                                ></div>
                            </div>

                            <div className="progress-info">
                                <span className="progress-count">
                                    {executionStatus?.processed || 0} of {executionStatus?.total || selectedEmployees.length}
                                </span>
                                <span className="progress-percent">
                                    {Math.round(executionStatus?.progress || 0)}%
                                </span>
                            </div>

                            {executionStatus?.currentEmployee && (
                                <div className="current-employee">
                                    Processing: {executionStatus.currentEmployee}
                                </div>
                            )}

                            <div className="execution-steps">
                                <div className={`exec-step ${(executionStatus?.progress || 0) >= 10 ? 'active' : ''}`}>
                                    <span className="exec-step-icon">📝</span>
                                    <span>Updating core records</span>
                                </div>
                                <div className={`exec-step ${(executionStatus?.progress || 0) >= 40 ? 'active' : ''}`}>
                                    <span className="exec-step-icon">💰</span>
                                    <span>Syncing to Payroll</span>
                                </div>
                                <div className={`exec-step ${(executionStatus?.progress || 0) >= 60 ? 'active' : ''}`}>
                                    <span className="exec-step-icon">🏥</span>
                                    <span>Updating Benefits</span>
                                </div>
                                <div className={`exec-step ${(executionStatus?.progress || 0) >= 80 ? 'active' : ''}`}>
                                    <span className="exec-step-icon">🔗</span>
                                    <span>Syncing third-party apps</span>
                                </div>
                            </div>

                            {canCancel && (
                                <button
                                    className="btn btn-secondary cancel-btn"
                                    onClick={handleCancel}
                                >
                                    Cancel Execution
                                </button>
                            )}

                            {cancelled && (
                                <div className="alert alert-warning mt-md">
                                    <strong>Cancellation requested.</strong> Already processed changes will remain applied.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="execution-complete card">
                    <div className="card-body">
                        <div className="complete-content">
                            <span className="complete-icon">✅</span>
                            <h3>Execution Complete!</h3>
                            <p>Redirecting to results...</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="step-footer">
                <button
                    className="btn btn-secondary"
                    onClick={prevStep}
                    disabled={isExecuting}
                >
                    ← Back
                </button>
                <div></div>
            </div>
        </div>
    );
}
