import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import { Spinner } from "react-bootstrap";

const API_KEY = "AIzaSyBG8bOtP9chnnahShv1Pn-ytiizAJDGlko";
const SPREADSHEET_ID = "1YZHGs9aAtK22f1fZNJvXuPuhEZ23_XzaO__m7kGpXnw";

const SHEET_URLS = [
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet2?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet3?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet4?key=${API_KEY}`,
];

const Overall = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all(SHEET_URLS.map((url) => fetch(url).then((res) => res.json())))
      .then((results) => {
        let parsedData = {};

        results.forEach((result) => {
          if (!result.values || result.values.length < 2) return;

          result.values.slice(1).forEach((row) => {
            const time = row[3] || "Unknown Time";
            const name = row[2] || "Unknown Player";
            let balanceString = (row[6] || "0").replace(/,/g, "");
            let balance = balanceString.includes("(")
              ? -parseFloat(balanceString.replace(/[()]/g, "")) 
              : parseFloat(balanceString);

            if (!parsedData[name]) {
              parsedData[name] = [];
            }

            parsedData[name].push({ time, balance });
          });
        });

        setData(parsedData);
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 30000); // Auto-refresh every 30sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container text-center pt-5 mt-5">
      <h1 className="text-center mb-4">Overall Game Data</h1>

      <div className="card p-3">
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" role="status" />
            <p>Loading data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart>
              <XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />

              {Object.entries(data).map(([player, balanceData], index) => (
                <Line 
                  key={index} 
                  type="monotone" 
                  dataKey="balance" 
                  data={balanceData} 
                  name={player} 
                  stroke={`hsl(${index * 60}, 100%, 50%)`} // Assigning different colors for players
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Overall;
