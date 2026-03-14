const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const app = express();
app.use(express.json()); // To parse JSON request body
app.use(cors()); // To allow frontend to access backend

const path = require("path");

app.use(
  express.static(path.join(__dirname, "Carbon-Foot-printing-Calculator"))
);

app.get("/", (req, res) => {
  res.redirect("/registration/register.html");
});

// MySQL pool
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQLPORT,
});
// 🔹 Route to Register a User
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const sql =
    "INSERT INTO clientdata (UserName, UserPassword, Email) VALUES (?, ?, ?)";
  pool.query(sql, [name, password, email], (err, result) => {
    if (err) {
      console.log("❌ Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "User registered successfully!" });
  });
});

// 🔹 Route to Fetch User Details
app.get("/user/:email", (req, res) => {
  const email = req.params.email;
  const sql = "SELECT UserName, Email FROM clientdata WHERE Email = ?";

  pool.query(sql, [email], (err, result) => {
    if (err) {
      console.log("❌ Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result[0]);
  });
});
const EMISSION_FACTORS = {
  transport: 2.3, // Example: 2.3 kg CO₂ per liter of fuel
  electricity: 0.5, // Example: 0.5 kg CO₂ per kWh
  food: 1.8, // Example: 1.8 kg CO₂ per kg of food
  waste: 0.3, // Example: 0.3 kg CO₂ per kg of waste
};

// API endpoint
app.post("/generate_report", (req, res) => {
  try {
    const { transport, electricity, food, waste, email } = req.body;

    // Validate input
    if (
      [transport, electricity, food, waste].some(
        (value) => value === undefined || isNaN(value) || value < 0
      )
    ) {
      return res.status(400).json({ error: "Invalid input values" });
    }

    // Calculate carbon footprint
    const breakdown = {
      transport: transport * EMISSION_FACTORS.transport,
      electricity: electricity * EMISSION_FACTORS.electricity,
      food: food * EMISSION_FACTORS.food,
      waste: waste * EMISSION_FACTORS.waste,
    };

    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    insert(email, total.toFixed(2));
    //Database storage
    const insertQuery = `
                UPDATE clientdata 
                SET Emission = ?
                WHERE email = ?
            `;

    pool.query(insertQuery, [total.toFixed(2), email], (err, results) => {
      if (err) {
        console.error("Error inserting data:", err);
        return;
      }
      console.log("Data inserted successfully, ID:", results.insertId);
    });

    // Send JSON response
    res.json({ total, breakdown });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//forgetPassword
// Nodemailer setup
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Send OTP API
app.post("/send-otp", (req, res) => {
  const { email } = req.body;
  const query = `SELECT * FROM clientdata WHERE email = ?`;
  pool.query(query, [email], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log(results.length);
    if (results.length === 0) {
      console.log("❌ Email not found in database:", email);
      return res.status(404).json({ error: "Email not found in database" });
    } else {
      const otp = generateOTP();
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "teamworkdt5@gmail.com",
          pass: "rioo xpnp mkgq akur",
        },
      });

      let mailOptions = {
        from: '"Reset Password" teamworkdt5@gmail.com',
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is: ${otp}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ error: "Failed to send OTP" });
        }
        console.log(`OTP sent to ${email}: ${otp}`);
        res.json({ message: "OTP sent successfully", otp });
      });
    }
  });
});

// Reset Password API
app.post("/reset-password", (req, res) => {
  const { email, newPassword } = req.body;
  const sql = "UPDATE clientdata SET UserPassword = ? WHERE Email = ?";
  pool.query(sql, [newPassword, email], (err, result) => {
    if (err) {
      console.error("Error updating password:", err);
      return res.status(500).json({ error: "Failed to update password" });
    }
    console.log("Password updated successfully.");
    res.json({ message: "Password updated successfully" });
  });
});

//progress milestone
app.get("/user-rank/:username", (req, res) => {
  const email = req.params.username;

  const updateRankQuery = `
    UPDATE clientdata u
    JOIN (
        SELECT id, RANK() OVER (ORDER BY Emission DESC) AS new_rank
        FROM clientdata
    ) ranked_clients ON u.id = ranked_clients.id
    SET u.rank = ranked_clients.new_rank;`;

  pool.query(updateRankQuery, (err) => {
    if (err) {
      console.error("Error updating ranks:", err);
      return res.status(500).json({ error: "Failed to update ranks" });
    }

    // Run SELECT only after UPDATE has finished
    const query =
      "SELECT Email, Emission, `rank` FROM clientdata WHERE Email = ?";
    pool.query(query, [email], (err, results) => {
      if (err) {
        console.error("Error fetching rank:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    });
  });
});

// 🔹 Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// Function to fetch table data
function fillTable(email, callback) {
  const sql1 =
    "SELECT col1, col2, col3, col4, col5, col6, col7, col8, col9, col10, col11, col12, col13, col14, col15, col16, col17, col18, col19, col20, col21, col22, col23, col24, col25, col26, col27, col28, col29, col30 FROM clientdata WHERE Email = ?";

  pool.query(sql1, [email], (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      callback(err, null);
      return;
    }
    if (result.length === 0) {
      console.log("No records found.");
      callback(null, []);
      return;
    }

    let dataArray = [];
    // Extract all column values into a single array
    for (let i = 1; i <= 30; i++) {
      let coll = "col" + i;
      const columnName = coll;
      dataArray.push(result[0][columnName] || 0);
    }

    callback(null, dataArray);
  });
}
// fillTable('google2@gmail.com');
// API to get table data
app.get("/getTableData", (req, res) => {
  const email = req.query.email || "google3@gmail.com"; // Default email

  fillTable(email, (err, data) => {
    if (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database operation failed" });
    } else {
      res.json(data);
    }
  });
});
function insert(email, data) {
  const sql1 = "SELECT columnno FROM clientdata WHERE Email = ?";

  pool.query(sql1, [email], (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return;
    }

    if (result.length === 0) {
      console.error("Email not found in database.");
      return;
    }

    let columnNo = result[0].columnno + 1;
    if (columnNo > 30) columnNo = 1;

    let colname = `col${columnNo}`;

    const sql2 = `UPDATE clientdata SET columnno = ?, ${colname} = ? WHERE Email = ?`;
    const values = [columnNo, data, email];

    pool.query(sql2, values, (err, result) => {
      if (err) {
        console.error("Error updating data:", err);
        return;
      }

      console.log(
        `Data inserted successfully: ${colname} = ${data} for ${email}`
      );
    });
  });
}
