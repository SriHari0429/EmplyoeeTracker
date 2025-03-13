import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import "./rangelevel.css";

const API_KEY = "AIzaSyBG8bOtP9chnnahShv1Pn-ytiizAJDGlko"; // Replace with your API Key
const SPREADSHEET_ID = "1YZHGs9aAtK22f1fZNJvXuPuhEZ23_XzaO__m7kGpXnw"; // Replace with your Google Sheets ID

const SHEET_URLS = {
  Baccarat1: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1?key=${API_KEY}`,
  Baccarat2: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet2?key=${API_KEY}`,
  AndarBahar: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet3?key=${API_KEY}`,
  Roulette: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet4?key=${API_KEY}`,
};

const RangeLevel = () => {
  const [game, setGame] = useState("Baccarat1"); // Default game
  const [data, setData] = useState([]);
  const [names, setNames] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetch(SHEET_URLS[game])
      .then((response) => response.json())
      .then((result) => {
        const rows = result.values;
        if (!rows || rows.length < 2) return;

        const formattedData = rows.slice(1).map((row) => ({
          date: row[0] || "Unknown Date",
          name: row[1] || "Unknown Name",
          table: row[2] || "Unknown Table",
          time: row[3] || "00:00",
          startBalance: parseFloat((row[5] || "0").replace(/,/g, "")),
          runningBalance: parseFloat((row[6] || "0").replace(/,/g, "")),
        })).filter(item => !isNaN(item.runningBalance) && !isNaN(item.startBalance));

        setData(formattedData);
        setNames([...new Set(formattedData.map((item) => item.name))]);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [game]);

  // Filter data based on user selection
  const filteredData = data.filter((item) => {
    // Convert sheet date to YYYY-MM-DD format for accurate comparison
    let formattedItemDate = item.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"); // Assuming DD/MM/YYYY
  
    const itemDate = new Date(formattedItemDate);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
  
    return (
      (!selectedName || item.name === selectedName) && // Filter by player name
      (!from || itemDate >= from) && // Filter by fromDate
      (!to || itemDate <= to) // Filter by toDate
    );
  });
console.log("Filtered Data for Graph:", filteredData);
  
  return (
    <div className="full-container">
      <h1>Range Level Data</h1>

      {/* Dropdowns Section */}
      <div className="dropdown-container">
        <select className="dropdown" onChange={(e) => setGame(e.target.value)}>
          {Object.keys(SHEET_URLS).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>

        <select className="dropdown" onChange={(e) => setSelectedName(e.target.value)}>
          <option value="">Select Name</option>
          {names.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <label>From Date: </label>
        <input type="date" className="date-picker" onChange={(e) => setFromDate(e.target.value)} />

        <label>To Date: </label>
        <input type="date" className="date-picker" onChange={(e) => setToDate(e.target.value)} />
      </div>

      {/* Chart Section */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={600}>
          <LineChart 
            data={filteredData}
            margin={{ top: 20, right: 30, left: 50, bottom: 50 }}
          >
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }} 
              angle={-45} 
              textAnchor="end" 
              label={{ value: "Time", position: "insideBottom", offset: -5 }} 
            />
            
            <YAxis 
              type="number"
              domain={["dataMin - 5000", "dataMax + 5000"]} 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toLocaleString("en-IN", { minimumFractionDigits: 2 })} 
              label={{ value: "Running Balance", angle: -90, position: "insideLeft" }} 
            />

            <ReferenceLine y={0} stroke="blue" strokeWidth={2} strokeDasharray="5 5" />

            <Tooltip
  formatter={(value, name, props) => [
    `Running Balance: ${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    `Player: ${props.payload?.name || "N/A"}`,
  ]}
  labelFormatter={(label, payload) => {
    if (payload && payload.length > 0 && payload[0].payload) {
      return `Date: ${payload[0].payload.date || "Unknown Date"}`;
    }
    return "Unknown Date";
  }}
/>



            <Legend />

            <Line 
              type="monotone" 
              dataKey="runningBalance" 
              stroke="#ff4136" 
              name="Running Balance" 
              strokeWidth={2}
              dot={{ r: 3 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RangeLevel;
