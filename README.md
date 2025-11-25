# Employee Management System - Developer Testing Project

## Technology Stack

1. **Backend**: Node.js, SQLite3 database, Express.js for REST API
2. **Validation**: bookshelf-joi-validator (server-side), Joi (client-side)
3. **Frontend**: React, Bootstrap, Font Awesome icons
4. **Table Component**: Custom React table implementation

## Quick Start

_To start application, please run command: `node server/seed.js` first to seed the database_

Then run: `npm start` to start both servers (frontend + backend)

## Current Features

✅ **Implemented Features:**
1. Retrieve employees from a REST API
2. Display employees in a React table with pagination
3. Create new employees via form
4. Edit employees via inline cell editing in the table
5. Delete employees with confirmation
6. Search/filter functionality
7. Column sorting
8. CSV export functionality
9. Responsive design with Bootstrap

## Project Structure

```
├── server/              # Backend Express.js API
│   ├── routes/         # API route handlers
│   ├── models/         # Models
│   ├── data/           # SQLite database & seed data
│   └── index.js        # Express server setup
├── src/                # React frontend application
│   ├── components/     # React components
│   │   ├── common/     # Reusable components (Form, Table, etc.)
│   │   └── Employees.jsx  # Main employee list component
│   └── App.js          # Main app component with routing
└── testrequirement.md  # Detailed test requirements
```

## Getting Started

The front-end app runs off localhost:3000. The REST API is located in the /server folder and runs off localhost:8080. The data is being served from a JSON file located in the /server/data folder. Run `npm start` to start both servers.
