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
        let seenTransactions = new Set(); // ✅ Prevent duplicates
  
        const allData = results.flatMap((result) => {
          const rows = result.values;
          if (!rows || rows.length < 2) return [];
  
          return rows.slice(1).map((row) => {
            let balanceString = (row[6] || "0").replace(/,/g, ""); // Remove commas
  
            // ✅ Convert values in parentheses (e.g., "(110)") into negative numbers
            let balance = balanceString.includes("(") 
              ? -parseFloat(balanceString.replace(/[()]/g, "")) 
              : parseFloat(balanceString);
  
            let transactionId = `${row[0]}-${row[3]}-${balance}`; // Unique ID
            if (seenTransactions.has(transactionId)) return null; // ✅ Avoid duplicates
            seenTransactions.add(transactionId);
  
            return {
              date: row[0] || "Unknown Date",
              time: row[3] || "Unknown Time", // Capture time for sorting
              name: row[2] || "Unknown Player",
              game: getGameName(row[3] || ""),
              runningBalance: isNaN(balance) ? 0 : balance, // Ensure valid numbers
            };
          }).filter(Boolean); // Remove nulls (duplicates)
        });
        allData.sort((a, b) => {
          let dateTimeA = new Date(`${a.date} ${a.time}`);
          let dateTimeB = new Date(`${b.date} ${b.time}`);
          return dateTimeA - dateTimeB;
        });
        

        setData(allData);
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setLoading(false));
  }, []);
  
  

  const filteredData = useMemo(() => {
    let balanceMap = new Map(); // ✅ Store each player's last balance
    let cumulativeProfitLoss = 0; // ✅ Track total profit/loss
  
    return data
      .filter((item) => {
        let formattedItemDate = item.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");
        const itemDate = new Date(formattedItemDate);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        return (!from || itemDate >= from) && (!to || itemDate <= to);
      })
      .map((item) => {
        let prevBalance = balanceMap.get(item.name) || 0; // ✅ Get previous balance per player
        let difference = item.runningBalance - prevBalance; // ✅ Correct balance change
        cumulativeProfitLoss += difference; // ✅ Update cumulative profit/loss
        balanceMap.set(item.name, item.runningBalance); // ✅ Store new balance for next calculation
  
        return { 
          ...item, 
          cumulativeBalance: cumulativeProfitLoss, // ✅ Properly updated
        };
      });
  }, [data, fromDate, toDate]);
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const color = value >= 0 ? "green" : "red"; // ✅ Green for positive, Red for negative
  
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "8px",
            border: `2px solid ${color}`, // ✅ Border color based on value
            boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: "5px" }}>{`Time: ${label}`}</p>
          <p style={{ color: color, fontWeight: "bold" }}>
            Balance: {value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };
  

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
    
    {/* ✅ Use Time Instead of Date for Better Tooltip Accuracy */}
    <XAxis 
      dataKey="time" 
      tick={{ fontSize: 12 }} 
      angle={-45} 
      textAnchor="end" 
    />

    <YAxis 
      domain={['dataMin - 5000', 'dataMax + 5000']} 
      tick={{ fontSize: 12 }} 
    />

    <ReferenceLine y={0} stroke="blue" strokeWidth={2} strokeDasharray="5 5" />

    {/* ✅ Fix Tooltip to Show Time Instead of Player Name */}
    <Tooltip content={<CustomTooltip />}
  formatter={(value) => [
    value.toLocaleString("en-IN", { minimumFractionDigits: 2 }), // ✅ Format number
  ]}
  labelFormatter={(label, payload) => {
    if (payload && payload.length > 0) {
      return `Time: ${payload[0].payload.time || "Unknown Time"}`; // ✅ Show Time Properly
    }
    return "Unknown Time";
  }}
  contentStyle={{
    borderRadius: "8px",
    border: "none",
    padding: "10px",
  }}
  itemStyle={(props) => ({
    color: props.payload.value >= 0 ? "green" : "red", // ✅ Green for positive, Red for negative
    fontWeight: "bold",
  })}
/>


    <Legend />

    {/* ✅ Use Proper Line Stroke for Cumulative Balance */}
    <Line 
      type="monotone" 
      dataKey="cumulativeBalance" 
      stroke="#ff4136" 
      strokeWidth={2} 
      dot={{ r: 3 }} 
    />
  </LineChart>
</ResponsiveContainer>

        )}
      </div>
    </div>
  );
};

export default Overall;
