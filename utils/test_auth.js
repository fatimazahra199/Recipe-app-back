const jwt = require("jsonwebtoken");
const { authMiddleware, signToken } = require("./auth");

// Define the user data to use for testing
const userData = {
  email: "testuser@example.com",
  username: "testuser",
  _id: "123",
};

// Generate a JWT token for the user
const token = signToken(userData);

// Verify the token and log the decoded data
try {
  const decodedData = jwt.verify(token, "mysecrets");
  console.log(decodedData);
} catch (error) {
  console.error(error);
}

// Use the authMiddleware function to extract user data from the request
const req = {
  headers: {
    authorization: `Bearer ${token}`,
  },
  query: {},
  body: {},
};
const updatedReq = authMiddleware({ req });
console.log(updatedReq.user);
