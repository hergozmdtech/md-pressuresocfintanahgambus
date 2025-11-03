import React, { useState, useEffect } from "react";
import { LineChartCardSterilizer } from "../components/LineChartCardSterilizer";
import { LineChartCardBPV } from "../components/LineChartCardBPV";
import { LineChartCardBoiler } from "../components/LineChartCardBoiler";
import { LineChartCardTurbine } from "../components/LineChartCardTurbine";
import "../styles/SterilizerPage.css";

// Define interface for chart info
interface ChartInfo {
  title: string;
  type: string;
  props: any;
}

interface SterilizerPageProps {
  onNavigateToHistory?: () => void;
}

const SterilizerPage: React.FC<SterilizerPageProps> = ({
  onNavigateToHistory,
}) => {
  // State to track selected chart for popup
  const [selectedChart, setSelectedChart] = useState<ChartInfo | null>(null);

  // Handler for expand button clicks
  const handleExpandClick = (chartInfo: ChartInfo) => {
    setSelectedChart(chartInfo);
  };

  // Close chart popup handler
  const closePopup = () => {
    setSelectedChart(null);
  };

  // Handler for history button click
  const handleHistoryClick = () => {
    if (onNavigateToHistory) {
      onNavigateToHistory();
    }
  };

  // Create sterilizer panels with expand buttons
  const sterilizerPanels = Array.from({ length: 3 }, (_, i) => {
    const chartProps = {
      title: `Sterilizer ${i + 1}`,
      tagName: `Pressure_Sterilizer_${i + 1}`,
      tagStatus: `Status_Sterilizer_${i + 1}`,
      tagHA: `HA_S${i + 1}`,
      tagTHA: `THA_S${i + 1}`,
    };

    return (
      <div key={i} className="chart-wrapper">
        <div className="sterilizer-button-area">
          <button
            className="expand-chart-button"
            onClick={() =>
              handleExpandClick({
                title: chartProps.title,
                type: "sterilizer",
                props: chartProps,
              })
            }
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15,3L21,3L21,9L19,9L19,5.41L9.41,15L11,15L11,17L3,17L3,9L5,9L5,10.59L14.59,1L15,1L15,3Z" />
            </svg>
            Expand
          </button>
        </div>
        <LineChartCardSterilizer {...chartProps} />
      </div>
    );
  });

  // Create other panels (BPV, Boiler, Turbine) with expand buttons
  const otherChartConfigs = [
    {
      type: "bpv",
      props: { title: "BPV", tagName: "Pressure_BPV", tagStatus: "Status_BPV" },
      component: LineChartCardBPV,
    },
    {
      type: "boiler",
      props: {
        title: "Boiler",
        tagName: "Pressure_Boiler",
        tagStatus: "Status_Boiler",
      },
      component: LineChartCardBoiler,
    },
    {
      type: "turbine",
      props: {
        title: "Steam Chest Turbine",
        tagName: "Pressure_Steam_Chest_Turbine",
        tagStatus: "Status_Turbine",
      },
      component: LineChartCardTurbine,
    },
  ];

  const otherPanels = otherChartConfigs.map((config, index) => {
    const Component = config.component;
    return (
      <div key={index + 6} className="chart-wrapper">
        <div className="sterilizer-button-area">
          <button
            className="expand-chart-button"
            onClick={() =>
              handleExpandClick({
                title: config.props.title,
                type: config.type,
                props: config.props,
              })
            }
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15,3L21,3L21,9L19,9L19,5.41L9.41,15L11,15L11,17L3,17L3,9L5,9L5,10.59L14.59,1L15,1L15,3Z" />
            </svg>
            Expand
          </button>
        </div>
        <Component {...config.props} />
      </div>
    );
  });

  // Render the appropriate component in the popup
  const renderPopupChart = () => {
    if (!selectedChart) return null;

    switch (selectedChart.type) {
      case "sterilizer":
        return <LineChartCardSterilizer {...selectedChart.props} />;
      case "bpv":
        return <LineChartCardBPV {...selectedChart.props} />;
      case "boiler":
        return <LineChartCardBoiler {...selectedChart.props} />;
      case "turbine":
        return <LineChartCardTurbine {...selectedChart.props} />;
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="button-container">
        <button className="history-button" onClick={handleHistoryClick}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="history-icon">
            <path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3" />
          </svg>
          History
        </button>
      </div>
      <div className="dashboard-container">
        {sterilizerPanels}
        {otherPanels}
      </div>

      {/* Popup modal for the selected chart */}
      {selectedChart && (
        <div className="chart-popup-overlay" onClick={closePopup}>
          <div
            className="chart-popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chart-popup-header">
              <h2>{selectedChart.title}</h2>
              <button className="close-button" onClick={closePopup}>
                ×
              </button>
            </div>
            <div className="chart-popup-body">{renderPopupChart()}</div>
          </div>
        </div>
      )}

      <footer className="footer-bar">
        <p>© 2025 PT. Makro Digital Teknologi — All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default SterilizerPage;
