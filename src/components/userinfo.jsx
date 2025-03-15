import React, { useState, useEffect } from "react";

const API_KEY = "AIzaSyBG8bOtP9chnnahShv1Pn-ytiizAJDGlko"; // Replace with your API Key
const SPREADSHEET_ID = "1YZHGs9aAtK22f1fZNJvXuPuhEZ23_XzaO__m7kGpXnw"; // Replace with your Google Sheets ID

const SHEET_URLS = [
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet2?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet3?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet4?key=${API_KEY}`,
];

const getGameName = (gameCode) => {
  if (!gameCode) return "Unknown Game";
  if (gameCode.includes("AB1")) return "Andar Bahar";
  if (gameCode.includes("B1")) return "Baccarat";
  if (gameCode.includes("R1")) return "Roulette";
  if (gameCode.includes("T1")) return "Texas Hold'em";
  if (gameCode.includes("C1")) return "Casino Hold'em";
  return "Unknown Game";
};

const UserInfo = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSheets();
  }, []);

  const fetchAllSheets = async () => {
    setLoading(true);
    let allData = [];
    for (let url of SHEET_URLS) {
      try {
        const response = await fetch(url);
        const result = await response.json();
        if (!result.values) continue;

        const rows = result.values.slice(1).map((row) => {
          let rawDate = row[0]?.trim() || "Unknown Date";
          let formattedDate = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawDate)
            ? rawDate.split("/").reverse().join("-")
            : rawDate;

          return {
            date: formattedDate,
            name: row[1]?.trim() || "Unknown Name",
            currentTable: row[2]?.trim() || "Unknown Table",
            runningBalance: parseFloat(row[6]?.replace(/,/g, "") || 0),
            currentGame: getGameName(row[7]?.trim()),
            time: row[3]?.trim() || "N/A",
            profit: row[6] > 0 ? parseFloat(row[6]) : 0,
            loss: row[6] < 0 ? Math.abs(parseFloat(row[6])) : 0,
          };
        });

        allData = [...allData, ...rows];
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    const uniqueDates = [...new Set(allData.map((item) => item.date))]
      .filter((d) => d !== "Unknown Date")
      .sort((a, b) => b.localeCompare(a));

    setDates(uniqueDates);
    setData(allData);
    if (uniqueDates.length > 0) {
      setSelectedDate(uniqueDates[0]);
      setFilteredData(allData.filter((item) => item.date === uniqueDates[0]));
    }
    setLoading(false);
  };

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    setFilteredData(data.filter((item) => item.date === newDate));
  };

  const processedData = filteredData.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = { 
        ...item, 
        shiftStart: item.time,  
        shiftEnd: item.time,
        runningBalance: item.runningBalance,
        profit: item.runningBalance > 0 ? item.runningBalance : 0, 
        loss: item.runningBalance < 0 ? Math.abs(item.runningBalance) : 0,
      };
    } else {
      acc[item.name].shiftStart = acc[item.name].shiftStart < item.time ? acc[item.name].shiftStart : item.time;
      acc[item.name].shiftEnd = item.time;
      acc[item.name].runningBalance = item.runningBalance;
  
      if (item.runningBalance > 0) {
        acc[item.name].profit += item.runningBalance;
      }
      if (item.runningBalance < 0) {
        acc[item.name].loss += Math.abs(item.runningBalance);
      }
    }
  
    // ✅ Calculate Total Work Hours
    const startTime = new Date(`2024-01-01 ${acc[item.name].shiftStart}`);
    const endTime = new Date(`2024-01-01 ${acc[item.name].shiftEnd}`);
    const totalMinutes = (endTime - startTime) / (1000 * 60); // Convert ms to minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    acc[item.name].totalHoursWorked = `${hours}h ${minutes}m`;
  
    return acc;
  }, {});
  

  return (
    <div className="container pt-5 mt-10">
      <h1 className="text-center mb-4 text-primary fw-bold text-center pt-5 mt-5">User Leaderboard</h1>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 w-25">
            <label className="form-label fw-bold">Select Date:</label>
            <input type="date" className="form-control" value={selectedDate} onChange={handleDateChange} />
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead className="table-dark text-center">
                <tr>
                  <th>Name</th>
                  <th>Current Game</th>
                  <th>Current Table</th>
                  <th>Running Balance</th>
                  <th>Shift Start</th>
                  <th>Shift End</th>
                  <th>Total Hours Worked</th>
                  <th>Profit</th>
                  <th>Loss</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(processedData).length > 0 ? (
                  Object.values(processedData).map((user, index) => (
                    <tr key={index} className="text-center">
                      <td>{user.name}</td>
                      <td>{user.currentGame}</td>
                      <td>{user.currentTable}</td>
                      <td className="fw-bold text-primary">₹{user.runningBalance.toLocaleString()}</td>
                      <td>{user.shiftStart}</td>
                      <td>{user.shiftEnd}</td>
                      <td className="fw-bold text-info">{user.totalHoursWorked}</td>
                      <td className="text-success fw-bold">₹{user.profit.toLocaleString()}</td>
                      <td className="text-danger fw-bold">₹{user.loss.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center fw-bold text-danger">No data available for selected date.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default UserInfo;
