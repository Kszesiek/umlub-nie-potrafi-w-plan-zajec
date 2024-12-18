import React from "react";
import './ScheduleColumn.scss';
import {hours} from "../constants/hours";
import {GroupClasses} from "../schemas/GroupClassesSchema";
import {ScheduleCard} from "./ScheduleCard";
import {SingleClass} from "../schemas/SingleClassSchema";
import {weekdayMap} from "../constants/weekdayMap";
import useWindowDimensions from "../utils/useWindowDimensions";

export function ScheduleColumn({columnName, groupClasses, chosenGroup, chosenWeek}: {
  columnName: String,
  groupClasses: GroupClasses[],
  chosenGroup: number | null,
  chosenWeek: number | null,
}) {
  const {height} = useWindowDimensions();

  return <div className="App-table-column">
    <div className="App-table-column-title">
      <h3>{columnName}</h3>
    </div>
    <div className="App-table-column-content">
      {hours.slice(1).map((hour, index) => {
        if (height < 700 && index % 2 !== 0) {
          return null;
        }
        return (
          <div key={hour} style={{flex: 1, backgroundColor: "white"}}/>
        );
      })}

      {
        groupClasses.map((groupClass) => {
          if (groupClass.group !== chosenGroup)
            return null;

          if (groupClass.week !== chosenWeek)
            return null;

          return groupClass.classes.map((singleClass: SingleClass) => {
              if (columnName.split(" ")[0] !== weekdayMap.get(singleClass.day))
                return null;

              const fullHeight = 22 * 60 - 8 * 60
              const [h_start, m_start] = singleClass.start_time.split(":");
              const scheduleCardTop = Number(h_start) * 60 + Number(m_start) - 8 * 60;
              const topPercent = `${scheduleCardTop / fullHeight * 100}%`;
              const [h_end, m_end] = singleClass.end_time.split(":");
              const scheduleCardBottom = 22 * 60 - (Number(h_end) * 60 + Number(m_end));
              const bottomPercent = `${scheduleCardBottom / fullHeight * 100}%`;
              return <ScheduleCard
                key={`${singleClass.course_name}-${singleClass.start_time}-${singleClass.end_time}`}
                singleClass={singleClass} top={topPercent} bottom={bottomPercent}
              />
            }
          )
        })
      }
    </div>
  </div>
}
