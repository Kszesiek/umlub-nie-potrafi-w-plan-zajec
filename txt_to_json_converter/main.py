# Online Python Playground
# Use the online IDE to write, edit & run your Python code
# Create, edit & delete files online

import json
from datetime import timedelta, date
import re

weekdaysMapping = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
days_map = {
    "poniedziałek": "Monday",
    "poniedz.": "Monday",
    "wtorek": "Tuesday",
    "środa": "Wednesday",
    "czwartek": "Thursday",
    "piątek": "Friday",
}

# Helper function to generate detailed class entries for each day
def generate_detailed_class_entries(course_name, katedra, start_day, days, time, class_type, location=None):
    entries = []

    current_day = start_day

    for day in weekdaysMapping:
        if current_day.weekday() < 5 and len(days) > 0 and day == days[0]:  # Only count weekdays (Monday-Friday)
            start_hour, end_hour = time.split('-')
            entries.append({
                "course_name": course_name,
                "katedra": katedra,
                "day": current_day.strftime("%A"),
                "start_time": start_hour.strip(),
                "end_time": end_hour.strip(),
                "type": class_type,
                "location": location if location else None
            })
            days.pop(0)
        current_day += timedelta(days=1)
    return entries


# Function to parse the text file and extract relevant information
def parse_schedule_text(file_path):
    schedule_data = []

    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    week_items: list[object] = []

    course_name = None
    groups = []
    katedra = None
    weeks = []
    weekdays = []
    duration = None
    class_type = None
    time = None
    location = None

    def save_classes():
        nonlocal groups, week_items, time, class_type, duration

        if len(groups) == 0 or len(week_items) == 0:
            return

        schedule_data.append({
            "groups": groups,
            "weeks": week_items
        })

        # Reset for the next group
        time = None
        class_type = None
        duration = None
        week_items = []

    for line in lines:
        line = line.strip()

        if bool(re.match(r"^\d+\. ", line)):  # new course
            save_classes()

            groups = []
            katedra = None
            weeks = []
            weekdays = []
            location = None

            course_name = re.search(r"\d+\.\s+(.+?):", line).group(1)

        elif line.startswith("Grupy"):
            save_classes()
            groups_range = line.split("Grupy ")[1].replace(":", "").split(" ")[0].split("-")
            groups = list(range(int(groups_range[0]), int(groups_range[1]) + 1)) if len(groups_range) > 1 else [int(groups_range[0])]
            more_groups_line = line.split(" + ")
            if len(more_groups_line) > 1:
                more_groups_range = line.split(" + ")[1].replace(":", "").split("-")
                more_groups = list(range(int(more_groups_range[0]), int(more_groups_range[1]) + 1))
                groups = [*groups, *more_groups]

        elif line.startswith("Grupa"):
            save_classes()
            groups_range = line.split("Grupa ")[1].replace(":", "").split("-")
            groups = list(range(int(groups_range[0]), int(groups_range[1]) + 1)) if len(groups_range) > 1 else [int(groups_range[0])]

        elif "Katedra" in line or "Klinika" in line or "Zakład" in line or "Pracownia" in line:
            katedra = line.split(":")[0]

        elif "tydzień" in line:
            parts = line.split(":")
            weeks_range = parts[0].split(" ")[0].split("-")
            new_weeks = list(range(int(weeks_range[0]), int(weeks_range[1]) + 1)) if len(weeks_range) > 1 else [int(weeks_range[0])]
            if weeks != new_weeks:
                save_classes()
                weeks = new_weeks
                for week in weeks:
                    if not any(item for item in week_items if item["week"] == week):
                        week_items.append({
                            "week": week,
                            "classes": []
                        })

        elif line.startswith("Aula") or line.startswith("Sala"): # or line.startswith("Katedra") or line.startswith("Klinika") or line.startswith("Zakład"):
            location = line.split(" - ")[0]
            if len(line.split(" - ")) <= 1:
                temp = line.split(" - ")
                print(line)
            weekdays_raw = line.split(" - ")[1].split(", ")

            weekdays_parsed = [days_map[weekday_raw] for weekday_raw in weekdays_raw]

            for week_item in week_items:
                if week_item["week"] in weeks:
                    for week_class in week_item["classes"]:
                        if week_class["type"] == "Seminarium" and week_class["day"] in weekdays_parsed:
                            week_class["location"] = location

        elif "godz. " in line:
            time = line.split("godz. ")[1].split(" ")[0]

            if "przez " in line:
                duration = int(line.split("przez ")[1].split(" dni")[0])
                weekdays = [weekdaysMapping[index % 5] for index in range(duration)]

            class_type = "Ćwiczenia" if ("ćw." in line or "Ćw." in line or "ćwicz." in line or "Ćwicz." in line) else \
                         "Seminarium" if ("sem." in line or "Sem." in line or "semin." in line or "Semin." in line) else \
                         None

            if any(phrase in line for phrase in days_map.keys()):
                weekdays: list[str] = []
                days_indices: dict[str, int] = dict.fromkeys(days_map.keys(), -1)
                for phrase in days_map:
                    days_indices[phrase] = line.find(phrase)

                number_of_weekdays = sum(1 if index > -1 else 0 for index in days_indices.values())
                if number_of_weekdays == 0:
                    print("ERROR: DIDN'T FIND ANY WEEKDAYS")
                elif number_of_weekdays == 1:
                    weekday_phrase = max(days_indices, key=days_indices.get)
                    # for _ in weeks:
                    weekdays.append(days_map[weekday_phrase])

                elif number_of_weekdays == 2:
                    weekday_max_phrase = max(days_indices, key=days_indices.get)
                    temp_weekday_max_index = days_indices[weekday_max_phrase]
                    days_indices[weekday_max_phrase] = -1
                    weekday_min_phrase = max(days_indices, key=days_indices.get)
                    days_indices[weekday_max_phrase] = temp_weekday_max_index

                    separator = line[days_indices[weekday_min_phrase] + len(weekday_min_phrase) : days_indices[weekday_max_phrase]]
                    if separator == " - ":
                        min_index = weekdaysMapping.index(days_map[weekday_min_phrase])
                        max_index = weekdaysMapping.index(days_map[weekday_max_phrase])
                        index_range = range(min_index, max_index + 1)
                        for index in index_range:
                            weekdays.append(weekdaysMapping[index])
                    else:
                        weekdays.append(days_map[weekday_min_phrase])
                        weekdays.append(days_map[weekday_max_phrase])

                else:
                    for weekday_phrase in days_indices:
                        if days_indices[weekday_phrase] > -1:
                            weekdays.append(days_map[weekday_phrase])
                    print(days_indices)

            location_index = max(line.find("Aula"), line.find("Sala"), line.find("Katedra"), line.find("Klinika"),
                                 line.find("Zakład"))
            if location_index > -1:
                location = line[location_index:]
            else:
                location = None

        # Check if we have enough information to add to schedule
        if groups and weeks and katedra and time and class_type:
            for item in week_items:
                start_day = date(2024, 9, 30) + timedelta(weeks=item["week"] - 1)
                class_entries = generate_detailed_class_entries(course_name, katedra, start_day, weekdays[:5], time, class_type, location)
                for new_entry in class_entries:
                    item["classes"].append(new_entry)
                if duration is not None:
                    weekdays = weekdays[5:]

    if len(week_items) > 0:
        schedule_data.append({
            "groups": groups,
            "weeks": week_items
        })

    return schedule_data


# Function to save the parsed schedule data as JSON
def save_schedule_to_json(schedule_data, output_file):
    with open(output_file, 'w', encoding='utf-8') as json_file:
        json.dump(schedule_data, json_file, indent=4, ensure_ascii=False)


# Main function to process the input text file and generate JSON
def main(input_file, output_file):
    schedule_data = {
       "data": parse_schedule_text(input_file)
    }
    save_schedule_to_json(schedule_data, output_file)
    print(f"JSON file has been created: {output_file}")


# Usage
input_file = 'input_schedule.txt'  # Path to your input text file
output_file = 'output_schedule.json'  # Path to your output JSON file
main(input_file, output_file)