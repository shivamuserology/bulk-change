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

    // Demo controls
    permissionScenario: PERMISSION_SCENARIOS.FULL_ACCESS,
    outcomeScenario: OUTCOME_SCENARIOS.HAPPY_PATH,
    entryMode: ENTRY_MODES.UI_GUIDED,

    // Drafts
    drafts: [],
    currentDraftId: null,

    // Action Logs
    actionLogs: []
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

    // Action Logs
    const addActionLog = useCallback((type, title, details = {}) => {
        const newLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            type, // 'selection' | 'modification' | 'validation' | 'execution' | 'system'
            title,
            details
        };
        setState(prev => ({
            ...prev,
            actionLogs: [newLog, ...(prev.actionLogs || [])]
        }));
    }, []);

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
        const emp = employees.find(e => e.id === employeeId);
        const name = emp ? `${emp.legalFirstName} ${emp.legalLastName}` : employeeId;

        setState(prev => {
            const isRemoving = prev.selectedEmployees.includes(employeeId);
            addActionLog(
                'selection',
                isRemoving ? `Deselected ${name}` : `Selected ${name}`,
                { employeeId, name, action: isRemoving ? 'remove' : 'add' }
            );
            return {
                ...prev,
                selectedEmployees: isRemoving
                    ? prev.selectedEmployees.filter(id => id !== employeeId)
                    : [...prev.selectedEmployees, employeeId]
            };
        });
    }, [employees, addActionLog]);

    const selectAllEmployees = useCallback((employeeIds) => {
        addActionLog('selection', `Selected all ${employeeIds.length} visible employees`, { count: employeeIds.length });
        setState(prev => ({
            ...prev,
            selectedEmployees: employeeIds
        }));
    }, [addActionLog]);

    const clearEmployees = useCallback(() => {
        addActionLog('selection', 'Cleared all selections', {});
        setState(prev => ({
            ...prev,
            selectedEmployees: []
        }));
    }, [addActionLog]);

    // Field selection
    const selectField = useCallback((fieldId) => {
        const field = fieldSchema.categories.flatMap(c => c.fields).find(f => f.id === fieldId);
        const label = field ? field.label : fieldId;

        setState(prev => {
            const isRemoving = prev.selectedFields.includes(fieldId);
            addActionLog(
                'selection',
                isRemoving ? `Removed attribute: ${label}` : `Added attribute: ${label}`,
                { fieldId, label, action: isRemoving ? 'remove' : 'add' }
            );
            return {
                ...prev,
                selectedFields: isRemoving
                    ? prev.selectedFields.filter(id => id !== fieldId)
                    : [...prev.selectedFields, fieldId]
            };
        });
    }, [fieldSchema, addActionLog]);

    const setSelectedFields = useCallback((fields) => {
        addActionLog('selection', `Bulk updated attributes (${fields.length} total)`, { count: fields.length, fields });
        setState(prev => ({
            ...prev,
            selectedFields: fields
        }));
    }, [addActionLog]);

    // Field values
    const setFieldValue = useCallback((fieldId, valueConfig) => {
        const field = fieldSchema.categories.flatMap(c => c.fields).find(f => f.id === fieldId);
        const label = field ? field.label : fieldId;

        addActionLog('modification', `Set value for ${label}`, {
            fieldId,
            label,
            type: valueConfig.type,
            value: valueConfig.value
        });

        setState(prev => ({
            ...prev,
            fieldValues: {
                ...prev.fieldValues,
                [fieldId]: valueConfig
            }
        }));
    }, [fieldSchema, addActionLog]);

    // Filter state
    const setFilters = useCallback((filters) => {
        const activeFilterCount = Object.keys(filters).length;
        if (activeFilterCount > 0) {
            addActionLog('system', `Applied ${activeFilterCount} filters`, { filters });
        }
        setState(prev => ({
            ...prev,
            filters
        }));
    }, [addActionLog]);

    // Effective date
    const setEffectiveDate = useCallback((dateType, customDate = null) => {
        addActionLog('system', `Set effective date to ${dateType}`, { dateType, customDate });
        setState(prev => ({
            ...prev,
            effectiveDate: dateType,
            customDate
        }));
    }, [addActionLog]);

    // Demo controls
    const setPermissionScenario = useCallback((scenario) => {
        addActionLog('system', `Switched permission scenario to ${scenario}`, { scenario });
        setState(prev => ({
            ...prev,
            permissionScenario: scenario
        }));
    }, [addActionLog]);

    const setOutcomeScenario = useCallback((scenario) => {
        addActionLog('system', `Switched outcome scenario to ${scenario}`, { scenario });
        setState(prev => ({
            ...prev,
            outcomeScenario: scenario
        }));
    }, [addActionLog]);

    const setEntryMode = useCallback((mode) => {
        addActionLog('system', `Switched entry mode to ${mode}`, { mode });
        setState(prev => ({
            ...prev,
            entryMode: mode,
            // Reset to appropriate step based on entry mode
            currentStep: mode === ENTRY_MODES.CSV_COMPLETE ? 4 :
                mode === ENTRY_MODES.CSV_EMPLOYEE_LIST ? 2 : 1
        }));
    }, [addActionLog]);

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

        addActionLog('validation', `Validation complete: ${results.status.toUpperCase()}`, {
            status: results.status,
            errorCount: results.errors.length,
            warningCount: results.warnings.length
        });

        setState(prev => ({
            ...prev,
            validationResults: results
        }));

        return results;
    }, [state.selectedEmployees, state.outcomeScenario, employees, addActionLog]);

    // Execution
    const executeChanges = useCallback(async () => {
        addActionLog('execution', 'Execution started', { count: state.selectedEmployees.length });

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

        addActionLog('execution', `Execution complete: ${finalStatus.status.toUpperCase()}`, finalStatus);

        setState(prev => ({
            ...prev,
            executionStatus: finalStatus
        }));

        return finalStatus;
    }, [state.selectedEmployees, state.outcomeScenario, addActionLog]);

    // Save draft
    const saveDraft = useCallback(() => {
        const draftId = `draft_${Date.now()}`;
        addActionLog('system', 'Saved draft', { draftId });
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
    }, [state, addActionLog]);

    // Load draft
    const loadDraft = useCallback((draftId) => {
        addActionLog('system', 'Loaded draft', { draftId });
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
    }, [state.drafts, addActionLog]);

    // Reset wizard
    const resetWizard = useCallback(() => {
        addActionLog('system', 'Reset Wizard', {});
        setState(prev => ({
            ...initialState,
            permissionScenario: prev.permissionScenario,
            outcomeScenario: prev.outcomeScenario,
            entryMode: prev.entryMode,
            drafts: prev.drafts,
            actionLogs: prev.actionLogs // Keep logs across hard resets in prototype
        }));
    }, [addActionLog]);

    // CSV import simulation
    const importCSVEmployees = useCallback((employeeIds) => {
        addActionLog('system', 'Imported employee list via CSV', { count: employeeIds.length });
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
    }, [employees, addActionLog]);

    const importCSVComplete = useCallback((data) => {
        addActionLog('system', 'Imported complete CSV template', { count: data.employeeIds.length });
        // Simulate full CSV import
        const { employeeIds, fields, values } = data;

        setState(prev => ({
            ...prev,
            selectedEmployees: employeeIds,
            selectedFields: fields,
            fieldValues: values,
            currentStep: 4
        }));
    }, [addActionLog]);

    const value = {
        ...state,
        employees,
        fieldSchema,
        showDemoPanel,
        setShowDemoPanel,

        // Action Logs
        addActionLog,

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
        importCSVComplete
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
