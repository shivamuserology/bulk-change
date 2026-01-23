import React from 'react';
import { useWizard, PERMISSION_SCENARIOS } from '../../context/WizardContext';
import './MainLayout.css';

const Sidebar = () => (
    <div className="sidebar">
        <nav className="sidebar-nav">
            {/* Top Section */}
            <div className="sidebar-section">
                <div className="sidebar-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9 12l2 2 4-4" />
                    </svg>
                </div>
                <div className="sidebar-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </div>
                <div className="sidebar-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="9" cy="7" r="4" />
                        <path d="M17 11l2 2 2-2" />
                        <path d="M19 13v-2" />
                        <path d="M3 21v-2a4 4 0 0 1 4-4h4" />
                    </svg>
                </div>
                <div className="sidebar-item active">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="9" cy="7" r="4" />
                        <circle cx="17" cy="7" r="4" />
                        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    </svg>
                </div>
                <div className="sidebar-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </div>
            </div>

            <div className="sidebar-divider"></div>

            {/* Middle Section */}
            <div className="sidebar-section">
                <div className="sidebar-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                </div>
                <div className="sidebar-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18.178 8c5.096 0 5.096 8 0 8" />
                        <path d="M5.822 8c-5.096 0-5.096 8 0 8" />
                        <path d="M12 4c-2.209 0-4 1.791-4 4v8c0 2.209 1.791 4 4 4s4-1.791 4-4V8c0-2.209-1.791-4-4-4z" />
                    </svg>
                </div>
                <div className="sidebar-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </div>
                <div className="sidebar-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                </div>
                <div className="sidebar-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v12" />
                        <path d="M15 9.5c0-1.38-1.12-2.5-2.5-2.5H9c-1.38 0-2.5 1.12-2.5 2.5S7.62 12 9 12h6c1.38 0 2.5 1.12 2.5 2.5S16.38 17 15 17H8.5" />
                    </svg>
                </div>
                <div className="sidebar-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </div>
            </div>
        </nav>
        <div className="sidebar-footer">
            <div className="sidebar-avatar">
                <img src="https://ui-avatars.com/api/?name=SS&background=random&size=32" alt="User" />
            </div>
            <div className="sidebar-accent-bar"></div>
        </div>
    </div>
);

const TopNav = () => {
    const { permissionScenario } = useWizard();

    const getRoleDisplay = () => {
        switch (permissionScenario) {
            case PERMISSION_SCENARIOS.FULL_ACCESS:
                return 'Super-Admin';
            case PERMISSION_SCENARIOS.MIXED:
                return 'Department Head';
            case PERMISSION_SCENARIOS.RESTRICTED:
                return 'Employee';
            default:
                return 'Super-Admin';
        }
    };

    return (
        <div className="top-nav">
            <div className="search-bar-container">
                <div className="global-search">
                    <svg className="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input type="text" placeholder="Search for people or apps" />
                </div>
            </div>
            <div className="top-nav-actions">
                <div className="nav-action-item">
                    <span className="nav-action-text">SUPPORT</span>
                    <span className="nav-action-icon">❓</span>
                </div>
                <span className="nav-divider">|</span>
                <div className="nav-action-item">
                    <span className="nav-action-icon">🌐</span>
                </div>
                <div className="user-profile">
                    <div className="avatar">SS</div>
                    <div className="user-info">
                        <div className="name">Shivam Sethi</div>
                        <div className="role">{getRoleDisplay()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function MainLayout({ children }) {
    return (
        <div className="main-layout">
            <Sidebar />
            <div className="layout-content">
                <TopNav />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
