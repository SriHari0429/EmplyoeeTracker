import React from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css"; // Import styles

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <h1>Welcome to Nirlogic Dashboard</h1>
      <div className="card-container">
        <div className="card" onClick={() => navigate("/userinfo")}>
          <h2>User Info</h2>
          <p>Every user Actions are captured</p>
        </div>
        <div className="card" onClick={() => navigate("/player-level")}>
          <h2>Player Level Data</h2>
          <p>Every player graph</p>
        </div>
        <div className="card" onClick={() => navigate("/game-level")}>
          <h2>Game Level Data</h2>
          <p>Every player table data</p>
        </div>
        <div className="card" onClick={() => navigate("/range-level")}>
          <h2>Range Level Data</h2>
          <p>Particular date range data</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
