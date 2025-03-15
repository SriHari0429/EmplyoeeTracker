import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Spinner } from "react-bootstrap";

const API_KEY = "AIzaSyBG8bOtP9chnnahShv1Pn-ytiizAJDGlko";
const SPREADSHEET_ID = "1YZHGs9aAtK22f1fZNJvXuPuhEZ23_XzaO__m7kGpXnw";

const SHEET_URLS = {
  Baccarat1: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1?key=${API_KEY}`,
  Baccarat2: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet2?key=${API_KEY}`,
  AndarBahar: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet3?key=${API_KEY}`,
  Roulette: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet4?key=${API_KEY}`,
};

const cache = {}; // Cache to store previously fetched data

const GameLevel = () => {
  const [game, setGame] = useState("Baccarat1");
  const [data, setData] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (cache[game]) {
      setData(cache[game]); // Load from cache if available
      setTables([...new Set(cache[game].map((item) => item.table))]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(SHEET_URLS[game]);
      const result = await response.json();
      const rows = result.values;

      if (!rows || rows.length < 2) {
        setData([]);
        setTables([]);
        return;
      }

      const formattedData = rows.slice(1).map((row) => {
        if (!row || !row[0]) return null;

        const dateParts = row[0].split("/");
        if (dateParts.length !== 3) return null;

        const [day, month, year] = dateParts;
        const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

        return {
          date: formattedDate,
          name: row[1] || "Unknown Player",
          table: row[2] || "Unknown Table",
          time: row[3] || "00:00",
          runningBalance: parseFloat((row[6] || "0").replace(/,/g, "")),
        };
      }).filter(item => item !== null && !isNaN(item.runningBalance));

      cache[game] = formattedData; // Store data in cache
      setData(formattedData);
      setTables([...new Set(formattedData.map((item) => item.table))]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [game]);

  useEffect(() => {
    fetchData();
  }, [game, fetchData]);

  const filteredData = useMemo(() => {
    return data.filter(item =>
      (!selectedTable || item.table === selectedTable) &&
      (!selectedDate || item.date === selectedDate)
    );
  }, [data, selectedTable, selectedDate]);

  return (
    <div className="container text-center pt-5 mt-5">
      <h1 className="text-center mb-4">Game Level Data</h1>

      <div className="row mb-4">
        <div className="col-md-4">
          <select className="form-select" onChange={(e) => setGame(e.target.value)} value={game}>
            {Object.keys(SHEET_URLS).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <select className="form-select" onChange={(e) => setSelectedTable(e.target.value)} value={selectedTable}>
            <option value="">Select Table</option>
            {tables.map((table) => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" role="status" />
          <p>Loading data...</p>
        </div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={600}>
            <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 50, bottom: 50 }}>
              <XAxis 
                dataKey="time" 
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
                  `Player: ${props.payload?.name || "N/A"}`
                ]} 
              />

              <Legend />

              <Line 
                type="monotone" 
                dataKey="runningBalance" 
                stroke="#ff4136" 
                strokeWidth={2}
                dot={{ r: 4, fill: "yellow" }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default GameLevel;
