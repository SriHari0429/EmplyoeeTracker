import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API_KEY = "AIzaSyBG8bOtP9chnnahShv1Pn-ytiizAJDGlko";
const SPREADSHEET_ID = "1YZHGs9aAtK22f1fZNJvXuPuhEZ23_XzaO__m7kGpXnw";

const SHEET_URLS = [
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet2?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet3?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet4?key=${API_KEY}`,
];

const Welcome = () => {
  const navigate = useNavigate();
  const [balances, setBalances] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      let today = new Date().toISOString().split("T")[0];
      let tempBalances = {};

      for (const url of SHEET_URLS) {
        try {
          const response = await fetch(url);
          const result = await response.json();
          const rows = result.values;
          if (!rows || rows.length < 2) continue;

          rows.slice(1).forEach((row) => {
            if (!row || !row[0]) return;
            const [day, month, year] = row[0].split("/");
            const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

            if (formattedDate === today) {
              const name = row[1] || "Unknown";
              const runningBalance = parseFloat((row[6] || "0").replace(/,/g, ""));
              tempBalances[name] = runningBalance;
            }
          });
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      setBalances(tempBalances);
    };

    fetchData();
  }, []);

  const cardData = [
    { title: "User Info", desc: "Every user action is captured", path: "/user-info" },
    { title: "Player Level Data", desc: "Every player graph", path: "/player-level" },
    { title: "Game Level Data", desc: "Every player table data", path: "/game-level" },
    { title: "Range Level Data", desc: "Particular date range data", path: "/range-level" },
    { title: "Overall Graph", desc: "Complete game data overview", path: "/over-all" },
    { title: "Tracking", desc: "Balance tracking details", path: "/balance-tracker" },
  ];

  return (
    <div className="container text-center pt-5 mt-5">
      <h1 className="mb-4 fw-bold text-primary">✨ Welcome to Nirlogi Solutions ✨</h1>
      <div className="row justify-content-center">
        {cardData.map((item, index) => (
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
