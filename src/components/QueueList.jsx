import React from 'react';
import { AlertCircle, Clock, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import './QueueList.css';

export default function QueueList({
  contracts,
  selectedContract,
  onSelectContract,
  searchQuery,
  onClearSearch,
  setActiveTab
}) {
  const formatINR = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 2)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getDueDays = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dueDate);
    target.setHours(0, 0, 0, 0);
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <aside className="queue-sidebar">
      <div className="queue-header-meta">
        <span>Showing <strong>{contracts.length}</strong> contracts</span>
        <span>Use <kbd>J</kbd> / <kbd>K</kbd> to move</span>
      </div>

      <div className="queue-items-scroll">
        {contracts.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
            {searchQuery ? (
              <>
                <p>No contracts match "{searchQuery}".</p>
                <button
                  onClick={onClearSearch}
                  style={{ marginTop: '8px', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <p>All caught up. No contracts are waiting for review.</p>
                <button
                  onClick={() => setActiveTab('Closed')}
                  style={{ marginTop: '8px', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  View closed contracts →
                </button>
              </>
            )}
          </div>
        ) : (
          contracts.map((c) => {
            const isSelected = selectedContract?.id === c.id;
            const diffDays = getDueDays(c.dueDate);
            const isOverdue = diffDays < 0;

            return (
              <div
                key={c.id}
                onClick={() => onSelectContract(c)}
                className={`queue-card-row ${isSelected ? 'selected' : ''}`}
              >
                <div className="card-top-line">
                  <div className="card-id-supplier">
                    <span className="card-id">{c.id}</span>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <span className="card-supplier">{c.supplier}</span>
                  </div>
                  <span className="card-value">{formatINR(c.value)}</span>
                </div>

                <div className="card-title">{c.title}</div>

                <div className="card-bottom-tags">
                  <div className="tags-left">
                    <span className={
                      c.priority === 'HIGH' ? 'badge-priority-high' :
                      c.priority === 'MEDIUM' ? 'badge-priority-med' : 'badge-priority-low'
                    }>
                      {c.priority === 'HIGH' && <ArrowUp size={11} />}
                      {c.priority === 'MEDIUM' && <ArrowRight size={11} />}
                      {c.priority === 'LOW' && <ArrowDown size={11} />}
                      {c.priority}
                    </span>

                    <span className={`badge-status ${c.status.toLowerCase().replace(' ', '-')}`}>
                      {c.status}
                    </span>
                  </div>

                  {isOverdue ? (
                    <span className="badge-overdue">
                      <AlertCircle size={12} /> Overdue by {Math.abs(diffDays)}d
                    </span>
                  ) : (
                    <span className="badge-due-normal">
                      <Clock size={12} /> {diffDays === 0 ? 'Due Today' : `Due in ${diffDays}d`}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}