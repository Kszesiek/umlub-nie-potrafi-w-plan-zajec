# Online Python Playground
# Use the online IDE to write, edit & run your Python code
# Create, edit & delete files online

import json
from datetime import timedelta, date
import re

# Helper function to generate detailed class entries for each day
def generate_detailed_class_entries(course_name, katedra, start_day, duration, time, class_type, location=None):
    entries = []

    current_day = start_day
    days_counter = 0

    while days_counter < min(duration, 5):
        if current_day.weekday() < 5:  # Only count weekdays (Monday-Friday)
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
            days_counter += 1  # Increment the day counter
        current_day += timedelta(days=1)

    return entries


# Function to parse the text file and extract relevant information
def parse_schedule_text(file_path):
    schedule_data = []

    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    course_name = None
    groups = None
    katedra = None
    weeks = None
    week_duration = None
    days_duration = None
    class_type = None
    time = None
    location = None

    for line in lines:
        line = line.strip()

        if bool(re.match(r"^\d+\. ", line)):
            course_name = re.search(r"\d+\.\s+(.+?):", line).group(1)

        elif line.startswith("Grupy"):
            groups_range = line.split("Grupy ")[1].replace(":", "").split("-")
            groups = list(range(int(groups_range[0]), int(groups_range[1]))) if len(groups_range) > 1 else [int(groups_range[0])]

        elif "Katedra" in line or "Klinika" in line:
            katedra = line.split(":")[0]

        elif "tydzień" in line:
            parts = line.split(":")
            weeks_range = parts[0].split(" ")[0].split("-")
            weeks = list(range(int(weeks_range[0]), int(weeks_range[1]) + 1)) if len(weeks_range) > 1 else [int(weeks_range[0])]

        elif "Ćwiczenia" in line or "Seminaria" in line:
            time = line.split("godz. ")[1].split(" – ")[0]
            days_duration = int(line.split("przez ")[1].split(" dni")[0])
            class_type = "Ćwiczenia" if "Ćwiczenia" in line else "Seminaria"
            location = None  # Reset location

        elif "aula" in line or "sala" in line:
            location = line

        # Check if we have enough information to add to schedule
        if groups and weeks and time and class_type:

            week_items = []
            for week in weeks:
                start_day = date(2024, 9, 30) + timedelta(weeks=week-1)
                week_items.append({
                    "week": week,
                    "classes": generate_detailed_class_entries(course_name, katedra, start_day, days_duration, time, class_type, location)
                })
                days_duration -= 5

            schedule_data.append({
                "groups": groups,
                "katedra": katedra,
                "weeks": week_items
            })
            # Reset for the next group
            time = None
            class_type = None

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