const kanbanAPI = {
    async getStages() {
      const url = "http://localhost:8055/api/stages/userSpecific";
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
          },
        });
  
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("stages fetch data ", data)
  
        // Transform API response to match the Kanban board's structure
        const stages = data.map((stage) => ({
          id: stage.id.toString(), // Ensure id is a string
          title: stage.name,
          cards: stage.cards || []
        }));
        console.log(stages);
  
        return stages;
      } catch (error) {
        console.error("Failed to fetch stages:", error);
        throw error;
      }
    },

      // API for adding a new stage
  async  addStage(name) {
    const url = "http://localhost:8055/api/stages";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem("token")
        },
        body: JSON.stringify({ name }) // Send the stage name in the request body
      });
      const data = await response.json();
      console.log(data);
      return data; // Return the new stage data if successful
    } catch (e) {
      console.error("Failed to add stage:", e);
      throw e;
    }
  }


  };
  
  export default kanbanAPI;
  