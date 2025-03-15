import React, { useState, useEffect, useMemo } from "react";
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
import "bootstrap/dist/css/bootstrap.min.css";
import { Spinner } from "react-bootstrap";

const API_KEY = "AIzaSyBG8bOtP9chnnahShv1Pn-ytiizAJDGlko"; 
const SPREADSHEET_ID = "1YZHGs9aAtK22f1fZNJvXuPuhEZ23_XzaO__m7kGpXnw"; 

const SHEET_URLS = {
  Baccarat1: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1?key=${API_KEY}`,
  Baccarat2: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet2?key=${API_KEY}`,
  AndarBahar: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet3?key=${API_KEY}`,
  Roulette: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet4?key=${API_KEY}`,
};

const RangeLevel = () => {
  const [game, setGame] = useState("Baccarat1");
  const [data, setData] = useState([]);
  const [names, setNames] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
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
        })).filter((item) => !isNaN(item.runningBalance) && !isNaN(item.startBalance));

        setData(formattedData);
        setNames([...new Set(formattedData.map((item) => item.name))]);
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setLoading(false));
  }, [game]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      let formattedItemDate = item.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");
      const itemDate = new Date(formattedItemDate);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      return (
        (!selectedName || item.name === selectedName) &&
        (!from || itemDate >= from) &&
        (!to || itemDate <= to)
      );
    });
  }, [data, selectedName, fromDate, toDate]);

  return (
    <div className="container text-center pt-5 mt-5">
      <h1 className="text-center mb-4">Range Level Data</h1>

      <div className="row mb-4">
        <div className="col-md-3">
          <label className="form-label">Select Game:</label>
          <select className="form-select" onChange={(e) => setGame(e.target.value)}>
            {Object.keys(SHEET_URLS).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Select Name:</label>
          <select className="form-select" onChange={(e) => setSelectedName(e.target.value)}>
            <option value="">All Players</option>
            {names.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">From Date:</label>
          <input type="date" className="form-control" onChange={(e) => setFromDate(e.target.value)} />
        </div>

        <div className="col-md-3">
          <label className="form-label">To Date:</label>
          <input type="date" className="form-control" onChange={(e) => setToDate(e.target.value)} />
        </div>
      </div>

      <div className="card p-3">
        {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" role="status" />
                  <p>Loading data...</p>
                </div>
              ) : (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                label={{ value: "Date", position: "insideBottom", offset: -5 }}
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
                labelFormatter={(label, payload) =>
                  payload && payload.length > 0 && payload[0].payload
                    ? `Date: ${payload[0].payload.date || "Unknown Date"}`
                    : "Unknown Date"
                }
              />

              <Legend />
              <Line type="monotone" dataKey="runningBalance" stroke="#ff4136" name="Running Balance" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RangeLevel;
