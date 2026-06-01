
const API_URL = "http://localhost:5204/api/auth";

export async function login(username, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  console.log(data);
  if (!response.ok || data.status !== "Success") {
    throw new Error("Invalid credentials");
  }

  return data;
}