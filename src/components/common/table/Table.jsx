import React, { PureComponent } from "react";
import { Link, Route } from "react-router-dom";
import ExportCSV from "../exportCSV/ExportCSV";
import DOMPurify from "dompurify";
import EmployeeForm from "../../EmployeeForm";

/**
 *  Table Component
 * - Uses PureComponent to avoid unnecessary re-renders
 * - Consolidates state updates
 * - Extracts helper methods for rendering
 * - Memoizes columns
 * - Keeps all original features: CSV export, pagination, inline editing
 */

class Table extends PureComponent {
  state = {
    localData: [],
    searchText: "",
    sortColumn: null,
    sortDirection: "asc",
    editingCell: null,
    editedValue: "",
    savingCell: null,
    errors: {},
    employees: []
  };

  componentDidMount() {
    this.setState({ localData: this.props.employees });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.employees !== this.props.employees) {
      this.setState({ localData: this.props.employees });
    }
  }

  // Memoized columns configuration
  getColumns = () => [
    {
      dataField: "color",
      text: "Color",
      editor: {
        type: "SELECT",
        options: [
          { value: "#FF6600", label: "#FF6600" },
          { value: "yellow", label: "yellow" },
          { value: "green", label: "green" },
          { value: "#333333", label: "#333333" },
          { value: "red", label: "red" },
        ],
      },
      headerStyle: { width: "3em" },
      align: "center",
      formatter: (cell) => (
        <i style={{ color: cell }} className="fas fa-circle" />
      ),
    },
    { dataField: "name", text: "Name", sort: true },
    {
      dataField: "code",
      text: "Code",
      editor: {
        type: "SELECT",
        options: [
          { value: "F100", label: "F100" },
          { value: "F101", label: "F101" },
          { value: "F102", label: "F102" },
          { value: "F103", label: "F103" },
          { value: "F104", label: "F104" },
          { value: "F105", label: "F105" },
          { value: "F106", label: "F106" },
        ],
      },
      sort: true,
    },
    {
      dataField: "city",
      text: "City",
      editor: {
        type: "SELECT",
        options: [
          { value: "Toronto", label: "Toronto" },
          { value: "Brampton", label: "Brampton" },
          { value: "Bolton", label: "Bolton" },
        ],
      },
      sort: true,
    },
    {
      dataField: "profession",
      text: "Profession",
      editor: {
        type: "SELECT",
        options: [
          { value: "Drywall Installer", label: "Drywall Installer" },
          { value: "Runner", label: "Runner" },
        ],
      },
      sort: true,
    },
    {
      dataField: "branch",
      text: "Branch",
      editor: {
        type: "SELECT",
        options: [
          { value: "Abacus", label: "Abacus" },
          { value: "Pillsworth", label: "Pillsworth" },
        ],
      },
      sort: true,
    },
    {
      dataField: "assigned",
      text: "Assigned",
      editor: {
        type: "SELECT",
        options: [
          { value: true, label: "Yes" },
          { value: false, label: "No" },
        ],
      },
      headerStyle: { width: "6em" },
      sort: true,
    },
    {
      dataField: "delete",
      text: "",
      csvExport: false,
      align: "center",
      editable: false,
      headerStyle: { width: "4.5em" },
      formatter: () => (
        <button className="btn btn-danger btn-sm">Delete</button>
      ),
      events: {
        onClick: (row) => {
          this.props.handleDelete(row.id);
        },
      },
    },
  ];

  // CSV Export
  exportToCSV = () => {
    const columns = this.getColumns().filter((col) => col.csvExport !== false);
    const { filteredData } = this.getFilteredAndSortedData();
    const headers = columns
      .map((col) => DOMPurify.sanitize(col.text || col.dataField))
      .join(",");
    const rows = filteredData
      .map((row) =>
        columns
          .map((col) => {
            let value = row[col.dataField];
            if (typeof value === "string") {
              value = DOMPurify.sanitize(value).replace(/"/g, '""');
              if (
                value.includes(",") ||
                value.includes('"') ||
                value.includes("\n")
              ) {
                value = `"${value}"`;
              }
            }
            return value || "";
          })
          .join(",")
      )
      .join("\n");
    const csvContent = [headers, rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "employees.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  getFilteredAndSortedData = () => {
    const { localData, searchText, sortColumn, sortDirection } = this.state;
    const columns = this.getColumns();
    let filtered = localData;
    if (searchText) {
      filtered = filtered.filter((row) =>
        columns.some(
          (col) =>
            col.dataField !== "delete" &&
            row[col.dataField]
              ?.toString()
              .toLowerCase()
              .includes(searchText.toLowerCase())
        )
      );
    }
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = (a[sortColumn] || "").toString().toLowerCase();
        const bVal = (b[sortColumn] || "").toString().toLowerCase();
        return sortDirection === "asc"
          ? aVal > bVal
            ? 1
            : -1
          : aVal < bVal
            ? 1
            : -1;
      });
    }
    return { filteredData: filtered };
  };

  getPaginatedData = () => {
    const { filteredData } = this.getFilteredAndSortedData();
    return {
      paginatedData: filteredData,
      totalPages: this.props.pagination.totalPages || 1,
    };
  };
  handlePageChange = (page) => {
    // Use the parent's page change handler for server-side pagination
    this.props.onPageChange && this.props.onPageChange(page);
  };

  handleSearchChange = (e) => this.setState({ searchText: e.target.value });

  handleSort = (dataField) =>
    this.setState((prev) => ({
      sortColumn: dataField,
      sortDirection:
        prev.sortColumn === dataField && prev.sortDirection === "asc"
          ? "desc"
          : "asc",
    }));


  handleCellClick = (row, column) => {
    if (column.editor && column.editable !== false) {
      this.setState({
        editingCell: { rowId: row.id, dataField: column.dataField },
        editedValue: row[column.dataField] || "",
      });
    }
  };

  handleCellChange = (value) => {
    this.setState((prevState) => {
      const { editingCell, localData } = prevState;
      if (!editingCell) return prevState;

      const updatedData = localData.map((r) =>
        r.id === editingCell.rowId ? { ...r, [editingCell.dataField]: value } : r
      );

      return {
        ...prevState,
        editedValue: value,
        localData: updatedData, // live update
      };
    });
  };

  handleCellBlur = async (row, column) => {
    const { editedValue } = this.state;
    if (!editedValue.trim()) {
      return this.setState({ editingCell: null });
    }

    this.setState({
      savingCell: { rowId: row.id, dataField: column.dataField },
    });

    const updatedRow = { ...row, [column.dataField]: editedValue };

    // Sanitize before sending
    Object.keys(updatedRow).forEach((key) => {
      if (typeof updatedRow[key] === "string") {
        updatedRow[key] = DOMPurify.sanitize(updatedRow[key]);
      }
    });

    // Create sanitized item object with proper boolean conversion
    const item = Object.entries(updatedRow).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: key === 'assigned' ? Boolean(value) :
        (typeof value === 'string' ? DOMPurify.sanitize(value) : value)
    }), {});

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employees/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const details = responseData?.details || [];

        const missingFields = details
          .map(({ field }) => field)
          .filter(Boolean);

        const errMsg = `${responseData.message}${missingFields.length ? ' : Values for ' +
          missingFields.join(', ') + ' missing' : ''}` ||
          `${response.text}`;

        throw new Error(errMsg);
      }

      this.props.onOptimisticUpdate?.({
        isSaving: true,
        msg: `Employee "${item.name}" successfully updated`,
        updatedData: this.state.localData,
      });
    } catch (err) {
      console.error("Error Updating employee:", err);
      const errMsg = err.message || "An unexpected error occurred";
      this.props.onUpdate?.({
        isSaving: false,
        msg: errMsg,
      });
      this.setState(prevState => ({
        errors: { ...prevState.errors, submit: errMsg },
      }));
    } finally {
      this.setState({ editingCell: null, savingCell: null });
    }
  };

  renderCellContent = (row, column) => {
    const { editingCell, editedValue, savingCell } = this.state;

    const isEditing =
      editingCell?.rowId === row.id &&
      editingCell.dataField === column.dataField;
    const isSaving =
      savingCell?.rowId === row.id && savingCell.dataField === column.dataField;
    if (isSaving) {
      return (
        <div
          className="spinner-border spinner-border-sm text-primary"
          role="status"
        />
      );
    }

    if (isEditing && column.editor) {
      if (column.editor.type === "SELECT") {
        return (

          <select
            value={editedValue}
            onChange={(e) => this.handleCellChange(e.target.value)}
            onBlur={() => this.handleCellBlur(row, column)}
            autoFocus
            id={column.dataField}
            name={column.dataField}
            className="form-control form-control-sm"
          >
            {column.editor.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }
      return (
        <input
          type="text"
          value={editedValue}
          onChange={(e) => this.handleCellChange(e.target.value)}
          onBlur={() => this.handleCellBlur(row, column)}
          autoFocus
          id={column.dataField}
          name={column.dataField}
          className="form-control form-control-sm"
        />
      );
    }
    return column.formatter
      ? column.formatter(row[column.dataField], row)
      : row[column.dataField];
  };

  render() {
    const columns = this.getColumns();
    const { paginatedData } = this.getPaginatedData();
    const errors = this.state;
    return (
      <div>
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
        <div className="mb-3">
          <Link to="/employees/new" className="btn btn-primary btn-sm mr-2">
            New Employee
          </Link>

          <ExportCSV onExport={this.exportToCSV} />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            id="search-table"
            name="search-table"
            placeholder="Search..."
            value={this.state.searchText}
            onChange={this.handleSearchChange}
          />
        </div>
        <hr />
        <div className="table-responsive">
          <table className="table table-striped table-hover table-sm">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.dataField}
                    style={col.headerStyle || {}}
                    className={col.sort ? "clickable" : ""}
                    onClick={() => col.sort && this.handleSort(col.dataField)}
                  >
                    {col.text}
                    {col.sort && this.state.sortColumn === col.dataField && (
                      <span className="ml-2">
                        {this.state.sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center">
                    Table is Empty
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id}>
                    {columns.map((col) => (
                      <td
                        key={col.dataField}
                        style={{
                          textAlign: col.align || "left",
                          ...(col.headerStyle || {}),
                        }}
                        onClick={() =>
                          col.editor &&
                          col.editable !== false &&
                          col.dataField !== "delete" &&
                          this.handleCellClick(row, col)
                        }
                      >
                        {col.dataField === "delete" ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              this.props.handleDelete(row.id);
                            }}
                          >
                            Delete
                          </button>
                        ) : (
                          this.renderCellContent(row, col)
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {this.props.pagination && this.props.pagination.totalPages > 1 && (
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${this.props.pagination.page === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  role="button"
                  onClick={() => this.handlePageChange(this.props.pagination.page - 1)}
                  disabled={this.props.pagination.page === 1}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: this.props.pagination.totalPages }, (_, i) => i + 1).map(page => (
                <li
                  key={page}
                  className={`page-item ${this.props.pagination.page === page ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => this.handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
              <li className={`page-item ${this.props.pagination.page === this.props.pagination.totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => this.handlePageChange(this.props.pagination.page + 1)}
                  disabled={this.props.pagination.page === this.props.pagination.totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}

        <div className="text-center mt-2">
          {this.props.pagination && `Showing ${paginatedData.length > 0 ? (this.props.pagination.page - 1) * this.props.pagination.limit + 1 : 0} to ${Math.min(this.props.pagination.page * this.props.pagination.limit, this.props.pagination.total)} of ${this.props.pagination.total} entries`}
        </div>
      </div>
    );
  }
}

export default Table;
