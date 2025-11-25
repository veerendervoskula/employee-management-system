import React from "react";

const Select = ({ data, name, label, options, error, ...rest }) => {
 
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <select 
        style={name === 'color' ? {backgroundColor: data.color, fontWeight: 'bold'} : null } 
        id={name} name={name} className="form-control" {...rest}>
        <option value=""  />
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default Select;
