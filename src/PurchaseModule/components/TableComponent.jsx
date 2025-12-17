import React from "react";

const TableComponent = ({ columns, data }) => {
  return (
    <div className="overflow-y-auto max-h-[400px] border rounded-lg shadow-md">
      <table className="w-full border-collapse">
        {/* Sticky Header */}
        <thead className="sticky top-0 bg-white z-20">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="p-2 text-left border-b-2 border-black bg-white"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="odd:bg-blue-50 even:bg-white text-center"
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="p-2 border-b">
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
