import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Employees from "./components/Employees";
import NavBar from "./components/common/navbar/NavBar";
import PageNotFound from "./components/PageNotFound";
import EmployeeForm from "./components/EmployeeForm";
import ErrorBoundary from "./components/common/ErrorBoundary";

class App extends React.Component {
  render() {
    return (
      <React.Fragment>
        <NavBar />
        <main className="container">
          <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
            <Switch>
              <Route path="/employees/view/:id" component={Employees} />
              <Route path="/employees/new" component={EmployeeForm} />
              <Route path="/employees" component={Employees} />
              <Redirect from="/" exact to="/employees" />
              <Route path="/not-found" exact component={PageNotFound} />
              <Redirect to="/not-found" />
            </Switch>
          </ErrorBoundary>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
