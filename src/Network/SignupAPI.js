export const signupUser = async (username, password) => {
    const url = "http://localhost:8055/api/auth/signup";
  
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }
  
      const data = await response.json();
      console.log("Signup successful:", data);
      return data;
    } catch (error) {
      console.error("Error signing up:", error.message);
      throw error; // Propagate the error to the caller
    }
  };
  