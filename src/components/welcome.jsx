import React from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">
      <h1 className="mb-4 fw-bold text-primary">✨ Welcome to Nirlogi Solutions ✨</h1>
      <div className="row justify-content-center">
        {[
          { title: "User Info", desc: "Every user action is captured", path: "/userinfo" },
          { title: "Player Level Data", desc: "Every player graph", path: "/player-level" },
          { title: "Game Level Data", desc: "Every player table data", path: "/game-level" },
          { title: "Range Level Data", desc: "Particular date range data", path: "/range-level" },
        ].map((item, index) => (
          <div key={index} className="col-md-3 col-sm-6 mb-4">
            <div 
              className="card shadow-lg p-4 border-0 text-center"
              style={{ cursor: "pointer", transition: "transform 0.2s" }}
              onClick={() => navigate(item.path)}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <h2 className="h5 fw-bold">{item.title}</h2>
              <p className="text-muted">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Welcome;
