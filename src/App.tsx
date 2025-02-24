import React, {ReactElement, TouchEventHandler, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import './App.scss';
import {ScheduleColumn} from "./components/ScheduleColumn";
import {hours} from "./constants/hours";
import {GroupClasses} from "./schemas/GroupClassesSchema";
import useWindowDimensions from "./utils/useWindowDimensions";
import {getData} from "./data";
import {FaTriangleExclamation} from "react-icons/fa6";
import {formatDateWithAddedDays} from "./utils/dateFormat";
import {BrowserView, MobileView} from 'react-device-detect';
import {PageHeader} from "./components/PageHeader";
import Swal from "sweetalert2";
import {renderToString} from "react-dom/server";

function App() {
  const data: GroupClasses[] = getData();

  const today = new Date();
  const dayZero = useMemo(() => new Date(2025, 1, 24), []);
  const diff = Math.abs(today.getTime() - dayZero.getTime());
  const diffWeek = Math.ceil(diff / (1000 * 3600 * 24 * 7));
  const lastWeekOfSemester = data.reduce((prev, current) => (prev && prev.week > current.week) ? prev : current).week;

  const [chosenWeek, setChosenWeek] = useState<number>(diffWeek);
  const [chosenGroup, setChosenGroup] = useState<number>(() => {
    const localStorageGroup: string | null = localStorage.getItem('group');
    if (localStorageGroup === null) {
      return 1;
    }
    const lastChosenGroup: number | null = Number(JSON.parse(localStorageGroup)) ?? null;
    if (lastChosenGroup === null) {
      return 1;
    }
    return lastChosenGroup;
  });
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(new Date(dayZero));

  const [activeWeekdayMobile, setActiveWeekdayMobile] = useState<number>(() => {
    if (1 <= today.getDay() && today.getDay() <= 5) {
      return today.getDay() - 1;
    } else return 0;
  });

  const warningMessage: ReactElement = useMemo(() => <>
    <p><b>Nowy semestr, nowe błędy w planie!</b> Plan został uzyskany w częściowo zautomatyzowany sposób i <u>nie został
      jeszcze ręcznie sprawdzony</u>, co więcej: <b>na pewno zawiera błędy</b> - dla przykładu: w planie nie znajdują
      sią jeszcze zajęcia z psychiatrii. W związku z tym nie opierajcie się jeszcze na tym planie w 100% i zgłaszajcie
      wszystkie błędy które napotkacie - w ten sposób szybciej się ich pozbędziemy. W razie zauważenia błędów napisz
      proszę maila na adres <a href="mailto:kszesiek@gmail.com"> kszesiek@gmail.com</a>. Pamiętaj, aby oprócz opisu
      problemu zawrzeć w mailu informację dla której grupy, tygodnia oraz których zajęć problem występuje. Możesz też
      dołączyć zrzut ekranu. Nie jestem w stanie sam sprawdzić poprawności wszystkich danych, dlatego to od Was zależy,
      ile błędów zostanie wychwyconych i naprawionych. 🤗</p>
  </>, [])

  useEffect(() => {
    const mobileWarning: string | null = localStorage.getItem('mobile-warning');
    // if (isMobile && mobileWarning !== "true") {
    if (true) {
      Swal.fire({
        title: "Proszę, przeczytaj mnie",
        html: renderToString(warningMessage),
        confirmButtonText: "Rozumiem!",
        customClass: {
          popup: "Error-container Mobile-popup-container",
        },
        preConfirm() {
          localStorage.setItem('mobile-warning', "true");
        }
      });
    }
  }, [warningMessage])

  const scheduleColumns = [
    <ScheduleColumn key="Monday" columnName={`Poniedziałek (${formatDateWithAddedDays(currentWeekMonday, 0)})`}
                    groupClasses={data} chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>,
    <ScheduleColumn key="Tuesday" columnName={`Wtorek (${formatDateWithAddedDays(currentWeekMonday, 1)})`}
                    groupClasses={data}
                    chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>,
    <ScheduleColumn key="Wednesday" columnName={`Środa (${formatDateWithAddedDays(currentWeekMonday, 2)})`}
                    groupClasses={data}
                    chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>,
    <ScheduleColumn key="Thursday" columnName={`Czwartek (${formatDateWithAddedDays(currentWeekMonday, 3)})`}
                    groupClasses={data}
                    chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>,
    <ScheduleColumn key="Friday" columnName={`Piątek (${formatDateWithAddedDays(currentWeekMonday, 4)})`}
                    groupClasses={data}
                    chosenGroup={chosenGroup} chosenWeek={chosenWeek}/>,
  ]

  const weekSelect = <select value={chosenWeek} defaultValue={chosenWeek} className="Filter"
                             onChange={(newChosenWeek) => setChosenWeek(Number(newChosenWeek.target.value))}>
    {
      new Array(lastWeekOfSemester).fill(null).map((_, i) => i + 1).map((week_number) => {
        const monday = new Date(dayZero)
        monday.setDate(monday.getDate() + (week_number - 1) * 7)
        const sunday = new Date(dayZero)
        sunday.setDate(sunday.getDate() + (week_number - 1) * 7 + 6)

        return <option key={week_number}
                       value={week_number}>{`Tydzień ${week_number} (${monday.getDate()}.${(monday.getMonth() + 1).toString().padStart(2, '0')}-${sunday.getDate()}.${(sunday.getMonth() + 1).toString().padStart(2, '0')})`}</option>
      })
    }
  </select>

  const groupSelect = <select className="Filter" value={chosenGroup} onChange={(newChosenGroup) => {
    localStorage.setItem('group', JSON.stringify(newChosenGroup.target.value));
    setChosenGroup(Number(newChosenGroup.target.value));
  }}>
    {
      new Array(56).fill(null).map((_, i) => i + 1).map((group_number) => (
        <option key={group_number} value={group_number}>{`Grupa ${group_number}`}</option>
      ))
    }
  </select>

  useLayoutEffect(() => {
    const baseDate = new Date(dayZero);
    baseDate.setDate(baseDate.getDate() + (chosenWeek - 1) * 7);
    setCurrentWeekMonday(baseDate);
  }, [chosenWeek, dayZero]);

  const {height} = useWindowDimensions();

  // MOBILE ONLY SWIPING LOGIC

  const divRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null); // Ref to store starting X coordinate

  const handleSwipeRight = () => {
    if (activeWeekdayMobile === 0) {
      // monday
      if (chosenWeek === 1)
        // first week of semester
        return;
      setChosenWeek((prevState) => prevState - 1);
      setActiveWeekdayMobile(4);
    } else {
      setActiveWeekdayMobile((prevState) => prevState - 1);
    }
  };

  const handleSwipeLeft = () => {
    if (activeWeekdayMobile === 4) {
      // friday
      if (chosenWeek === lastWeekOfSemester)
        // last week of semester
        return;
      setChosenWeek((prevState) => prevState + 1);
      setActiveWeekdayMobile(0);
    } else {
      setActiveWeekdayMobile((prevState) => prevState + 1);
    }
  };

  const handleTouchStart: TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove: TouchEventHandler<HTMLDivElement> = (e) => {
    if (!touchStartX.current) {
      return;
    }

    const touchEndX = e.touches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // You can set a threshold to determine if it's a swipe
    // and not just a small touch movement.
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swiped Left
        handleSwipeLeft();
      } else {
        // Swiped Right
        handleSwipeRight();
      }
    }
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    if (touchStartX.current === null) {
      return;
    }

    // Reset touchStartX for the next swipe
    touchStartX.current = null;
  };

  // END OF MOBILE ONLY LOGIC

  return (
    <div className="App">
      <PageHeader/>
      <BrowserView className="Browser-view">
        <div className="App-hours-outer-container">
          <h3>.</h3>
          <div className="App-hours-inner-container">
            {hours.map((hour, index) => {
              if (height < 700 && index % 2 !== 0) {
                return null;
              }
              return <React.Fragment key={`hours-${hour}`}>
                {index !== 0 && <div style={{flex: 1}}/>}
                <p className="App-hours-label" style={{top: 0}}>{hour}</p>
              </React.Fragment>
            })}
          </div>
        </div>
        <div className="App-table">
          {scheduleColumns.map((column) => column)}
        </div>
        <div className="App-right-bar-wrapper">
          <div className="Shadow-wrapper" style={{backgroundColor: "gold"}}>
            <div className="App-settings">
              <p>Wybierz tydzień:</p>
              {weekSelect}
              <p>Wybierz numer grupy:</p>
              {groupSelect}
            </div>
          </div>
          <div className="App-sidebar-wrapper">
            <div className="App-sidebar-warning-container Info-container">
              <div className="App-sidebar-warning-title">
                <h3>Co nowego</h3>
              </div>
              <div className="App-sidebar-warning-details">
                <p>
                  <li><b>Plan na nowy semestr!</b></li>
                  <li>W planie mogą zdarzać się błędy - jesteśmy w trakcie ręcznego sprawdzenia poprawności</li>
                  <li><b>Uwaga! Plan jest niekompletny! Brakuje m.in. psychiatrii</b></li>
                  <li>Dodano brakujące zajęcia z medycyny rodzinnej</li>
                  <li>Dodano brakujące typy niektórych zajęć</li>
                </p>
              </div>
            </div>
          </div>
          <div className="App-sidebar-wrapper">
            <div className="App-sidebar-warning-container Error-container">
              <div className="App-sidebar-warning-title">
                <FaTriangleExclamation size={24} color="red" /* color="#FFC000" */ />
                <h3>Uwaga!</h3>
                <FaTriangleExclamation size={24} color="red" /* color="#FFC000" */ />
              </div>
              {warningMessage}
            </div>
          </div>
        </div>
      </BrowserView>

      <MobileView className="Mobile-view">
        <div className="Filters-container">
          {weekSelect}
          {groupSelect}
        </div>
        <div className="Weekdays">
          <div className={activeWeekdayMobile === 0 ? "Chosen-weekday" : undefined}
               onClick={() => setActiveWeekdayMobile(0)}>pon
          </div>
          <div className={activeWeekdayMobile === 1 ? "Chosen-weekday" : undefined}
               onClick={() => setActiveWeekdayMobile(1)}>wt
          </div>
          <div className={activeWeekdayMobile === 2 ? "Chosen-weekday" : undefined}
               onClick={() => setActiveWeekdayMobile(2)}>śr
          </div>
          <div className={activeWeekdayMobile === 3 ? "Chosen-weekday" : undefined}
               onClick={() => setActiveWeekdayMobile(3)}>czw
          </div>
          <div className={activeWeekdayMobile === 4 ? "Chosen-weekday" : undefined}
               onClick={() => setActiveWeekdayMobile(4)}>pt
          </div>
        </div>
        <div className="Schedule-component">
          <div className="App-hours-outer-container">
            <h3>.</h3>
            <div className="App-hours-inner-container">
              {hours.map((hour, index) => {
                if (height < 700 && index % 2 !== 0) {
                  return null;
                }
                return <React.Fragment key={`hours-${hour}`}>
                  {index !== 0 && <div style={{flex: 1}}/>}
                  <p className="App-hours-label" style={{top: 0}}>{hour}</p>
                </React.Fragment>
              })}
            </div>
          </div>
          <div
            className="Schedule-column"
            ref={divRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {scheduleColumns[activeWeekdayMobile]}
          </div>
        </div>
      </MobileView>
    </div>
  );
}

export default App;