import React from "react";
import './ScheduleCard.css';
import {SingleClass} from "../schemas/SingleClassSchema";

export function ScheduleCard({singleClass, top, bottom}: { singleClass: SingleClass, top: string, bottom: string }) {
  const color: string = (() => {
    switch (singleClass.type) {
      case "Ćwiczenia":
        return 'lightskyblue';
      case "Seminarium":
        return 'gold';
      case "Wykład":
        return 'mediumpurple';
      default:
        return "lightgray";
    }
  })();


  return (
    <div className="App-table-column-item" style={{top: top, bottom: bottom}}>
      <div className="App-table-column-card" style={{'--fade-color': color} as React.CSSProperties}>
        <h4>{singleClass.course_name}</h4>
        <p>{singleClass.type}</p>
        <p>{`${singleClass.start_time}-${singleClass.end_time}`}</p>
        <p>{singleClass.location === "N/A" ? "" : singleClass.location}</p>
        <p>{singleClass.katedra}</p>
      </div>
    </div>
  );
}
