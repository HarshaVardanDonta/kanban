import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Kanban from './components/Kanban';

function App() {
  const [user, setUser] = React.useState(null);

  return (
    <Routes>
      <Route path="/" element={<Login setUser={setUser} />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/kanban"
        element={user ? <Kanban user={user} /> : <Navigate to="/" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
