import React, { useState } from 'react';
import { Search, Sun, Moon, Keyboard, Plus, LayoutGrid, Columns } from 'lucide-react';

export default function TopNavbar({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  grayscale,
  setGrayscale,
  setShowShortcutsModal,
  setShowAddModal,
  searchInputRef
}) {
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Left Section: Brand Title + Long Search Bar with Hover & Focus */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px'
            }}
          >
            CR
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Contract Review Queue
              </h1>
              <span
                style={{
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid #dbeafe'
                }}
              >
                Procurement
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Reviewer: <strong style={{ color: '#334155' }}>Priya Raman</strong> • Target: 20-40 contracts/day
            </div>
          </div>
        </div>

        {/* Search Bar (Left aligned, 380px width, Hover + Focus Glow) */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '12px',
              color: isSearchFocused ? '#2563eb' : (isSearchHovered ? '#64748b' : '#94a3b8'),
              pointerEvents: 'none',
              transition: 'color 0.2s ease'
            }}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search contracts (Press /)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onMouseEnter={() => setIsSearchHovered(true)}
            onMouseLeave={() => setIsSearchHovered(false)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              padding: '8px 14px 8px 36px',
              fontSize: '13px',
              borderRadius: '8px',
              border: isSearchFocused
                ? '1.5px solid #2563eb'
                : (isSearchHovered ? '1px solid #94a3b8' : '1px solid #cbd5e1'),
              backgroundColor: isSearchFocused ? '#ffffff' : (isSearchHovered ? '#f1f5f9' : '#f8fafc'),
              boxShadow: isSearchFocused ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
              width: '600px',
              outline: 'none',
              color: '#0f172a',
              cursor: 'text',
              transition: 'all 0.2s ease'
            }}
          />
        </div>
      </div>

      {/* Right Section: View toggles, Add Contract & utility buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* View Mode Toggle */}
        <div
          style={{
            display: 'flex',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            overflow: 'hidden'
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('split')}
            title="Split view"
            style={{
              padding: '6px 10px',
              border: 'none',
              backgroundColor: viewMode === 'split' ? '#2563eb' : '#ffffff',
              color: viewMode === 'split' ? '#ffffff' : '#64748b',
              cursor: 'pointer'
            }}
          >
            <Columns size={15} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            title="Table view"
            style={{
              padding: '6px 10px',
              border: 'none',
              backgroundColor: viewMode === 'table' ? '#2563eb' : '#ffffff',
              color: viewMode === 'table' ? '#ffffff' : '#64748b',
              cursor: 'pointer'
            }}
          >
            <LayoutGrid size={15} />
          </button>
        </div>

        {/* Add Contract Button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '7px 14px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Plus size={15} /> Add Contract
        </button>

        {/* Shortcuts Button */}
        <button
          type="button"
          onClick={() => setShowShortcutsModal(true)}
          title="Shortcuts (?)"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '6px 9px',
            color: '#475569',
            cursor: 'pointer'
          }}
        >
          <Keyboard size={15} />
        </button>

        {/* High-Contrast / Grayscale Toggle */}
        <button
          type="button"
          onClick={() => setGrayscale((prev) => !prev)}
          title="Toggle contrast"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '6px 9px',
            color: '#475569',
            cursor: 'pointer'
          }}
        >
          {grayscale ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}