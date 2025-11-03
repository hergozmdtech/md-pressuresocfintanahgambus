import * as React from "react";
import { useState, useEffect } from "react";
import {
  ToolbarComponent,
  ItemsDirective,
  ItemDirective,
} from "@syncfusion/ej2-react-navigations";
import "./TitleBar.css";
import Logo from "../assets/LogoSocfindoSH.png";

const TitleBar = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="titlebar-wrapper">
      <ToolbarComponent cssClass="titlebar-toolbar">
        <ItemsDirective>
          <ItemDirective
            template={() => (
              <div className="titlebar-content">
                <div className="title-logo-text">
                  <img
                    src="LogoSocfindoSH.png"
                    alt="Logo"
                    className="title-logo"
                  />
                  <span className="title-text">
                    Pressure Monitoring System - PT. Socfindo POM Tanah Gambus
                  </span>
                </div>
                <span className="clock">
                  {new Intl.DateTimeFormat("en-GB", {
                    weekday: "short", // Sat
                    day: "2-digit", // 05
                    month: "short", // Jul
                    year: "numeric", // 2025
                    hour: "2-digit", // 13
                    minute: "2-digit", // 45
                    second: "2-digit", // 27
                    hour12: false, // 24-hour format
                  }).format(dateTime)}
                </span>
              </div>
            )}
          />
        </ItemsDirective>
      </ToolbarComponent>
    </div>
  );
};

export default TitleBar;
