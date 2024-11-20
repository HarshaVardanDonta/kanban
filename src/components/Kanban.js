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
    
    const response = await fetch(`http://localhost:8055/api/cards/${card.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem("token")
      },
      body: JSON.stringify(updatedCard),
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h2>Kanban Board</h2>
        <div className="kanban-board">
          {stages.map((stage) => (
            <Stage
              key={stage.id}
              stage={stage}
              onDrop={handleDrop}
              onUpdateTitle={updateStageTitle}
            />
          ))}
        </div>

        {/* Add new stage */}
        <div className="add-stage">
          <input
            type="text"
            placeholder="New stage title"
            value={newStageTitle}
            onChange={(e) => setNewStageTitle(e.target.value)}
          />
          <button onClick={addNewStage}>Add Stage</button>
        </div>

      </div>
    </DndProvider>
  );
};

const Stage = ({ stage, onDrop, onUpdateTitle }) => {
  const [, drop] = useDrop({
    accept: 'CARD',
    drop: (item) => onDrop(item, stage.id),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(stage.title);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const saveTitle = () => {
    setIsEditing(false);
    onUpdateTitle(stage.id, title);
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
        </div>
      ) : (
        <h3 onDoubleClick={() => setIsEditing(true)}>{stage.title}</h3>
      )}
      
    </div>
  );
};

export default Kanban;
