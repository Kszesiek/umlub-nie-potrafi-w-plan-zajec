import React from "react";
import './ScheduleCard.scss';
import {SingleClass} from "../schemas/SingleClassSchema";
import Swal from "sweetalert2";
import {isMobile} from 'react-device-detect';

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

  function onClick() {
    Swal.fire({
      allowOutsideClick: true,
      title: singleClass.course_name,
      customClass: {
        popup: `App-table-column-card Class-details-popup ${isMobile ? "Class-details-popup-mobile" : null}`,
        htmlContainer: "Class-details-text",
      },
      html: `<div class="Class-details-text">
        ${singleClass.type ? `Typ zajęć: ${singleClass.type}<br>` : ""}
        ${singleClass.start_time ? `Godziny: ${singleClass.start_time}-${singleClass.end_time}<br>` : ""}
        ${singleClass.location ? `Miejsce: ${singleClass.location ? singleClass.location : null}<br>` : ""}
        ${singleClass.katedra ? `Katedra: ${singleClass.katedra}` : ""}
      </div>`,
      background: color,
      color: "black",
      showConfirmButton: false,
    });
  }

  return (
    <div className="App-table-column-item" style={{top: top, bottom: bottom}} onClick={onClick}>
      <div className="App-table-column-card" style={{'--fade-color': color} as React.CSSProperties}>
        <div className="App-card-title">
          <h4>{singleClass.course_name}</h4>
          <p style={isMobile && singleClass.type ? {} : {display: "none"}}>({singleClass.type})</p>
        </div>
        <p style={isMobile ? {display: "none"} : {}}>{singleClass.type}</p>
        <p>{`${singleClass.start_time}-${singleClass.end_time}`}</p>
        <p>{singleClass.location === "N/A" ? "" : singleClass.location}</p>
        <p>{singleClass.katedra}</p>
      </div>
    </div>
  );
}
