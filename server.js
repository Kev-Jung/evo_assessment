import express from "express";
import fetch from "node-fetch";
import * as dotenv from "dotenv";
import path from "path";

const __dirname = path.resolve();
dotenv.config();

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());

const SANDBOX_ROOT_URL = "https://sandbox.payfabric.com/payment/api";

app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});





// -------------   Exercise 2: Basic API Request   ------------- //
const generateToken = async () => {
  const TOKEN_ENDPOINT = "/token/create";

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `${process.env.DEVICE_ID}|${process.env.DEVICE_PASSWORD}`,
    },
  };

  try {
    const response = await fetch(SANDBOX_ROOT_URL + TOKEN_ENDPOINT, options);
    // returns response data => {Token: "2:4uiyc8ch0hom"}
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

app.get("/token", async (req, res) => {
  const token = await generateToken();
  if (!token) {
   return res.status(500).json({error: "Server Error: Unable to provide a token. Please try again later."})
  }
  return res.status(200).json(token);
});





// -------------   Exercise 3: POST API Request   ------------- //
const createTransaction = async (payload) => {
  const TRANSACTION_ENDPOINT = "/transaction/create";

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `${process.env.DEVICE_ID}|${process.env.DEVICE_PASSWORD}`,
    },
    body: JSON.stringify(payload),
  };
  
  try {
    const response = await fetch(SANDBOX_ROOT_URL + TRANSACTION_ENDPOINT, options);
    // returns response data => {Key: "23011902451849"}
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

app.get("/transaction", (req, res) => {
  res.status(200).render("exercise-3");
});

app.post("/transaction", async (req, res) => {
  const payload = req.body;

  if (!payload) {
    return req.status(400).json({ error: "Bad Request: No payload given." });
  }

  const transactionKey = await createTransaction(payload);
  // Successfully created transaction with 201 status code
  return res.status(201).json(transactionKey);
});





// -------------   Exercise 4: Basic HTML Demo   ------------- //
app.get("/payment-page", async (req, res) => {
  // invoke functions from exercise 2 & 3 and destructure security token and transaction key from API response
  const { Token } = await generateToken();
  const { Key } = await createTransaction({
    // hardcoded payload for this example
    Amount: 9.99,
    Currency: "USD",
    SetupId: "EVO US_CC",
    Type: "Sale",
  });

  if (!Token || !Key) {
    return res.status(500).json({error: "Server Error: There was a problem getting the token or transaction key. Please try again later."})
  }

  const paymentPageURL = `https://sandbox.payfabric.com/Payment/Web/Transaction/Process?key=${Key}&token=${Token}`;
  // use EJS template engine to render html page passing url as data
  res.status(200).render("exercise-4", { paymentPageURL });
});


app.listen(PORT, () => console.log("Server initialized on port", PORT));
