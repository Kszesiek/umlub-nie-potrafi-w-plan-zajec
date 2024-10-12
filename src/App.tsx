import React, {useState} from 'react';
import './App.css';
import {ScheduleColumn} from "./components/ScheduleColumn";
import {hours} from "./constants/hours";

import ginekologia from "./data/ginekologia.json";
import {dataObjectSchema} from "./schemas/DataObjectSchema";
import {GroupClasses} from "./schemas/GroupClassesSchema";
import useWindowDimensions from "./utils/useWindowDimensions";

function App() {
  const data: GroupClasses[] = []
  data.push(...dataObjectSchema.parse(ginekologia).data);

  const [chosenWeek, setChosenWeek] = useState<number | null>(null);
  const [chosenGroup, setChosenGroup] = useState<number | null>(null);

  const { height, width } = useWindowDimensions();

  return (
    <div className="App">
      <header className="App-header">
        <p>
          UMLub nie potrafi w plan zajęć 🙃
        </p>
      </header>
      <div className="App-content">
        <div className="App-hours-outer-container">
          <h3>.</h3>
          <div className="App-hours-inner-container">
            {hours.map((hour, index) => {
              if (height < 700 && index % 2 !== 0) {
                return null;
              }
              return <>
                {index !== 0 && <div style={{flex: 1}}/>}
                <p className="App-hours-label" style={{top: 0}}>{hour}</p>
              </>
            })}
          </div>
        </div>
        <div className="App-table">
          <ScheduleColumn columnName="Poniedziałek" groupClasses={data} chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>
          <ScheduleColumn columnName="Wtorek" groupClasses={data} chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>
          <ScheduleColumn columnName="Środa" groupClasses={data} chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>
          <ScheduleColumn columnName="Czwartek" groupClasses={data} chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>
          <ScheduleColumn columnName="Piątek" groupClasses={data} chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>
        </div>
        <div className="App-settings">
          <p>Wybierz numer tygodnia:</p>
          <select
            onChange={(newChosenWeek) => setChosenWeek(Number(newChosenWeek.target.value))}
          >
            {
              new Array(12).fill(null).map((_, i) => i + 1).map((week_number) => (
                <option value={week_number}>{`Tydzień ${week_number}`}</option>
              ))
            }
          </select>
          <p>Wybierz numer grupy:</p>
          <select
            onChange={(newChosenGroup) => setChosenGroup(Number(newChosenGroup.target.value))}
          >
            {
              new Array(56).fill(null).map((_, i) => i + 1).map((group_number) => (
                <option value={group_number}>{`Grupa ${group_number}`}</option>
              ))
            }
          </select>
        </div>
      </div>
    </div>
  );
}

export default App;
