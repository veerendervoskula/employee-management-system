const QB = require("./orm").knex;
const User = require("./models/employee");
const userData = require("./data/employees.json");

async function seedDatabase() {
  try {
    await QB.schema
      .dropTableIfExists("employees")
      .createTable("employees", (table) => {
        table.increments("id").primary();
        table.string("name");
        table.string("code");
        table.string("profession");
        table.string("color");
        table.string("city");
        table.string("branch");
        table.boolean("assigned");
      });

    console.log("Employees table created successfully.");

    const result = await User.collection(userData).invokeThen("save");
    console.log(`${result.length} employees seeded successfully.`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
}

seedDatabase();