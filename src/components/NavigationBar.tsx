import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import "../styles/NavigationBar.css";

const NavigationBar = forwardRef((_, ref) => {
  const sidebarRef = useRef<SidebarComponent>(null);

  useImperativeHandle(ref, () => ({
    toggle: () => {
      sidebarRef.current?.toggle();
    },
  }));

  return (
    <SidebarComponent
      ref={sidebarRef}
      width="220px"
      dockSize="60px"
      enableDock={true}
      style={{ height: "100vh" }}
    >
      <div className="sidebar-container">
        {/* ✅ Logo on top */}
        <img src="LogoSocfindoSH.png" alt="Logo" className="sidebar-logo" />
        {/* ✅ Menu */}
        <ul className="sidebar-menu">
          <li>
            <a href="/">Dashboard</a>
          </li>
          <li>
            <a href="/sterilizer">Pressure</a>
          </li>
        </ul>
      </div>
    </SidebarComponent>
  );
});

export default NavigationBar;
