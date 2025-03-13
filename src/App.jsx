import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Welcome from "./components/welcome";
import PlayerData from "./components/playerlevel";
import GameLevel from "./components/gamelevel";
import RangeLevel from "./components/rangelevel";
import UserInfo from "./components/userinfo";

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/player-level" element={<PlayerData />} />
          <Route path="/game-level" element={<GameLevel />} />
          <Route path="/range-level" element={<RangeLevel />} />
          <Route path="/userinfo" element={<UserInfo />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
