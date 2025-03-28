import React, { useState, useEffect } from "react";

const API_KEY = "AIzaSyBG8bOtP9chnnahShv1Pn-ytiizAJDGlko";
const SPREADSHEET_ID = "1YZHGs9aAtK22f1fZNJvXuPuhEZ23_XzaO__m7kGpXnw";

const SHEET_URLS = [
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet2?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet3?key=${API_KEY}`,
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet4?key=${API_KEY}`,
];

// Group 1 (Madu.pr125)
// const allowedUsers1 = ["Sai 1", "Monish 1", "Pooja 1", "Shonima 1", "Venu 1", "Manasa 1", "Yaswanth 1", "Hima 1", "Afreen 1"];
const allowedUsers1 = ["Sai 1", "Monish 1", "Ali 1", , "Suresh 1", "Pooja 1", "Gowthami 1"];

// Group 2 (bprasad)
// const allowedUsers2 = ["Harika 1", "Akhila 1", "Gowthami 1", "Rakshitha 1", "Smitha 1", "Akshatha 1", "Lakshmi", "PoojaE 1", "Prathika 1", "Pavani 1"];
const allowedUsers2 = [ "Rakshitha 1", "Smitha 1", "Akshatha 1", "Lakshmi", "Prathika 1", "Manasa 1", "Vardhan 1" ];

const BalanceTracker = () => {
  const [startingBalance1] = useState(20233);
  const [startingBalance2] = useState(20242);

  const [playerTotal1, setPlayerTotal1] = useState(0);
  const [playerTotal2, setPlayerTotal2] = useState(0);

  const [expectedBalance1, setExpectedBalance1] = useState(20233);
  const [expectedBalance2, setExpectedBalance2] = useState(20242);

  const [balanceDifference1, setBalanceDifference1] = useState(0);
  const [balanceDifference2, setBalanceDifference2] = useState(0);

  const [userBalances1, setUserBalances1] = useState({});
  const [userBalances2, setUserBalances2] = useState({});

  const [lastUpdated, setLastUpdated] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    let total1 = 0, total2 = 0;
    let newBalances1 = { ...userBalances1 };
    let newBalances2 = { ...userBalances2 };

    const today = new Date().toLocaleDateString("en-GB");
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedTime = `${hours}:${minutes < 10 ? "0" : ""}${minutes}${hours >= 12 ? "PM" : "AM"}`;
    setLastUpdated(formattedTime);

    for (let url of SHEET_URLS) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        const result = await response.json();
        if (!result.values) continue;

        result.values.slice(1).forEach((row) => {
          const rowDate = row[0]?.trim();
          const username = row[1]?.trim();
          const balance = parseFloat(row[6]?.replace(/,/g, "") || 0);

          if (allowedUsers1.includes(username) && rowDate === today) {
            newBalances1[username] = balance;
          }
          if (allowedUsers2.includes(username) && rowDate === today) {
            newBalances2[username] = balance;
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    allowedUsers1.forEach((user) => {
      if (!newBalances1[user]) newBalances1[user] = 0;
    });
    allowedUsers2.forEach((user) => {
      if (!newBalances2[user]) newBalances2[user] = 0;
    });

    total1 = Object.values(newBalances1).reduce((acc, balance) => acc + balance, 0);
    total2 = Object.values(newBalances2).reduce((acc, balance) => acc + balance, 0);

    setPlayerTotal1(total1);
    setPlayerTotal2(total2);

    setExpectedBalance1(startingBalance1 + total1);
    setExpectedBalance2(startingBalance2 + total2);

    setBalanceDifference1(total1);
    setBalanceDifference2(total2);

    setUserBalances1(newBalances1);
    setUserBalances2(newBalances2);

    setLoading(false);
  };

  return (
    <div className="container mt-5 p-5 text-center">
      <h2>Balance Tracker</h2>
      <p>Tracking selected users' balances.</p>

      {/* Group 1 (Madu.pr125) */}
      <div className="card p-4 shadow mt-4">
        <h4>Balance Overview (Madu.pr125)</h4>
        <h5>Starting Balance: <span className="text-primary">₹{startingBalance1.toLocaleString()}</span></h5>
        <h5>Player Total Balance: <span className="text-warning">₹{playerTotal1.toLocaleString()}</span></h5>
        <h5>Expected Balance: <span className="text-success">₹{expectedBalance1.toLocaleString()}</span></h5>
        <h5>Balance Difference: 
          <span className={`fw-bold ${balanceDifference1 >= 0 ? "text-success" : "text-danger"}`}>
            ₹{balanceDifference1.toLocaleString()}
          </span>
        </h5>
      </div>

      {/* Table for Group 1 */}
      <div className="card p-4 shadow mt-4">
        <h4>Users (Madu.pr125)</h4>
        {loading ? <p>Loading data...</p> : (
          <table className="table table-bordered mt-3">
            <thead>
              <tr><th>Name</th><th>Running Balance</th></tr>
            </thead>
            <tbody>
              {allowedUsers1.map((user, index) => (
                <tr key={index}>
                  <td>{user}</td>
                  <td className={userBalances1[user] >= 0 ? "text-success" : "text-danger"}>₹{userBalances1[user].toLocaleString()}</td>
                </tr>
              ))}
              <tr className="fw-bold text-primary"><td>Total</td><td>₹{playerTotal1.toLocaleString()}</td></tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Group 2 (bprasad) */}
      <div className="card p-4 shadow mt-4">
        <h4>Balance Overview (bprasad)</h4>
        <h5>Starting Balance: <span className="text-primary">₹{startingBalance2.toLocaleString()}</span></h5>
        <h5>Player Total Balance: <span className="text-warning">₹{playerTotal2.toLocaleString()}</span></h5>
        <h5>Expected Balance: <span className="text-success">₹{expectedBalance2.toLocaleString()}</span></h5>
        <h5>Balance Difference: 
          <span className={`fw-bold ${balanceDifference2 >= 0 ? "text-success" : "text-danger"}`}>
            ₹{balanceDifference2.toLocaleString()}
          </span>
        </h5>
      </div>

      {/* Table for Group 2 */}
      <div className="card p-4 shadow mt-4">
        <h4>Users (bprasad)</h4>
        {loading ? <p>Loading data...</p> : (
          <table className="table table-bordered mt-3">
            <thead>
              <tr><th>Name</th><th>Running Balance</th></tr>
            </thead>
            <tbody>
              {allowedUsers2.map((user, index) => (
                <tr key={index}><td>{user}</td><td>₹{userBalances2[user].toLocaleString()}</td></tr>
              ))}
              <tr className="fw-bold text-primary"><td>Total</td><td>₹{playerTotal2.toLocaleString()}</td></tr>
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-3">🕒 Last Updated: {lastUpdated}</p>
    </div>
  );
};

export default BalanceTracker;
