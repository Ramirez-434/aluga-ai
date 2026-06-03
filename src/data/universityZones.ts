export interface UniversityZone {
  id: string;
  name: string;
  color: string;
  polygon: [number, number][];
}

export const UNIVERSITY_ZONES: UniversityZone[] = [
  {
    id: "uft-gurupi",
    name: "UFT - Campus Gurupi",
    color: "#f97316", // Laranja UFT
    polygon: [
      [-11.7435, -49.0490],
      [-11.7435, -49.0430],
      [-11.7485, -49.0430],
      [-11.7485, -49.0490],
    ]
  },
  {
    id: "unirg-campus2",
    name: "UnirG - Campus II",
    color: "#0284c7", // Azul UnirG
    polygon: [
      [-11.7280, -49.0660],
      [-11.7280, -49.0620],
      [-11.7310, -49.0620],
      [-11.7310, -49.0660],
    ]
  },
  {
    id: "unitins-natividade",
    name: "Unitins - Campus Natividade",
    color: "#16a34a", // Verde Unitins
    polygon: [
      [-11.7080, -47.7260],
      [-11.7080, -47.7220],
      [-11.7120, -47.7220],
      [-11.7120, -47.7260],
    ]
  }
];
