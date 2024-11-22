import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import kanbanAPI from '../Network/KanbanAPI';
import { FaPlus, FaTimes  } from 'react-icons/fa';

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
      setShowAddStagePopup(false);
    } catch (e) {
      console.error("Error adding new stage:", e);
    }
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

  const [showAddStagePopup, setShowAddStagePopup] = useState(false); // Popup visibility state



  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className='kanban-header'>
          <h2> Kanban Board</h2>

          {/* Plus icon button to show the popup */}
          <button
          onClick={() => setShowAddStagePopup(true)}
          style={{
            backgroundColor: 'green',
            width: 'fit-content',
            height:'fit-content',
            color: 'white',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '10px',
            alignContent: 'center',
            fontWeight: 'bold',
            margin: '0px'
          }}
        >
          Add Stage &nbsp;<FaPlus />
        </button>
        </div>
       

        {/* Modal for adding a new stage */}
        {showAddStagePopup && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add New Stage</h3>
                
                <button
                  onClick={() => setShowAddStagePopup(false)}
                  style={{
                    backgroundColor: 'red',
                    width: 'fit-content',
                    height:'fit-content',
                    color: 'white',
                    borderRadius: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <input
                type="text"
                placeholder="New stage title"
                value={newStageTitle}
                onChange={(e) => setNewStageTitle(e.target.value)}
                style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
              />
              <button
                onClick={addNewStage}
                disabled={newStageTitle.length === 0}
                style={{
                  padding: '10px',
                  cursor: newStageTitle.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Add Stage
              </button>
            </div>
          </div>
        )}

        <div className="kanban-board">
          {stages.map((stage) => (
            <Stage
              key={stage.id}
              stage={stage}
              onDrop={handleDrop}
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

const Stage = ({ stage, onDrop, handleDelete, fetchStages, handleDeleteStage }) => {
  const [, drop] = useDrop({
    accept: 'CARD',
    drop: (item) => onDrop(item, stage.id),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(stage.title);

  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');

  const handleTitleChange = async (e) => {
    setTitle(e.target.value);
    console.log(e.target.value)
  };

  const updateStageTitle = async () => {
    console.log("clicked")
    try {
      const response = await fetch(`http://localhost:8055/api/stages/updateStage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          id: stage.id,
          name: title
        }),
      });

      if (response.ok) {
        console.log(`Stage ${stage.id} updated successfully!`);
        setIsEditing(false); // Exit editing mode
        fetchStages();
      } else {
        console.error(`Failed to update stage ${stage.id}:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error updating stage ${stage.id}:`, error);
    }
  }

  const saveTitle = () => {
    setIsEditing(false);
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
            autoFocus
          />
          <button
            onClick={() => updateStageTitle()}
            disabled={title ==null}
          >
            Save
          </button>
          <button
            style={{
              background: 'red',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              marginTop: '10px',
            }}
            onClick={() => {
              setTitle(stage.title);
              setIsEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <h3 onDoubleClick={() => { setIsEditing(true); console.log('Editing mode:', true); }}>
          {stage.title}
        </h3>
      )}

      {/* Render cards */}
      <div className="kanban-cards">
        {(stage.cards || []).map((card) => (
          <Card key={card.id} card={card} onDelete={() => handleDelete(card.id)} fetchStages={fetchStages} />
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


const Card = ({ card, onDelete, fetchStages }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: card,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [editedDescription, setEditedDescription] = useState(card.description);

  // Function to handle editing the card
  const handleCardEdit = async () => {
    try {
      const response = await fetch(`http://localhost:8055/api/Cards/updateCard`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          id: card.id,
          title: editedTitle,
          description: editedDescription,
        }),
      });

      if (response.ok) {
        console.log(`Card ${card.id} updated successfully!`);
        setIsEditing(false); // Exit editing mode
        fetchStages();
      } else {
        console.error(`Failed to update card ${card.id}:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error updating card ${card.id}:`, error);
    }
  };

  return (
    <div
      ref={drag}
      className="kanban-card"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Edit Title"
            style={{ marginBottom: '5px', width: '100%' }}
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Edit Description"
            style={{ marginBottom: '5px', width: '100%' }}
          />
          <button onClick={handleCardEdit} style={{ marginRight: '5px' }}>
            Save
          </button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <h4 onDoubleClick={() => setIsEditing(true)}>{card.title}</h4>
          <p onDoubleClick={() => setIsEditing(true)}>{card.description}</p>
        </div>
      )}
      <button
        onClick={onDelete}
        style={{ background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        Delete
      </button>
    </div>
  );
};



export default Kanban;
