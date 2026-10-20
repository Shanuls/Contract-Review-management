import React from 'react';
import { Search, SplitSquareVertical, Table, Eye, Keyboard, Plus } from 'lucide-react';
import './TopNavbar.css';

export default function TopNavbar({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  tabCounts,
  viewMode,
  setViewMode,
  grayscale,
  setGrayscale,
  setShowShortcutsModal,
  setShowAddModal,
  searchInputRef
}) {
  const tabs = ['Open', 'New', 'In review', 'Blocked', 'Closed'];

  return (
    <header className="topbar-header">
      <div className="topbar-row-main">
        <div className="brand-wrapper">
          <div className="brand-badge">CR</div>
          <div>
            <div className="brand-title-wrap">
              <span className="brand-title">Contract Review Queue</span>
              <span className="brand-tag">Procurement</span>
            </div>
            <p className="brand-subtitle">Reviewer: <strong>Priya Raman</strong> • Target: 20-40 contracts/day</p>
          </div>
        </div>

        <div className="search-box-wrap">
          <Search className="search-icon" size={15} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, title, supplier... (Press / to focus)"
            className="search-input"
          />
          <kbd className="search-kbd">/</kbd>
        </div>

        <div className="topbar-actions">
          <div className="view-toggle-wrap">
            <button
              onClick={() => setViewMode('split')}
              className={`btn-toggle ${viewMode === 'split' ? 'active' : ''}`}
            >
              <SplitSquareVertical size={14} /> Split View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`btn-toggle ${viewMode === 'table' ? 'active' : ''}`}
            >
              <Table size={14} /> Table View
            </button>
          </div>

          <button
            onClick={() => setGrayscale(!grayscale)}
            className={`btn-pill-action ${grayscale ? 'active-purple' : ''}`}
          >
            <Eye size={14} /> Grayscale Check
          </button>

          <button
            onClick={() => setShowShortcutsModal(true)}
            className="btn-pill-action"
          >
            <Keyboard size={14} /> Shortcuts <kbd className="search-kbd">?</kbd>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary-action"
          >
            <Plus size={15} /> Add Contract
          </button>
        </div>
      </div>

      <div className="topbar-row-tabs">
        <div className="tabs-group">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            >
              <span>{tab}</span>
              <span className="tab-counter">{tabCounts[tab] || 0}</span>
            </button>
          ))}
        </div>
        <div className="default-sort-hint">
          <span className="live-dot"></span>
          Default Sort: <strong>Overdue First → Priority (High→Low) → Due Date</strong>
        </div>
      </div>
    </header>
  );
}