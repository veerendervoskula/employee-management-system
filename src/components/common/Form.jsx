import React, { Component } from "react";
import PropTypes from "prop-types";
import Input from "./Input";
import Select from "./Select";
import Radio from "./Radio";
import { validateField, validateData } from "../../validation/employeeValidator";
import employeeSchema from "../../utils/schema/employeeSchema";

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        name: "",
        code: "",
        profession: "",
        color: "",
        city: "",
        branch: "",
        assigned: false
      },
      errors: {},
      isSubmitting: false
    };
  }

  static propTypes = {
    onSubmit: PropTypes.func,
    initialData: PropTypes.object,
    schema: PropTypes.object.isRequired
  };

  static defaultProps = {
    onSubmit: () => { },
    initialData: {}
  };

  componentDidMount() {
    const { initialData } = this.props;
    if (Object.keys(initialData).length > 0) {
      this.setState(prevState => ({
        data: { ...prevState.data, ...initialData }
      }));
    }
  }

  get _schema() {
    return this.props.schema || employeeSchema;
  }

  validateProperty = ({ name, value }) => {
    if (!this._schema) {
      console.warn("No validation schema provided to Form component");
      return null;
    }
    return validateField(name, value, this._schema);
  };

  validate = () => {
    if (!this._schema) {
      console.warn("No validation schema provided to Form component");
      return null;
    }
    return validateData(this.state.data, this._schema);
  };

  handleSubmit = async e => {
    e.preventDefault();
    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    this.setState({ isSubmitting: true });
    try {
      await this.props.onSubmit(this.state.data);
    } catch (error) {
      this.setState(prevState => ({
        errors: { ...prevState.errors, submit: error.message || "An error occurred while submitting the form" }
      }));
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  handleChange = ({ currentTarget: input }) => {
    const value =
      input.type === "checkbox"
        ? input.checked
        : input.type === "number"
          ? input.value === "" ? "" : parseFloat(input.value)
          : input.value === "true" || input.value === "false"
            ? input.value === "true"
            : input.value;

    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty({ name: input.name, value });
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];

    this.setState(prevState => ({
      data: { ...prevState.data, [input.name]: value },
      errors
    }));
  };

  renderButton(label, type = "submit", className = "btn btn-primary") {
    const { isSubmitting, errors } = this.state;
    const hasErrors = Boolean(errors && Object.keys(errors).length);
    return (
      <button
        type={type}
        disabled={hasErrors || isSubmitting}
        className={className}
        aria-busy={isSubmitting}
        aria-disabled={hasErrors || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : label}
      </button>
    );
  }

  renderInput(name, label, type = "text") {
    const { data, errors, isSubmitting } = this.state;
    return (
      <Input
        onChange={this.handleChange}
        name={name}
        type={type}
        value={data[name] || ""}
        label={label}
        error={errors[name]}
        disabled={isSubmitting}
        autoComplete={name}
        className={`form-control form-control-sm ${errors?.name ? "is-invalid" : ""}`}
      />
    );
  }

  renderSelect(name, label, options) {
    const { data, errors, isSubmitting } = this.state;
    return (
      <Select
        onChange={this.handleChange}
        name={name}
        value={data[name] || ""}
        label={label}
        options={options}
        data={data}
        error={errors[name]}
        disabled={isSubmitting}
        autoComplete={name}
        className={`form-control form-control-sm ${errors?.name ? "is-invalid" : ""}`}
      />
    );
  }

  renderRadio(name, label) {
    const { data, errors, isSubmitting } = this.state;
    return (
      <Radio
        name={name}
        label={label}
        data={data[name]}
        onChange={this.handleChange}
        error={errors[name]}
        disabled={isSubmitting}
      />
    );
  }

  renderGlobalError() {
    const { errors } = this.state;
    if (errors.submit) {
      return (
        <div className="alert alert-danger" role="alert" aria-live="polite">
          {errors.submit}
        </div>
      );
    }
    return null;
  }
 
}

export default Form;