import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Welcome from "./components/welcome";
import PlayerData from "./components/playerlevel";
import GameLevel from "./components/gamelevel";
import RangeLevel from "./components/rangelevel";
import UserInfo from "./components/userinfo";
import Overall from "./components/overall";
import BalanceTracker from "./components/BalanceTracker";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap is now globally included

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/player-level" element={<PlayerData />} />
          <Route path="/game-level" element={<GameLevel />} />
          <Route path="/range-level" element={<RangeLevel />} />
          <Route path="/user-info" element={<UserInfo />} />
          <Route path="/over-all" element={<Overall />} />
          <Route path="/balance-tracker" element={<BalanceTracker />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
