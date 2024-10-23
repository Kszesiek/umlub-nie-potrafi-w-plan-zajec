import chirurgia from './chirurgia.json';
import ginekologia from './ginekologia.json';
import laryngologia from './laryngologia.json';
import onkologia from './onkologia.json';
import transplantologia from './transplantologia.json';
import {GroupClasses} from "../schemas/GroupClassesSchema";
import {dataObjectSchema} from "../schemas/DataObjectSchema";

export function getData(): GroupClasses[] {
  const data: GroupClasses[] = []

  const dataSources = [
    chirurgia,
    ginekologia,
    laryngologia,
    onkologia,
    transplantologia,
  ];

  dataSources.forEach((dataSource) => {
    console.log(dataSource);
    data.push(...dataObjectSchema.parse(dataSource).data);
  })

  return data;
}
