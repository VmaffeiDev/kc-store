export function DataTablePage({ eyebrow, title, columns, rows, action }: { eyebrow: string; title: string; columns: string[]; rows: string[][]; action?: React.ReactNode }) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="section-kicker">{eyebrow}</p><h1 className="font-display mt-2 text-5xl">{title}</h1></div>{action}</div>
      <div className="surface mt-8 overflow-x-auto bg-white p-4">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b text-xs uppercase tracking-wider text-[#777]"><tr>{columns.map((column) => <th key={column} className="py-3 pr-5">{column}</th>)}</tr></thead>
          <tbody className="divide-y">{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="py-4 pr-5">{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
