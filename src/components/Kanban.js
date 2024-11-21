import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import kanbanAPI from '../Network/KanbanAPI';

const Kanban = () => {
  const [stages, setStages] = useState([]);

  // Fetch stages with associated cards
  const fetchStages = async () => {
    try {
      const fetchedStages = await kanbanAPI.getStages();
      setStages(fetchedStages);
      console.log(fetchedStages);
    } catch (error) {
      console.error("Error fetching stages:", error);
    }
  };



  useEffect(() => {
    fetchStages(); // Fetch stages on initial load
  }, []);

  const [newStageTitle, setNewStageTitle] = useState('');


// Handle dropping a card into a stage
const handleDrop = async (card, toStageId) => {
  try {
    // Update the card's stage
    const updatedCard = { ...card, stage: { id: toStageId } };
    
    const response = await fetch(`http://localhost:8055/api/Cards/${card.id}/${toStageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem("token")
      },
    });

    const updatedCardData = await response.json();
    console.log("Updated Card:", updatedCardData);
    

    // After successful update, refetch the stages to update the UI
    fetchStages();
  } catch (error) {
    console.error("Error updating card:", error);
  }
};


  // Add a new stage
  const addNewStage = async () => {
    if (!newStageTitle.trim()) return;
    try {
      const newStage = await kanbanAPI.addStage(newStageTitle);
      setStages([...stages, newStage]);
      setNewStageTitle('');
      fetchStages();
    } catch (e) {
      console.error("Error adding new stage:", e);
    }
  };


  const updateStageTitle = (id, newTitle) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === id ? { ...stage, title: newTitle } : stage
      )
    );
  };

  const deleteStage = async (stageId) => {
    try {
      const response = await fetch(`http://localhost:8055/api/stages/${stageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (response.ok) {
        console.log(`Stage ${stageId} deleted successfully`);
        fetchStages(); // Refetch stages to update the UI
      } else {
        console.error(`Failed to delete stage ${stageId}`);
      }
    } catch (error) {
      console.error("Error deleting stage:", error);
    }
  };


  const deleteCard = async (cardId) => {
    try {
      const response = await fetch(`http://localhost:8055/api/Cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (response.ok) {
        console.log(`Card ${cardId} deleted successfully`);
        // Refetch stages to update UI or optimistically remove the card
        fetchStages();
      } else {
        console.error(`Failed to delete card ${cardId}`);
      }
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h2>Kanban Board</h2>
          {/* Add new stage */}
          <div className="kanban-stage">
          <input
            type="text"
            placeholder="New stage title"
            value={newStageTitle}
            onChange={(e) => setNewStageTitle(e.target.value)}
          />
          <button onClick={addNewStage}>Add Stage</button>
        </div>
        <div className="kanban-board">
          {stages.map((stage) => (
            <Stage
              key={stage.id}
              stage={stage}
              onDrop={handleDrop}
              onUpdateTitle={updateStageTitle}
              handleDelete={deleteCard}
              fetchStages={fetchStages}
              handleDeleteStage={deleteStage}
              
            />
          ))}
        </div>

      

      </div>
    </DndProvider>
  );
};

const Stage = ({ stage, onDrop, onUpdateTitle, handleDelete, fetchStages, handleDeleteStage  }) => {
  const [, drop] = useDrop({
    accept: 'CARD',
    drop: (item) => onDrop(item, stage.id),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(stage.title);

  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const saveTitle = () => {
    setIsEditing(false);
    onUpdateTitle(stage.id, title);
  };

  const addNewCard = async () => {
    if (!newCardTitle.trim() || !newCardDesc.trim()) {
      alert("Title and Description are required to add a card!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8055/api/Cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: newCardTitle,
          description: newCardDesc,
          stage: { id: stage.id },
        }),
      });

      if (response.ok) {
        console.log("Card added successfully!");
        setNewCardTitle('');
        setNewCardDesc('');
        fetchStages();
      } else {
        console.error("Failed to add card:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding card:", error);
    }
  };

  return (
    <div ref={drop} className="kanban-stage">
      {isEditing ? (
        <div>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={saveTitle}
            autoFocus
          />
          <button onClick={() => setIsEditing(false)}>Save</button>
        </div>
      ) : (
        <h3 onDoubleClick={() => setIsEditing(true)}>{stage.title}</h3>
      )}

      {/* Render cards */}
      <div className="kanban-cards">
         {(stage.cards || []).map((card) => (
    <Card key={card.id} card={card} onDelete={() => handleDelete(card.id)} />
  ))}
      </div>

      {/* Add new card */}
      <div className="kanban-card">
        <input
          type="text"
          placeholder="Card Title"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
        />
        <textarea
          placeholder="Card Description"
          value={newCardDesc}
          onChange={(e) => setNewCardDesc(e.target.value)}
        />
        <button onClick={addNewCard}>Add Card</button>
      </div>

         {/* Delete Stage Button */}
         <button
        onClick={() => handleDeleteStage(stage.id)}
        style={{
          background: 'red',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          marginTop: '10px',
        }}
      >
        Delete Stage
      </button>
      
    </div>
  );
};


const Card = ({ card, onDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: card,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="kanban-card"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      <h4>{card.title}</h4>
      <p>{card.description}</p>
      {/* Delete Button */}
      <button
        onClick={() => {onDelete()}}
        style={{ background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        Delete
      </button>
    </div>
  );
};



export default Kanban;
