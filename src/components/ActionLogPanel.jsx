import React, { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import './ActionLogPanel.css';

export default function ActionLogPanel({ isOpen, onClose }) {
    const { actionLogs } = useWizard();
    const [search, setSearch] = useState('');
    const [expandedLogs, setExpandedLogs] = useState([]);

    const toggleExpand = (id) => {
        setExpandedLogs(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'selection': return '👥';
            case 'modification': return '📝';
            case 'validation': return '🔍';
            case 'execution': return '🚀';
            case 'system': return '⚙️';
            default: return '📋';
        }
    };

    const filteredLogs = actionLogs.filter(log =>
        log.title.toLowerCase().includes(search.toLowerCase()) ||
        log.type.toLowerCase().includes(search.toLowerCase())
    );

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    if (!isOpen) return null;

    return (
        <div className="log-panel-overlay" onClick={onClose}>
            <div className="log-panel-container" onClick={e => e.stopPropagation()}>
                <div className="log-panel-header">
                    <div className="header-title">
                        <h3>Action Log</h3>
                        <span className="log-count">{actionLogs.length} events</span>
                    </div>
                    <button className="close-panel-btn" onClick={onClose}>×</button>
                </div>

                <div className="log-panel-search">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="log-search-input"
                    />
                </div>

                <div className="log-list">
                    {filteredLogs.length === 0 ? (
                        <div className="empty-log">
                            <span className="empty-icon">📂</span>
                            <p>No actions logged yet.</p>
                        </div>
                    ) : (
                        filteredLogs.map(log => (
                            <div key={log.id} className={`log-entry ${expandedLogs.includes(log.id) ? 'expanded' : ''}`}>
                                <div className="log-entry-main" onClick={() => toggleExpand(log.id)}>
                                    <span className="log-type-icon">{getTypeIcon(log.type)}</span>
                                    <div className="log-title-info">
                                        <div className="log-title-row">
                                            <span className="log-title">{log.title}</span>
                                            <span className="log-time">{formatTime(log.timestamp)}</span>
                                        </div>
                                        <span className={`log-badge ${log.type}`}>{log.type}</span>
                                    </div>
                                    <span className="expand-arrow">{expandedLogs.includes(log.id) ? '▾' : '▸'}</span>
                                </div>

                                {expandedLogs.includes(log.id) && (
                                    <div className="log-details-area">
                                        <pre className="log-json">
                                            {JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
