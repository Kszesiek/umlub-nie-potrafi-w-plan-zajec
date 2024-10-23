import ginekologia from './1. ginekologia.json';
import onkologia from './2. onkologia.json';
import chirurgia from './3. chirurgia.json';
import laryngologia from './4. laryngologia.json';
import transplantologia from './5. transplantologia.json';
import urologia from './7. urologia.json';
import neurochirurgia from './8. neurochirurgia.json';
import medycyna_rodzinna from './9. medycyna rodzinna.json';
import pediatria from './10. pediatria.json';
import kardiochirurgia from './11. kardiochirurgia.json';
import torakochirurgia from './12. torakochirurgia.json';
import chirurgia_dziecieca from './13. chirurgia dziecieca.json';
import psychiatria from './14. psychiatria.json';
import anestezjologia from './15. anestezjologia.json';
import {GroupClasses} from "../schemas/GroupClassesSchema";
import {dataObjectSchema} from "../schemas/DataObjectSchema";

export function getData(): GroupClasses[] {
  const data: GroupClasses[] = []

  const dataSources = [
    ginekologia,
    onkologia,
    chirurgia,
    laryngologia,
    transplantologia,
    urologia,
    neurochirurgia,
    medycyna_rodzinna,
    pediatria,
    kardiochirurgia,
    torakochirurgia,
    chirurgia_dziecieca,
    psychiatria,
    anestezjologia,
  ];

  dataSources.forEach((dataSource) => {
    data.push(...dataObjectSchema.parse(dataSource).data);
  })

  return data;
}
