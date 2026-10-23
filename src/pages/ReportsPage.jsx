import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Download,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ReportsPage({ contracts = [] }) {
  const navigate = useNavigate();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  // Theme Tokens for Crisp Light & Slate Dark
const theme = {
    bg: isDark ? '#0f172a' : '#f8fafc',          // Pitch black (#000000) illama soft slate navy
    cardBg: isDark ? '#172234' : '#ffffff',      // Soft dark card
    border: isDark ? '#233044' : '#e2e8f0',      // Subtle clean border
    borderLight: isDark ? '#1a2436' : '#f1f5f9',
    textMain: isDark ? '#94a3b8' : '#0f172a',    // <-- Pure white (#f4f4f5) illama glare adikadha soft slate text
    textMuted: isDark ? '#64748b' : '#64748b',   // Secondary text
    subtleBg: isDark ? '#131d2e' : '#f8fafc',
    innerHover: isDark ? '#1e2d42' : '#f1f5f9'
  };

  const [selectedPeriod, setSelectedPeriod] = useState('Quarter to Date');
  const [vendorFilter, setVendorFilter] = useState('All');
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const totalSpend = useMemo(() => {
    return contracts.reduce((acc, c) => acc + (Number(c.value) || 0), 0);
  }, [contracts]);

  const approvedCount = useMemo(() => {
    return contracts.filter((c) => c.status === 'Approved').length;
  }, [contracts]);

  const blockedCount = useMemo(() => {
    return contracts.filter((c) => c.status === 'Blocked').length;
  }, [contracts]);

  const rejectedCount = useMemo(() => {
    return contracts.filter((c) => c.status === 'Rejected').length;
  }, [contracts]);

  const newOrPendingCount = useMemo(() => {
    return contracts.filter((c) => c.status === 'New' || c.status === 'Open').length;
  }, [contracts]);

  const approvalRatio = useMemo(() => {
    if (!contracts.length) return 0;
    return Math.round((approvedCount / contracts.length) * 100);
  }, [approvedCount, contracts.length]);

  const categoryData = useMemo(() => {
    const map = {};
    contracts.forEach((c) => {
      const cat = c.category || 'Other';
      map[cat] = (map[cat] || 0) + (Number(c.value) || 0);
    });

    const colors = ['#2563eb', '#8b5cf6', '#059669', '#d97706', '#0284c7', '#64748b'];
    return Object.keys(map)
      .map((key, idx) => ({
        name: key,
        valueLakh: Math.round(map[key] / 100000),
        color: colors[idx % colors.length]
      }))
      .sort((a, b) => b.valueLakh - a.valueLakh)
      .slice(0, 5);
  }, [contracts]);

  const maxCategoryVal = useMemo(() => {
    return categoryData.length > 0 ? Math.max(...categoryData.map((d) => d.valueLakh)) : 100;
  }, [categoryData]);

  const supplierData = useMemo(() => {
    const map = {};
    contracts.forEach((c) => {
      if (!map[c.supplier]) {
        map[c.supplier] = {
          name: c.supplier,
          category: c.category || 'Procurement',
          count: 0,
          totalVal: 0,
          hasBlocked: false
        };
      }
      map[c.supplier].count += 1;
      map[c.supplier].totalVal += Number(c.value) || 0;
      if (c.status === 'Blocked') {
        map[c.supplier].hasBlocked = true;
      }
    });

    let list = Object.values(map).sort((a, b) => b.totalVal - a.totalVal);

    if (vendorFilter === 'High Exposure') {
      list = list.filter((v) => v.totalVal > 5000000);
    } else if (vendorFilter !== 'All') {
      list = list.filter((v) => v.category.toLowerCase().includes(vendorFilter.toLowerCase()));
    }

    return list.slice(0, 6);
  }, [contracts, vendorFilter]);

  const handleExportCSV = () => {
    const headers = ['ID,Supplier,Category,Title,Value(INR),Status,Priority,DueDate'];
    const rows = contracts.map((c) => 
      `"${c.id}","${c.supplier}","${c.category}","${c.title.replace(/"/g, '""')}","${c.value}","${c.status}","${c.priority}","${c.dueDate}"`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ProcureFlow_Analytics_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalDonut = contracts.length || 1;
  const approvedPct = (approvedCount / totalDonut) * 100;
  const pendingPct = (newOrPendingCount / totalDonut) * 100;
  const blockedPct = (blockedCount / totalDonut) * 100;

  const c1 = approvedPct;
  const c2 = c1 + pendingPct;
  const c3 = c2 + blockedPct;

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        backgroundColor: theme.bg,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxSizing: 'border-box',
        minWidth: 0
      }}
    >
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 style={{ fontSize: '19px', fontWeight: 800, color: theme.textMain, margin: 0 }}>
            Procurement & Spend Analytics
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: theme.textMuted }}>
            Audit turnaround times, vendor spend distributions, and review decisions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              color: theme.textMain,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option>Quarter to Date</option>
            <option>Previous Quarter</option>
            <option>Year to Date</option>
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              color: theme.textMain,
              cursor: 'pointer'
            }}
          >
            <Download size={13} color="#2563eb" /> Export CSV
          </button>
        </div>
      </div>

      {/* 2. Top Analytics Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px'
        }}
      >
        <div style={{ backgroundColor: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}`, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textMuted }}>Total Portfolio Spend</span>
            <div style={{ padding: '5px', backgroundColor: isDark ? '#111827' : '#eff6ff', borderRadius: '5px' }}>
              <CreditCard size={14} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: '19px', fontWeight: 800, color: theme.textMain, margin: '4px 0 1px' }}>
            ₹{(totalSpend / 10000000).toFixed(2)} Cr
          </div>
          <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>
            ↑ 8.4% vs last period
          </div>
        </div>

        <div style={{ backgroundColor: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}`, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textMuted }}>Average Cycle Time</span>
            <div style={{ padding: '5px', backgroundColor: isDark ? '#111827' : '#f5f3ff', borderRadius: '5px' }}>
              <Clock size={14} color="#7c3aed" />
            </div>
          </div>
          <div style={{ fontSize: '19px', fontWeight: 800, color: '#2563eb', margin: '4px 0 1px' }}>
            2.4 Days
          </div>
          <div style={{ fontSize: '10px', color: theme.textMuted }}>
            Benchmark: &lt; 3 business days
          </div>
        </div>

        <div style={{ backgroundColor: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}`, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textMuted }}>On-Time SLA Rate</span>
            <div style={{ padding: '5px', backgroundColor: isDark ? '#111827' : '#ecfdf5', borderRadius: '5px' }}>
              <CheckCircle2 size={14} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '19px', fontWeight: 800, color: '#059669', margin: '4px 0 1px' }}>
            93.8%
          </div>
          <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>
            High operational health
          </div>
        </div>

        <div style={{ backgroundColor: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}`, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textMuted }}>Approval Ratio</span>
            <div style={{ padding: '5px', backgroundColor: isDark ? '#111827' : '#eff6ff', borderRadius: '5px' }}>
              <ShieldCheck size={14} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: '19px', fontWeight: 800, color: theme.textMain, margin: '4px 0 1px' }}>
            {approvalRatio}%
          </div>
          <div style={{ fontSize: '10px', color: theme.textMuted }}>
            {approvedCount} approved out of {contracts.length}
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(300px, 1fr)',
          gap: '10px',
          alignItems: 'stretch'
        }}
      >
        <div
          style={{
            backgroundColor: theme.cardBg,
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: theme.textMain, margin: 0 }}>
              Top Spend by Category
            </h3>
            {hoveredBar && (
              <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>
                Filter: {hoveredBar} ↗
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginTop: '12px' }}>
            {categoryData.map((cat) => {
              const barWidth = Math.max(12, Math.round((cat.valueLakh / (maxCategoryVal || 1)) * 100));
              const isHovered = hoveredBar === cat.name;

              return (
                <div
                  key={cat.name}
                  onClick={() => navigate('/queue', { state: { categoryFilter: cat.name } })}
                  onMouseEnter={() => setHoveredBar(cat.name)}
                  onMouseLeave={() => setHoveredBar(null)}
                  title={`Click to filter queue by ${cat.name} (₹${cat.valueLakh}L)`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      width: '160px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isHovered ? '#2563eb' : theme.textMuted,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat.name}
                  </span>

                  <div style={{ flex: 1, backgroundColor: theme.subtleBg, borderRadius: '4px', height: '16px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        backgroundColor: cat.color,
                        borderRadius: '4px',
                        transition: 'all 0.15s ease',
                        opacity: isHovered ? 0.85 : 1
                      }}
                    />
                  </div>

                  <span style={{ width: '55px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: theme.textMain }}>
                    ₹{cat.valueLakh}L
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${theme.border}`, paddingTop: '6px', marginTop: '10px', fontSize: '9px', color: theme.textMuted }}>
            <span>₹0L</span>
            <span>₹40L</span>
            <span>₹80L</span>
            <span>₹120L</span>
            <span>₹{Math.ceil(maxCategoryVal / 20) * 20}L</span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme.cardBg,
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: theme.textMain, margin: 0 }}>
              Workflow Status Breakdown
            </h3>
            {hoveredSlice && (
              <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>
                Filter: {hoveredSlice} ↗
              </span>
            )}
          </div>

          <div
            style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              margin: '10px 0',
              background: `conic-gradient(
                #059669 0% ${c1}%,
                #2563eb ${c1}% ${c2}%,
                #dc2626 ${c2}% ${c3}%,
                #64748b ${c3}% 100%
              )`
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '18px',
                left: '18px',
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                backgroundColor: theme.cardBg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 800, color: theme.textMain }}>
                {contracts.length}
              </span>
              <span style={{ fontSize: '9px', color: theme.textMuted }}>Contracts</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', width: '100%', fontSize: '10px' }}>
            <div
              onClick={() => navigate('/queue', { state: { statusFilter: 'Approved' } })}
              onMouseEnter={() => setHoveredSlice('Approved')}
              onMouseLeave={() => setHoveredSlice(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', backgroundColor: hoveredSlice === 'Approved' ? (isDark ? '#064e3b' : '#f0fdf4') : 'transparent' }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '2px', backgroundColor: '#059669' }} />
              <span style={{ color: theme.textMuted }}>Approved:</span>
              <strong style={{ color: theme.textMain }}>{approvedCount}</strong>
            </div>

            <div
              onClick={() => navigate('/queue', { state: { statusFilter: 'New' } })}
              onMouseEnter={() => setHoveredSlice('Pending')}
              onMouseLeave={() => setHoveredSlice(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', backgroundColor: hoveredSlice === 'Pending' ? (isDark ? '#1e3a8a' : '#eff6ff') : 'transparent' }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '2px', backgroundColor: '#2563eb' }} />
              <span style={{ color: theme.textMuted }}>Pending:</span>
              <strong style={{ color: theme.textMain }}>{newOrPendingCount}</strong>
            </div>

            <div
              onClick={() => navigate('/queue', { state: { statusFilter: 'Blocked' } })}
              onMouseEnter={() => setHoveredSlice('Blocked')}
              onMouseLeave={() => setHoveredSlice(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', backgroundColor: hoveredSlice === 'Blocked' ? (isDark ? '#451a1a' : '#fef2f2') : 'transparent' }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '2px', backgroundColor: '#dc2626' }} />
              <span style={{ color: theme.textMuted }}>Blocked:</span>
              <strong style={{ color: theme.textMain }}>{blockedCount}</strong>
            </div>

            <div
              onClick={() => navigate('/queue', { state: { statusFilter: 'Rejected' } })}
              onMouseEnter={() => setHoveredSlice('Rejected')}
              onMouseLeave={() => setHoveredSlice(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', backgroundColor: hoveredSlice === 'Rejected' ? (isDark ? '#1e293b' : '#f1f5f9') : 'transparent' }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '2px', backgroundColor: '#64748b' }} />
              <span style={{ color: theme.textMuted }}>Rejected:</span>
              <strong style={{ color: theme.textMain }}>{rejectedCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Strategic Suppliers Table */}
      <div
        style={{
          backgroundColor: theme.cardBg,
          borderRadius: '8px',
          border: `1px solid ${theme.border}`,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: theme.textMain, margin: 0 }}>
            Top Strategic Suppliers by Committed Value
          </h3>

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['All', 'High Exposure', 'Supply Chain', 'Information Technology'].map((filterName) => {
              const isActive = vendorFilter === (filterName === 'All' ? 'All' : filterName);
              return (
                <button
                  key={filterName}
                  type="button"
                  onClick={() => setVendorFilter(filterName)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    borderRadius: '5px',
                    border: isActive ? '1px solid #2563eb' : `1px solid ${theme.border}`,
                    backgroundColor: isActive ? (isDark ? '#1e3a8a' : '#eff6ff') : theme.cardBg,
                    color: isActive ? '#2563eb' : theme.textMuted,
                    cursor: 'pointer'
                  }}
                >
                  {filterName === 'All' ? 'All Vendors' : filterName}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
            <thead>
              <tr style={{ color: theme.textMuted, borderBottom: `1px solid ${theme.border}`, fontSize: '10px' }}>
                <th style={{ padding: '6px 8px', fontWeight: 600 }}>Supplier Name</th>
                <th style={{ padding: '6px 8px', fontWeight: 600 }}>Primary Category</th>
                <th style={{ padding: '6px 8px', fontWeight: 600, textAlign: 'center' }}>Active Contracts</th>
                <th style={{ padding: '6px 8px', fontWeight: 600, textAlign: 'right' }}>Total Value</th>
                <th style={{ padding: '6px 8px', fontWeight: 600, textAlign: 'center' }}>Risk Level</th>
                <th style={{ padding: '6px 8px', fontWeight: 600, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {supplierData.map((s) => (
                <tr key={s.name} style={{ borderBottom: `1px solid ${theme.tableBorder}` }}>
                  <td style={{ padding: '8px', fontWeight: 700, color: theme.textMain }}>{s.name}</td>
                  <td style={{ padding: '8px', color: theme.textMuted }}>{s.category}</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: theme.textMain, fontWeight: 600 }}>
                    {s.count}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                    ₹{(s.totalVal / 100000).toFixed(1)} Lakh
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {s.hasBlocked ? (
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#dc2626', backgroundColor: isDark ? '#451a1a' : '#fef2f2', padding: '1px 5px', borderRadius: '4px', border: '1px solid #7f1d1d' }}>
                        High Risk
                      </span>
                    ) : (
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#059669', backgroundColor: isDark ? '#064e3b' : '#ecfdf5', padding: '1px 5px', borderRadius: '4px', border: '1px solid #047857' }}>
                        Low Risk
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => navigate('/queue', { state: { supplierFilter: s.name } })}
                      style={{
                        padding: '3px 6px',
                        fontSize: '10px',
                        fontWeight: 600,
                        backgroundColor: isDark ? '#1e3a8a' : '#eff6ff',
                        color: '#2563eb',
                        border: `1px solid ${isDark ? '#2563eb' : '#bfdbfe'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      Filter Queue <ExternalLink size={10} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}