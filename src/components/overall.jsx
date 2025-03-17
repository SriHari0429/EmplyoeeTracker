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

const SHEET_URLS = [
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet2?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet3?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet4?key=${API_KEY}`,
];

const getGameName = (code) => {
  if (code.includes("AB")) return "Andar Bahar";
  if (code.includes("B")) return "Baccarat";
  if (code.includes("R")) return "Roulette";
  if (code.includes("T")) return "Texas Hold’em";
  if (code.includes("C")) return "Casino Hold’em";
  if (code.includes("E")) return "Extreme Texas Hold’em";
  return "Unknown Game";
};

const Overall = () => {
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all(SHEET_URLS.map((url) => fetch(url).then((res) => res.json())))
      .then((results) => {
        const allData = results.flatMap((result) => {
          const rows = result.values;
          if (!rows || rows.length < 2) return [];
          return rows.slice(1).map((row) => {
            return {
              date: row[0] || "Unknown Date",
              name: row[1] || "Unknown Player",
              game: getGameName(row[2] || ""),
              runningBalance: parseFloat((row[6] || "0").replace(/,/g, "")),
            };
          }).filter((item) => !isNaN(item.runningBalance));
        });
        setData(allData);
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      let formattedItemDate = item.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");
      const itemDate = new Date(formattedItemDate);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      return (!from || itemDate >= from) && (!to || itemDate <= to);
    });
  }, [data, fromDate, toDate]);

  return (
    <div className="container text-center pt-5 mt-5">
      <h1 className="text-center mb-4">Overall Game Data</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label">From Date:</label>
          <input type="date" className="form-control" onChange={(e) => setFromDate(e.target.value)} />
        </div>

        <div className="col-md-6">
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
              <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
              <YAxis domain={['dataMin - 5000', 'dataMax + 5000']} tick={{ fontSize: 12 }} />
              <ReferenceLine y={0} stroke="blue" strokeWidth={2} strokeDasharray="5 5" />
              <Tooltip
                formatter={(value, name, props) => [
                  `Running Balance: ${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                  `Game: ${props.payload?.game || "Unknown"} | Player: ${props.payload?.name || "Unknown"}`,
                ]}
                labelFormatter={(label, payload) =>
                  payload && payload.length > 0 && payload[0].payload
                    ? `Date: ${payload[0].payload.date || "Unknown Date"}`
                    : "Unknown Date"
                }
              />
              <Legend />
              <Line type="monotone" dataKey="runningBalance" stroke="#ff4136" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Overall;
