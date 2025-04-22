import React, { useState, useEffect } from "react";

const API_KEY = "AIzaSyBG8bOtP9chnnahShv1Pn-ytiizAJDGlko";
const SPREADSHEET_ID = "1YZHGs9aAtK22f1fZNJvXuPuhEZ23_XzaO__m7kGpXnw";

const SHEET_URLS = [
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet2?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet3?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet4?key=${API_KEY}`,
];

const allowedUsers1 = ["Sai 1", "Monish 1", "Ali 1", "Suresh 1", "Pooja 1", "Gowthami 1", "Lakshmi 1"];
const allowedUsers2 = ["Rakshitha 1", "Smitha 1", "Akshatha 1", "Prathika 1", "Manasa 1", "Vardhan 1"];

const SWITCH_THRESHOLD = 1550;

const BalanceTracker = () => {
  const [userBalances, setUserBalances] = useState({});
  const [switchValues, setSwitchValues] = useState({});
  const [lastSwitchValues, setLastSwitchValues] = useState({});
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  const [startingBalance1] = useState(20233);
  const [startingBalance2] = useState(20242);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    let newBalances = { ...userBalances };
    let newSwitchValues = { ...switchValues };
    let newLastSwitchValues = { ...lastSwitchValues };

    const today = new Date().toLocaleDateString("en-GB");
    const now = new Date();
    const formattedTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
    setLastUpdated(formattedTime);

    for (let url of SHEET_URLS) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const result = await response.json();
        if (!result.values) continue;

        result.values.slice(1).forEach((row) => {
          const rowDate = row[0]?.trim();
          const username = row[1]?.trim();
          const balance = row[6] ? parseFloat(row[6].replace(/,/g, "")) || 0 : 0;

          if ((allowedUsers1.includes(username) || allowedUsers2.includes(username)) && rowDate === today) {
            newBalances[username] = balance;

            if (!newSwitchValues[username]) {
              newSwitchValues[username] = 0;
            }

            if (Math.abs(balance - newSwitchValues[username]) >= SWITCH_THRESHOLD) {
              newLastSwitchValues[username] = newSwitchValues[username]; // Store last switch value
              newSwitchValues[username] = balance;
            }
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    setUserBalances(newBalances);
    setSwitchValues(newSwitchValues);
    setLastSwitchValues(newLastSwitchValues);
    setLoading(false);
  };

  const calculateOverview = (users, startingBalance) => {
    const totalBalance = users.reduce((acc, user) => acc + (userBalances[user] || 0), 0);
    const expectedBalance = startingBalance + totalBalance;
    return { totalBalance, expectedBalance, balanceDifference: totalBalance };
  };

  const renderOverview = (groupName, users, startingBalance) => {
    const { totalBalance, expectedBalance, balanceDifference } = calculateOverview(users, startingBalance);
    return (
      <div className="card p-4 shadow mt-4 text-center">
        <h4>Balance Overview ({groupName})</h4>
        <h5>
          Starting Balance: <span className="text-primary">₹{startingBalance.toLocaleString()}</span>
        </h5>
        <h5>
          Player Total Balance: <span className="text-warning">₹{totalBalance.toLocaleString()}</span>
        </h5>
        <h5>
          Expected Balance: <span className="text-success">₹{expectedBalance.toLocaleString()}</span>
        </h5>
        <h5>
          Balance Difference:{" "}
          <span className={`fw-bold ${balanceDifference >= 0 ? "text-success" : "text-danger"}`}>
            ₹{balanceDifference.toLocaleString()}
          </span>
        </h5>
      </div>
    );
  };

  const renderTable = (groupName, users) => {
    let totalBalance = 0;
  
    return (
      <div className="card p-4 shadow mt-4">
        <h4>{groupName}</h4>
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Running Balance</th>
                <th>Next Switch Value</th>
                <th>Last Switch Value</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                const currentBalance = userBalances[user] || 0;
                totalBalance += currentBalance; // Accumulate total running balance
                const nextSwitchUp = currentBalance + SWITCH_THRESHOLD;
                const nextSwitchDown = currentBalance - SWITCH_THRESHOLD;
                const lastSwitch = lastSwitchValues[user] !== undefined ? lastSwitchValues[user] : "-";
  
                const shouldSwitch = currentBalance >= nextSwitchUp || currentBalance <= nextSwitchDown;
  
                return (
                  <tr key={index} className={shouldSwitch ? "bg-danger text-white fw-bold" : ""}>
                    <td>{user}</td>
                    <td>₹{currentBalance.toLocaleString()}</td>
                    <td>
                      <span className="text-primary fw-bold">Switch at ₹{nextSwitchUp.toLocaleString()}</span>
                      <span className="text-light"> or </span>
                      <span className="text-primary fw-bold">₹{nextSwitchDown.toLocaleString()}</span>
                    </td>
                    <td className="text-warning fw-bold">{lastSwitch !== "-" ? `₹${lastSwitch.toLocaleString()}` : "-"}</td>
                  </tr>
                );
              })}
              {/* ✅ Add Total Row */}
              <tr className="fw-bold bg-light">
                <td>Total</td>
                <td>₹{totalBalance.toLocaleString()}</td>
                <td colSpan="2"></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div className="container mt-5 p-5 text-center">
      <h2>Balance Tracker</h2>
      <p>Tracking selected users' balances.</p>
      {renderOverview("Madu.pr125", allowedUsers1, startingBalance1)}
      {renderTable("Madu.pr125", allowedUsers1)}
      {renderOverview("bprasad", allowedUsers2, startingBalance2)}
      {renderTable("bprasad", allowedUsers2)}
      <p className="mt-3">🕒 Last Updated: {lastUpdated}</p>
    </div>
  );
};

export default BalanceTracker;