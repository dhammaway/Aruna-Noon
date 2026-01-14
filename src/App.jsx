import { useState, useEffect } from "react";
import SunCalc from "suncalc";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

import { fetchGeoLocationDetail, parseLocation, months } from "./utils";
import "./App.css";

function App() {
  const [page, setPage] = useState("input");
  const [year, setYear] = useState(new Date().getFullYear());
  const [location, setLocation] = useState(null);
  const [place, setPlace] = useState(null);
  const [times, setTimes] = useState({});
  const [error, setError] = useState(null);
  const [arunaOffset, setArunaOffset] = useState(40);
  const [fetchingState, setFetchingState] = useState({
    status: "idle",
    error: null,
  });

  const { latitude = 0, longitude = 0 } = location || {};

  const years = Array.from(
    { length: 20 },
    (_, i) => new Date().getFullYear() - 10 + i
  );

  useEffect(() => {
    if (location == null) return;
    setFetchingState({ status: "loading", error: null });
    fetchGeoLocationDetail(location.latitude, location.longitude)
      .then((result) => {
        const { city, town, village, country, amenity } = result;
        setPlace({
          name: amenity || village || city || town || "Unknown",
          country: country || "Unknown",
        });
        setError(null);
        setFetchingState({ status: "success", error: null });
      })
      .catch((err) => {
        setError("Failed to get location name.");
        setFetchingState({ status: "error", error: err });
        console.error(`Failed to get location name: ${err.message}`);
      });
  }, [location, setError, setPlace]);

  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude.toFixed(7);
          const longitude = position.coords.longitude.toFixed(7);
          setLocation({ latitude, longitude });
          setError(null);
        },
        (err) => setError(err.message)
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const getSunTimesForYear = () => {
    if (!location) return;
    const { latitude, longitude } = location;
    const sunTimes = {};
    for (let month = 0; month < 12; month++) {
      sunTimes[month] = {};
      for (let day = 1; day <= 31; day++) {
        const date = new Date(year, month, day);
        if (date.getMonth() !== month) continue;
        const times = SunCalc.getTimes(date, latitude, longitude);
        const arunaTime = new Date(
          times.sunrise.getTime() - arunaOffset * 60000
        );
        sunTimes[month][day] = `${arunaTime.getHours()}:${arunaTime
          .getMinutes()
          .toString()
          .padStart(2, "0")} / ${times.solarNoon.getHours()}:${times.solarNoon
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
      }
    }
    setTimes(sunTimes);
    setPage("table");
  };

  const printPDF = () => {
    if (Object.keys(times).length === 0) {
      alert("Table data is not ready yet. Please wait.");
      return;
    }

    const pdf = new jsPDF("landscape");

    // Title: "Aruna & Noon Time [year] at [location], [country]"
    pdf.setFontSize(14);
    const title = `Aruna & Noon Time ${year} at ${place?.name || "Unknown"} (${
      place?.country || "Unknown"
    })`;

    // Center the title dynamically
    const titleWidth =
      (pdf.getStringUnitWidth(title) * pdf.getFontSize()) /
      pdf.internal.scaleFactor;
    const x = (pdf.internal.pageSize.width - titleWidth) / 2;
    pdf.text(title, x, 10);

    const tableData = [];
    for (let day = 1; day <= 31; day++) {
      const row = [day];
      months.forEach((_, monthIndex) => {
        row.push(times[monthIndex]?.[day] || "-");
      });
      tableData.push(row);
    }

    const columns = [
      { header: "Date", dataKey: "date" },
      ...months.map((month) => ({
        header: month,
        dataKey: month.toLowerCase(),
      })),
    ];

    // Manually setting row height and adjusting margins
    pdf.autoTable({
      head: [columns.map((col) => col.header)],
      body: tableData,
      startY: 20, // Adjusted top margin for the table
      theme: "grid",
      styles: {
        fontSize: 8, // Further reduced font size
        cellPadding: 1, // Reduced padding between cells
        halign: "center", // Center-align content
        cellHeight: 5, // Set custom row height for the cells
      },
      columnStyles: {
        0: { cellWidth: 15 }, // Adjusted width for date column
        1: { cellWidth: 20 }, // Adjusted width for other columns
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
        8: { cellWidth: 20 },
        9: { cellWidth: 20 },
        10: { cellWidth: 20 },
        11: { cellWidth: 20 },
        12: { cellWidth: 20 },
      },
      margin: { top: 20 }, // Adjusted top margin
    });

    pdf.save(`Aruna_SolarNoon_${year}.pdf`);
  };

  const handleChangeLat = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setLocation((s) => ({ ...s, latitude: Number(e.target.value) }));
  };
  const handleChangeLon = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setLocation((s) => ({ ...s, longitude: Number(e.target.value) }));
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {page === "input" ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h1>Aruna & Noon Time</h1>
          <label>
            Select Year:
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Aruna Offset (minutes):
            <input
              type="number"
              value={arunaOffset}
              onChange={(e) => setArunaOffset(Number(e.target.value))}
            />
          </label>
          <br />
          <br />
          <button onClick={getLocation}>Get My Location</button>
          <br />
          <p>or Input Your Location Manually</p>
          <label forHtml="location">
            Location:
            <input
              type="text"
              id="location"
              value={`${latitude}, ${longitude}`}
              onChange={(e) => setLocation(parseLocation(e.target.value))}
              placeholder="Latitude,Longitude"
            />
          </label>
          {/* <label forHtml="latitude">
            Latitude:
            <input
              type="number"
              id="latitude"
              value={latitude}
              onChange={handleChangeLat}
            />
          </label>
          <br />
          <label forHtml="longitude">
            Longitude:
            <input
              type="number"
              id="longitude"
              value={longitude}
              onChange={handleChangeLon}
            />
          </label>
          <br /> */}

          {fetchingState.status === "loading" ? (
            <p>Loading...</p>
          ) : (
            fetchingState.status === "success" && (
              <p>
                📍 {place?.name}, {place?.country} ({location.latitude},{" "}
                {location.longitude})
              </p>
            )
          )}

          {error && <p style={{ color: "red" }}>⚠️ {error}</p>}
          <button
            style={{
              display: "block",
              marginTop: "10px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
            onClick={getSunTimesForYear}
            disabled={!location}
          >
            Show Table
          </button>
        </div>
      ) : (
        <div>
          <button onClick={() => setPage("input")}>&larr; Back</button>
          <button onClick={printPDF}>Print to PDF</button>
          <div id="table-container">
            <h2>Aruna & Noon Times for {year}</h2>
            <table
              border="1"
              style={{
                margin: "auto",
                borderCollapse: "collapse",
                width: "90%",
                textAlign: "center",
              }}
            >
              <thead>
                <tr>
                  <th>Date</th>
                  {months.map((month, index) => (
                    <th key={index}>{month}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(31).keys()].map((day) => (
                  <tr key={day}>
                    <td>{day + 1}</td>
                    {months.map((_, monthIndex) => (
                      <td key={monthIndex}>
                        {times[monthIndex]?.[day + 1] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
