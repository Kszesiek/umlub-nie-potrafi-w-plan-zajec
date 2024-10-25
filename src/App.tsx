import React, {useState} from 'react';
import './App.css';
import {ScheduleColumn} from "./components/ScheduleColumn";
import {hours} from "./constants/hours";
import {GroupClasses} from "./schemas/GroupClassesSchema";
import useWindowDimensions from "./utils/useWindowDimensions";
import {getData} from "./data";
import {FaCircleInfo, FaTriangleExclamation} from "react-icons/fa6";

function App() {
  const data: GroupClasses[] = getData();

  const date1 = new Date();
  const date2 = new Date(2024, 8, 28);
  const diff = Math.abs(date1.getTime() - date2.getTime());
  const diffWeek = Math.ceil(diff / (1000 * 3600 * 24 * 7));

  const [chosenWeek, setChosenWeek] = useState<number>(diffWeek);
  const [chosenGroup, setChosenGroup] = useState<number>(1);

  const {height, width} = useWindowDimensions();

  return (
    <div className="App">
      <header className="App-header">
        <p>
          UMLub nie potrafi w plan zajęć 🙃
        </p>
        <div style={{flex: 1}}/>
        <div className="App-version-container">wersja 0.2.1</div>
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
                {index !== 0 && <div key={`gap-${index}`} style={{flex: 1}}/>}
                <p key={`p-${index}`} className="App-hours-label" style={{top: 0}}>{hour}</p>
              </>
            })}
          </div>
        </div>
        <div className="App-table">
          <ScheduleColumn columnName="Poniedziałek" groupClasses={data} chosenGroup={chosenGroup}
                          chosenWeek={chosenWeek}/>
          <ScheduleColumn columnName="Wtorek" groupClasses={data} chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>
          <ScheduleColumn columnName="Środa" groupClasses={data} chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>
          <ScheduleColumn columnName="Czwartek" groupClasses={data} chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>
          <ScheduleColumn columnName="Piątek" groupClasses={data} chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>
        </div>
        <div className="App-right-bar-wrapper">
          <div className="Shadow-wrapper" style={{backgroundColor: "gold"}}>
            <div className="App-settings">
              <p>Wybierz tydzień:</p>
              <select defaultValue={chosenWeek}
                      onChange={(newChosenWeek) => setChosenWeek(Number(newChosenWeek.target.value))}>
                {
                  new Array(19).fill(null).map((_, i) => i + 1).map((week_number) => {
                    const monday = new Date(2024, 8, 30)
                    monday.setDate(monday.getDate() + (week_number - 1) * 7)
                    const sunday = new Date(2024, 8, 30)
                    sunday.setDate(sunday.getDate() + (week_number - 1) * 7 + 6)

                    return <option key={week_number}
                                   value={week_number}>{`Tydzień ${week_number} (${monday.getDate()}.${(monday.getMonth() + 1).toString().padStart(2, '0')}-${sunday.getDate()}.${(sunday.getMonth() + 1).toString().padStart(2, '0')})`}</option>
                  })
                }
              </select>
              <p>Wybierz numer grupy:</p>
              <select onChange={(newChosenGroup) => setChosenGroup(Number(newChosenGroup.target.value))}>
                {
                  new Array(56).fill(null).map((_, i) => i + 1).map((group_number) => (
                    <option key={group_number} value={group_number}>{`Grupa ${group_number}`}</option>
                  ))
                }
              </select>
            </div>
          </div>
          <div className="App-sidebar-wrapper">
            <div className="App-sidebar-container Info-container">
              <FaCircleInfo size={24} color="#0080FFFF"/>
              <p>Wersja mobilna już wkrótce!</p>
            </div>
          </div>
          <div className="App-sidebar-wrapper">
            <div className="App-sidebar-warning-container Error-container">
              <div className="App-sidebar-warning-title">
                <FaTriangleExclamation size={24} color="red"/>
                <h3>Uwaga!</h3>
                <FaTriangleExclamation size={24} color="red" /*#FFC000*/ />
              </div>
              <p><b>Wyświetlane dane mogą zawierać błędy</b>, ponieważ zostały uzyskane w częściowo zautomatyzowany
                sposób. W razie zauważenia nieprawidłowości napisz proszę maila na adres <a
                  href="mailto:kszesiek@gmail.com">kszesiek@gmail.com</a>. Pamiętaj, aby oprócz opisu problemu zawrzeć w
                mailu informację dla której grupy, tygodnia oraz których zajęć problem występuje. Nie jestem w stanie
                sam sprawdzić poprawności wszystkich danych, dlatego to od Was zależy, ile błędów zostanie wychwyconych
                i naprawionych. 🤗</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;