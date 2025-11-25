import React from "react";
import PropTypes from "prop-types";
import Form from "./common/Form";
import DOMPurify from "dompurify";

class EmployeeForm extends Form {
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
      codes: ["F100", "F101", "F102", "F103", "F104", "F105", "F106"],
      professions: ["Drywall Installer", "Runner"],
      colors: ["#FF6600", "yellow", "green", "#333333", "red"],
      cities: ["Toronto", "Brampton", "Bolton"],
      branches: ["Abacus", "Pillsworth"],
      errors: {},
      success: {},
      isLoading: false,
      isSaving: false
    };
    this._isUnmounted = false;
  }

  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired
    }).isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string
      }).isRequired
    }).isRequired,
    onSuccess: PropTypes.func,
  };

  // Override handleSubmit to use doSubmit instead of Form's onSubmit prop
  handleSubmit = async (e) => {
    e.preventDefault();
    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;
    await this.doSubmit();
  }

  handleClick = e => {
    e.preventDefault();
    if (this.props.history && this.props.history.push) {
      this.props.history.push("/employees");
    }
  };

  async componentDidMount() {
    const employeeId = this.props.match && this.props.match.params && this.props.match.params.id;
    if (!employeeId) return;

    this.setState({ isLoading: true });
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employees/view/${employeeId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch employee: ${response.statusText}`);
      }
      const employee = await response.json();
      this.getEmployeeById(employee);
    } catch (error) {
      console.error('Error fetching employee:', error);
      this.setState(prevState => ({
        errors: { ...prevState.errors, fetch: error.message },
        isLoading: false
      }));
    }
  }

  getEmployeeById(employee) {
    if (!employee) {
      if (this.props.history && this.props.history.replace) {
        this.props.history.replace("/not-found");
      }
      return;
    }

    try {
      const data = {
        id: employee.id,
        name: employee.name,
        code: employee.code,
        profession: employee.profession,
        color: employee.color,
        city: employee.city,
        branch: employee.branch,
        assigned: Boolean(employee.assigned)
      };

      this.setState({
        data,
        isLoading: false,
        errors: {}
      });
    } catch (error) {
      console.error('Error processing employee data:', error);
      this.setState(prevState => ({
        errors: { ...prevState.errors, fetch: 'Error processing employee data' },
        isLoading: false
      }));
    }
  }

  componentWillUnmount() {
    // Clean up any pending state updates
    this._isUnmounted = true;
  }

  // Safely set state if component is still mounted
  safeSetState = (state, callback) => {
    if (!this._isUnmounted) {
      this.setState(state, callback);
    }
  }

  //Form submit
  async doSubmit() {
    this.safeSetState({ isSaving: true, errors: {} });

    const { id, ...data } = this.state.data;

    // Create sanitized item object with proper boolean conversion
    const item = Object.entries(data).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: key === 'assigned' ? Boolean(value) :
        (typeof value === 'string' ? DOMPurify.sanitize(value) : value)
    }), {});

    const baseUrl = `${process.env.REACT_APP_API_BASE_URL}/employees`;
    const url = id ? `${baseUrl}/${id}` : baseUrl;
    const method = id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const details = responseData?.details || [];

        const missingFields = details
          .map(({ field }) => field)
          .filter(Boolean);

        const errMsg = `${responseData.message}${missingFields.length ? ' : Values for the fields ' +
          missingFields.join(', ') + ' missing' : ''}` ||
          `Request failed with status ${response.status}`;

        throw new Error(errMsg);
      }

      // Send success message and redirect
      if (this.props.history && this.props.history.push) {
        const newEmployee = {
          isSaving: true,
          msg: `Employee "${item.name}" successfully created`,
          updatedData: item
        };

        this.props.history.push("/employees", { newEmployee });
      }
    } catch (err) {
      const errMsg = err.message || "An unexpected error occurred";
      this.setState(prevState => ({
        errors: { ...prevState.errors, submit: errMsg },
        isSaving: false
      }));
      console.error("Error saving employee:", err);
    }
  }

  render() {
    const { isLoading, isSaving, errors, success } = this.state;

    if (isLoading) {
      return (
        <div className="text-center p-4">
          <div className="spinner-border" role="status" aria-label="Loading">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-4">
            {this.state.data.id ? 'Edit Employee' : 'Add New Employee'}
          </h5>

          {errors.fetch && (
            <div className="alert alert-danger" role="alert">
              {errors.fetch}
              <button
                type="button"
                className="close"
                aria-label="Close"
                onClick={() => this.setState(prevState => ({ errors: { ...prevState.errors, fetch: null } }))}
              />
            </div>
          )}

          {errors.submit && (
            <div className="alert alert-danger mt-3" role="alert">
              {errors.submit}
              <button
                type="button"
                className="close"
                aria-label="Close submit error"
                onClick={() => this.setState(prevState => ({ errors: { ...prevState.errors, submit: null } }))}
              />
            </div>
          )}

          {success?.submit && (
            <div className="alert alert-success" role="success">
              {success.submit}
              <button
                type="button"
                className="close float-end"
                aria-label="Close Success"
                onClick={() => this.setState(prevState => ({ success: { ...prevState.success, submit: null } }))}
              />
            </div>
          )}

          <form onSubmit={this.handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                {this.renderInput("name", "Name", "text")}
                {this.renderSelect("code", "Code", this.state.codes)}
                {this.renderSelect("profession", "Profession", this.state.professions)}
              </div>
              <div className="col-md-6">
                {this.renderSelect("color", "Color", this.state.colors)}
                {this.renderSelect("city", "City", this.state.cities)}
                {this.renderSelect("branch", "Branch", this.state.branches)}
                {this.renderRadio("assigned", "Assigned", this.state.data.assigned)}
              </div>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="btn btn-primary me-2 mr-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={this.handleClick}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}


EmployeeForm.defaultProps = {
  onSuccess: () => { }
};

export default EmployeeForm;
