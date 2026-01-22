import React from 'react';
import { useWizard, STEPS } from '../context/WizardContext';
import './ProgressHeader.css';

export default function ProgressHeader() {
    const { currentStep, selectedEmployees, selectedFields, goToStep } = useWizard();

    const canNavigateTo = (stepId) => {
        // Can always go back
        if (stepId < currentStep) return true;
        // Can't skip ahead more than one step
        if (stepId > currentStep + 1) return false;
        // Need employees selected to go past step 1
        if (stepId > 1 && selectedEmployees.length === 0) return false;
        // Need fields selected to go past step 2
        if (stepId > 2 && selectedFields.length === 0) return false;
        return true;
    };

    return (
        <header className="progress-header">
            <div className="progress-header-content">
                <div className="progress-header-title">
                    <h1>Bulk Change</h1>
                    <span className="header-subtitle">
                        {selectedEmployees.length > 0 && (
                            <span className="count-badge">{selectedEmployees.length} employees</span>
                        )}
                        {selectedFields.length > 0 && (
                            <span className="count-badge">{selectedFields.length} fields</span>
                        )}
                    </span>
                </div>

                <nav className="progress-nav">
                    {STEPS.map((step, index) => (
                        <React.Fragment key={step.id}>
                            {index > 0 && (
                                <div className={`step-connector ${currentStep > step.id - 1 ? 'completed' : ''}`} />
                            )}
                            <button
                                className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                                onClick={() => canNavigateTo(step.id) && goToStep(step.id)}
                                disabled={!canNavigateTo(step.id)}
                            >
                                <span className="step-number">
                                    {currentStep > step.id ? '✓' : step.id}
                                </span>
                                <span className="step-label">{step.short}</span>
                            </button>
                        </React.Fragment>
                    ))}
                </nav>
            </div>
        </header>
    );
}
