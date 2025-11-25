import React from "react";
import PropTypes from 'prop-types';

const Radio = ({ name, label, data, error, onChange, disabled, ...rest }) => {
  const positiveId = `${name}-yes`;
  const negativeId = `${name}-no`;

  return (
    <div className="form-group" role="radiogroup" aria-labelledby={`${name}-label`}>
      <span id={`${name}-label`} className="d-none">{label}</span>
      <div className="custom-control custom-radio custom-control-inline">
        <input
          {...rest}
          checked={data === true}
          type="radio"
          role={positiveId}
          id={positiveId}
          name={name}
          className="custom-control-input"
          value="true"
          onChange={onChange}
          disabled={disabled}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        <label className="custom-control-label" htmlFor={positiveId}>
          {label}
        </label>
      </div>
      <div className="custom-control custom-radio custom-control-inline">
        <input
          {...rest}
          checked={data === false}
          type="radio"
          id={negativeId}
          role={negativeId}
          name={name}
          className="custom-control-input"
          value="false"
          onChange={onChange}
          disabled={disabled}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        <label className="custom-control-label" htmlFor={negativeId}>
          {`Not ${label}`}
        </label>
      </div>
      {error && <div id={`${name}-error`} className="alert alert-danger" role="alert">{error}</div>}
    </div>
  );
};

Radio.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  data: PropTypes.bool,
  error: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool
};

Radio.defaultProps = {
  data: null,
  error: '',
  disabled: false,
  onChange: () => {}
};

export default Radio;
