import React, { useState } from "react";
import SterilizerPage from "./pages/SterilizerPage";
import ChartHistoryPage from "./pages/ChartHistoryPage";
import TitleBar from "./components/TitleBar";
import NavigationBar from "./components/NavigationBar";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("sterilizer");

  const handleNavigateToHistory = () => {
    setCurrentPage("history");
  };

  const handleNavigateToSterilizer = () => {
    setCurrentPage("sterilizer");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div
        className="main-content"
        style={{ paddingTop: "60px", padding: "1rem", width: "100%" }}
      >
        <TitleBar />
        <div style={{ paddingTop: "60px" }}>
          {currentPage === "history" ? (
            <ChartHistoryPage onNavigateBack={handleNavigateToSterilizer} />
          ) : (
            <SterilizerPage onNavigateToHistory={handleNavigateToHistory} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
