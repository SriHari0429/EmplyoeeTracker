import React, { useState, useEffect } from "react";
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
import { Spinner, Button, Form } from "react-bootstrap";

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
  const [filteredData, setFilteredData] = useState([]);
  const [totalPositive, setTotalPositive] = useState(0);
  const [totalNegative, setTotalNegative] = useState(0);
  const [totalDifference, setTotalDifference] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    setToDate(today);
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all(SHEET_URLS.map((url) => fetch(url).then((res) => res.json())))
      .then((results) => {
        let seenTransactions = new Set();
        let allData = results.flatMap((result) => {
          const rows = result.values;
          if (!rows || rows.length < 2) return [];

          return rows
            .slice(1)
            .map((row) => {
              let balanceString = (row[6] || "0").replace(/,/g, "");
              let balance = balanceString.includes("(")
                ? -parseFloat(balanceString.replace(/[()]/g, ""))
                : parseFloat(balanceString);

              let transactionId = `${row[0]}-${row[2]}-${row[3]}-${balance}`;
              if (seenTransactions.has(transactionId)) return null;
              seenTransactions.add(transactionId);

              return {
                date: row[0] || "Unknown Date",
                time: row[3] || "Unknown Time",
                name: row[2] || "Unknown Player",
                game: getGameName(row[3] || ""),
                runningBalance: isNaN(balance) ? 0 : balance,
              };
            })
            .filter(Boolean);
        });

        allData.sort((a, b) => {
          let dateTimeA = new Date(`${a.date.split("/").reverse().join("-")} ${a.time}`);
          let dateTimeB = new Date(`${b.date.split("/").reverse().join("-")} ${b.time}`);
          return dateTimeA - dateTimeB;
        });

        setData(allData);
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const from = fromDate ? new Date(fromDate) : new Date(today);
    const to = toDate ? new Date(toDate) : new Date(today);
  
    const filteredTransactions = data.filter((item) => {
      const itemDate = new Date(item.date.split("/").reverse().join("-"));
      return itemDate >= from && itemDate <= to;
    });
  
    const groupedByTime = {};
    filteredTransactions.forEach((item) => {
      const timeKey = item.time;
      if (!groupedByTime[timeKey]) groupedByTime[timeKey] = [];
      groupedByTime[timeKey].push(item);
    });
  
    let totalPos = 0;
    let totalNeg = 0;
    let prevDifference = 0;
    let graphPoints = [];
  
    Object.entries(groupedByTime)
      .sort((a, b) => {
        const t1 = new Date(`1970-01-01T${a[0]}`);
        const t2 = new Date(`1970-01-01T${b[0]}`);
        return t1 - t2;
      })
      .forEach(([time, group]) => {
        const nameMap = {};
  
        group.forEach((item) => {
          const name = item.name;
          if (!nameMap[name]) nameMap[name] = { pos: 0, neg: 0 };
  
          if (item.runningBalance >= 0) {
            nameMap[name].pos += item.runningBalance;
          } else {
            nameMap[name].neg += Math.abs(item.runningBalance);
          }
        });
  
        let groupPos = 0;
        let groupNeg = 0;
  
        Object.values(nameMap).forEach(({ pos, neg }) => {
          groupPos += pos;
          groupNeg += neg;
        });
  
        totalPos += groupPos;
        totalNeg += groupNeg;
        const currentDifference = totalPos - totalNeg;
  
        graphPoints.push({
          time,
          totalDifference: currentDifference,
          prevDifference,
        });
  
        prevDifference = currentDifference;
      });
  
    setTotalPositive(totalPos);
    setTotalNegative(totalNeg);
    setTotalDifference(totalPos - totalNeg);
    setFilteredData(graphPoints);
  }, [data, fromDate, toDate]);
  
  
  return (
    <div className="container text-center pt-5 mt-5">
      <h1 className="text-center mb-4">Overall Game Data</h1>
      <div className="card p-3">
        <div className="row mb-3">
          <div className="col-md-6">
            <Form.Group>
              <Form.Label>From Date:</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group>
              <Form.Label>To Date:</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Form.Group>
          </div>
        </div>

        <Button variant="primary" onClick={fetchData} className="mb-3 w-2">
          Refresh Data
        </Button>

        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" role="status" />
            <p>Loading data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
              <YAxis tick={{ fontSize: 12 }} />
              <ReferenceLine y={0} stroke="blue" strokeWidth={2} strokeDasharray="5 5" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalDifference" stroke="#28a745" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mb-4">
  <h5 className="text-success">Total Positive: ₹{totalPositive.toLocaleString()}</h5>
  <h5 className="text-danger">Total Negative: ₹{totalNegative.toLocaleString()}</h5>
  <h5 className="text-primary">Total Difference: ₹{totalDifference.toLocaleString()}</h5>
</div>


    </div>
  );
};

export default Overall;
