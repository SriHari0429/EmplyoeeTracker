import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Form, Container, Row, Col, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const API_KEY = "AIzaSyBG8bOtP9chnnahShv1Pn-ytiizAJDGlko";
const SPREADSHEET_ID = "1YZHGs9aAtK22f1fZNJvXuPuhEZ23_XzaO__m7kGpXnw";

const SHEET_URLS = {
  Baccarat1: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1?key=${API_KEY}`,
  Baccarat2: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet2?key=${API_KEY}`,
  AndarBahar: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet3?key=${API_KEY}`,
  Roulette: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet4?key=${API_KEY}`,
};

const PlayerLevel = () => {
  const [game, setGame] = useState("Baccarat1");
  const [data, setData] = useState([]);
  const [dates, setDates] = useState([]);
  const [names, setNames] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [cachedData, setCachedData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (cachedData[game]) {
        setData(cachedData[game]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(SHEET_URLS[game]);
        const result = await response.json();
        const rows = result.values;
        if (!rows || rows.length < 2) return;

        const formattedData = rows
          .slice(1)
          .map((row) => {
            if (!row || !row[0]) return null;
            const [day, month, year] = row[0].split("/");
            const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

            return {
              date: formattedDate,
              name: row[1] || "Unknown",
              table: row[2] || "Unknown Table",
              time: row[3] || "00:00",
              startBalance: parseFloat((row[5] || "0").replace(/,/g, "")),
              runningBalance: parseFloat((row[6] || "0").replace(/,/g, "")),
            };
          })
          .filter((item) => item && !isNaN(item.runningBalance) && !isNaN(item.startBalance));

        setCachedData((prev) => ({ ...prev, [game]: formattedData }));
        setData(formattedData);
        setDates([...new Set(formattedData.map((item) => item.date))]);
        setNames([...new Set(formattedData.map((item) => item.name))]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [game, cachedData]);

  const filteredData = useMemo(() => {
    return data.filter(
      (item) => (!selectedDate || item.date === selectedDate) && (!selectedName || item.name === selectedName)
    );
  }, [data, selectedDate, selectedName]);

  return (
    <Container fluid className="mt-4">
      <h2 className="text-center mb-4">Player Level Data</h2>

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" role="status" />
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          {/* Controls Section */}
          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Select Game</Form.Label>
                <Form.Select onChange={(e) => setGame(e.target.value)} value={game}>
                  {Object.keys(SHEET_URLS).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Select Date</Form.Label>
                <Form.Control type="date" onChange={(e) => setSelectedDate(e.target.value)} value={selectedDate} />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Select Name</Form.Label>
                <Form.Select onChange={(e) => setSelectedName(e.target.value)} value={selectedName}>
                  <option value="">All Players</option>
                  {names.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Chart Section */}
          <Row>
            <Col>
              <div className="border p-3 bg-white shadow rounded">
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: "500px" }}>
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={500}>
                    <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 50, bottom: 50 }}>
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
                        tickFormatter={(value) =>
                          value.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                        }
                        label={{ value: "Running Balance", angle: -90, position: "insideLeft" }}
                      />
                      <ReferenceLine y={0} stroke="blue" strokeWidth={2} strokeDasharray="5 5" />
                      <Tooltip
                        formatter={(value, name, props) => [
                          `Running Balance: ${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                          `Table: ${props.payload?.table || "N/A"}`,
                        ]}
                      />
                      <Legend />
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
                )}
              </div>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default PlayerLevel;
