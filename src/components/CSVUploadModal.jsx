import React, { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import './CSVUploadModal.css';

// Sample data for demo
const SAMPLE_EMPLOYEE_IDS = [
    'EMP0001', 'EMP0002', 'EMP0003', 'EMP0004', 'EMP0005',
    'EMP0006', 'EMP0007', 'EMP0008', 'EMP0009', 'EMP0010',
    'EMP0011', 'EMP0012', 'EMP0013', 'EMP0014', 'EMP0015',
    'INVALID1', 'INVALID2' // For demo errors
];

const SAMPLE_COMPLETE_DATA = {
    employeeIds: ['EMP0001', 'EMP0002', 'EMP0003', 'EMP0004', 'EMP0005'],
    fields: ['compensation', 'title', 'workLocation'],
    values: {
        compensation: { type: 'increase', value: 5, isPercent: true },
        title: { type: 'set', value: 'Senior Engineer' },
        workLocation: { type: 'set', value: 'San Francisco' }
    }
};

export default function CSVUploadModal({ type, onClose, onUpload }) {
    const { employees, selectedEmployees, selectedFields, fieldSchema } = useWizard();
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [previewData, setPreviewData] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        // Simulate file upload
        simulateUpload();
    };

    const simulateUpload = () => {
        setUploadedFile({ name: 'employees.csv', size: '2.5 KB' });

        if (type === 'employee_list') {
            // Simulate parsed employee IDs
            setPreviewData({
                type: 'employee_list',
                total: SAMPLE_EMPLOYEE_IDS.length,
                valid: SAMPLE_EMPLOYEE_IDS.filter(id => id.startsWith('EMP')).length,
                invalid: SAMPLE_EMPLOYEE_IDS.filter(id => !id.startsWith('EMP')).length,
                sample: SAMPLE_EMPLOYEE_IDS.slice(0, 5),
                invalidIds: SAMPLE_EMPLOYEE_IDS.filter(id => !id.startsWith('EMP'))
            });
        } else if (type === 'template') {
            // Download template with current selections
            const templateData = {
                type: 'template',
                fields: selectedFields,
                employeeCount: selectedEmployees.length
            };
            setPreviewData(templateData);
        } else if (type === 'complete') {
            setPreviewData({
                type: 'complete',
                employeeCount: SAMPLE_COMPLETE_DATA.employeeIds.length,
                fieldCount: SAMPLE_COMPLETE_DATA.fields.length,
                fields: SAMPLE_COMPLETE_DATA.fields,
                sample: SAMPLE_COMPLETE_DATA.employeeIds.slice(0, 3)
            });
        }
    };

    const handleConfirm = () => {
        if (type === 'employee_list') {
            onUpload(SAMPLE_EMPLOYEE_IDS.filter(id => id.startsWith('EMP')));
        } else if (type === 'complete') {
            onUpload(SAMPLE_COMPLETE_DATA);
        } else {
            onUpload(previewData);
        }
    };

    const downloadTemplate = () => {
        // Generate CSV content
        const selectedEmps = employees.filter(e => selectedEmployees.includes(e.id));
        const allFields = fieldSchema.categories.flatMap(c => c.fields);
        const selectedFieldObjs = allFields.filter(f => selectedFields.includes(f.id));

        let csv = 'Employee ID,Name,' + selectedFieldObjs.map(f => f.label).join(',') + '\n';
        selectedEmps.forEach(emp => {
            csv += `${emp.id},${emp.legalFirstName} ${emp.legalLastName},`;
            csv += selectedFieldObjs.map(f => emp[f.id] || '').join(',') + '\n';
        });

        // Create download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk_change_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>
                        {type === 'employee_list' && '📥 Upload Employee List'}
                        {type === 'template' && '📥 Download / Upload Template'}
                        {type === 'complete' && '📥 Upload Complete Change File'}
                    </h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {type === 'template' && !uploadedFile && (
                        <div className="template-section">
                            <p>Download a template with your selected employees and fields, make changes offline, then upload.</p>
                            <button className="btn btn-primary" onClick={downloadTemplate}>
                                📥 Download Template ({selectedEmployees.length} employees, {selectedFields.length} fields)
                            </button>
                            <div className="divider">
                                <span>then upload completed file</span>
                            </div>
                        </div>
                    )}

                    {!uploadedFile ? (
                        <div
                            className={`upload-zone ${dragActive ? 'active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={simulateUpload}
                        >
                            <div className="upload-icon">📄</div>
                            <p>Drag & drop your CSV file here</p>
                            <p className="upload-hint">or click to browse</p>
                            <p className="upload-format">
                                {type === 'employee_list' && 'CSV with Employee IDs or emails (one per row)'}
                                {type === 'template' && 'Upload the completed template CSV'}
                                {type === 'complete' && 'CSV with Employee IDs, field names, and new values'}
                            </p>
                        </div>
                    ) : (
                        <div className="upload-preview">
                            <div className="file-info">
                                <span className="file-icon">📄</span>
                                <span className="file-name">{uploadedFile.name}</span>
                                <span className="file-size">{uploadedFile.size}</span>
                                <button className="btn btn-ghost btn-sm" onClick={() => {
                                    setUploadedFile(null);
                                    setPreviewData(null);
                                }}>
                                    Remove
                                </button>
                            </div>

                            {previewData && (
                                <div className="preview-results">
                                    {previewData.type === 'employee_list' && (
                                        <>
                                            <div className="preview-stat success">
                                                <span className="stat-value">{previewData.valid}</span>
                                                <span className="stat-label">Valid employees found</span>
                                            </div>
                                            {previewData.invalid > 0 && (
                                                <div className="preview-stat warning">
                                                    <span className="stat-value">{previewData.invalid}</span>
                                                    <span className="stat-label">Not found</span>
                                                </div>
                                            )}
                                            {previewData.invalidIds.length > 0 && (
                                                <div className="alert alert-warning mt-md">
                                                    <strong>Not found:</strong> {previewData.invalidIds.join(', ')}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {previewData.type === 'complete' && (
                                        <>
                                            <div className="preview-stat success">
                                                <span className="stat-value">{previewData.employeeCount}</span>
                                                <span className="stat-label">Employees</span>
                                            </div>
                                            <div className="preview-stat info">
                                                <span className="stat-value">{previewData.fieldCount}</span>
                                                <span className="stat-label">Fields</span>
                                            </div>
                                            <div className="preview-fields">
                                                <strong>Fields detected:</strong>
                                                <div className="field-tags">
                                                    {previewData.fields.map(f => (
                                                        <span key={f} className="badge badge-plum">{f}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        disabled={!previewData}
                        onClick={handleConfirm}
                    >
                        {type === 'employee_list' && `Import ${previewData?.valid || 0} Employees`}
                        {type === 'template' && 'Apply Changes'}
                        {type === 'complete' && 'Import & Continue to Validation'}
                    </button>
                </div>
            </div>
        </div>
    );
}
