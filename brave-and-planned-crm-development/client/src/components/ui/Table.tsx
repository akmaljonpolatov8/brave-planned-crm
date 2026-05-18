import React from 'react'

interface TableProps {
  headers: string[]
  rows: React.ReactNode[][]
  isLoading?: boolean
}

const Table: React.FC<TableProps> = ({ headers, rows, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bp-card">
        <div className="skeleton" style={{ height: '300px' }}></div>
      </div>
    )
  }

  return (
    <div className="bp-card" style={{ overflowX: 'auto' }}>
      <table className="bp-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
