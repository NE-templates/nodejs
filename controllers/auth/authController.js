import db from "../../helpers/db.js";
import _ from "lodash";
import bcrypt from "bcrypt";

export const signin = async (req, res) => {
  const { email, password } = _.pick(req.body, ["email", "password"]);

  try {
    const { rows } = db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    delete user.password;

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createUser = async (req, res) => {
  const { fullName, email, address, password } = _.pick(req.body, [
    "fullName",
    "email",
    "address",
    "password",
  ]);

  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const { rows: existingUsers } = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUsers.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_SALT)
    );

    const {
      rows: [user],
    } = await client.query(
      `INSERT INTO users (full_name, email, address, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email`,
      [fullName, email, address, hashedPassword]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.constraint === "users_email_key") {
      return res.status(400).json({ message: "Email already registered" });
    }

    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

export const createUsers = async (req, res) => {
  const users = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({
      message: "Invalid input: users must be a non-empty array",
    });
  }

  const invalidUsers = users.filter((user) => {
    const { fullName, email, address, password } = user;
    return !fullName || !email || !address || !password;
  });

  if (invalidUsers.length > 0) {
    return res.status(400).json({
      message: "All users must have fullName, email, address, and password",
      invalidCount: invalidUsers.length,
    });
  }

  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const emails = users.map((user) => user.email);
    const duplicateEmails = emails.filter(
      (email, index) => emails.indexOf(email) !== index
    );

    if (duplicateEmails.length > 0) {
      return res.status(400).json({
        message: "Duplicate emails in request",
        duplicateEmails,
      });
    }

    const { rows: existingUsers } = await client.query(
      "SELECT email FROM users WHERE email = ANY($1)",
      [emails]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        message: "Some emails are already registered",
        existingEmails: existingUsers.map((user) => user.email),
      });
    }

    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const { fullName, email, address, password } = user;
        const hashedPassword = await bcrypt.hash(
          password,
          Number(process.env.BCRYPT_SALT)
        );

        const { rows } = await client.query(
          `INSERT INTO users (full_name, email, address, password)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, full_name, email, address`,
          [fullName, email, address, hashedPassword]
        );

        return rows[0];
      })
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Users created successfully",
      count: createdUsers.length,
      users: createdUsers.map(({ password, ...user }) => user),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Bulk user creation error:", error);

    if (error.constraint === "users_email_key") {
      return res.status(400).json({
        message: "Unique email constraint violation",
        error: error.detail,
      });
    }

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  } finally {
    client.release();
  }
};
