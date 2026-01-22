import React from 'react';
import { useWizard, PERMISSION_SCENARIOS, OUTCOME_SCENARIOS, ENTRY_MODES } from '../context/WizardContext';
import './DemoControlPanel.css';

export default function DemoControlPanel() {
    const {
        showDemoPanel,
        setShowDemoPanel,
        permissionScenario,
        setPermissionScenario,
        outcomeScenario,
        setOutcomeScenario,
        entryMode,
        setEntryMode,
        resetWizard,
        currentStep,
        selectedEmployees,
        selectedFields
    } = useWizard();

    if (!showDemoPanel) {
        return (
            <button
                className="demo-toggle-btn"
                onClick={() => setShowDemoPanel(true)}
                title="Show Demo Controls"
            >
                🎮
            </button>
        );
    }

    return (
        <div className="demo-panel">
            <div className="demo-panel-header">
                <span className="demo-panel-title">🎮 Demo Controls</span>
                <button
                    className="demo-close-btn"
                    onClick={() => setShowDemoPanel(false)}
                >
                    ×
                </button>
            </div>

            <div className="demo-panel-body">
                <div className="demo-section">
                    <label className="demo-label">📥 Entry Mode</label>
                    <div className="demo-options">
                        <label className="demo-option">
                            <input
                                type="radio"
                                name="entryMode"
                                checked={entryMode === ENTRY_MODES.UI_GUIDED}
                                onChange={() => setEntryMode(ENTRY_MODES.UI_GUIDED)}
                            />
                            <span>UI Guided</span>
                        </label>
                        <label className="demo-option">
                            <input
                                type="radio"
                                name="entryMode"
                                checked={entryMode === ENTRY_MODES.CSV_EMPLOYEE_LIST}
                                onChange={() => setEntryMode(ENTRY_MODES.CSV_EMPLOYEE_LIST)}
                            />
                            <span>CSV: Employee List</span>
                        </label>
                        <label className="demo-option">
                            <input
                                type="radio"
                                name="entryMode"
                                checked={entryMode === ENTRY_MODES.CSV_TEMPLATE}
                                onChange={() => setEntryMode(ENTRY_MODES.CSV_TEMPLATE)}
                            />
                            <span>CSV: Template</span>
                        </label>
                        <label className="demo-option">
                            <input
                                type="radio"
                                name="entryMode"
                                checked={entryMode === ENTRY_MODES.CSV_COMPLETE}
                                onChange={() => setEntryMode(ENTRY_MODES.CSV_COMPLETE)}
                            />
                            <span>CSV: Complete File</span>
                        </label>
                    </div>
                </div>

                <div className="demo-section">
                    <label className="demo-label">🔐 Permission Scenario</label>
                    <div className="demo-options">
                        <label className="demo-option">
                            <input
                                type="radio"
                                name="permission"
                                checked={permissionScenario === PERMISSION_SCENARIOS.FULL_ACCESS}
                                onChange={() => setPermissionScenario(PERMISSION_SCENARIOS.FULL_ACCESS)}
                            />
                            <span>Full Access</span>
                        </label>
                        <label className="demo-option">
                            <input
                                type="radio"
                                name="permission"
                                checked={permissionScenario === PERMISSION_SCENARIOS.MIXED}
                                onChange={() => setPermissionScenario(PERMISSION_SCENARIOS.MIXED)}
                            />
                            <span>Mixed (3 edit, 2 approval)</span>
                        </label>
                        <label className="demo-option">
                            <input
                                type="radio"
                                name="permission"
                                checked={permissionScenario === PERMISSION_SCENARIOS.RESTRICTED}
                                onChange={() => setPermissionScenario(PERMISSION_SCENARIOS.RESTRICTED)}
                            />
                            <span>Restricted</span>
                        </label>
                    </div>
                </div>

                <div className="demo-section">
                    <label className="demo-label">⚡ Outcome Scenario</label>
                    <div className="demo-options">
                        <label className="demo-option">
                            <input
                                type="radio"
                                name="outcome"
                                checked={outcomeScenario === OUTCOME_SCENARIOS.HAPPY_PATH}
                                onChange={() => setOutcomeScenario(OUTCOME_SCENARIOS.HAPPY_PATH)}
                            />
                            <span>Happy Path ✅</span>
                        </label>
                        <label className="demo-option">
                            <input
                                type="radio"
                                name="outcome"
                                checked={outcomeScenario === OUTCOME_SCENARIOS.WITH_WARNINGS}
                                onChange={() => setOutcomeScenario(OUTCOME_SCENARIOS.WITH_WARNINGS)}
                            />
                            <span>With Warnings ⚠️</span>
                        </label>
                        <label className="demo-option">
                            <input
                                type="radio"
                                name="outcome"
                                checked={outcomeScenario === OUTCOME_SCENARIOS.WITH_ERRORS}
                                onChange={() => setOutcomeScenario(OUTCOME_SCENARIOS.WITH_ERRORS)}
                            />
                            <span>With Errors ❌</span>
                        </label>
                        <label className="demo-option">
                            <input
                                type="radio"
                                name="outcome"
                                checked={outcomeScenario === OUTCOME_SCENARIOS.PARTIAL_FAILURE}
                                onChange={() => setOutcomeScenario(OUTCOME_SCENARIOS.PARTIAL_FAILURE)}
                            />
                            <span>Partial Failure</span>
                        </label>
                        <label className="demo-option">
                            <input
                                type="radio"
                                name="outcome"
                                checked={outcomeScenario === OUTCOME_SCENARIOS.TPA_FAILURE}
                                onChange={() => setOutcomeScenario(OUTCOME_SCENARIOS.TPA_FAILURE)}
                            />
                            <span>TPA Sync Failure</span>
                        </label>
                    </div>
                </div>

                <div className="demo-section demo-status">
                    <div className="demo-status-row">
                        <span>Step:</span>
                        <strong>{currentStep}/7</strong>
                    </div>
                    <div className="demo-status-row">
                        <span>Employees:</span>
                        <strong>{selectedEmployees.length}</strong>
                    </div>
                    <div className="demo-status-row">
                        <span>Fields:</span>
                        <strong>{selectedFields.length}</strong>
                    </div>
                </div>

                <button className="btn btn-secondary w-full" onClick={resetWizard}>
                    🔄 Reset Wizard
                </button>
            </div>
        </div>
    );
}
