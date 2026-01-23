import React from 'react';
import './MainLayout.css';

const Sidebar = () => (
    <div className="sidebar">
        <div className="sidebar-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#F5C518" />
                <path d="M2 17L12 22L22 17" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
        <nav className="sidebar-nav">
            <div className="sidebar-item active">
                <span className="icon">👥</span>
            </div>
            <div className="sidebar-item">
                <span className="icon">🏠</span>
            </div>
            <div className="sidebar-item">
                <span className="icon">🏢</span>
            </div>
            <div className="sidebar-item">
                <span className="icon">📱</span>
            </div>
            <div className="sidebar-item">
                <span className="icon">💰</span>
            </div>
            <div className="sidebar-item">
                <span className="icon">📊</span>
            </div>
        </nav>
        <div className="sidebar-footer">
            <div className="sidebar-item">
                <span className="icon">⚙️</span>
            </div>
        </div>
    </div>
);

const TopNav = () => (
    <div className="top-nav">
        <div className="search-bar-container">
            <div className="global-search">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Search for people or apps" />
            </div>
        </div>
        <div className="top-nav-actions">
            <span className="support-link">SUPPORT ❓</span>
            <span className="accessibility-icon">👤</span>
            <div className="user-profile">
                <div className="avatar">TH</div>
                <div className="user-info">
                    <div className="name">Tom Hanks</div>
                    <div className="role">Admin • Bubba Gump</div>
                </div>
            </div>
        </div>
    </div>
);

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
