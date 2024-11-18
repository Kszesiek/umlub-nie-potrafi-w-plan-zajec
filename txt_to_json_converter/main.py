import json
from datetime import timedelta, date
import re
import itertools

weekdaysMapping = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
days_map = {
    "poniedziałek": "Monday",
    "poniedz.": "Monday",
    "wtorek": "Tuesday",
    "środa": "Wednesday",
    "czwartek": "Thursday",
    "piątek": "Friday",
}

GROUPS = [i for i in range(1, 57)]
WEEKS = [i for i in range(1, 21)]


# Helper function to generate detailed class entries for each day
def generate_detailed_class_entries(course_name, katedra, days, time, class_type, weeks, location=None):
    entries = []

    for week in weeks:
        current_day = date(2024, 9, 30) + timedelta(weeks=week - 1)
        for day in weekdaysMapping:
            if current_day.weekday() < 5 and len(days) > 0 and day == days[0]:  # Only count weekdays (Monday-Friday)
                start_hour, end_hour = time.split('-')
                calendar_week = week

                modified_current_day = current_day

                if week >= 5:
                    calendar_week += 1
                if week >= 12:
                    calendar_week += 2

                if day == "Monday":
                    if 1 <= week <= 4 or 12 <= week <= 15:
                        calendar_week += 1

                if day == "Friday" and week == 5:
                    calendar_week = 5
                    modified_current_day = date(2024, 10, 29)
                if day == "Monday" and week == 6:
                    calendar_week = 6
                    modified_current_day = date(2024, 11, 8)

                entries.append({
                    "calendar_week": calendar_week,
                    "item": {
                        "course_name": course_name,
                        "katedra": katedra,
                        "day": modified_current_day.strftime("%A"),
                        "start_time": start_hour.strip(),
                        "end_time": end_hour.strip(),
                        "type": class_type,
                        "location": location if location else None
                    },
                })
                days.pop(0)
            current_day += timedelta(days=1)
    return entries


# Function to parse the text file and extract relevant information
def parse_schedule_text(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    chonky_boi = []  # all the classes in the semester

    for (group, week) in itertools.product(GROUPS, WEEKS):
        chonky_boi.append({
            "group": group,
            "week": week,
            "classes": [],
        })

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

    for line in lines:
        line = line.strip()

        if bool(re.match(r"^\d+\. ", line)):  # new course

            groups = []
            katedra = None
            weeks = []
            weekdays = []
            duration = None
            class_type = None
            time = None
            location = None

            course_name = re.search(r"\d+\.\s+(.+?):", line).group(1)

        elif line.startswith("Grupy"):
            group = line.split("Grupy ")[1].replace(":", "").split(" ")[0].split("-")
            groups = list(range(int(group[0]), int(group[1]) + 1)) if len(group) > 1 else [
                int(group[0])]
            more_groups_line = line.split(" + ")
            if len(more_groups_line) > 1:
                more_groups_range = line.split(" + ")[1].replace(":", "").split("-")
                more_groups = list(range(int(more_groups_range[0]), int(more_groups_range[1]) + 1))
                groups = [*groups, *more_groups]

        elif line.startswith("Grupa"):
            group = line.split("Grupa ")[1].replace(":", "")
            groups = [int(group)]

        elif "Katedra" in line or "Klinika" in line or "Zakład" in line or "Pracownia" in line:
            katedra = line.split(":")[0]

        elif "tydzień" in line:
            parts = line.split(":")
            weeks_range = parts[0].split(" ")[0].split("-")
            new_weeks = list(range(int(weeks_range[0]), int(weeks_range[1]) + 1)) if len(weeks_range) > 1 else [
                int(weeks_range[0])]
            weeks = new_weeks
            for week in weeks:
                if not any(item for item in week_items if item["week"] == week):
                    week_items.append({
                        "week": week,
                        "classes": []
                    })

        elif line.startswith("Aula") or line.startswith("Sala"):
            location = line.split(" - ")[0]
            if len(line.split(" - ")) > 1:
                weekdays_raw = line.split(" - ")[1].split(", ")
                weekdays_parsed = [days_map[weekday_raw] for weekday_raw in weekdays_raw]
                weekdays_final = []
                if duration is None:
                    weekdays_final = [*weekdays_parsed * len(weeks)]
                else:
                    weekdays_final = [weekdaysMapping[index % 5] for index in range(duration) if
                                      weekdaysMapping[index % 5] in weekdays_parsed]

                class_entries = generate_detailed_class_entries(course_name, katedra, weekdays_final, time,
                                                                class_type, weeks, location)

                for new_entry in class_entries:
                    chonky_boi_filtered = [item for item in chonky_boi if
                                           item["group"] in groups and item["week"] == new_entry["calendar_week"]]
                    for chonky_boi_entry in chonky_boi_filtered:
                        for entry in chonky_boi_entry["classes"]:
                            if (entry["course_name"] == new_entry["item"]["course_name"] and
                                    entry["day"] == new_entry["item"]["day"] and
                                    entry["start_time"] == new_entry["item"]["start_time"] and
                                    entry["end_time"] == new_entry["item"]["end_time"]):
                                entry["location"] = new_entry["item"]["location"]

        elif "godz. " in line:
            time = line.split("godz. ")[1].split(" ")[0]

            if "przez " in line:
                duration = int(line.split("przez ")[1].split(" dni")[0])
                weekdays = [weekdaysMapping[index % 5] for index in range(duration)]

            class_type = "Ćwiczenia" if ("ćw." in line or "Ćw." in line or "ćwicz." in line or "Ćwicz." in line) else \
                "Seminarium" if ("sem." in line or "Sem." in line or "semin." in line or "Semin." in line) else \
                "Wykład" if ("wykład" in line) else \
                "Egzamin" if ("egzamin" in line) else \
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
                    weekdays.append(days_map[weekday_phrase])

                elif number_of_weekdays == 2:
                    weekday_max_phrase = max(days_indices, key=days_indices.get)
                    temp_weekday_max_index = days_indices[weekday_max_phrase]
                    days_indices[weekday_max_phrase] = -1
                    weekday_min_phrase = max(days_indices, key=days_indices.get)
                    days_indices[weekday_max_phrase] = temp_weekday_max_index

                    separator = line[days_indices[weekday_min_phrase] + len(weekday_min_phrase): days_indices[
                        weekday_max_phrase]]
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

                weekdays = [*weekdays * len(weeks)]

            location_index = max(line.find("Aula"), line.find("Sala"), line.find("Katedra"), line.find("Klinika"),
                                 line.find("Zakład"), line.find("UNIVE"), line.find("ACAD"), line.find("Szpital"))
            if location_index > -1:
                location = line[location_index:]
            else:
                location = None

            class_entries = generate_detailed_class_entries(course_name, katedra, weekdays, time,
                                                            class_type, weeks, location)
            for new_entry in class_entries:
                chonky_boi_filtered = [item for item in chonky_boi if
                                       item["group"] in groups and item["week"] == new_entry["calendar_week"]]
                for chonky_boi_entry in chonky_boi_filtered:
                    chonky_boi_entry["classes"].append(new_entry["item"])

    return chonky_boi  # schedule_data


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
input_file = 'input_schedule_all_raw.txt'  # Path to your input text file
output_file = 'output_schedule.json'  # Path to your output JSON file
main(input_file, output_file)
