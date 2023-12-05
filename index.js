// import express from "express";
// import { Pool } from "pg";
const express = require("express");
const morgan = require("morgan");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 5500;

app.use(
  cors({
    origin: "*",
  })
);
app.use(morgan("combined"));

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Scholarships",
  password: "123",
  port: 5432,
});

// Create a write stream for logging to a file
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// Use morgan middleware for logging HTTP requests
app.use(morgan("combined", { stream: accessLogStream }));

// getting all scholarships
app.get("/scholarships", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM scholarships");
    const scholarships = result.rows;
    const clientIP = req.ip || req.connection.remoteAddress;
    console.log(`Client IP: ${clientIP}`);

    morgan("combined", { stream: accessLogStream });
    res.json(scholarships);
  } catch (error) {
    console.log("Error querying the database", error);
    res.status(500).send("Internal Server Error");
  }
});

// adding a scholarship
app.post("/scholarships", async (req, res) => {
  console.log(req.body);
  const {
    scholarship_name,
    scholarship_amount,
    scholarship_quantity,
    scholarship_years,
  } = req.body;
  console.log(req.body);
  try {
    const result = await pool.query(
      "INSERT INTO scholarships(scholarship_name, scholarship_amount, scholarship_quantity, scholarship_years) VALUES ($1, $2, $3, $4)",
      [
        scholarship_name,
        scholarship_amount,
        scholarship_quantity,
        scholarship_years,
      ]
    );
    console.log(result);
    console.log(result.rows);
    morgan("combined", { stream: accessLogStream });
    const newScholarship = result.rows[0];
    res.status(201).json(newScholarship);
  } catch (error) {
    console.error("Error inserting into the database", error);
    res.status(500).send("Internal Server Error");
  }
});

// Update a scholarship by ID
app.put("/scholarships/:id", async (req, res) => {
  const { id } = req.params;
  const {
    scholarship_name,
    scholarship_amount,
    scholarship_quantity,
    scholarship_years,
  } = req.body;
  try {
    const result = await pool.query(
      "UPDATE scholarships SET scholarship_name = $1, scholarship_amount = $2, scholarship_quantity = $3, scholarship_years = $4 WHERE scholarship_id = $5 RETURNING *",
      [
        scholarship_name,
        scholarship_amount,
        scholarship_quantity,
        scholarship_years,
        id,
      ]
    );
    const updatedScholarship = result.rows[0];
    morgan("combined", { stream: accessLogStream });
    if (!updatedScholarship) {
      return res.status(404).json({ message: "Scholarship not found" });
    }
    res.json(updatedScholarship);
  } catch (error) {
    console.error("Error updating the database", error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete a scholarship by ID
app.delete("/scholarships/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM scholarships WHERE scholarship_id = $1 RETURNING *",
      [id]
    );
    morgan("combined", { stream: accessLogStream });

    res.status(200).json("successfully deleted");
  } catch (error) {
    console.error("Error deleting from the database", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/", (req, res) => {
  res.send("<h1>Home Page</h1>");
});

app.post("/register", (req, res) => {
  //Do something with the data
  res.sendStatus(201);
});

app.put("/user/angela", (req, res) => {
  res.sendStatus(200);
});

app.patch("/user/angela", (req, res) => {
  res.sendStatus(200);
});

app.delete("/user/angela", (req, res) => {
  //Deleting
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
