# EVO TSE Evaluation Assessment - Kevin Jung

My solution for this technical assessment is demonstrated through the use of a Node/Express web server which is responsible for handling client requests and getting and posting data to the PayFabric API.

## All Exercises
[Exercise 2](https://github.com/Kev-Jung/evo_assessment#exercise-2)<br />
[Exercise 3](https://github.com/Kev-Jung/evo_assessment#exercise-3)<br />
[Exercise 4](https://github.com/Kev-Jung/evo_assessment#exercise-4)<br />
[Exercise 5](https://github.com/Kev-Jung/evo_assessment#exercise-5)<br />
[Exercise 6](https://github.com/Kev-Jung/evo_assessment#exercise-6)<br />

<br/>

## Exercise 2

### Goals:
- Demonstrate ability to follow technical documentation.
- Demonstrate ability to make a basic RESTful API request.

### Instructions:
Follow the instructions on [Security Token](https://github.com/PayFabric/Hosted-Pages/blob/master/Sections/Security%20Token.md) page and make an API request using the API Credentials above to obtain a Security ```Token```.

### My Process:
- Store API Credentials in .env file for secure retreival in code
- Create a function ```generateToken``` that is responsible for making the API request to retrieve token

```javascript
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
```
- Expose a route ```/token``` that will invoke ```generateToken``` from client request. Return a status code ```200``` upon success with token or status code 500 for server error.

```javascript
app.get("/token", async (req, res) => {
  const token = await generateToken();
  if (!token) {
   return res.status(500).json({error: "Server Error: Unable to provide a token. Please try again later."})
  }
  return res.status(200).json(token);
});
```
### Answer:

```{ Token: "2:4uiyc8ch0hom" } ```

<br/>

## Exercise 3


### Goals:
- Demonstrate ability to work with RESTful API request involving authentication and data payload.
- Demonstrate ability to work with JSON payload in an API request.

### Instructions:
Follow the instructions on GitHub on how to [Create a Transaction](https://github.com/PayFabric/APIs/blob/master/PayFabric/Sections/Transactions.md#create-a-transaction) and make an API request using the API Credentials to obtain a Transaction ```Key```.

### My Process:
- Create a simple UI that will accept user's input to post data to the web server then PayFabric API. Expose a server route on ```/transaction```

<img width="477" alt="Exercise-3" src="https://user-images.githubusercontent.com/86936720/213939241-b16aa24b-6493-4121-8093-d0e5112cec11.png">

- POST request sent from client to server on form submit, using payload from HTML:
```javascript
const fetchTransactionKey = async (payload) => {
  const response = await fetch("/transaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const transactionKey = await response.json();
  console.log(transactionKey);
  return transactionKey;
};
```
- POST request sent from server to PayFabric API using authentication and payload from client:
```javascript
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
    const response = await fetch(SANDBOX_URL + TRANSACTION_ENDPOINT, options);
    // returns response data => {Key: "23011902451849"}
    return await response.json();
  } catch (e) {
    console.error(e);
  }
};
```
- Display the Transaction Key to UI

### Answer:

```{ Key: "23011902451849" }```

<br/>

## Exercise 4

### Goals: 
- Demonstrate ability to create a simple HTML demo page.
- Demonstrate ability of chaining multiple API calls into a single use case.

### Instructions: 
- Read and understand how to build an URL for [PayFabric Hosted Payment Page](https://github.com/PayFabric/Hosted-Pages/blob/master/Sections/Payment%20Page.md).
- Create a HTML demo page with iFrame embedding the PayFabric Hosted Payment page. 

### My Process:
- Expose a route on the server ```/payment-page``` which will display the hosted payment page upon client request
- Invoke previous functions from exercise 2 & 3 since ```Token``` and ```Key``` are required to generate payment URL.
- Pass the URL with necessary parameters to my EJS template emgine to render the HTML page in an iframe.
```javascript
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
```
- Set the ```src``` of the iframe to be the ```paymentPageURL```
```html 
  <body>
    <h1>Exercise 4: PayFabric Hosted Payment Page</h1>
    <div class="iframe-container">
      <iframe src="<%= paymentPageURL  %>" frameborder="0"></iframe>
    </div>
  </body>
```

### Answer:

<img width="642" alt="Exercise-4" src="https://user-images.githubusercontent.com/86936720/213939158-fa8ecb05-4f24-4ddb-a54c-14f3df47b3f4.png">

<br/>

## Exercise 5

### Goals: 
- Demonstrate thinking process on troubleshooting issues.

### Instructions: 
Please describe any challenges you have faced going through previous exercises and how you were able to resolve the challenges.

| Challenges | Solutions|
|------------|----------|
|Becoming familiar with PayFabric documentation and required syntax | <ul><li>Review sample code for other languages.</li><li>Identify required headers (ex: Content-Type and Authorization).</li><li>Make isolated calls using Postman to test requests are a success before implementing into Node/Express backend code.</li></ul>|
|CORS issue when trying to send the hosted payment page directly from server to client instead of embedded iframe in HTML.<img width="500" alt="CORS-error" src="https://user-images.githubusercontent.com/86936720/213940316-ef814249-e536-4f27-bc00-d2230c5d3dcb.png"> | <ul><li>Due to CORS not allowing my web server to directly send the payment page HTML code to the client, needed a workaround to send my own HTML page using dynamically assigned data from the server.</li><li>Resorted to using the EJS template engine to pass data from server to HTML.</li></ul>

<br />

## Exercise 6

### Problem:
ACME Company’s customers are limited on how their invoices are received through the payment portal. Invoices are only routed to a single email address on file in their “profile” page.

Email Notification types:
<ul>
  <li>New Invoices</li>
  <li>Past Due Invoices</li>
  <li>Other Communications:
    <ul>
      <li>Payment Receipts</li>
      <li>Password Reset</li>
    </ul>
  </li>
</ul>

### Requirements:
- Ability to route invoice types to a designated email inbox.
- Profile page must allow user to add in a secondary recipient for notifications.
- Users should be able to select which communication they would like email inbox to be subscribed to.
- Store additional recipients in the database with information on which communication they are subscribed to.

### Proposed Changes:
- Create a "Key Contact" category on the Profile Page that would contain two subcategories:
  - Primary Contact: the default email address on file for the user account.
  - Billing Contact: Secondary email address which be configured to receive different notification types.
- By default, Primary Contact will receive all communications.
  - If Billing Contact is set and subscribed to certain notification types then those notifications will be routed to the Billing Contact. 
  - Notifications not within the scope of the Billing Contact's subscription will be routed to the Primary Contact.
- Add additional functionality through dropdowns, modals, and/or checkboxes on the UI for customers to add additional email addresses for dedicated invoice routing. 

### Process Flow:

![FlowChart](https://user-images.githubusercontent.com/86936720/213942691-efdb7929-15b8-43b1-9148-72a40f35a568.png)

### User Interface:

![Balsamiq-1](https://user-images.githubusercontent.com/86936720/213942738-979ab6b5-7b90-42a4-89de-ba51c79c85b3.png)

![Balsamiq-2](https://user-images.githubusercontent.com/86936720/213942742-6261188f-8c87-4fe5-a42c-e9d54300c4e8.png)


