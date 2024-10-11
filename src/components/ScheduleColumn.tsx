import React from "react";
import './ScheduleColumn.css';
import {hours} from "../constants/hours";
import {GroupClasses} from "../schemas/GroupClassesSchema";
import {WeekClasses} from "../schemas/WeekClassesSchema";
import {ScheduleCard} from "./ScheduleCard";
import {SingleClass} from "../schemas/SingleClassSchema";
import {weekdayMap} from "../constants/weekdayMap";

export function ScheduleColumn({columnName, groupClasses, chosenGroup, chosenWeek}: { columnName: String, groupClasses: GroupClasses[], chosenGroup: number | null, chosenWeek: number | null }) {
  return <div className="App-table-column">
    <div className="App-table-column-title">
      <h3>{columnName}</h3>
    </div>
    <div className="App-table-column-content">
      {hours.slice(1).map((hour) => {
        return (
          <div style={{flex: 1, backgroundColor: "white"}}/>
        );
      })}

      {
        groupClasses.map((groupClass) => {
          if (!groupClass.groups.includes(chosenGroup ?? 0))
            return null;

          return groupClass.weeks.map((week: WeekClasses) => {
          if (week.week !== chosenWeek)
            return null;

            return week.classes.map((singleClass: SingleClass) => {
              if (columnName !== weekdayMap.get(singleClass.day))
                return null;

                const fullHeight = 22 * 60 - 8 * 60
                const [h_start, m_start] = singleClass.start_time.split(":");
                const scheduleCardTop = Number(h_start) * 60 + Number(m_start) - 8 * 60;
                const topPercent = `${scheduleCardTop / fullHeight * 100}%`;
                const [h_end, m_end] = singleClass.end_time.split(":");
                const scheduleCardBottom = 22*60 - (Number(h_end) * 60 + Number(m_end));
                const bottomPercent = `${scheduleCardBottom / fullHeight * 100}%`;
                return <ScheduleCard singleClass={singleClass} top={topPercent} bottom={bottomPercent}/>
              }
            )
          })
        })
      }
    </div>
  </div>
}
