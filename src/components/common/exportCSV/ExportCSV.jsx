import React from "react";

const ExportCSV = props => {
  const handleClick = () => {
    props.onExport();
  };
  return (
    <button className="btn btn-success btn-sm" onClick={handleClick}>
      Export to CSV
    </button>
  );
};

export default ExportCSV;
