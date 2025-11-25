import React, { Component } from "react";
import Table from "./common/table/Table";
import { fetchWithRateLimit } from "../utils/api";
import { autoDismiss } from "../utils/autoDismiss";

class Employees extends Component {
  state = {
    employees: [],
    loading: false,
    deleting: null,
    success: {},
    errors: {},
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }
  };

  //Fetch employees from API with pagination
  fetchEmployees = async (page = 1) => {
    this.setState({ loading: true });
    try {
      const json = await fetchWithRateLimit(`${process.env.REACT_APP_API_BASE_URL}/employees/?page=${page}&limit=${this.state.pagination.limit}`);
      this.setState({
        employees: json.employees,
        pagination: json.pagination || this.state.pagination
      });
    } catch ({ message }) {
      console.error('Error fetching employees:', message);
      const errMsg = message || "An unexpected error occurred";
      this.setState(prevState => ({
        errors: { ...prevState.errors, submit: errMsg },
      }));
      // Auto-dismiss after 10 seconds
      autoDismiss(this.setState.bind(this), 'errors');
    } finally {
      this.setState({ loading: false });
    }
  };

  //Delete employee by Id & update the state optimistically
  handleDelete = async id => {
    // Find the employee to show their name in the confirmation dialog
    const employeeToDelete = this.state.employees.find(emp => emp.id === id);
    const confirmMessage = `Are you sure you want to delete ${employeeToDelete ? employeeToDelete.name : 'this employee'}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    this.setState(prevState => ({
      deleting: id,
      // Optimistically remove the employee from the list
      employees: prevState.employees.filter(emp => emp.id !== id)
    }));

    try {
      const result = await fetchWithRateLimit(`${process.env.REACT_APP_API_BASE_URL}/employees/${id}`, {
        method: "DELETE"
      });
      this.setState(prevState => ({
        success: { ...prevState.success, submit: result.message },
      }));

      // Auto-dismiss after 10 seconds
      autoDismiss(this.setState.bind(this), 'success');

      await this.fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      // Revert the optimistic update
      await this.fetchEmployees();
    } finally {
      this.setState({ deleting: null });
    }
  };

  handlePageChange = async (page) => {
    await this.fetchEmployees(page);
  };

  componentDidMount = async () => {
    await this.fetchEmployees(1);
  };

  render() {
    const { employees, loading, deleting, pagination, success, errors } = this.state;

    const displayEmployees = (employees || []).map(e => ({
      ...e,
      assigned:
        e.assigned === 1 ? "Yes" : e.assigned === 0 ? "No" : e.assigned
    }));

    return (
      <React.Fragment>
        {success?.submit && (
          <div className="alert alert-success" role="success">
            {success.submit}
            <button
              type="button"
              className="close"
              aria-label="Close Success"
              onClick={() => this.setState(prevState => ({ success: { ...prevState.success, submit: null } }))}
            />
          </div>

        )}
        {errors?.submit && (
          <div className="alert alert-danger position-relative" role="alert">
            {errors.submit}
            <button
              type="button"
              className="close"
              aria-label="Close"
              onClick={() => this.setState(prevState => ({ errors: { ...prevState.errors, submit: null } }))}
            />
          </div>
        )}

        <Table
          employees={displayEmployees}
          handleDelete={this.handleDelete}
          onUpdate={async ({ isSaving, msg }) => {
            if (!isSaving) {
              this.setState(prevState => ({
                errors: { ...prevState.errors, submit: msg },
              }));
              // Auto-dismiss after 10 seconds
              autoDismiss(this.setState.bind(this), 'errors');
            }
            await this.fetchEmployees(pagination.page);
          }
          }
          onOptimisticUpdate={({ isSaving, msg, updatedData }) => {
            if (isSaving) {
              this.setState(prevState => ({
                success: { ...prevState.success, submit: msg },
                employees: updatedData
              }));
              // Auto-dismiss after 10 seconds
              autoDismiss(this.setState.bind(this), 'success');
            }
          }
          }
          loading={loading}
          deleting={deleting}
          pagination={pagination}
          onPageChange={this.handlePageChange}
        />
      </React.Fragment>
    );
  }
}

export default Employees;
