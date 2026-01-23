import React, { useState, useMemo } from 'react';
import { useWizard } from '../../context/WizardContext';
import './Step3.css';

export default function Step3_SpecifyValues() {
    const {
        employees,
        selectedEmployees,
        selectedFields,
        fieldSchema,
        effectiveDate,
        setEffectiveDate,
        customDate,
        nextStep,
        prevStep
    } = useWizard();

    const [isUploaded, setIsUploaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const getFieldLabel = (fieldId) => {
        for (const cat of fieldSchema.categories) {
            const field = cat.fields.find(f => f.id === fieldId);
            if (field) return field.label;
        }
        return fieldId;
    };

    // Download Logic (same as Step 2)
    const handleDownload = () => {
        if (!selectedEmployees.length) return;

        const headers = ['Employee ID', 'Name', ...selectedFields.map(getFieldLabel)];
        const rows = selectedEmployees.map(empId => {
            const emp = employees.find(e => e.id === empId);
            if (!emp) return [];
            const row = [emp.id, `${emp.legalFirstName} ${emp.legalLastName}`];
            selectedFields.forEach(fieldId => { row.push(emp[fieldId] || ''); });
            return row;
        });

        const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulk_change_data_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e) => {
        simulateUpload();
    };

    const simulateUpload = () => {
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsUploaded(true);
                    return 100;
                }
                return prev + 20;
            });
        }, 200);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        simulateUpload();
    };

    return (
        <div className="step-container animate-fade-in">
            <div className="step-header">
                <div>
                    <h2>Specify New Values</h2>
                    <p className="step-description">
                        Modify data offline and upload the completed CSV for validation.
                    </p>
                </div>
            </div>

            <div className="upload-download-content">
                <div className="upload-download-container">

                    {/* Step 1: Download */}
                    <div className="revamp-section">
                        <h3><span className="section-number">1</span> Download Current Data</h3>
                        <div className="download-card">
                            <div className="download-info">
                                <h4>Pre-filled Template</h4>
                                <p>Contains {selectedEmployees.length} employees and {selectedFields.length} selected attributes.</p>
                            </div>
                            <button className="btn btn-secondary" onClick={handleDownload}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download CSV Template
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Upload */}
                    <div className="revamp-section">
                        <h3><span className="section-number">2</span> Upload Modified Data</h3>
                        <div
                            className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${isUploaded ? 'success' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={onDrop}
                            onClick={() => document.getElementById('csv-upload').click()}
                        >
                            <input
                                type="file"
                                id="csv-upload"
                                hidden
                                accept=".csv"
                                onChange={handleFileUpload}
                            />

                            <div className="upload-icon">
                                {isUploaded ? '✅' : '📤'}
                            </div>

                            <div className="upload-hint">
                                {isUploaded ? (
                                    <>
                                        <h4>File Uploaded Successfully!</h4>
                                        <p>Click or drag to replace the file.</p>
                                    </>
                                ) : uploadProgress > 0 ? (
                                    <div style={{ width: '100%', maxWidth: '300px' }}>
                                        <h4>Uploading... {uploadProgress}%</h4>
                                        <div style={{ height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden', marginTop: '10px' }}>
                                            <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--plum-deep)', transition: 'width 0.2s' }}></div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h4>Click or drag CSV file here to upload</h4>
                                        <p>Only .csv files are supported. Max size 10MB.</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="revamp-section">
                        <h3>Pre-execution Checklist</h3>
                        <div className="instructions-grid">
                            <div className="instruction-card">
                                <h5><span className="tip-icon">⚠️</span> Critical Rules</h5>
                                <ul>
                                    <li><strong>Maintain ID column:</strong> Do not change or remove the 'Employee ID' column.</li>
                                    <li><strong>Header names:</strong> Keep the header row exactly as it is in the downloaded file.</li>
                                    <li><strong>File format:</strong> Save your file as a .CSV (Comma Separated Values) only.</li>
                                </ul>
                            </div>
                            <div className="instruction-card">
                                <h5><span className="tip-icon">💡</span> Pro Tips</h5>
                                <ul>
                                    <li><strong>Empty Cells:</strong> Leave cells empty if you don't want to change that specific attribute for an employee.</li>
                                    <li><strong>Date Formatting:</strong> Ensure all dates are in YYYY-MM-DD format to avoid validation errors.</li>
                                    <li><strong>Validation:</strong> The next step will run a full validation on your data before committing.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Effective Date */}
                    <div className="revamp-section">
                        <h3><span className="section-number">3</span> Schedule Changes</h3>
                        <div className="effective-date-section card">
                            <div className="card-body">
                                <div className="date-options">
                                    <label className="date-option">
                                        <input
                                            type="radio"
                                            name="effectiveDate"
                                            checked={effectiveDate === 'immediate'}
                                            onChange={() => setEffectiveDate('immediate')}
                                        />
                                        <div className="date-option-content">
                                            <span className="date-option-title">Immediately</span>
                                            <span className="date-option-desc">Changes apply upon execution</span>
                                        </div>
                                    </label>

                                    <label className="date-option">
                                        <input
                                            type="radio"
                                            name="effectiveDate"
                                            checked={effectiveDate === 'next_pay_period'}
                                            onChange={() => setEffectiveDate('next_pay_period')}
                                        />
                                        <div className="date-option-content">
                                            <span className="date-option-title">Next Pay Period</span>
                                            <span className="date-option-desc">February 1, 2026</span>
                                        </div>
                                    </label>

                                    <label className="date-option">
                                        <input
                                            type="radio"
                                            name="effectiveDate"
                                            checked={effectiveDate === 'custom'}
                                            onChange={() => setEffectiveDate('custom')}
                                        />
                                        <div className="date-option-content">
                                            <span className="date-option-title">Specific Date</span>
                                            {effectiveDate === 'custom' && (
                                                <input
                                                    type="date"
                                                    className="form-input"
                                                    style={{ marginTop: '8px' }}
                                                    value={customDate || ''}
                                                    onChange={(e) => setEffectiveDate('custom', e.target.value)}
                                                />
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="step-footer">
                <button className="btn btn-secondary" onClick={prevStep}>
                    ← Back
                </button>
                <button
                    className="btn btn-primary btn-lg"
                    disabled={!isUploaded}
                    onClick={nextStep}
                >
                    Continue to Validation →
                </button>
            </div>
        </div>
    );
}
