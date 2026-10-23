import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  const [activeTooltip, setActiveTooltip] = useState(null);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Review Queue', path: '/queue', icon: FileText },
    { name: 'Reports', path: '/reports', icon: BarChart3 }
  ];

  const handleToggleTooltip = (name) => {
    setActiveTooltip((prev) => (prev === name ? null : name));
  };

  return (
    <aside
      style={{
        width: '70px',
        backgroundColor: isDark ? '#000000' : '#0f172a',
        color: '#94a3b8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRight: `1px solid ${isDark ? '#1f1f1f' : '#1e293b'}`,
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {/* 1. CR Logo + Periya Font ProcureFlow Text with Proper Spacing */}
      <div
        style={{
          padding: '22px 6px 18px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '9px',
          width: '100%',
          borderBottom: `1px solid ${isDark ? '#1a1a1a' : '#1e293b'}`
        }}
        title="ProcureFlow - Contract Portal"
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '15px',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.35)'
          }}
        >
          CR
        </div>
        {/* <div
          style={{
            fontSize: '12.5px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.2px',
            textAlign: 'center',
            lineHeight: 1.2,
            whiteSpace: 'nowrap'
          }}
        > */}
          {/* ProcureFlow */}
        {/* </div> */}
      </div>

      {/* 2. Nav Icons with Spacing and Tooltips */}
      <nav
        style={{
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          flex: 1,
          width: '100%'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isTooltipVisible = activeTooltip === item.name;

          return (
            <div
              key={item.path}
              style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
              onMouseEnter={() => setActiveTooltip(item.name)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <NavLink
                to={item.path}
                onClick={() => handleToggleTooltip(item.name)}
                style={({ isActive }) => ({
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '9px',
                  textDecoration: 'none',
                  color: isActive ? '#ffffff' : '#a1a1aa',
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  transition: 'background-color 0.2s, color 0.2s'
                })}
              >
                <Icon size={20} strokeWidth={2} />
              </NavLink>

              {/* Tooltip on Hover/Click */}
              {isTooltipVisible && (
                <div
                  style={{
                    position: 'absolute',
                    left: '60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
                    pointerEvents: 'none'
                  }}
                >
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 3. Footer: Priya Raman Avatar */}
      <div
        style={{
          padding: '18px 0',
          borderTop: `1px solid ${isDark ? '#1a1a1a' : '#1e293b'}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          position: 'relative'
        }}
        onMouseEnter={() => setActiveTooltip('user')}
        onMouseLeave={() => setActiveTooltip(null)}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: isDark ? '#18181b' : '#334155',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          PR
        </div>

        {/* User Info Tooltip */}
        {activeTooltip === 'user' && (
          <div
            style={{
              position: 'absolute',
              left: '60px',
              bottom: '14px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              padding: '7px 12px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
              zIndex: 100,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>
              Priya Raman
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              Reviewer Lead
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}