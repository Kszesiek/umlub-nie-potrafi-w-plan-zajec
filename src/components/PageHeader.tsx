import packageJson from "../../package.json";
import React from "react";
import './PageHeader.scss';

export function PageHeader() {
  return <header className="Page-header">
    <p>
      UMLub nie potrafi w plan zajęć 🙃
    </p>
    <div style={{flex: 1}}/>
    <div className="Version-container">wersja {packageJson.version}</div>
  </header>
}