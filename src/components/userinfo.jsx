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
  const [selectedUsers, setSelectedUsers] = useState(new Set());

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
            updateTime: row[3]?.trim() || "N/A",
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
      const filtered = allData.filter((item) => item.date === uniqueDates[0]);
      setFilteredData(filtered);

      // Initialize selected users (all checked by default)
      const initialSelectedUsers = new Set(filtered.map((item) => item.name));
      setSelectedUsers(initialSelectedUsers);
    }
    setLoading(false);
  };

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    const filtered = data.filter((item) => item.date === newDate);
    setFilteredData(filtered);

    // Update selected users for new date
    const newSelectedUsers = new Set(filtered.map((item) => item.name));
    setSelectedUsers(newSelectedUsers);
  };

  const processedData = filteredData.reduce((acc, item) => {
    acc[item.name] = {
      ...item,
      updateTime: item.updateTime,
      runningBalance: item.runningBalance,
    };
    return acc;
  }, {});

  // Checkbox handler to track selected users
  const handleCheckboxChange = (name) => {
    setSelectedUsers((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(name)) {
        newSelected.delete(name);
      } else {
        newSelected.add(name);
      }
      return newSelected;
    });
  };

  // Filter selected users and calculate the total balance
  const selectedBalances = Object.values(processedData).filter((user) =>
    selectedUsers.has(user.name)
  );
  const totalBalance = selectedBalances.reduce(
    (sum, user) => sum + user.runningBalance,
    0
  );

  return (
    <div className="container pt-5 mt-10">
      <h1 className="text-center mb-4 text-primary fw-bold text-center pt-5 mt-5">
        User Leaderboard
      </h1>
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
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead className="table-dark text-center">
                <tr>
                  <th>Select</th>
                  <th>Name</th>
                  <th>Current Game</th>
                  <th>Current Table</th>
                  <th>Current Running Balance</th>
                  <th>Update Time</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(processedData).length > 0 ? (
                  Object.values(processedData).map((user, index) => (
                    <tr key={index} className="text-center">
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.name)}
                          onChange={() => handleCheckboxChange(user.name)}
                        />
                      </td>
                      <td>{user.name}</td>
                      <td>{user.currentGame}</td>
                      <td>{user.currentTable}</td>
                      <td
                        className={`fw-bold ${
                          user.runningBalance >= 0
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        ₹{user.runningBalance.toLocaleString()}
                      </td>
                      <td>{user.updateTime}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center fw-bold text-danger">
                      No data available for selected date.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="table-warning text-center">
                <tr>
                  <td colSpan="4" className="fw-bold">Total Selected Balance</td>
                  <td
                    className={`fw-bold ${
                      totalBalance >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    ₹{totalBalance.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default UserInfo;
