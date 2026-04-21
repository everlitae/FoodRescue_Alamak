use FoodRescue

if (!db.getCollectionNames().includes("Users")) {
  db.createCollection("Users", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["email", "password"],
        properties: {
          NIK: { bsonType: "string" },
          full_name: { bsonType: "string" },
          email: { bsonType: "string" },
          username: { bsonType: "string" },
          password: { bsonType: "string" },
          address: { bsonType: "string" },
          birthdate: { bsonType: "date" },
          current_employment: { bsonType: "string" },
          salary: { bsonType: "int" },
          marriage_status: { bsonType: "string" },
          created_at: { bsonType: "date" },
          updated_at: { bsonType: "date" }
        }
      }
    }
  })
}

db.Users.createIndex({ email: 1 }, { unique: true })
db.Users.createIndex({ NIK: 1 }, { unique: true })
db.Users.createIndex({ username: 1 })
