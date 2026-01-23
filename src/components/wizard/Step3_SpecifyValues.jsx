import React, { useState } from 'react';
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

    // Download Logic
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

    const simulateUpload = () => {
        setUploadProgress(0);
        setIsUploaded(false);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsUploaded(true);
                    return 100;
                }
                return prev + 25;
            });
        }, 300);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        simulateUpload();
    };

    return (
        <div className="step3-container animate-fade-in">
            {/* Top Navigation Row */}
            <div className="step3-nav-header">
                <button className="btn btn-secondary btn-sm" onClick={prevStep}>
                    ← Back
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleDownload} style={{ color: 'var(--plum-deep)', fontWeight: '600' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Template
                </button>
            </div>

            {/* Title Area */}
            <div className="step3-title-area">
                <h2>Specify New Values</h2>
                <p>Upload your modified data file to proceed with validation.</p>
            </div>

            {/* Central Content */}
            <div className="step3-center-content">

                {/* Hero Upload Area */}
                <div className="upload-hero-container">
                    <div
                        className={`upload-dropzone-modern ${isDragging ? 'dragging' : ''} ${isUploaded ? 'is-uploaded' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                        onClick={() => document.getElementById('modern-upload-input').click()}
                    >
                        <input
                            type="file"
                            id="modern-upload-input"
                            hidden
                            accept=".csv"
                            onChange={simulateUpload}
                        />

                        <div className="modern-upload-icon">
                            {isUploaded ? (
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            ) : (
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                            )}
                        </div>

                        <div className="modern-upload-text">
                            <h3>{isUploaded ? 'Data Uploaded Successfully' : 'Drop your modified CSV here'}</h3>
                            <p>{isUploaded ? 'Your file has been processed and is ready for validation.' : 'or click to browse from your computer'}</p>
                        </div>

                        {!isUploaded && uploadProgress > 0 && (
                            <div className="modern-progress-container">
                                <div className="modern-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions Row */}
                <div className="modern-instructions-row">
                    <div className="instruction-tile">
                        <div className="tile-icon">⚠️</div>
                        <div className="tile-content">
                            <h5>Keep Column Headers</h5>
                            <p>Do not rename or remove any columns. We use the 'Employee ID' for mapping.</p>
                        </div>
                    </div>
                    <div className="instruction-tile">
                        <div className="tile-icon">💡</div>
                        <div className="tile-content">
                            <h5>Only Fill Changes</h5>
                            <p>Leave cells empty for attributes you don't wish to modify.</p>
                        </div>
                    </div>
                </div>

                {/* Scheduling Section */}
                <div className="schedule-minimal-container">
                    <div className="schedule-header">
                        <h4>Effective Date</h4>
                    </div>
                    <div className="minimal-date-grid">
                        <label className={`minimal-date-card ${effectiveDate === 'immediate' ? 'active' : ''}`}>
                            <input type="radio" name="eff-date" checked={effectiveDate === 'immediate'} onChange={() => setEffectiveDate('immediate')} />
                            <span className="date-label">Immediate</span>
                            <span className="date-subtext">Apply now</span>
                        </label>
                        <label className={`minimal-date-card ${effectiveDate === 'next_pay_period' ? 'active' : ''}`}>
                            <input type="radio" name="eff-date" checked={effectiveDate === 'next_pay_period'} onChange={() => setEffectiveDate('next_pay_period')} />
                            <span className="date-label">Next Period</span>
                            <span className="date-subtext">Feb 1, 2026</span>
                        </label>
                        <label className={`minimal-date-card ${effectiveDate === 'custom' ? 'active' : ''}`}>
                            <input type="radio" name="eff-date" checked={effectiveDate === 'custom'} onChange={() => setEffectiveDate('custom')} />
                            <span className="date-label">Custom Date</span>
                            <span className="date-subtext">{customDate || 'Select...'}</span>
                        </label>
                    </div>

                    {effectiveDate === 'custom' && (
                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                            <input
                                type="date"
                                className="form-input"
                                style={{ maxWidth: '200px' }}
                                value={customDate || ''}
                                onChange={(e) => setEffectiveDate('custom', e.target.value)}
                            />
                        </div>
                    )}
                </div>

            </div>

            {/* Footer Action */}
            <div className="step3-footer">
                <button
                    className="btn-premium"
                    disabled={!isUploaded}
                    onClick={nextStep}
                >
                    Continue to Validation
                </button>
            </div>
        </div>
    );
}
