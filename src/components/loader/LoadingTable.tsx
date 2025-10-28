type LoadingTableProps = {
  columns: number;
  rows?: number;
};

export function LoadingTable({ columns, rows = 5 }: LoadingTableProps) {
  return (
    <table className="border-collapse w-full">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="p-3 bg-gray-100 border-b">
              <div className="w-24 shimmer"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rIndex) => (
          <tr key={rIndex}>
            {Array.from({ length: columns }).map((_, cIndex) => (
              <td key={cIndex} className="p-3 border-b">
                <div className="w-full shimmer"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
