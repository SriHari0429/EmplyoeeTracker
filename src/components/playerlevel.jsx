    import React, { useState, useEffect } from "react";
    import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
    import "./playerlevel.css";

    const API_KEY = "AIzaSyBG8bOtP9chnnahShv1Pn-ytiizAJDGlko"; // Replace with your API Key
    const SPREADSHEET_ID = "1YZHGs9aAtK22f1fZNJvXuPuhEZ23_XzaO__m7kGpXnw"; // Replace with your Google Sheets ID

    const SHEET_URLS = {
    Baccarat1: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1?key=${API_KEY}`,
    Baccarat2: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet2?key=${API_KEY}`,
    AndarBahar: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet3?key=${API_KEY}`,
    Roulette: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet4?key=${API_KEY}`,
    };

    const PlayerLevel = () => {
    const [game, setGame] = useState("Baccarat1"); // Default to Baccarat1
    const [data, setData] = useState([]);
    const [dates, setDates] = useState([]);
    const [names, setNames] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedName, setSelectedName] = useState("");

    useEffect(() => {
        fetch(SHEET_URLS[game])
        .then((response) => response.json())
        .then((result) => {
            console.log("API Response:", result); // Debugging Step
            const rows = result.values;
            if (!rows || rows.length < 2) return;

            const formattedData = rows.slice(1).map((row) => ({
            date: row[0] || "Unknown Date",  
            name: row[1] || "Unknown Name",  
            table: row[2] || "Unknown Table",  
            time: row[3] || "00:00",       
            startBalance: parseFloat((row[5] || "0").replace(/,/g, "")), 
            runningBalance: parseFloat((row[6] || "0").replace(/,/g, "")), 
            })).filter(item => !isNaN(item.runningBalance) && !isNaN(item.startBalance));

            console.log("Formatted Data:", formattedData); // Debugging Step

            setData(formattedData);
            setDates([...new Set(formattedData.map((item) => item.date))]);
            setNames([...new Set(formattedData.map((item) => item.name))]);
        })
        .catch((error) => console.error("Error fetching data:", error));
    }, [game]); 

    return (
        <div className="full-container">
            <h1>Player Level Data</h1>
        {/* Dropdowns Section */}
        <div className="dropdown-container">
            <select className="dropdown" onChange={(e) => setGame(e.target.value)}>
            {Object.keys(SHEET_URLS).map((key) => (
                <option key={key} value={key}>{key}</option>
            ))}
            </select>

            <select className="dropdown" onChange={(e) => setSelectedDate(e.target.value)}>
            <option value="">Select Date</option>
            {dates.map((date) => (
                <option key={date} value={date}>{date}</option>
            ))}
            </select>

            <select className="dropdown" onChange={(e) => setSelectedName(e.target.value)}>
            <option value="">Select Name</option>
            {names.map((name) => (
                <option key={name} value={name}>{name}</option>
            ))}
            </select>
        </div>

        {/* Chart Section */}
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={600}>
            <LineChart 
                data={data.filter(item => 
                (!selectedDate || item.date === selectedDate) && 
                (!selectedName || item.name === selectedName)
                )}
                margin={{ top: 20, right: 30, left: 50, bottom: 50 }}
            >
                <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }} 
                angle={-45} 
                textAnchor="end" 
                label={{ value: "Time", position: "insideBottom", offset: -5 }} 
                />
                
                <YAxis 
                type="number"
                domain={["dataMin - 5000", "dataMax + 5000"]} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString("en-IN", { minimumFractionDigits: 2 })} 
                label={{ value: "Running Balance", angle: -90, position: "insideLeft" }} 
                />

                {/* Reference line at 0 for clarity */}
                <ReferenceLine y={0} stroke="blue" strokeWidth={2} strokeDasharray="5 5" />

                <Tooltip 
                formatter={(value, name, props) => [
                    `Running Balance: ${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                    `Table: ${props.payload?.table || "N/A"}`
                ]} 
                />

                <Legend />

                {/* Running Balance Line */}
                <Line 
                type="monotone" 
                dataKey="runningBalance" 
                stroke="#ff4136" 
                name="Running Balance" 
                strokeWidth={2}
                dot={{ r: 3 }} 
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
        </div>
    );
    };

    export default PlayerLevel;
