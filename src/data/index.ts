import schedule from './schedule.json'
import schedule_permanent from './schedule_permanent.json'
import {GroupClasses} from "../schemas/GroupClassesSchema";
import {dataObjectSchema} from "../schemas/DataObjectSchema";

export function getData(): GroupClasses[] {
  const data: GroupClasses[] = []

  const dataSources = [
    schedule,
    schedule_permanent,
  ];

  dataSources.forEach((dataSource) => {
    data.push(...dataObjectSchema.parse(dataSource).data);
  })

  return data;
}
