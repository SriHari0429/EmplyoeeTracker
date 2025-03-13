import React, { useState, useEffect } from "react";
import "./userinfo.css";

const API_KEY = "AIzaSyBG8bOtP9chnnahShv1Pn-ytiizAJDGlko"; // Replace with your API Key
const SPREADSHEET_ID = "1YZHGs9aAtK22f1fZNJvXuPuhEZ23_XzaO__m7kGpXnw"; // Replace with your Google Sheets ID

const SHEET_URLS = [
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet2?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet3?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet4?key=${API_KEY}`,
];

const UserInfo = () => {
  const [data, setData] = useState([]);
  const [dates, setDates] = useState([]);
  const [names, setNames] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [workDuration, setWorkDuration] = useState("");
  const [profit, setProfit] = useState(0);
  const [loss, setLoss] = useState(0);

  useEffect(() => {
    fetchAllSheets();
  }, []);

  const fetchAllSheets = async () => {
    let allData = [];
    for (let url of SHEET_URLS) {
      try {
        const response = await fetch(url);
        const result = await response.json();
        const rows = result.values || [];

        const formattedData = rows.slice(1).map((row) => ({
          date: row[0]?.trim() || "Unknown Date",
          name: row[1]?.trim() || "Unknown Name",
          table: row[2]?.trim() || "Unknown Table",
          time: row[3]?.trim() || null,
          switch: row[4]?.trim() || "N/A",
          startB: row[5]?.trim() || "0",
          runningB: parseFloat(row[6]?.replace(/,/g, "") || 0), // Convert to number
          game: row[7]?.trim() || "Unknown Game",
        }));

        allData = [...allData, ...formattedData];
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    setData(allData);
    setDates([...new Set(allData.map((item) => item.date))]);
    calculateProfitLoss(allData);
  };

  useEffect(() => {
    if (selectedDate) {
      const filteredNames = [
        ...new Set(data.filter((item) => item.date === selectedDate).map((item) => item.name)),
      ];
      setNames(filteredNames);
      calculateProfitLoss(data, selectedDate);
    } else {
      setNames([]);
    }
  }, [selectedDate, data]);

  useEffect(() => {
    if (selectedDate && selectedName) {
      setWorkDuration(calculateWorkHours(data, selectedDate, selectedName));
      calculateProfitLoss(data, selectedDate, selectedName);
    }
  }, [selectedDate, selectedName, data]);

  const calculateWorkHours = (data, selectedDate, selectedName) => {
    const filteredData = data.filter(
      (row) => row.date === selectedDate && row.name === selectedName
    );

    if (filteredData.length === 0) return "No data found";

    const timestamps = filteredData
      .map((row) => {
        if (!row.time || row.time.length < 5) return null;
        const [hours, minutes] = row.time.split(":").map((val) => parseInt(val, 10));
        return new Date(2025, 2, 5, hours, minutes, 0);
      })
      .filter(Boolean)
      .sort((a, b) => a - b);

    if (timestamps.length === 0) return "Invalid time data";

    const startTime = timestamps[0];
    const endTime = timestamps[timestamps.length - 1];

    const totalMinutes = (endTime - startTime) / (1000 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    return `${hours} hours ${minutes} minutes`;
  };

  const calculateProfitLoss = (data, dateFilter = "", nameFilter = "") => {
    let profitSum = 0;
    let lossSum = 0;

    data.forEach((row) => {
      if ((!dateFilter || row.date === dateFilter) && (!nameFilter || row.name === nameFilter)) {
        if (row.runningB > 0) {
          profitSum += row.runningB;
        } else {
          lossSum += row.runningB;
        }
      }
    });

    setProfit(profitSum);
    setLoss(lossSum);
  };

  return (
    <div className="userinfo-container">
      <h1>User Work Hours & Profit/Loss Tracker</h1>

      <div className="dropdown-container">
        <select onChange={(e) => setSelectedDate(e.target.value)}>
          <option value="">Select Date</option>
          {dates.map((date) => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>

        <select onChange={(e) => setSelectedName(e.target.value)} disabled={!selectedDate}>
          <option value="">Select Name</option>
          {names.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="info-cards">
        <div className="work-card">
          <h2>Total Worked Hours</h2>
          <p>{workDuration}</p>
        </div>

        <div className="profit-loss-card">
          <h2>Total Profit</h2>
          <p>₹{profit.toLocaleString()}</p>
        </div>

        <div className="profit-loss-card loss">
          <h2>Total Loss</h2>
          <p>₹{Math.abs(loss).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
