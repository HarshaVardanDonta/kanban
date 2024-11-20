export const loginUser = async (username, password) => {
    const url = "http://localhost:8055/api/auth/login";
  
    const body = {
      username,
      password,
    };
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        const contentType = response.headers.get("Content-Type");
        let errorMessage = "Login failed";
  
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          errorMessage = await response.text();
        }
  
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      console.log("Login successful:", data['Token']);
      return data; // You might receive a token or user details
    } catch (error) {
      console.error("Error logging in:", error);
      throw error; // Propagate the error to the caller
    }
  };
  