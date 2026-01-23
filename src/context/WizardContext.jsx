import React, { createContext, useContext, useState, useCallback } from 'react';
import employeesData from '../data/employees.json';
import fieldSchema from '../data/fieldSchema.json';

const WizardContext = createContext(null);

export const STEPS = [
    { id: 1, name: 'Select Employees', short: 'Select' },
    { id: 2, name: 'Choose Attributes', short: 'Attributes' },
    { id: 3, name: 'Specify Values', short: 'Values' },
    { id: 4, name: 'Validation', short: 'Validate' },
    { id: 5, name: 'Review & Confirm', short: 'Review' },
    { id: 6, name: 'Execute', short: 'Execute' },
    { id: 7, name: 'Post-Execution', short: 'Results' }
];

// Demo control scenarios
export const PERMISSION_SCENARIOS = {
    FULL_ACCESS: 'full_access',
    MIXED: 'mixed',
    RESTRICTED: 'restricted'
};

export const OUTCOME_SCENARIOS = {
    HAPPY_PATH: 'happy_path',
    WITH_WARNINGS: 'with_warnings',
    WITH_ERRORS: 'with_errors',
    PARTIAL_FAILURE: 'partial_failure',
    TPA_FAILURE: 'tpa_failure'
};

export const ENTRY_MODES = {
    UI_GUIDED: 'ui_guided',
    CSV_EMPLOYEE_LIST: 'csv_employee_list',
    CSV_TEMPLATE: 'csv_template',
    CSV_COMPLETE: 'csv_complete'
};

const defaultActionLog = [
    {
        id: 'log_bulk_1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        status: 'success',
        type: 'bulk_change',
        summary: 'Updated 124 employees',
        details: {
            employeeCount: 124,
            fields: ['department', 'workLocation', 'title'],
            effectiveDate: 'Feb 1, 2026',
            scenario: 'happy_path'
        }
    },
    {
        id: 'log_bulk_2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        status: 'success',
        type: 'bulk_change',
        summary: 'Updated 45 employees',
        details: {
            employeeCount: 45,
            fields: ['compensation', 'equity'],
            effectiveDate: 'Immediate',
            scenario: 'with_warnings'
        }
    },
    {
        id: 'log_single_1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        status: 'success',
        type: 'single_change',
        summary: 'Updated Department for James Smith',
        details: {
            employeeId: 'EMP0001',
            employeeName: 'James Smith',
            field: 'department',
            oldValue: 'Engineering',
            newValue: 'Platform'
        }
    },
    {
        id: 'log_single_2',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'success',
        type: 'single_change',
        summary: 'Updated Work Location for Mary Johnson',
        details: {
            employeeId: 'EMP0002',
            employeeName: 'Mary Johnson',
            field: 'workLocation',
            oldValue: 'Remote',
            newValue: 'San Francisco, CA'
        }
    },
    {
        id: 'log_single_3',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        status: 'success',
        type: 'single_change',
        summary: 'Updated Job Title for Robert Brown',
        details: {
            employeeId: 'EMP0003',
            employeeName: 'Robert Brown',
            field: 'title',
            oldValue: 'Engineer',
            newValue: 'Senior Engineer'
        }
    },
    {
        id: 'log_single_4',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: 'success',
        type: 'single_change',
        summary: 'Updated Compensation for Emily White',
        details: {
            employeeId: 'EMP0004',
            employeeName: 'Emily White',
            field: 'compensation',
            oldValue: 120000,
            newValue: 135000
        }
    },
    {
        id: 'log_single_5',
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        status: 'success',
        type: 'single_change',
        summary: 'Updated Manager for Michael Green',
        details: {
            employeeId: 'EMP0005',
            employeeName: 'Michael Green',
            field: 'managerName',
            oldValue: 'Sarah Connors',
            newValue: 'John Connor'
        }
    }
];

const initialState = {
    currentStep: 1,
    selectedEmployees: [],
    filters: {}, // Add filters state
    selectedFields: [],
    fieldValues: {}, // { fieldId: { type: 'set'|'increase'|'replace', value: any, cohorts: [] } }
    effectiveDate: 'immediate',
    customDate: null,
    validationResults: null,
    executionStatus: null,
    actionLog: defaultActionLog, // Track session actions

    // Demo controls
    permissionScenario: PERMISSION_SCENARIOS.FULL_ACCESS,
    outcomeScenario: OUTCOME_SCENARIOS.HAPPY_PATH,
    entryMode: ENTRY_MODES.UI_GUIDED,

    // Drafts
    drafts: [],
    currentDraftId: null
};

export function WizardProvider({ children }) {
    const [state, setState] = useState(initialState);
    const [showDemoPanel, setShowDemoPanel] = useState(true);

    // Get all employees
    const employees = employeesData;

    // Get field permissions based on scenario
    const getFieldPermission = useCallback((field) => {
        if (state.permissionScenario === PERMISSION_SCENARIOS.FULL_ACCESS) {
            return 'full';
        }
        if (state.permissionScenario === PERMISSION_SCENARIOS.RESTRICTED) {
            return field.defaultPermission;
        }
        // Mixed: use default but some are approval_required
        return field.defaultPermission;
    }, [state.permissionScenario]);

    // Navigation
    const goToStep = useCallback((step) => {
        setState(prev => ({ ...prev, currentStep: step }));
    }, []);

    const nextStep = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentStep: Math.min(prev.currentStep + 1, STEPS.length)
        }));
    }, []);

    const prevStep = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentStep: Math.max(prev.currentStep - 1, 1)
        }));
    }, []);

    // Employee selection
    const selectEmployee = useCallback((employeeId) => {
        setState(prev => ({
            ...prev,
            selectedEmployees: prev.selectedEmployees.includes(employeeId)
                ? prev.selectedEmployees.filter(id => id !== employeeId)
                : [...prev.selectedEmployees, employeeId]
        }));
    }, []);

    const selectAllEmployees = useCallback((employeeIds) => {
        setState(prev => ({
            ...prev,
            selectedEmployees: employeeIds
        }));
    }, []);

    const clearEmployees = useCallback(() => {
        setState(prev => ({
            ...prev,
            selectedEmployees: []
        }));
    }, []);

    // Field selection
    const selectField = useCallback((fieldId) => {
        setState(prev => ({
            ...prev,
            selectedFields: prev.selectedFields.includes(fieldId)
                ? prev.selectedFields.filter(id => id !== fieldId)
                : [...prev.selectedFields, fieldId]
        }));
    }, []);

    const setSelectedFields = useCallback((fields) => {
        setState(prev => ({
            ...prev,
            selectedFields: fields
        }));
    }, []);

    // Field values
    const setFieldValue = useCallback((fieldId, valueConfig) => {
        setState(prev => ({
            ...prev,
            fieldValues: {
                ...prev.fieldValues,
                [fieldId]: valueConfig
            }
        }));
    }, []);

    // Filter state
    const setFilters = useCallback((filters) => {
        setState(prev => ({
            ...prev,
            filters
        }));
    }, []);

    // Action Log
    const addActionLogEntry = useCallback((entry) => {
        setState(prev => ({
            ...prev,
            actionLog: [
                {
                    id: `log_${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    status: 'success',
                    ...entry
                },
                ...prev.actionLog
            ]
        }));
    }, []);

    // Effective date
    const setEffectiveDate = useCallback((dateType, customDate = null) => {
        setState(prev => ({
            ...prev,
            effectiveDate: dateType,
            customDate
        }));
    }, []);

    // Demo controls
    const setPermissionScenario = useCallback((scenario) => {
        setState(prev => ({
            ...prev,
            permissionScenario: scenario
        }));
    }, []);

    const setOutcomeScenario = useCallback((scenario) => {
        setState(prev => ({
            ...prev,
            outcomeScenario: scenario
        }));
    }, []);

    const setEntryMode = useCallback((mode) => {
        setState(prev => ({
            ...prev,
            entryMode: mode,
            // Reset to appropriate step based on entry mode
            currentStep: mode === ENTRY_MODES.CSV_COMPLETE ? 4 :
                mode === ENTRY_MODES.CSV_EMPLOYEE_LIST ? 2 : 1
        }));
    }, []);

    // Validation
    const runValidation = useCallback(() => {
        // Simulate validation based on outcome scenario
        let results = {
            status: 'success',
            errors: [],
            warnings: [],
            passedEmployees: [],
            failedEmployees: []
        };

        const selectedEmps = employees.filter(e => state.selectedEmployees.includes(e.id));

        if (state.outcomeScenario === OUTCOME_SCENARIOS.HAPPY_PATH) {
            results.passedEmployees = selectedEmps;
        } else if (state.outcomeScenario === OUTCOME_SCENARIOS.WITH_WARNINGS) {
            results.status = 'warning';
            results.passedEmployees = selectedEmps;
            results.warnings = [
                { type: 'benefits_impact', message: '3 employees will trigger benefits eligibility review', employees: ['EMP0053'] },
                { type: 'tpa_delay', message: 'Google Workspace sync may take up to 24 hours', employees: [] }
            ];
        } else if (state.outcomeScenario === OUTCOME_SCENARIOS.WITH_ERRORS) {
            results.status = 'error';
            const errorEmps = selectedEmps.filter(e => e._edgeCase);
            const passedEmps = selectedEmps.filter(e => !e._edgeCase);
            results.failedEmployees = errorEmps;
            results.passedEmployees = passedEmps;
            results.errors = [
                { type: 'circular_manager', message: 'EMP0047 has circular manager reference', employees: ['EMP0047'], blocking: true },
                { type: 'invalid_email', message: 'EMP0048 has invalid email format', employees: ['EMP0048'], blocking: true },
                { type: 'salary_band', message: 'EMP0049 compensation exceeds salary band', employees: ['EMP0049'], blocking: false }
            ];
        } else {
            results.passedEmployees = selectedEmps;
        }

        setState(prev => ({
            ...prev,
            validationResults: results
        }));

        return results;
    }, [state.selectedEmployees, state.outcomeScenario, employees]);

    // Execution
    const executeChanges = useCallback(async () => {
        setState(prev => ({
            ...prev,
            executionStatus: { status: 'running', progress: 0, currentEmployee: null }
        }));

        const total = state.selectedEmployees.length;

        // Simulate progress
        for (let i = 0; i < total; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setState(prev => ({
                ...prev,
                executionStatus: {
                    status: 'running',
                    progress: ((i + 1) / total) * 100,
                    currentEmployee: state.selectedEmployees[i],
                    processed: i + 1,
                    total
                }
            }));
        }

        // Final status based on scenario
        let finalStatus;
        if (state.outcomeScenario === OUTCOME_SCENARIOS.PARTIAL_FAILURE) {
            finalStatus = {
                status: 'partial',
                successCount: Math.floor(total * 0.9),
                failedCount: Math.ceil(total * 0.1),
                failedEmployees: state.selectedEmployees.slice(-Math.ceil(total * 0.1)),
                tpaStatus: {
                    slack: 'success',
                    googleWorkspace: 'success',
                    github: 'success'
                }
            };
        } else if (state.outcomeScenario === OUTCOME_SCENARIOS.TPA_FAILURE) {
            finalStatus = {
                status: 'success',
                successCount: total,
                failedCount: 0,
                tpaStatus: {
                    slack: 'success',
                    googleWorkspace: 'pending',
                    github: 'failed'
                }
            };
        } else {
            finalStatus = {
                status: 'success',
                successCount: total,
                failedCount: 0,
                tpaStatus: {
                    slack: 'success',
                    googleWorkspace: 'success',
                    github: 'success'
                }
            };
        }

        setState(prev => ({
            ...prev,
            executionStatus: finalStatus
        }));

        // Log the action
        addActionLogEntry({
            type: 'bulk_change',
            summary: `Updated ${state.selectedEmployees.length} employees`,
            details: {
                employeeCount: state.selectedEmployees.length,
                fields: state.selectedFields,
                effectiveDate: state.effectiveDate,
                scenario: state.outcomeScenario
            }
        });

        return finalStatus;
    }, [state.selectedEmployees, state.outcomeScenario]);

    // Save draft
    const saveDraft = useCallback(() => {
        const draftId = `draft_${Date.now()}`;
        const draft = {
            id: draftId,
            savedAt: new Date().toISOString(),
            selectedEmployees: state.selectedEmployees,
            selectedFields: state.selectedFields,
            fieldValues: state.fieldValues,
            effectiveDate: state.effectiveDate,
            currentStep: state.currentStep
        };

        setState(prev => ({
            ...prev,
            drafts: [...prev.drafts, draft],
            currentDraftId: draftId
        }));

        return draftId;
    }, [state]);

    // Load draft
    const loadDraft = useCallback((draftId) => {
        const draft = state.drafts.find(d => d.id === draftId);
        if (draft) {
            setState(prev => ({
                ...prev,
                selectedEmployees: draft.selectedEmployees,
                selectedFields: draft.selectedFields,
                fieldValues: draft.fieldValues,
                effectiveDate: draft.effectiveDate,
                currentStep: draft.currentStep,
                currentDraftId: draftId
            }));
        }
    }, [state.drafts]);

    // Reset wizard
    const resetWizard = useCallback(() => {
        setState(prev => ({
            ...initialState,
            permissionScenario: prev.permissionScenario,
            outcomeScenario: prev.outcomeScenario,
            entryMode: prev.entryMode,
            drafts: prev.drafts
        }));
    }, []);

    // CSV import simulation
    const importCSVEmployees = useCallback((employeeIds) => {
        // Simulate CSV import with validation
        const validIds = employeeIds.filter(id => employees.find(e => e.id === id));
        const invalidIds = employeeIds.filter(id => !employees.find(e => e.id === id));

        setState(prev => ({
            ...prev,
            selectedEmployees: validIds,
            currentStep: 2
        }));

        return {
            valid: validIds.length,
            invalid: invalidIds.length,
            invalidIds
        };
    }, [employees]);

    const importCSVComplete = useCallback((data) => {
        // Simulate full CSV import
        const { employeeIds, fields, values } = data;

        setState(prev => ({
            ...prev,
            selectedEmployees: employeeIds,
            selectedFields: fields,
            fieldValues: values,
            currentStep: 4
        }));
    }, []);

    const value = {
        ...state,
        employees,
        fieldSchema,
        showDemoPanel,
        setShowDemoPanel,

        // Navigation
        goToStep,
        nextStep,
        prevStep,

        // Employee selection
        selectEmployee,
        selectAllEmployees,
        clearEmployees,

        // Field selection
        selectField,
        setSelectedFields,
        getFieldPermission,

        // Filters
        setFilters,

        // Field values
        setFieldValue,
        setEffectiveDate,

        // Demo controls
        setPermissionScenario,
        setOutcomeScenario,
        setEntryMode,

        // Actions
        runValidation,
        executeChanges,
        saveDraft,
        loadDraft,
        resetWizard,

        // CSV imports
        importCSVEmployees,
        importCSVComplete,

        // Action Log
        addActionLogEntry,

        revertAction: useCallback((logId) => {
            setState(prev => {
                const logEntry = prev.actionLog.find(l => l.id === logId);
                if (!logEntry || logEntry.status === 'reverted') return prev;

                const newLog = prev.actionLog.map(l =>
                    l.id === logId ? { ...l, status: 'reverted' } : l
                );

                return {
                    ...prev,
                    actionLog: [
                        {
                            id: `log_revert_${Date.now()}`,
                            timestamp: new Date().toISOString(),
                            status: 'success',
                            type: 'revert',
                            summary: `Reverted: ${logEntry.summary}`,
                            details: { revertedLogId: logId }
                        },
                        ...newLog
                    ]
                };
            });
        }, [])
    };

    return (
        <WizardContext.Provider value={value}>
            {children}
        </WizardContext.Provider>
    );
}

export function useWizard() {
    const context = useContext(WizardContext);
    if (!context) {
        throw new Error('useWizard must be used within a WizardProvider');
    }
    return context;
}
