import React, { useState } from 'react';
import './SelectionContextBar.css';

const SelectionContextBar = ({ count, totalCount, filters, onDownload }) => {
    const [showPopover, setShowPopover] = useState(false);

    // Get filter summary text
    const getFilterSummary = () => {
        const keys = Object.keys(filters || {});
        if (keys.length === 0) return 'All employees';
        if (keys.length === 1) return `1 filter applied`;
        return `${keys.length} filters applied`;
    };

    const hasFilters = Object.keys(filters || {}).length > 0;

    return (
        <div className="selection-context-bar">
            <div className="context-info">
                <div
                    className="context-label-container"
                    onMouseEnter={() => setShowPopover(true)}
                    onMouseLeave={() => setShowPopover(false)}
                >
                    <span className="context-icon">👥</span>
                    <span className="context-text">
                        Modifying <strong>{count}</strong> of <strong>{totalCount}</strong> employees
                    </span>
                    {hasFilters && (
                        <span className="context-filter-badge">
                            {getFilterSummary()}
                        </span>
                    )}

                    {/* Popover */}
                    {showPopover && (
                        <div className="context-popover animate-fade-in">
                            <div className="popover-header">Applied Filters</div>
                            {hasFilters ? (
                                <ul className="popover-list">
                                    {Object.entries(filters).map(([key, values]) => (
                                        <li key={key}>
                                            <strong>{key}:</strong> {values.join(', ')}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="popover-empty">No active filters</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <button className="btn-download-preview" onClick={onDownload}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Preview CSV
            </button>
        </div>
    );
};

export default SelectionContextBar;
