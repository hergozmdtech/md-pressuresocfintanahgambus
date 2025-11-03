import React, { useState, useEffect } from "react";
import { LineChartCardSterilizer } from "../components/LineChartCardSterilizer";
import { LineChartCardBPV } from "../components/LineChartCardBPV";
import { LineChartCardBoiler } from "../components/LineChartCardBoiler";
import { LineChartCardTurbine } from "../components/LineChartCardTurbine";
import "../styles/ChartHistoryPage.css";

interface ChartOption {
  value: string;
  label: string;
  type: "sterilizer" | "bpv" | "boiler" | "turbine";
  props: any;
}

interface ChartHistoryPageProps {
  onNavigateBack?: () => void;
}

const ChartHistoryPage: React.FC<ChartHistoryPageProps> = ({
  onNavigateBack,
}) => {
  // State for selected chart and date range
  const [selectedChart, setSelectedChart] = useState<ChartOption | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasData, setHasData] = useState<boolean>(false);

  // Generate chart options
  const chartOptions: ChartOption[] = [
    // Sterilizer options
    ...Array.from({ length: 3 }, (_, i) => ({
      value: `sterilizer-${i + 1}`,
      label: `Sterilizer ${i + 1}`,
      type: "sterilizer" as const,
      props: {
        title: `Sterilizer ${i + 1}`,
        tagName: `Pressure_Sterilizer_${i + 1}`,
        tagStatus: `Status_Sterilizer_${i + 1}`,
        tagHA: `HA_S${i + 1}`,
        tagTHA: `THA_S${i + 1}`,
      },
    })),
    // Other chart options
    {
      value: "bpv",
      label: "BPV",
      type: "bpv",
      props: { title: "BPV", tagName: "Pressure_BPV", tagStatus: "Status_BPV" },
    },
    {
      value: "boiler",
      label: "Boiler",
      type: "boiler",
      props: {
        title: "Boiler",
        tagName: "Pressure_Boiler",
        tagStatus: "Status_Boiler",
      },
    },
    {
      value: "turbine",
      label: "Turbine",
      type: "turbine",
      props: {
        title: "Turbine",
        tagName: "Pressure_Turbine",
        tagStatus: "Status_Turbine",
      },
    },
  ];

  // Initialize with default dates
  useEffect(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    setStartDate(formatDate(yesterday));
    setEndDate(formatDate(today));
  }, []);

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Handle chart selection
  const handleChartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const selected =
      chartOptions.find((option) => option.value === selectedValue) || null;
    setSelectedChart(selected);
    setHasData(false);
  };

  // Handle date changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setHasData(false);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setHasData(false);
  };

  // Fetch historical data
  const fetchHistoricalData = () => {
    if (!selectedChart || !startDate || !endDate) {
      alert("Please select a chart and date range");
      return;
    }

    setIsLoading(true);

    // Simulate loading time - this would be replaced with actual WebSocket request
    setTimeout(() => {
      setIsLoading(false);
      setHasData(true);
    }, 1500);

    // Actual WebSocket implementation would go here
    // Example:
    // const params = {
    //   chartType: selectedChart.type,
    //   tagName: selectedChart.props.tagName,
    //   startDate,
    //   endDate
    // };
    // socket.emit('fetchHistoricalData', params);
  };

  // Render the selected chart
  const renderChart = () => {
    if (!selectedChart) return null;

    // Add history params to the chart props
    const historyProps = {
      ...selectedChart.props,
      historyMode: true,
      startDate,
      endDate,
    };

    switch (selectedChart.type) {
      case "sterilizer":
        return <LineChartCardSterilizer {...historyProps} />;
      case "bpv":
        return <LineChartCardBPV {...historyProps} />;
      case "boiler":
        return <LineChartCardBoiler {...historyProps} />;
      case "turbine":
        return <LineChartCardTurbine {...historyProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="history-page-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 className="history-page-title">Chart History Data</h1>
        {onNavigateBack && (
          <button
            onClick={onNavigateBack}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ width: "16px", height: "16px" }}
            >
              <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
            </svg>
            Back to Sterilizer
          </button>
        )}
      </div>

      <div className="history-controls">
        <div className="control-group">
          <label htmlFor="chart-select">Select Chart:</label>
          <select
            id="chart-select"
            value={selectedChart?.value || ""}
            onChange={handleChartChange}
            className="chart-select"
          >
            <option value="">-- Select a chart --</option>
            <optgroup label="Sterilizers">
              {chartOptions
                .filter((opt) => opt.type === "sterilizer")
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Other Charts">
              {chartOptions
                .filter((opt) => opt.type !== "sterilizer")
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="start-date">Start Date:</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={handleStartDateChange}
            className="date-input"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="control-group">
          <label htmlFor="end-date">End Date:</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={handleEndDateChange}
            className="date-input"
            min={startDate}
            max={
              startDate
                ? new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                : ""
            }
          />
        </div>

        <button
          className="fetch-button"
          onClick={fetchHistoricalData}
          disabled={!selectedChart || !startDate || !endDate || isLoading}
        >
          {isLoading ? "Loading..." : "View History"}
        </button>
      </div>

      <div className="history-chart-container">
        {isLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading historical data...</p>
          </div>
        ) : hasData ? (
          renderChart()
        ) : (
          <div className="no-data-message">
            <p>
              Select a chart and date range, then click "View History" to see
              historical data
            </p>
          </div>
        )}
      </div>

      <footer className="footer-bar">
        <p>© 2025 PT. Makro Digital Teknologi — All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default ChartHistoryPage;
