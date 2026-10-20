import React from 'react';
import './TableView.css';

export default function TableView({ contracts, onSelectContract, selectedContract }) {
  const formatINR = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="tableview-container">
      <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Contract Ledger</h2>
      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Sorted by urgency & priority</p>

      <table className="tableview-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Supplier</th>
            <th>Value</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => (
            <tr
              key={c.id}
              onClick={() => onSelectContract(c)}
              className={selectedContract?.id === c.id ? 'selected-row' : ''}
            >
              <td style={{ fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>{c.id}</td>
              <td style={{ fontWeight: 600 }}>{c.title}</td>
              <td style={{ color: '#475569' }}>{c.supplier}</td>
              <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatINR(c.value)}</td>
              <td>{c.priority}</td>
              <td>{c.status}</td>
              <td>{c.dueDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}