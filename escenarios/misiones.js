// Generado por python/exportar_misiones.py desde escenarios/*.json. No editar a mano.
window.MISIONES = [
 {
  "id": "casa",
  "orden": 1,
  "reto": 1,
  "titulo": "El robot limpiador",
  "lugar": "Casa inteligente",
  "concepto": "Memoria y objetivo compuesto",
  "dificultad": "Inicial",
  "tema": "casa",
  "historia": "Son las ocho de la mañana. Los sensores de piso marcaron cuatro manchas repartidas por la casa. Robi sale de su base, tiene que pasar por todas y volver a cargarse. La alfombra de la sala es lenta: aspirarla cuesta el triple.",
  "objetivo": "Pasar por todas las manchas y volver a la base.",
  "agente": {
   "nombre": "Robi",
   "dibujo": "aspiradora",
   "percibe": "La baldosa en la que está, si las vecinas están libres y si hay una mancha bajo él.",
   "recuerda": "Qué manchas ya limpió. Sin esa memoria pasaría dos veces por la misma.",
   "acciones": "Moverse una baldosa: norte, sur, este u oeste.",
   "meta": "Todas las manchas limpias y Robi en la base."
  },
  "objeto": "la mancha",
  "objeto_plural": "manchas",
  "verbos": {
   "visita": "limpia"
  },
  "modo": "visitar",
  "final": "inicio",
  "unidad": "s",
  "unidad_larga": "segundos",
  "mapa": [
   "############",
   "#kkk:#cc..p#",
   "#::::#cc...#",
   "#:n::D...m.#",
   "##D#####D###",
   "#....#.....#",
   "#~~~~D..t..#",
   "#~M~~#.tt.m#",
   "#pss.#..B..#",
   "############"
  ],
  "leyenda": {
   "#": "muro",
   ".": "piso",
   ":": "baldosa",
   "~": "alfombra",
   "D": "puerta",
   "B": "base",
   "m": "mugre",
   "n": "mugre_baldosa",
   "M": "mugre_alfombra",
   "k": "cocina",
   "c": "cama",
   "s": "sofa",
   "t": "mesa",
   "p": "planta"
  },
  "tipos": {
   "muro": {
    "nombre": "Muro",
    "paso": false
   },
   "piso": {
    "nombre": "Piso de madera",
    "costo": 1
   },
   "baldosa": {
    "nombre": "Baldosa de cocina",
    "costo": 1
   },
   "alfombra": {
    "nombre": "Alfombra",
    "costo": 3
   },
   "puerta": {
    "nombre": "Puerta abierta",
    "costo": 1
   },
   "puerta_cerrada": {
    "nombre": "Puerta cerrada",
    "paso": false
   },
   "base": {
    "nombre": "Base de carga",
    "costo": 1,
    "inicio": true
   },
   "mugre": {
    "nombre": "Mancha",
    "costo": 1,
    "objetivo": "visitar",
    "suelo": "piso"
   },
   "mugre_baldosa": {
    "nombre": "Mancha",
    "costo": 1,
    "objetivo": "visitar",
    "suelo": "baldosa"
   },
   "mugre_alfombra": {
    "nombre": "Mancha en la alfombra",
    "costo": 3,
    "objetivo": "visitar",
    "suelo": "alfombra"
   },
   "juguete": {
    "nombre": "Juguete en el piso",
    "paso": false,
    "suelo": "piso"
   },
   "cocina": {
    "nombre": "Mesón de cocina",
    "paso": false,
    "suelo": "baldosa"
   },
   "cama": {
    "nombre": "Cama",
    "paso": false,
    "suelo": "piso"
   },
   "sofa": {
    "nombre": "Sofá",
    "paso": false,
    "suelo": "piso"
   },
   "mesa": {
    "nombre": "Mesa del comedor",
    "paso": false,
    "suelo": "piso"
   },
   "planta": {
    "nombre": "Planta",
    "paso": false,
    "suelo": "piso"
   }
  },
  "zonas": [
   {
    "nombre": "Cocina",
    "desde": [
     1,
     1
    ],
    "hasta": [
     3,
     4
    ]
   },
   {
    "nombre": "Dormitorio",
    "desde": [
     1,
     6
    ],
    "hasta": [
     3,
     10
    ]
   },
   {
    "nombre": "Sala",
    "desde": [
     5,
     1
    ],
    "hasta": [
     8,
     4
    ]
   },
   {
    "nombre": "Comedor",
    "desde": [
     5,
     6
    ],
    "hasta": [
     8,
     10
    ]
   }
  ],
  "herramientas": [
   {
    "id": "puerta",
    "nombre": "Puertas",
    "ayuda": "Abre o cierra una puerta.",
    "ciclos": [
     [
      "puerta",
      "puerta_cerrada"
     ]
    ]
   },
   {
    "id": "mancha",
    "nombre": "Manchas",
    "ayuda": "Ensucia o limpia una baldosa. Máximo 6 manchas.",
    "ciclos": [
     [
      "piso",
      "mugre"
     ],
     [
      "baldosa",
      "mugre_baldosa"
     ],
     [
      "alfombra",
      "mugre_alfombra"
     ]
    ]
   },
   {
    "id": "juguete",
    "nombre": "Juguetes",
    "ayuda": "Deja o recoge un juguete: bloquea la baldosa.",
    "ciclos": [
     [
      "piso",
      "juguete"
     ]
    ]
   }
  ],
  "parametros": [
   {
    "id": "pelo",
    "nombre": "Alfombra de pelo largo",
    "ayuda": "Aspirar la alfombra cuesta 6 en vez de 3.",
    "valor": false,
    "costos": {
     "alfombra": 6,
     "mugre_alfombra": 6
    }
   }
  ],
  "sugerido": "ucs",
  "preguntas": [
   "Si cierras la puerta entre cocina y dormitorio, ¿cuántos segundos más tarda Robi?",
   "¿Por qué el número de estados expandidos es mayor que el número de baldosas de la casa?",
   "BFS y costo uniforme, ¿cruzan la alfombra por el mismo sitio?"
  ],
  "relato": {
   "reloj": {
    "inicio": "08:00",
    "segundos_por_unidad": 20
   },
   "medidor": {
    "nombre": "Batería",
    "inicio": 100,
    "por_unidad": 1.5,
    "unidad": "%"
   },
   "inicio": [
    "08:00. La familia salió; la casa queda en silencio.",
    "Robi se desacopla de la base con un pitido corto. Cuatro manchas en el mapa."
   ],
   "zonas": {
    "Cocina": "Robi entra a la cocina. Huele a café y hay migas bajo el mesón.",
    "Dormitorio": "Dormitorio. Robi baja el volumen del motor.",
    "Sala": "La sala. La alfombra lo espera: lenta, pero hay que pasar.",
    "Comedor": "Comedor. Patas de silla por todas partes."
   },
   "terreno": {
    "alfombra": "Sobre la alfombra las cerdas giran más lento. Cada paso cuesta el triple.",
    "puerta": "Robi cruza una puerta.",
    "mugre_alfombra": "Mancha incrustada en la alfombra: pasada lenta."
   },
   "eventos": {
    "visita": "Robi {verbo} {obj}. El sensor de polvo baja a cero.",
    "replan": "{motivo} Robi se detiene, gira sobre sí mismo y recalcula."
   },
   "ambiente": [
    "El gato mira a Robi desde el sofá, sin moverse.",
    "Un rayo de sol cruza el piso.",
    "Batería: {medidor}.",
    "El parachoques roza una pata de silla."
   ],
   "fin": "Robi vuelve a su base a las {hora}. Casa limpia; batería en {medidor}."
  },
  "dinamica": {
   "continuo": true,
   "turno": 140,
   "resumen": "Durante el turno la casa se vuelve a ensuciar y alguien abre y cierra puertas.",
   "eventos": [
    {
     "nombre": "Nueva mancha",
     "prob": 0.06,
     "a": {
      "piso": "mugre",
      "baldosa": "mugre_baldosa",
      "alfombra": "mugre_alfombra"
     },
     "textos": [
      "El gato tumba una matera: tierra en {celda}.",
      "Alguien entra con los zapatos embarrados: mancha en {celda}.",
      "Se riega un vaso de jugo en {celda}."
     ]
    },
    {
     "nombre": "Puerta cerrada",
     "prob": 0.02,
     "a": {
      "puerta": "puerta_cerrada"
     },
     "textos": [
      "Un portazo: se cierra la puerta en {celda}."
     ]
    },
    {
     "nombre": "Puerta abierta",
     "prob": 0.05,
     "a": {
      "puerta_cerrada": "puerta"
     },
     "textos": [
      "Alguien abre la puerta en {celda}."
     ]
    }
   ]
  }
 },
 {
  "id": "laberinto",
  "orden": 2,
  "reto": 2,
  "titulo": "Escapa del laberinto",
  "lugar": "Mazmorra bajo el castillo",
  "concepto": "BFS frente a DFS",
  "dificultad": "Inicial",
  "escena": {
   "fondo": [
    "#2b2f3a",
    "#0b0d12"
   ],
   "losa": [
    "#4b4f58",
    "#2f3238",
    "#22242a"
   ],
   "calor": [
    167,
    139,
    250
   ],
   "ruta": "#fbbf24",
   "noche": true,
   "alto": 40
  },
  "historia": "Iris bajó a la mazmorra con una linterna y un mapa a medio dibujar. La salida está tras una reja de hierro que solo abre la llave de bronce, olvidada en la cámara central. No hay atajos: hay pasillos que se cruzan, callejones sin salida y charcos que retrasan cada paso.",
  "objetivo": "Encontrar la llave, abrir la reja y salir.",
  "agente": {
   "nombre": "Iris",
   "dibujo": "persona",
   "color": "#f59e0b",
   "linterna": true,
   "percibe": "Las paredes y pasillos que la linterna alcanza a su alrededor.",
   "recuerda": "Si ya tiene la llave en el bolsillo.",
   "acciones": "Avanzar un paso por un pasillo libre. La reja solo cede con la llave.",
   "meta": "Iris fuera, del otro lado de la reja."
  },
  "objeto": "la llave",
  "objeto_plural": "llave",
  "verbos": {
   "visita": "recoge"
  },
  "modo": "visitar",
  "final": "salida",
  "unidad": "s",
  "unidad_larga": "segundos",
  "mapa": [
   "#############",
   "#E..........#",
   "#.###.#.###.#",
   "#.#...#...#.#",
   "#.#.#####.#.#",
   "#...#.k.#...#",
   "###.#.#.#.###",
   "#...#.#...#.#",
   "#.###.###.#.#",
   "#....R#.....#",
   "#####S#######"
  ],
  "leyenda": {
   "#": "muro",
   ".": "pasillo",
   "E": "entrada",
   "k": "llave",
   "R": "reja",
   "S": "salida",
   "d": "derrumbe",
   "w": "charco"
  },
  "tipos": {
   "muro": {
    "nombre": "Muro de piedra",
    "paso": false,
    "forma": {
     "f": "bloque",
     "alto": 18,
     "color": "#5b606b",
     "techo": "#767c88"
    }
   },
   "pasillo": {
    "nombre": "Pasillo",
    "costo": 1,
    "piso": "#3b4049",
    "patron": "losas"
   },
   "entrada": {
    "nombre": "Escalera de entrada",
    "costo": 1,
    "inicio": true,
    "piso": "#3b4049",
    "patron": "losas",
    "forma": {
     "f": "marca",
     "color": "#94a3b8"
    }
   },
   "llave": {
    "nombre": "Llave de bronce",
    "costo": 1,
    "objetivo": "visitar",
    "clase": "llave",
    "suelo": "pasillo",
    "forma": {
     "f": "llave"
    },
    "al_cumplir": "ocultar"
   },
   "reja": {
    "nombre": "Reja (pide la llave)",
    "costo": 1,
    "requiere": "llave",
    "suelo": "pasillo",
    "forma": {
     "f": "reja"
    }
   },
   "salida": {
    "nombre": "Salida",
    "costo": 1,
    "suelo": "pasillo",
    "forma": {
     "f": "portal",
     "color": "#fde68a"
    }
   },
   "derrumbe": {
    "nombre": "Derrumbe",
    "paso": false,
    "suelo": "pasillo",
    "forma": {
     "f": "escombro"
    }
   },
   "charco": {
    "nombre": "Charco helado",
    "costo": 3,
    "suelo": "pasillo",
    "forma": {
     "f": "charco",
     "color": "rgba(96,165,250,0.7)"
    }
   }
  },
  "zonas": [
   {
    "nombre": "cámara central",
    "desde": [
     5,
     5
    ],
    "hasta": [
     5,
     7
    ]
   }
  ],
  "herramientas": [
   {
    "id": "derrumbe",
    "nombre": "Derrumbes",
    "ayuda": "Tapa o despeja un pasillo.",
    "ciclos": [
     [
      "pasillo",
      "derrumbe"
     ]
    ]
   },
   {
    "id": "charco",
    "nombre": "Charcos",
    "ayuda": "Un charco no bloquea, pero cruzarlo cuesta 3.",
    "ciclos": [
     [
      "pasillo",
      "charco"
     ]
    ]
   }
  ],
  "parametros": [],
  "sugerido": "bfs",
  "preguntas": [
   "¿Cuántos estados expande DFS frente a BFS? ¿Cuál encuentra el camino más corto?",
   "Tapa el pasillo de la derecha con un derrumbe. ¿Qué le pasa al plan?",
   "¿Por qué la cámara central aparece dos veces en el mapa de calor, antes y después de la llave?"
  ],
  "relato": {
   "reloj": {
    "inicio": "23:40",
    "segundos_por_unidad": 6
   },
   "medidor": {
    "nombre": "Linterna",
    "inicio": 100,
    "por_unidad": 0.9,
    "unidad": "%"
   },
   "inicio": [
    "La escalera cruje detrás de {agente}. Abajo huele a piedra mojada.",
    "La linterna marca un círculo de luz; todo lo demás es plan."
   ],
   "zonas": {
    "cámara central": "La cámara central. En el suelo, algo brilla."
   },
   "terreno": {
    "charco": "El agua le llega a los tobillos. Cada paso cuesta el triple.",
    "reja": "La llave gira con un chasquido. La reja cede.",
    "salida": "Aire frío desde arriba: es la salida."
   },
   "eventos": {
    "visita": "{agente} recoge {obj}. Ahora la reja ya no es un muro.",
    "replan": "{motivo} {agente} se detiene y vuelve a trazar el camino."
   },
   "ambiente": [
    "Una gota cae en algún lugar. El eco no dice dónde.",
    "{agente} pasa la mano por la pared: piedra fría, sin marcas.",
    "Un callejón a la izquierda. El plan dice que no.",
    "La linterna parpadea. {medidor}."
   ],
   "fin": "{agente} sube los últimos escalones. Afuera, la noche está clara."
  },
  "dinamica": {
   "continuo": false,
   "turno": 90,
   "resumen": "La mazmorra cruje: los derrumbes aparecen y se despejan.",
   "eventos": [
    {
     "nombre": "Derrumbe",
     "prob": 0.035,
     "a": {
      "pasillo": "derrumbe"
     },
     "textos": [
      "Un temblor: se viene abajo el techo en {celda}.",
      "Cae una lluvia de piedras en {celda}."
     ]
    },
    {
     "nombre": "Paso despejado",
     "prob": 0.04,
     "a": {
      "derrumbe": "pasillo"
     },
     "textos": [
      "Las piedras de {celda} se acomodan y dejan un paso."
     ]
    }
   ]
  }
 },
 {
  "id": "semaforo",
  "orden": 3,
  "reto": 3,
  "titulo": "El semáforo inteligente",
  "lugar": "Avenida con tres cruces",
  "concepto": "Tiempo dentro del estado",
  "dificultad": "Inicial",
  "escena": {
   "fondo": [
    "#dbeafe",
    "#93c5fd"
   ],
   "losa": [
    "#cbd5e1",
    "#94a3b8",
    "#64748b"
   ],
   "calor": [
    14,
    165,
    233
   ],
   "ruta": "#f59e0b",
   "noche": false,
   "alto": 70
  },
  "historia": "La ruta 7 cruza la avenida de oeste a este, recoge pasajeros en la parada del centro y termina en la estación. Tres semáforos cambian cada pocos segundos. La regla de seguridad no se negocia: el bus nunca entra a un cruce en rojo. Tú controlas los semáforos; el bus decide si espera, sigue o se desvía por la calle de atrás.",
  "objetivo": "Pasar por la parada y llegar a la estación sin cruzar ningún rojo, en el menor tiempo.",
  "agente": {
   "nombre": "Ruta 7",
   "dibujo": "vehiculo",
   "color": "#facc15",
   "largo": true,
   "percibe": "El color de cada semáforo y en qué segundo del ciclo va.",
   "recuerda": "Si ya pasó por la parada y en qué fase del ciclo está.",
   "acciones": "Avanzar una cuadra o esperar un segundo en su sitio.",
   "meta": "Parada atendida y bus en la estación, sin un solo rojo."
  },
  "objeto": "la parada",
  "objeto_plural": "parada",
  "verbos": {
   "visita": "atiende"
  },
  "modo": "visitar",
  "final": "estacion",
  "unidad": "s",
  "unidad_larga": "segundos",
  "fases": {
   "periodo": 6,
   "verde": {
    "x1": [
     0,
     3
    ],
    "x2": [
     3,
     6
    ],
    "x3": [
     0,
     3
    ]
   }
  },
  "mapa": [
   "HHHHHHHHHHHHHHH",
   "H.............H",
   "H.HH.HH.HH.HH.H",
   "H.HH.HH.HH.HH.H",
   "BaaaXaaYpaZaaaT",
   "H.HH.HH.HH.HH.H",
   "H.HH.HH.HH.HH.H",
   "H.............H",
   "HHHHHHHHHHHHHHH"
  ],
  "leyenda": {
   "H": "edificio",
   ".": "calle",
   "a": "avenida",
   "B": "patio",
   "T": "estacion",
   "p": "parada",
   "X": "cruce1",
   "Y": "cruce2",
   "Z": "cruce3",
   "o": "obra",
   "t": "trancon"
  },
  "tipos": {
   "edificio": {
    "nombre": "Edificio",
    "paso": false,
    "piso": "#a8a29e",
    "forma": {
     "f": "edificio",
     "alto": [
      12,
      26
     ],
     "colores": [
      "#e7d7c1",
      "#c7d2fe",
      "#fbcfe8",
      "#d9f99d",
      "#fed7aa"
     ]
    }
   },
   "calle": {
    "nombre": "Calle de atrás",
    "costo": 2,
    "piso": "#6b7280",
    "patron": "asfalto"
   },
   "avenida": {
    "nombre": "Avenida",
    "costo": 1,
    "piso": "#4b5563",
    "patron": "asfalto"
   },
   "patio": {
    "nombre": "Patio de buses",
    "costo": 1,
    "inicio": true,
    "piso": "#9ca3af",
    "patron": "rejilla"
   },
   "estacion": {
    "nombre": "Estación",
    "costo": 1,
    "piso": "#e5e7eb",
    "forma": {
     "f": "marca",
     "color": "#22c55e"
    }
   },
   "parada": {
    "nombre": "Parada",
    "costo": 1,
    "objetivo": "visitar",
    "suelo": "avenida",
    "forma": {
     "f": "parada"
    }
   },
   "cruce1": {
    "nombre": "Cruce 1 (semáforo)",
    "costo": 1,
    "semaforo": "x1",
    "suelo": "avenida",
    "forma": {
     "f": "semaforo"
    }
   },
   "cruce2": {
    "nombre": "Cruce 2 (semáforo)",
    "costo": 1,
    "semaforo": "x2",
    "suelo": "avenida",
    "forma": {
     "f": "semaforo"
    }
   },
   "cruce3": {
    "nombre": "Cruce 3 (semáforo)",
    "costo": 1,
    "semaforo": "x3",
    "suelo": "avenida",
    "forma": {
     "f": "semaforo"
    }
   },
   "obra": {
    "nombre": "Obra en la vía",
    "paso": false,
    "suelo": "calle",
    "forma": {
     "f": "barrera"
    }
   },
   "trancon": {
    "nombre": "Trancón",
    "costo": 4,
    "suelo": "avenida",
    "forma": {
     "f": "trancon"
    }
   }
  },
  "zonas": [
   {
    "nombre": "calle de atrás",
    "desde": [
     1,
     1
    ],
    "hasta": [
     1,
     13
    ]
   },
   {
    "nombre": "calle sur",
    "desde": [
     7,
     1
    ],
    "hasta": [
     7,
     13
    ]
   }
  ],
  "herramientas": [
   {
    "id": "obra",
    "nombre": "Obras",
    "ayuda": "Cierra una cuadra de la calle de atrás.",
    "ciclos": [
     [
      "calle",
      "obra"
     ]
    ]
   },
   {
    "id": "trancon",
    "nombre": "Trancón",
    "ayuda": "Un trancón en la avenida: la cuadra cuesta 4 s.",
    "ciclos": [
     [
      "avenida",
      "trancon"
     ]
    ]
   }
  ],
  "parametros": [
   {
    "id": "ola",
    "nombre": "Ola verde",
    "ayuda": "Sincroniza los tres semáforos con la velocidad del bus.",
    "valor": false,
    "fases": {
     "verde": {
      "x1": [
       3,
       6
      ],
      "x2": [
       0,
       3
      ],
      "x3": [
       3,
       6
      ]
     }
    }
   },
   {
    "id": "largo",
    "nombre": "Ciclo largo",
    "ayuda": "El ciclo pasa de 6 a 10 s: verdes de 5 s.",
    "valor": false,
    "fases": {
     "periodo": 10,
     "verde": {
      "x1": [
       0,
       5
      ],
      "x2": [
       5,
       10
      ],
      "x3": [
       0,
       5
      ]
     }
    }
   }
  ],
  "sugerido": "ucs",
  "preguntas": [
   "¿Cuántos segundos espera el bus en rojo sin coordinación? ¿Y con «Ola verde»?",
   "¿Por qué el estado tiene que incluir el segundo del ciclo y no solo la cuadra?",
   "Pon un trancón en la avenida. ¿Conviene esperar o tomar la calle de atrás?"
  ],
  "relato": {
   "reloj": {
    "inicio": "07:15",
    "segundos_por_unidad": 1
   },
   "medidor": {
    "nombre": "Pasajeros",
    "inicio": 18,
    "por_unidad": 0,
    "unidad": "",
    "eventos": {
     "visita": 14
    }
   },
   "inicio": [
    "Hora pico. El conductor de la ruta 7 mira el primer semáforo.",
    "La regla está pegada en el tablero: nunca cruzar en rojo."
   ],
   "zonas": {
    "calle de atrás": "El bus deja la avenida y toma la calle de atrás: más lenta, pero sin semáforos.",
    "calle sur": "Desvío por la calle sur."
   },
   "terreno": {
    "cruce1": "Primer cruce, en verde. Pasa.",
    "cruce2": "Segundo cruce. Verde justo a tiempo.",
    "cruce3": "Tercer cruce. La avenida se abre.",
    "trancon": "Trancón. Los carros avanzan a paso de tortuga."
   },
   "eventos": {
    "visita": "Parada del centro. Suben pasajeros; alguien saluda al conductor.",
    "espera": "Rojo adelante. El bus espera un segundo con el motor encendido.",
    "replan": "{motivo} El plan de la ruta cambia."
   },
   "ambiente": [
    "Una moto se cuela entre el bus y la acera.",
    "Un peatón termina de cruzar.",
    "El GPS marca {hora}.",
    "Alguien timbra para bajarse en la estación."
   ],
   "fin": "La ruta 7 entra a la estación a las {hora}. Ni un solo rojo cruzado."
  },
  "dinamica": {
   "continuo": false,
   "turno": 60,
   "resumen": "El tráfico de la avenida va y viene; aparecen obras en la calle de atrás.",
   "eventos": [
    {
     "nombre": "Trancón",
     "prob": 0.07,
     "a": {
      "avenida": "trancon"
     },
     "textos": [
      "Un choque menor frena la avenida en {celda}."
     ]
    },
    {
     "nombre": "Despeja",
     "prob": 0.12,
     "a": {
      "trancon": "avenida"
     },
     "textos": [
      "La avenida se despeja en {celda}."
     ]
    },
    {
     "nombre": "Obra",
     "prob": 0.03,
     "a": {
      "calle": "obra"
     },
     "textos": [
      "Cuadrilla de obras en {celda}."
     ]
    }
   ]
  }
 },
 {
  "id": "almacen",
  "orden": 4,
  "reto": 4,
  "titulo": "El robot del almacén",
  "lugar": "Bodega de despacho",
  "concepto": "Estado con carga y capacidad",
  "dificultad": "Intermedia",
  "tema": "almacen",
  "historia": "Llegaron tres pedidos. Carga sale del cargador, recoge cada paquete entre las estanterías y los lleva al muelle de despacho. Su bandeja tiene un límite: si solo carga uno a la vez, tiene que ir y volver.",
  "objetivo": "Recoger los paquetes y dejarlos todos en el muelle de despacho.",
  "agente": {
   "nombre": "Carga",
   "dibujo": "montacargas",
   "percibe": "Su baldosa, los pasillos libres a su alrededor y si hay un paquete al alcance.",
   "recuerda": "Qué paquetes lleva encima y cuáles ya entregó.",
   "acciones": "Moverse una baldosa. Recoger si hay espacio en la bandeja. Entregar al pisar el muelle.",
   "meta": "Todos los paquetes en el muelle."
  },
  "objeto": "el paquete",
  "objeto_plural": "paquetes",
  "verbos": {
   "recoge": "recoge",
   "entrega": "entrega"
  },
  "modo": "recoger",
  "final": "despacho",
  "unidad": "s",
  "unidad_larga": "segundos",
  "mapa": [
   "#############",
   "#R..........#",
   "#.SS.SS.SS..#",
   "#.SS.SS.SSp.#",
   "#.......x...#",
   "#.SS.SS.SS..#",
   "#.SSpSS.SS..#",
   "#...........#",
   "#.SS.SS.SS..#",
   "#pSS.SS.SS.E#",
   "#############"
  ],
  "leyenda": {
   "#": "muro",
   ".": "piso",
   "S": "estante",
   "p": "paquete",
   "R": "cargador",
   "E": "despacho",
   "x": "derrame",
   "P": "palet"
  },
  "tipos": {
   "muro": {
    "nombre": "Muro",
    "paso": false
   },
   "piso": {
    "nombre": "Pasillo",
    "costo": 1
   },
   "estante": {
    "nombre": "Estantería",
    "paso": false
   },
   "cargador": {
    "nombre": "Cargador",
    "costo": 1,
    "inicio": true
   },
   "despacho": {
    "nombre": "Muelle de despacho",
    "costo": 1
   },
   "paquete": {
    "nombre": "Paquete",
    "costo": 1,
    "objetivo": "recoger",
    "suelo": "piso"
   },
   "derrame": {
    "nombre": "Derrame: avanzar despacio",
    "costo": 5,
    "suelo": "piso"
   },
   "palet": {
    "nombre": "Palé atravesado",
    "paso": false,
    "suelo": "piso"
   }
  },
  "zonas": [
   {
    "nombre": "pasillo norte",
    "desde": [
     1,
     1
    ],
    "hasta": [
     3,
     11
    ]
   },
   {
    "nombre": "pasillo central",
    "desde": [
     4,
     1
    ],
    "hasta": [
     6,
     11
    ]
   },
   {
    "nombre": "pasillo sur",
    "desde": [
     7,
     1
    ],
    "hasta": [
     9,
     11
    ]
   }
  ],
  "herramientas": [
   {
    "id": "palet",
    "nombre": "Palés",
    "ayuda": "Pone o quita un palé: bloquea el pasillo.",
    "ciclos": [
     [
      "piso",
      "palet"
     ]
    ]
   },
   {
    "id": "derrame",
    "nombre": "Derrames",
    "ayuda": "Un derrame no bloquea, pero cruzarlo cuesta 5.",
    "ciclos": [
     [
      "piso",
      "derrame"
     ]
    ]
   },
   {
    "id": "paquete",
    "nombre": "Paquetes",
    "ayuda": "Agrega o quita un pedido. Máximo 6.",
    "ciclos": [
     [
      "piso",
      "paquete"
     ]
    ]
   }
  ],
  "parametros": [
   {
    "id": "capacidad",
    "nombre": "Capacidad de la bandeja",
    "ayuda": "Cuántos paquetes puede llevar a la vez.",
    "tipo": "opciones",
    "opciones": [
     1,
     2,
     3
    ],
    "valor": 3,
    "regla": "capacidad"
   }
  ],
  "sugerido": "astar",
  "preguntas": [
   "Baja la capacidad a 1. ¿Cuántos viajes al muelle hace ahora Carga?",
   "Con capacidad 1, ¿por qué crecen tanto los estados expandidos?",
   "Pon un derrame en el pasillo central. ¿Lo cruza BFS? ¿Y A*?"
  ],
  "relato": {
   "reloj": {
    "inicio": "05:30",
    "segundos_por_unidad": 10
   },
   "medidor": {
    "nombre": "Batería",
    "inicio": 100,
    "por_unidad": 0.9,
    "unidad": "%"
   },
   "inicio": [
    "05:30. Llegan los pedidos del día. El camión sale a las seis.",
    "Carga deja el cargador; la bandeja está vacía."
   ],
   "zonas": {
    "pasillo norte": "Pasillo norte: estanterías de electrónica.",
    "pasillo central": "Pasillo central, el más transitado.",
    "pasillo sur": "Pasillo sur, junto a los muelles."
   },
   "terreno": {
    "derrame": "Derrame en el piso. Carga reduce la velocidad para no patinar.",
    "despacho": "Carga llega al muelle de despacho."
   },
   "eventos": {
    "recoge": "Carga {verbo} {obj} y lo asegura en la bandeja.",
    "entrega": "Carga {verbo} {obj} en el muelle. Un operario lo escanea.",
    "replan": "{motivo} Carga se detiene y busca otra ruta entre las estanterías."
   },
   "ambiente": [
    "Un montacargas grande pasa al fondo con un pitido.",
    "Los escáneres de la estantería parpadean en verde.",
    "Batería: {medidor}.",
    "Alguien grita un número de pedido."
   ],
   "fin": "Todos los paquetes en el muelle a las {hora}. El camión puede salir."
  },
  "dinamica": {
   "continuo": true,
   "turno": 170,
   "resumen": "Llegan pedidos nuevos, se riegan cosas y alguien deja palés atravesados.",
   "eventos": [
    {
     "nombre": "Pedido nuevo",
     "prob": 0.05,
     "a": {
      "piso": "paquete"
     },
     "textos": [
      "Entra un pedido nuevo: paquete en {celda}.",
      "Pedido urgente por la web: paquete en {celda}."
     ]
    },
    {
     "nombre": "Derrame",
     "prob": 0.03,
     "a": {
      "piso": "derrame"
     },
     "textos": [
      "Se rompe un galón de aceite en {celda}."
     ]
    },
    {
     "nombre": "Limpieza",
     "prob": 0.06,
     "a": {
      "derrame": "piso"
     },
     "textos": [
      "El equipo de aseo seca el piso en {celda}."
     ]
    },
    {
     "nombre": "Palé",
     "prob": 0.02,
     "a": {
      "piso": "palet"
     },
     "textos": [
      "Un operario deja un palé atravesado en {celda}."
     ]
    },
    {
     "nombre": "Retiran palé",
     "prob": 0.05,
     "a": {
      "palet": "piso"
     },
     "textos": [
      "Retiran el palé de {celda}."
     ]
    }
   ]
  }
 },
 {
  "id": "tesoro",
  "orden": 5,
  "reto": 5,
  "titulo": "En busca del tesoro",
  "lugar": "Isla de las tres calas",
  "concepto": "Más de un camino: antorcha o marea",
  "dificultad": "Inicial",
  "escena": {
   "fondo": [
    "#bae6fd",
    "#38bdf8"
   ],
   "losa": [
    "#fde68a",
    "#d6b26a",
    "#b8954f"
   ],
   "calor": [
    236,
    72,
    153
   ],
   "ruta": "#dc2626",
   "noche": false,
   "alto": 50
  },
  "historia": "El bote de Marina toca la arena al sur de la isla. El cofre está en una cala escondida al noreste, rodeada de rocas. Hay dos maneras de llegar: atravesar la cueva, que es oscura y pide una antorcha olvidada en el oeste, o rodear por el bajío, con el agua a la cintura. Las dos funcionan; solo una es barata.",
  "objetivo": "Llegar al tesoro y volver al bote.",
  "agente": {
   "nombre": "Marina",
   "dibujo": "persona",
   "color": "#0ea5e9",
   "percibe": "Arena, selva, rocas y la profundidad del agua.",
   "recuerda": "Si encontró el tesoro y si lleva la antorcha.",
   "acciones": "Caminar, abrirse paso por la selva o vadear el bajío. La cueva solo con antorcha.",
   "meta": "Tesoro en la mochila y Marina de vuelta en el bote."
  },
  "objeto": "el tesoro",
  "objeto_plural": "tesoro",
  "verbos": {
   "visita": "encuentra"
  },
  "modo": "visitar",
  "final": "inicio",
  "unidad": "min",
  "unidad_larga": "minutos",
  "mapa": [
   "~~~~~~~~~~~~~~",
   "~~~..^^^^^~~~~",
   "~~..TT^ccXbb~~",
   "~..TTT^c^^^b~~",
   "~.t.TT.c...bb~",
   "~..T.......b~~",
   "~~..TT..TT.b~~",
   "~~~.....TT..~~",
   "~~~~..M....~~~",
   "~~~~~~~~~~~~~~"
  ],
  "leyenda": {
   "~": "mar",
   ".": "arena",
   "T": "selva",
   "^": "roca",
   "c": "cueva",
   "X": "tesoro",
   "b": "bajio",
   "t": "antorcha",
   "M": "bote",
   "l": "tronco"
  },
  "tipos": {
   "mar": {
    "nombre": "Mar abierto",
    "paso": false,
    "piso": "#0ea5e9",
    "patron": "agua"
   },
   "arena": {
    "nombre": "Arena",
    "costo": 1,
    "piso": "#fcd34d",
    "patron": "puntos"
   },
   "selva": {
    "nombre": "Selva",
    "costo": 3,
    "piso": "#65a30d",
    "patron": "cesped",
    "forma": {
     "f": "arbol",
     "palmera": true
    }
   },
   "roca": {
    "nombre": "Rocas",
    "paso": false,
    "piso": "#a8a29e",
    "forma": {
     "f": "roca"
    }
   },
   "cueva": {
    "nombre": "Cueva (pide antorcha)",
    "costo": 1,
    "requiere": "antorcha",
    "piso": "#44403c",
    "patron": "losas",
    "forma": {
     "f": "cueva"
    }
   },
   "tesoro": {
    "nombre": "Cofre del tesoro",
    "costo": 1,
    "objetivo": "visitar",
    "suelo": "arena",
    "forma": {
     "f": "cofre"
    }
   },
   "antorcha": {
    "nombre": "Antorcha (opcional)",
    "costo": 1,
    "objetivo": "visitar",
    "opcional": true,
    "clase": "antorcha",
    "suelo": "arena",
    "forma": {
     "f": "antorcha"
    },
    "al_cumplir": "ocultar",
    "nombre_obj": "la antorcha"
   },
   "bajio": {
    "nombre": "Bajío",
    "costo": 4,
    "piso": "#67e8f9",
    "patron": "agua"
   },
   "bote": {
    "nombre": "Bote",
    "costo": 1,
    "inicio": true,
    "suelo": "arena",
    "forma": {
     "f": "barco"
    }
   },
   "tronco": {
    "nombre": "Palmera caída",
    "paso": false,
    "suelo": "arena",
    "forma": {
     "f": "tronco"
    }
   }
  },
  "zonas": [
   {
    "nombre": "la cueva",
    "desde": [
     2,
     7
    ],
    "hasta": [
     4,
     8
    ]
   },
   {
    "nombre": "el bajío",
    "desde": [
     2,
     10
    ],
    "hasta": [
     6,
     12
    ]
   }
  ],
  "herramientas": [
   {
    "id": "tronco",
    "nombre": "Palmeras caídas",
    "ayuda": "Bloquea un tramo de arena.",
    "ciclos": [
     [
      "arena",
      "tronco"
     ]
    ]
   },
   {
    "id": "derrumbe",
    "nombre": "Derrumbe en la cueva",
    "ayuda": "Convierte un tramo de cueva en roca.",
    "ciclos": [
     [
      "cueva",
      "roca"
     ]
    ]
   }
  ],
  "parametros": [
   {
    "id": "marea",
    "nombre": "Marea alta",
    "ayuda": "El bajío pasa de 4 a 9 min por tramo.",
    "valor": false,
    "costos": {
     "bajio": 9
    }
   }
  ],
  "sugerido": "ucs",
  "preguntas": [
   "La antorcha es opcional. ¿El plan óptimo pasa por ella? ¿Y con marea alta?",
   "¿Qué hace BFS con la antorcha? ¿Le importa el bajío?",
   "Derrumba la entrada de la cueva. ¿Cuánto empeora el viaje?"
  ],
  "relato": {
   "reloj": {
    "inicio": "06:30",
    "segundos_por_unidad": 60
   },
   "medidor": {
    "nombre": "Agua",
    "inicio": 100,
    "por_unidad": 1.4,
    "unidad": "%"
   },
   "inicio": [
    "El bote toca la arena. Marina amarra la cuerda a una piedra.",
    "En el mapa viejo, una X al noreste y una nota: «la cueva no perdona la oscuridad»."
   ],
   "zonas": {
    "la cueva": "Dentro de la cueva la antorcha dibuja sombras en las paredes.",
    "el bajío": "Marina entra al bajío. El agua tira de sus piernas."
   },
   "terreno": {
    "selva": "La selva se cierra. Cada metro hay que abrirlo con las manos.",
    "bajio": "Agua hasta la cintura. Avanza despacio."
   },
   "eventos": {
    "visita": "Marina abre {obj}. Monedas, un catalejo y una carta sin firma.",
    "replan": "{motivo} Marina despliega el mapa otra vez."
   },
   "ambiente": [
    "Un loro protesta desde una rama.",
    "El sol ya calienta la arena.",
    "Huellas de cangrejo cruzan el camino.",
    "Marina bebe un sorbo. {medidor}."
   ],
   "fin": "De vuelta en el bote a las {hora}, con el cofre entre las rodillas.",
   "eventos_clase": {
    "antorcha": "Marina enciende la antorcha. La llama se agita: la cueva ya no es un muro."
   }
  },
  "verbos_clase": {
   "antorcha": "enciende"
  },
  "dinamica": {
   "continuo": false,
   "turno": 90,
   "resumen": "Ventarrones tumban palmeras y la cueva suelta piedras.",
   "eventos": [
    {
     "nombre": "Palmera caída",
     "prob": 0.03,
     "a": {
      "arena": "tronco"
     },
     "textos": [
      "Un ventarrón tumba una palmera en {celda}."
     ]
    },
    {
     "nombre": "Derrumbe en la cueva",
     "prob": 0.015,
     "a": {
      "cueva": "roca"
     },
     "textos": [
      "Se desprende una roca dentro de la cueva, en {celda}."
     ]
    }
   ]
  }
 },
 {
  "id": "ambulancia",
  "orden": 6,
  "reto": 6,
  "titulo": "La ambulancia inteligente",
  "lugar": "Ciudad con tráfico",
  "concepto": "Menos cuadras no es menos tiempo",
  "dificultad": "Intermedia",
  "tema": "ciudad",
  "historia": "Entra una llamada: hay un paciente en la calle 4. La ambulancia sale de la base, lo recoge y lo lleva a la entrada de urgencias. Las avenidas son rápidas; las calles internas, lentas; un trancón puede costar seis minutos por cuadra.",
  "objetivo": "Recoger al paciente y llegar a urgencias en el menor tiempo.",
  "agente": {
   "nombre": "Ambulancia 07",
   "dibujo": "ambulancia",
   "percibe": "El estado del tráfico de cada cuadra: libre, trancón o cerrada.",
   "recuerda": "Si ya lleva al paciente a bordo.",
   "acciones": "Avanzar una cuadra por cualquier vía abierta.",
   "meta": "Paciente a bordo y ambulancia en la entrada de urgencias."
  },
  "objeto": "al paciente",
  "objeto_plural": "paciente",
  "verbos": {
   "visita": "recoge"
  },
  "modo": "visitar",
  "final": "urgencias",
  "unidad": "min",
  "unidad_larga": "minutos",
  "mapa": [
   "==============",
   "=HHH.HHH.gggg=",
   "=HHH.HHH.gggg=",
   "=....t....P..=",
   "=HH.HHH.HHH.H=",
   "=HH.HHH.HHH.H=",
   "=.....t......=",
   "=HHH.hhhh.HH.=",
   "=HHH.hhhh.HH.=",
   "=HHH..E...HH.=",
   "=A...........=",
   "=============="
  ],
  "leyenda": {
   "=": "avenida",
   ".": "calle",
   "H": "edificio",
   "h": "hospital",
   "g": "parque",
   "E": "urgencias",
   "A": "base_amb",
   "P": "paciente",
   "t": "trancon",
   "x": "cerrada"
  },
  "tipos": {
   "avenida": {
    "nombre": "Avenida",
    "costo": 1
   },
   "calle": {
    "nombre": "Calle",
    "costo": 2
   },
   "trancon": {
    "nombre": "Calle con trancón",
    "costo": 6,
    "suelo": "calle"
   },
   "trancon_av": {
    "nombre": "Avenida con trancón",
    "costo": 6,
    "suelo": "avenida"
   },
   "cerrada": {
    "nombre": "Calle cerrada",
    "paso": false,
    "suelo": "calle"
   },
   "cerrada_av": {
    "nombre": "Avenida cerrada",
    "paso": false,
    "suelo": "avenida"
   },
   "edificio": {
    "nombre": "Edificio",
    "paso": false
   },
   "hospital": {
    "nombre": "Hospital",
    "paso": false
   },
   "parque": {
    "nombre": "Parque",
    "paso": false
   },
   "urgencias": {
    "nombre": "Entrada de urgencias",
    "costo": 1
   },
   "base_amb": {
    "nombre": "Base de ambulancias",
    "costo": 1,
    "inicio": true
   },
   "paciente": {
    "nombre": "Paciente",
    "costo": 2,
    "objetivo": "visitar",
    "suelo": "calle"
   }
  },
  "herramientas": [
   {
    "id": "trafico",
    "nombre": "Tráfico",
    "ayuda": "Pone o quita un trancón: la cuadra cuesta 6 min.",
    "ciclos": [
     [
      "calle",
      "trancon"
     ],
     [
      "avenida",
      "trancon_av"
     ]
    ]
   },
   {
    "id": "cierre",
    "nombre": "Cierres",
    "ayuda": "Cierra o abre una cuadra.",
    "ciclos": [
     [
      "calle",
      "cerrada"
     ],
     [
      "avenida",
      "cerrada_av"
     ]
    ]
   },
   {
    "id": "paciente",
    "nombre": "Mover paciente",
    "ayuda": "Lleva al paciente a otra calle.",
    "mover": "paciente",
    "sobre": [
     "calle",
     "avenida"
    ]
   }
  ],
  "parametros": [
   {
    "id": "pico",
    "nombre": "Hora pico",
    "ayuda": "Las avenidas pasan de 1 a 4 minutos por cuadra.",
    "valor": false,
    "costos": {
     "avenida": 4
    }
   }
  ],
  "sugerido": "ucs",
  "preguntas": [
   "BFS cuenta cuadras; costo uniforme cuenta minutos. ¿Cuántos minutos pierde BFS?",
   "Activa la hora pico. ¿La ruta óptima sigue usando la avenida?",
   "Cierra la calle por la que pasa la ruta. ¿Cuánto empeora el tiempo?"
  ],
  "relato": {
   "reloj": {
    "inicio": "21:14",
    "segundos_por_unidad": 60
   },
   "medidor": {
    "nombre": "Pulso del paciente",
    "pulso": true,
    "unidad": "lpm"
   },
   "inicio": [
    "21:14. Central: «paciente en la calle 4, consciente, dolor en el pecho».",
    "Sirena encendida. La Ambulancia 07 sale de la base."
   ],
   "terreno": {
    "avenida": "Avenida despejada: la ambulancia acelera.",
    "calle": "Calle interna: hay que bajar la velocidad.",
    "trancon": "Trancón. Los carros se orillan como pueden.",
    "urgencias": "Entrada de urgencias. Las puertas se abren."
   },
   "eventos": {
    "visita": "La ambulancia {verbo} {obj}. Camilla adentro, oxígeno puesto.",
    "replan": "{motivo} El copiloto lee la nueva ruta en voz alta."
   },
   "ambiente": [
    "La sirena rebota entre los edificios.",
    "Un taxi se sube al andén para abrir paso.",
    "Central pregunta por el tiempo estimado: {hora}.",
    "Pulso del paciente: {medidor}."
   ],
   "fin": "Paciente entregado en urgencias a las {hora}."
  },
  "dinamica": {
   "continuo": true,
   "turno": 180,
   "resumen": "El tráfico cambia todo el tiempo y entran nuevas llamadas de emergencia.",
   "eventos": [
    {
     "nombre": "Trancón",
     "prob": 0.06,
     "a": {
      "calle": "trancon",
      "avenida": "trancon_av"
     },
     "textos": [
      "Choque reportado: se forma un trancón en {celda}."
     ]
    },
    {
     "nombre": "Despeja",
     "prob": 0.09,
     "a": {
      "trancon": "calle",
      "trancon_av": "avenida"
     },
     "textos": [
      "El tráfico se despeja en {celda}."
     ]
    },
    {
     "nombre": "Nueva llamada",
     "prob": 0.035,
     "a": {
      "calle": "paciente"
     },
     "max": 1,
     "textos": [
      "Central: nueva emergencia en {celda}.",
      "Llamada al 123: persona herida en {celda}."
     ]
    }
   ]
  }
 },
 {
  "id": "dron",
  "orden": 7,
  "reto": 7,
  "titulo": "El dron repartidor",
  "lugar": "Ciudad vista desde arriba",
  "concepto": "El costo es energía de la batería",
  "dificultad": "Intermedia",
  "escena": {
   "fondo": [
    "#e0f2fe",
    "#7dd3fc"
   ],
   "losa": [
    "#d1d5db",
    "#9ca3af",
    "#6b7280"
   ],
   "calor": [
    217,
    70,
    239
   ],
   "ruta": "#f97316",
   "noche": false,
   "alto": 80
  },
  "historia": "Kite despega del techo de la central con tres pedidos de farmacia. Volar sobre la calle gasta poco; subir por encima de un edificio gasta el doble o el triple. Sobre el aeropuerto no se vuela, nunca. La batería alcanza para lo que alcanza: si el plan pide más energía de la que hay, Kite cae antes de volver.",
  "objetivo": "Entregar los tres pedidos y volver a la base sin agotar la batería.",
  "bateria": 52,
  "agente": {
   "nombre": "Kite",
   "dibujo": "dron",
   "percibe": "Altura de los edificios, zonas prohibidas, viento y carga de la batería.",
   "recuerda": "Qué azoteas ya recibieron su pedido.",
   "acciones": "Volar a la celda vecina. Sobre edificios sube y gasta más.",
   "meta": "Tres entregas y dron en la base, con batería de sobra."
  },
  "objeto": "la entrega",
  "objeto_plural": "entregas",
  "verbos": {
   "visita": "deja el paquete en"
  },
  "modo": "visitar",
  "final": "inicio",
  "unidad": "Wh",
  "unidad_larga": "Wh de batería",
  "mapa": [
   "..............",
   ".BB.HH..TT.Ba.",
   ".BB.HH..TT.BB.",
   "......XXX.....",
   ".aH...XXX..HH.",
   ".HH...XXX..Ha.",
   "..............",
   ".TT.BB....BB..",
   ".TT.BB.D..BB..",
   ".............."
  ],
  "leyenda": {
   ".": "aire",
   "B": "bajo",
   "H": "alto",
   "T": "torre",
   "X": "aeropuerto",
   "a": "azotea",
   "D": "base",
   "z": "prohibida",
   "s": "tormenta"
  },
  "tipos": {
   "aire": {
    "nombre": "Sobre la calle",
    "costo": 1,
    "piso": "#9ca3af",
    "patron": "asfalto"
   },
   "bajo": {
    "nombre": "Sobre edificio bajo",
    "costo": 2,
    "piso": "#a8a29e",
    "forma": {
     "f": "bloque",
     "alto": 18,
     "color": "#e7e5e4",
     "techo": "#f5f5f4",
     "ventanas": true
    }
   },
   "alto": {
    "nombre": "Sobre edificio alto",
    "costo": 3,
    "piso": "#a8a29e",
    "forma": {
     "f": "bloque",
     "alto": 36,
     "color": "#cbd5e1",
     "techo": "#e2e8f0",
     "ventanas": true
    }
   },
   "torre": {
    "nombre": "Torre de antenas",
    "paso": false,
    "piso": "#a8a29e",
    "forma": {
     "f": "torre"
    }
   },
   "aeropuerto": {
    "nombre": "Aeropuerto: no se vuela",
    "paso": false,
    "piso": "#d6d3d1",
    "patron": "rejilla",
    "forma": {
     "f": "volumen",
     "color": "rgba(239,68,68,0.22)",
     "alto": 60
    }
   },
   "azotea": {
    "nombre": "Azotea de entrega",
    "costo": 2,
    "objetivo": "visitar",
    "piso": "#a8a29e",
    "forma": {
     "f": "bloque",
     "alto": 18,
     "color": "#fde68a",
     "techo": "#fef3c7"
    }
   },
   "base": {
    "nombre": "Base de carga",
    "costo": 1,
    "inicio": true,
    "piso": "#9ca3af",
    "forma": {
     "f": "marca",
     "color": "#0ea5e9"
    }
   },
   "prohibida": {
    "nombre": "Zona temporal prohibida",
    "paso": false,
    "suelo": "aire",
    "forma": {
     "f": "volumen",
     "color": "rgba(239,68,68,0.22)",
     "alto": 60
    }
   },
   "tormenta": {
    "nombre": "Celda de tormenta",
    "costo": 5,
    "suelo": "aire",
    "forma": {
     "f": "tormenta"
    }
   }
  },
  "herramientas": [
   {
    "id": "prohibida",
    "nombre": "Zona prohibida",
    "ayuda": "Declara una zona temporal donde no se vuela.",
    "ciclos": [
     [
      "aire",
      "prohibida"
     ]
    ]
   },
   {
    "id": "tormenta",
    "nombre": "Tormenta",
    "ayuda": "Una celda de tormenta: se puede cruzar, pero gasta 5.",
    "ciclos": [
     [
      "aire",
      "tormenta"
     ]
    ]
   }
  ],
  "parametros": [
   {
    "id": "viento",
    "nombre": "Viento fuerte",
    "ayuda": "Volar sobre la calle gasta 2 en vez de 1.",
    "valor": false,
    "costos": {
     "aire": 2
    }
   }
  ],
  "sugerido": "astar",
  "preguntas": [
   "¿Con cuánta batería de sobra vuelve Kite? Activa el viento: ¿alcanza todavía?",
   "BFS cuenta celdas, no energía. ¿Cuánta energía gastaría su plan?",
   "¿Dónde pondrías una zona prohibida para que el plan ya no sea posible?"
  ],
  "relato": {
   "reloj": {
    "inicio": "10:05",
    "segundos_por_unidad": 15
   },
   "medidor": {
    "nombre": "Batería",
    "bateria": true,
    "unidad": "%"
   },
   "inicio": [
    "Las hélices zumban. Kite se eleva desde la base con tres paquetes enganchados.",
    "En la pantalla del operador: {medidor}."
   ],
   "terreno": {
    "alto": "Kite sube para pasar por encima de un edificio alto. El consumo se dispara.",
    "bajo": "Sobrevuela un techo bajo: ligera subida.",
    "tormenta": "Turbulencia. Kite se sacude dentro de la tormenta."
   },
   "eventos": {
    "visita": "Kite desciende, {verbo} la azotea {obj} y vuelve a subir.",
    "replan": "{motivo} Kite flota en el sitio y recalcula."
   },
   "ambiente": [
    "Una paloma esquiva el dron en el último segundo.",
    "Batería: {medidor}.",
    "Desde arriba, el tráfico parece de juguete.",
    "El viento empuja de lado; el dron corrige."
   ],
   "fin": "Kite se posa en la base a las {hora}. Batería restante: {medidor}."
  },
  "dinamica": {
   "continuo": false,
   "turno": 90,
   "resumen": "Las tormentas se mueven y la torre de control declara zonas temporales.",
   "eventos": [
    {
     "nombre": "Tormenta",
     "prob": 0.06,
     "a": {
      "aire": "tormenta"
     },
     "textos": [
      "Se forma una celda de tormenta en {celda}."
     ]
    },
    {
     "nombre": "Se disipa",
     "prob": 0.12,
     "a": {
      "tormenta": "aire"
     },
     "textos": [
      "La tormenta de {celda} se disipa."
     ]
    },
    {
     "nombre": "Zona temporal",
     "prob": 0.02,
     "a": {
      "aire": "prohibida"
     },
     "textos": [
      "Torre de control: zona prohibida en {celda}."
     ]
    }
   ]
  }
 },
 {
  "id": "parqueadero",
  "orden": 8,
  "reto": 8,
  "titulo": "El parqueadero inteligente",
  "lugar": "Sótano de un centro comercial",
  "concepto": "Elegir entre muchas metas",
  "dificultad": "Intermedia",
  "escena": {
   "fondo": [
    "#e2e8f0",
    "#94a3b8"
   ],
   "losa": [
    "#cbd5e1",
    "#94a3b8",
    "#64748b"
   ],
   "calor": [
    16,
    185,
    129
   ],
   "ruta": "#f59e0b",
   "noche": false,
   "alto": 40
  },
  "historia": "Sábado al mediodía. Un sedán entra al sótano buscando cupo. Cada cupo libre es una meta posible, pero no todas valen lo mismo: unos quedan junto a la entrada y obligan a caminar hasta el ascensor; otros están junto al ascensor y lejos de la rampa. Los reservados solo cuentan con permiso. El sistema no elige el cupo más cercano: elige el que suma menos manejo más caminata.",
  "objetivo": "Estacionar en el cupo libre que minimice manejo más caminata hasta el ascensor.",
  "agente": {
   "nombre": "Sedán gris",
   "dibujo": "vehiculo",
   "color": "#94a3b8",
   "percibe": "Qué cupos están libres, ocupados o reservados, y los conos en los carriles.",
   "recuerda": "Nada más que su posición: le basta llegar a cualquier cupo libre.",
   "acciones": "Avanzar por el carril o entrar a un cupo.",
   "meta": "Carro dentro de un cupo libre."
  },
  "objeto": "el cupo",
  "objeto_plural": "cupos libres",
  "verbos": {
   "llega": "estaciona en"
  },
  "modo": "alguno",
  "unidad": "min",
  "unidad_larga": "minutos",
  "mapa": [
   "##############",
   "#oxooxoxoxNNA#",
   "#............#",
   "#.xoxoxxoxoo.#",
   "#.##########.#",
   "#.oxoxxooxox.#",
   "#............#",
   "#.Roxxoxoxxo.#",
   "#E...........#",
   "##############"
  ],
  "leyenda": {
   "#": "muro",
   ".": "carril",
   "o": "cupo",
   "x": "ocupado",
   "N": "cupo_cerca",
   "R": "reservado",
   "A": "ascensor",
   "E": "entrada",
   "k": "conos"
  },
  "tipos": {
   "muro": {
    "nombre": "Muro",
    "paso": false,
    "forma": {
     "f": "bloque",
     "alto": 16,
     "color": "#cbd5e1",
     "techo": "#e2e8f0"
    }
   },
   "carril": {
    "nombre": "Carril",
    "costo": 1,
    "piso": "#6b7280",
    "patron": "asfalto"
   },
   "cupo": {
    "nombre": "Cupo libre (caminata larga)",
    "costo": 3,
    "objetivo": "visitar",
    "piso": "#71717a",
    "forma": {
     "f": "cupo",
     "color": "#ffffff"
    }
   },
   "cupo_cerca": {
    "nombre": "Cupo junto al ascensor",
    "costo": 1,
    "objetivo": "visitar",
    "piso": "#71717a",
    "forma": {
     "f": "cupo",
     "color": "#86efac"
    }
   },
   "reservado": {
    "nombre": "Cupo reservado",
    "paso": false,
    "objetivo": "visitar",
    "piso": "#71717a",
    "forma": {
     "f": "cupo",
     "color": "#60a5fa",
     "simbolo": true
    }
   },
   "ocupado": {
    "nombre": "Cupo ocupado",
    "paso": false,
    "piso": "#71717a",
    "forma": {
     "f": "carro_parqueado"
    }
   },
   "ocupado_cerca": {
    "nombre": "Cupo ocupado",
    "paso": false,
    "piso": "#71717a",
    "forma": {
     "f": "carro_parqueado"
    }
   },
   "ascensor": {
    "nombre": "Ascensor",
    "paso": false,
    "forma": {
     "f": "bloque",
     "alto": 40,
     "color": "#334155",
     "techo": "#475569",
     "puerta": true
    }
   },
   "entrada": {
    "nombre": "Rampa de entrada",
    "costo": 1,
    "inicio": true,
    "piso": "#4b5563",
    "patron": "rejilla"
   },
   "conos": {
    "nombre": "Conos",
    "paso": false,
    "suelo": "carril",
    "forma": {
     "f": "conos"
    }
   }
  },
  "herramientas": [
   {
    "id": "ocupar",
    "nombre": "Ocupar o liberar",
    "ayuda": "Llega otro carro o se va uno.",
    "ciclos": [
     [
      "cupo",
      "ocupado"
     ],
     [
      "cupo_cerca",
      "ocupado_cerca"
     ]
    ]
   },
   {
    "id": "conos",
    "nombre": "Conos",
    "ayuda": "Cierra un tramo de carril.",
    "ciclos": [
     [
      "carril",
      "conos"
     ]
    ]
   }
  ],
  "parametros": [
   {
    "id": "permiso",
    "nombre": "Permiso de movilidad reducida",
    "ayuda": "El cupo reservado pasa a estar disponible.",
    "valor": false,
    "costos": {
     "reservado": 1
    }
   },
   {
    "id": "mercado",
    "nombre": "Mercado pesado",
    "ayuda": "Caminar lejos cuesta 9 en vez de 3.",
    "valor": false,
    "costos": {
     "cupo": 9
    }
   }
  ],
  "sugerido": "ucs",
  "preguntas": [
   "BFS escoge el cupo más cercano en pasos. ¿Es el mejor si cuentas la caminata?",
   "Activa «Mercado pesado». ¿Qué cupo elige ahora el agente?",
   "Ocupa los cupos junto al ascensor. ¿Qué cambia?"
  ],
  "relato": {
   "reloj": {
    "inicio": "12:10",
    "segundos_por_unidad": 30
   },
   "medidor": {
    "nombre": "Paciencia",
    "inicio": 100,
    "por_unidad": 4,
    "unidad": "%"
   },
   "inicio": [
    "La barrera se levanta. El letrero marca cupos libres en verde.",
    "Dentro del carro, alguien dice: «busca uno cerca del ascensor»."
   ],
   "terreno": {
    "carril": "El sedán avanza despacio por el carril.",
    "cupo": "Este cupo queda lejos del ascensor: tocará caminar.",
    "cupo_cerca": "Cupo junto al ascensor."
   },
   "eventos": {
    "llega": "El sedán {verbo} {obj}. Freno de mano.",
    "replan": "{motivo} El sistema actualiza el letrero de cupos."
   },
   "ambiente": [
    "Un carro sale en reversa más adelante.",
    "Huele a llanta y a cemento.",
    "El eco de un pito rebota en las columnas.",
    "{medidor} de paciencia en el asiento de atrás."
   ],
   "fin": "Motor apagado a las {hora}. A caminar hasta el ascensor."
  },
  "dinamica": {
   "continuo": false,
   "turno": 40,
   "resumen": "Otros carros llegan y se van mientras el sedán busca cupo.",
   "eventos": [
    {
     "nombre": "Ocupan un cupo",
     "prob": 0.12,
     "a": {
      "cupo": "ocupado",
      "cupo_cerca": "ocupado_cerca"
     },
     "textos": [
      "Otro carro se adelanta y toma el cupo {celda}."
     ]
    },
    {
     "nombre": "Liberan un cupo",
     "prob": 0.06,
     "a": {
      "ocupado": "cupo",
      "ocupado_cerca": "cupo_cerca"
     },
     "textos": [
      "Un carro sale y libera el cupo {celda}."
     ]
    }
   ]
  }
 },
 {
  "id": "cultivos",
  "orden": 9,
  "reto": 9,
  "titulo": "El agricultor inteligente",
  "lugar": "Finca con parcelas",
  "concepto": "Prioridades que cambian el plan",
  "dificultad": "Avanzada",
  "tema": "finca",
  "historia": "Las trampas de la finca reportaron plaga en cinco parcelas. Dos son urgentes: si no se revisan primero, se pierde la cosecha. Rumi sale del granero, cruza el río solo por los puentes y vuelve al terminar. Pisar el cultivo cuesta más que ir por el camino; con lluvia, el barro se vuelve casi intransitable.",
  "objetivo": "Inspeccionar todas las parcelas con plaga, las urgentes antes que las demás, y volver al granero.",
  "agente": {
   "nombre": "Rumi",
   "dibujo": "rover",
   "percibe": "El terreno bajo sus ruedas y el reporte de plaga de cada parcela.",
   "recuerda": "Qué parcelas ya inspeccionó. Una parcela normal no cuenta como inspeccionada mientras falte una urgente.",
   "acciones": "Avanzar una baldosa. El río solo se cruza por un puente.",
   "meta": "Todas las parcelas inspeccionadas, en orden de prioridad, y Rumi en el granero."
  },
  "objeto": "la parcela",
  "objeto_plural": "parcelas",
  "verbos": {
   "visita": "inspecciona"
  },
  "modo": "visitar",
  "final": "inicio",
  "unidad": "u",
  "unidad_larga": "unidades de energía",
  "mapa": [
   "TTTTTTTTTTTTTT",
   "TGG.,,,~,,p,,T",
   "TGG.,,,~,,,,.T",
   "T.B....=.....T",
   "T.,,,,.~,,,,.T",
   "T.,p,,.~,,,,.T",
   "T.,,,,.~,,U,.T",
   "T.mm...~.....T",
   "T.,,,,.~,,,,.T",
   "T.,,,U.=,,,,.T",
   "T......~.p...T",
   "TTTTTTTTTTTTTT"
  ],
  "leyenda": {
   "T": "arbol",
   "G": "granero",
   "B": "patio",
   ".": "camino",
   ",": "cultivo",
   "p": "plaga",
   "U": "plaga_urgente",
   "~": "rio",
   "=": "puente",
   "m": "barro"
  },
  "tipos": {
   "arbol": {
    "nombre": "Árboles del lindero",
    "paso": false
   },
   "granero": {
    "nombre": "Granero",
    "paso": false
   },
   "patio": {
    "nombre": "Patio del granero",
    "costo": 1,
    "inicio": true
   },
   "camino": {
    "nombre": "Camino de tierra",
    "costo": 1
   },
   "cultivo": {
    "nombre": "Cultivo sano",
    "costo": 3
   },
   "plaga": {
    "nombre": "Parcela con plaga",
    "costo": 3,
    "objetivo": "visitar",
    "suelo": "cultivo"
   },
   "plaga_urgente": {
    "nombre": "Plaga urgente",
    "costo": 3,
    "objetivo": "visitar",
    "prioridad": "alta",
    "suelo": "cultivo"
   },
   "rio": {
    "nombre": "Río",
    "paso": false
   },
   "puente": {
    "nombre": "Puente",
    "costo": 1
   },
   "barro": {
    "nombre": "Barro",
    "costo": 4,
    "suelo": "camino"
   }
  },
  "zonas": [
   {
    "nombre": "lote norte",
    "desde": [
     1,
     8
    ],
    "hasta": [
     2,
     12
    ]
   },
   {
    "nombre": "lote del maíz",
    "desde": [
     4,
     2
    ],
    "hasta": [
     6,
     5
    ]
   },
   {
    "nombre": "lote del café",
    "desde": [
     4,
     8
    ],
    "hasta": [
     6,
     11
    ]
   },
   {
    "nombre": "lote sur",
    "desde": [
     8,
     2
    ],
    "hasta": [
     9,
     5
    ]
   },
   {
    "nombre": "lote del río",
    "desde": [
     8,
     8
    ],
    "hasta": [
     10,
     12
    ]
   }
  ],
  "herramientas": [
   {
    "id": "plaga",
    "nombre": "Plaga",
    "ayuda": "Cada clic: sana → plaga → urgente → sana. Máximo 6.",
    "ciclos": [
     [
      "cultivo",
      "plaga",
      "plaga_urgente"
     ]
    ]
   },
   {
    "id": "barro",
    "nombre": "Barro",
    "ayuda": "Convierte un tramo de camino en barro.",
    "ciclos": [
     [
      "camino",
      "barro"
     ]
    ]
   }
  ],
  "parametros": [
   {
    "id": "lluvia",
    "nombre": "Lluvia",
    "ayuda": "El camino cuesta 2 y el barro 9.",
    "valor": false,
    "costos": {
     "camino": 2,
     "barro": 9
    }
   },
   {
    "id": "prioridad",
    "nombre": "Urgentes primero",
    "ayuda": "Si lo apagas, Rumi ignora la prioridad.",
    "valor": true,
    "regla": "prioridad"
   }
  ],
  "sugerido": "astar",
  "preguntas": [
   "Apaga «Urgentes primero». ¿Cuánta energía ahorra Rumi y qué riesgo corre la finca?",
   "Con lluvia, ¿Rumi atraviesa el barro o lo rodea?",
   "¿Por qué A* expande menos estados que costo uniforme y aun así encuentra el mismo costo?"
  ],
  "relato": {
   "reloj": {
    "inicio": "06:00",
    "segundos_por_unidad": 90
   },
   "medidor": {
    "nombre": "Batería",
    "inicio": 100,
    "por_unidad": 0.8,
    "unidad": "%"
   },
   "inicio": [
    "Amanece en la finca. Las trampas reportaron plaga en la noche.",
    "Rumi sale del granero; las urgentes van primero."
   ],
   "zonas": {
    "lote norte": "Lote norte, junto al lindero.",
    "lote del maíz": "Entre las hileras de maíz.",
    "lote del café": "El lote del café, al otro lado del río.",
    "lote sur": "Lote sur.",
    "lote del río": "Lote del río: tierra húmeda."
   },
   "terreno": {
    "cultivo": "Rumi pisa entre las plantas con cuidado. Cuesta más que ir por el camino.",
    "barro": "Barro. Las ruedas se hunden.",
    "puente": "Rumi cruza el puente de madera."
   },
   "eventos": {
    "visita": "Rumi {verbo} {obj}: toma fotos de las hojas y deja una trampa nueva.",
    "replan": "{motivo} Rumi se detiene y rehace la ruta."
   },
   "ambiente": [
    "Un gallo canta desde el granero.",
    "El rocío brilla en las hojas.",
    "Batería: {medidor}.",
    "Un colibrí pasa frente a la cámara de Rumi."
   ],
   "fin": "Rumi vuelve al granero a las {hora}. Reporte de plaga enviado."
  },
  "dinamica": {
   "continuo": true,
   "turno": 220,
   "resumen": "La plaga se propaga a las parcelas vecinas y llueve sobre los caminos.",
   "eventos": [
    {
     "nombre": "Plaga se propaga",
     "prob": 0.05,
     "a": {
      "cultivo": "plaga"
     },
     "junto_a": [
      "plaga",
      "plaga_urgente"
     ],
     "textos": [
      "La plaga salta a la parcela vecina, {celda}."
     ]
    },
    {
     "nombre": "Plaga urgente",
     "prob": 0.02,
     "a": {
      "cultivo": "plaga_urgente"
     },
     "textos": [
      "La trampa de {celda} reporta plaga urgente."
     ]
    },
    {
     "nombre": "Barro",
     "prob": 0.03,
     "a": {
      "camino": "barro"
     },
     "textos": [
      "Un aguacero deja barro en {celda}."
     ]
    }
   ]
  }
 },
 {
  "id": "hospital",
  "orden": 10,
  "reto": 10,
  "titulo": "El robot del hospital",
  "lugar": "Planta de hospitalización, turno de noche",
  "concepto": "Plan secuencial: primero la farmacia",
  "dificultad": "Intermedia",
  "escena": {
   "fondo": [
    "#ecfeff",
    "#a5f3fc"
   ],
   "losa": [
    "#f1f5f9",
    "#cbd5e1",
    "#94a3b8"
   ],
   "calor": [
    14,
    116,
    144
   ],
   "ruta": "#0ea5e9",
   "noche": false,
   "alto": 50
  },
  "historia": "Tres de la mañana. Lumen recibe la ronda: cuatro pacientes esperan su medicación. Antes de visitar cualquier habitación tiene que pasar por la farmacia; sin el medicamento, llegar a una cama no sirve de nada. Algunas habitaciones pueden quedar en aislamiento y cerrar su puerta en cualquier momento.",
  "objetivo": "Recoger la medicación en farmacia, llevarla a cada paciente y terminar en el muelle de carga.",
  "agente": {
   "nombre": "Lumen",
   "dibujo": "robot",
   "color": "#e0f2fe",
   "percibe": "Puertas abiertas o en aislamiento, pisos mojados y camillas en el pasillo.",
   "recuerda": "Si ya pasó por farmacia y a qué pacientes ya atendió.",
   "acciones": "Avanzar por pasillos y entrar a habitaciones con la puerta abierta.",
   "meta": "Cuatro pacientes con su medicación y Lumen en el muelle de carga."
  },
  "objeto": "el paciente",
  "objeto_plural": "puntos de la ronda",
  "verbos": {
   "visita": "atiende a"
  },
  "modo": "visitar",
  "final": "cargador",
  "unidad": "s",
  "unidad_larga": "segundos",
  "mapa": [
   "##############",
   "#bb.#bb.#ff..#",
   "#...#...#ffF.#",
   "#.h.#.h.#....#",
   "##D###D###D###",
   "#S..........K#",
   "##D###D###D###",
   "#...#...#...h#",
   "#.h.#bb.#bb..#",
   "#bb.#...#....#",
   "##############"
  ],
  "leyenda": {
   "#": "muro",
   ".": "piso",
   "b": "cama",
   "f": "estante",
   "F": "farmacia",
   "h": "paciente",
   "D": "puerta",
   "S": "estacion",
   "w": "mojado",
   "c": "camilla",
   "i": "aislada",
   "K": "cargador"
  },
  "tipos": {
   "muro": {
    "nombre": "Muro",
    "paso": false,
    "forma": {
     "f": "bloque",
     "alto": 24,
     "color": "#e2e8f0",
     "techo": "#f8fafc"
    }
   },
   "piso": {
    "nombre": "Piso",
    "costo": 1,
    "piso": "#e0f2f1",
    "patron": "baldosa"
   },
   "cama": {
    "nombre": "Cama",
    "paso": false,
    "suelo": "piso",
    "forma": {
     "f": "cama"
    }
   },
   "estante": {
    "nombre": "Estante de farmacia",
    "paso": false,
    "suelo": "piso",
    "forma": {
     "f": "estante"
    }
   },
   "farmacia": {
    "nombre": "Ventanilla de farmacia",
    "costo": 1,
    "objetivo": "visitar",
    "prioridad": "alta",
    "suelo": "piso",
    "forma": {
     "f": "marca",
     "color": "#22c55e"
    },
    "nombre_obj": "la ventanilla de farmacia",
    "permanente": true
   },
   "paciente": {
    "nombre": "Paciente",
    "costo": 1,
    "objetivo": "visitar",
    "suelo": "piso",
    "forma": {
     "f": "persona",
     "color": "#93c5fd",
     "acostado": true
    }
   },
   "puerta": {
    "nombre": "Puerta abierta",
    "costo": 1,
    "suelo": "piso"
   },
   "aislada": {
    "nombre": "Aislamiento: puerta cerrada",
    "paso": false,
    "suelo": "piso",
    "forma": {
     "f": "bloque",
     "alto": 24,
     "color": "#f97316",
     "techo": "#fdba74",
     "ins": 0.1
    }
   },
   "estacion": {
    "nombre": "Estación de enfermería",
    "costo": 1,
    "inicio": true,
    "suelo": "piso",
    "forma": {
     "f": "marca",
     "color": "#0ea5e9"
    }
   },
   "mojado": {
    "nombre": "Piso recién trapeado",
    "costo": 4,
    "suelo": "piso",
    "forma": {
     "f": "charco",
     "color": "rgba(56,189,248,0.45)"
    }
   },
   "camilla": {
    "nombre": "Camilla en el pasillo",
    "paso": false,
    "suelo": "piso",
    "forma": {
     "f": "camilla"
    }
   },
   "cargador": {
    "nombre": "Muelle de carga",
    "costo": 1,
    "suelo": "piso",
    "forma": {
     "f": "marca",
     "color": "#22c55e"
    }
   }
  },
  "zonas": [
   {
    "nombre": "habitación 101",
    "desde": [
     1,
     1
    ],
    "hasta": [
     3,
     3
    ]
   },
   {
    "nombre": "habitación 102",
    "desde": [
     1,
     5
    ],
    "hasta": [
     3,
     7
    ]
   },
   {
    "nombre": "farmacia",
    "desde": [
     1,
     9
    ],
    "hasta": [
     3,
     12
    ]
   },
   {
    "nombre": "pasillo",
    "desde": [
     5,
     1
    ],
    "hasta": [
     5,
     12
    ]
   },
   {
    "nombre": "habitación 201",
    "desde": [
     7,
     1
    ],
    "hasta": [
     9,
     3
    ]
   },
   {
    "nombre": "habitación 202",
    "desde": [
     7,
     5
    ],
    "hasta": [
     9,
     7
    ]
   },
   {
    "nombre": "habitación 203",
    "desde": [
     7,
     9
    ],
    "hasta": [
     9,
     12
    ]
   }
  ],
  "herramientas": [
   {
    "id": "aislar",
    "nombre": "Aislamiento",
    "ayuda": "Cierra o abre la puerta de una habitación.",
    "ciclos": [
     [
      "puerta",
      "aislada"
     ]
    ]
   },
   {
    "id": "trapear",
    "nombre": "Trapear",
    "ayuda": "Piso mojado: se puede pasar, pero cuesta 4.",
    "ciclos": [
     [
      "piso",
      "mojado"
     ]
    ]
   },
   {
    "id": "camilla",
    "nombre": "Camillas",
    "ayuda": "Deja una camilla en el pasillo.",
    "ciclos": [
     [
      "piso",
      "camilla"
     ]
    ]
   }
  ],
  "parametros": [
   {
    "id": "prioridad",
    "nombre": "Farmacia primero",
    "ayuda": "Si lo apagas, Lumen puede «atender» sin medicamento. Mira cuánto ahorra y por qué está mal.",
    "valor": true,
    "regla": "prioridad"
   }
  ],
  "sugerido": "astar",
  "preguntas": [
   "Apaga «Farmacia primero». ¿Cuánto ahorra Lumen? ¿Por qué ese plan no sirve?",
   "Pon en aislamiento la habitación 202. ¿Se puede completar la ronda?",
   "¿Cuántas veces cruza Lumen el pasillo central en el plan óptimo?"
  ],
  "relato": {
   "reloj": {
    "inicio": "03:00",
    "segundos_por_unidad": 8
   },
   "medidor": {
    "nombre": "Batería",
    "inicio": 100,
    "por_unidad": 0.6,
    "unidad": "%"
   },
   "inicio": [
    "El pasillo está en penumbra. Lumen enciende sus luces bajas para no despertar a nadie.",
    "La ronda de las tres: primero farmacia, después las camas."
   ],
   "zonas": {
    "farmacia": "Lumen entra a la farmacia. La ventanilla tiene listas cuatro bolsas rotuladas.",
    "pasillo": "De vuelta al pasillo central. Un monitor pita a lo lejos.",
    "habitación 101": "Habitación 101. Lumen baja la velocidad.",
    "habitación 102": "Habitación 102. Una lámpara de lectura sigue encendida.",
    "habitación 201": "Habitación 201.",
    "habitación 202": "Habitación 202. Ronquidos suaves.",
    "habitación 203": "Habitación 203, la del fondo."
   },
   "terreno": {
    "mojado": "Piso mojado. Lumen avanza a la mitad de velocidad."
   },
   "eventos": {
    "visita": "Lumen {verbo} {obj}. Bolsa entregada, registro firmado.",
    "replan": "{motivo} Lumen se detiene a un lado del pasillo y rehace la ronda."
   },
   "ambiente": [
    "Una enfermera saluda a Lumen con la cabeza.",
    "Huele a alcohol y a café recalentado.",
    "El reloj del pasillo marca {hora}.",
    "Batería: {medidor}."
   ],
   "fin": "Ronda terminada a las {hora}. Lumen se acopla al muelle de carga.",
   "eventos_clase": {
    "farmacia": "En la ventanilla, el farmaceuta le carga cuatro bolsas rotuladas. Ahora sí, a las camas."
   }
  },
  "verbos_clase": {
   "farmacia": "recoge la medicación en"
  },
  "dinamica": {
   "continuo": true,
   "turno": 220,
   "resumen": "Suenan timbres en las habitaciones, trapean pasillos y dejan camillas.",
   "eventos": [
    {
     "nombre": "Timbre",
     "prob": 0.045,
     "a": {
      "piso": "paciente"
     },
     "zonas": [
      "habitación 101",
      "habitación 102",
      "habitación 201",
      "habitación 202",
      "habitación 203"
     ],
     "textos": [
      "Timbre en la {zona}: un paciente pide medicación.",
      "La {zona} llama a enfermería."
     ]
    },
    {
     "nombre": "Trapean",
     "prob": 0.03,
     "a": {
      "piso": "mojado"
     },
     "zonas": [
      "pasillo"
     ],
     "textos": [
      "El aseo trapea el pasillo en {celda}."
     ]
    },
    {
     "nombre": "Seca",
     "prob": 0.08,
     "a": {
      "mojado": "piso"
     },
     "textos": [
      "El piso de {celda} ya secó."
     ]
    },
    {
     "nombre": "Camilla",
     "prob": 0.02,
     "a": {
      "piso": "camilla"
     },
     "zonas": [
      "pasillo"
     ],
     "textos": [
      "Dejan una camilla en el pasillo, {celda}."
     ]
    },
    {
     "nombre": "Retiran camilla",
     "prob": 0.05,
     "a": {
      "camilla": "piso"
     },
     "textos": [
      "Se llevan la camilla de {celda}."
     ]
    }
   ]
  }
 },
 {
  "id": "ciber",
  "orden": 11,
  "reto": 11,
  "titulo": "El agente de ciberseguridad",
  "lugar": "Red de una empresa",
  "concepto": "Ganar es que no exista camino",
  "dificultad": "Avanzada",
  "escena": {
   "fondo": [
    "#0f172a",
    "#020617"
   ],
   "losa": [
    "#1e293b",
    "#0f172a",
    "#020617"
   ],
   "calor": [
    244,
    63,
    94
   ],
   "ruta": "#f43f5e",
   "noche": true,
   "alto": 40
  },
  "historia": "Un servidor de la esquina amaneció comprometido. El gusano busca el camino más corto hasta la base de datos de clientes, y lo va a encontrar si existe. Tu trabajo es segmentar la red: cortar cables o poner cortafuegos hasta que la búsqueda del gusano ya no encuentre ruta. Pero cada corte tiene un costo: las terminales de los empleados también necesitan llegar a los datos.",
  "objetivo": "Dejar al gusano sin camino a la base de datos, manteniendo conectadas las terminales.",
  "exito": "contener",
  "legitimos": "terminal",
  "agente": {
   "nombre": "Gusano W-32",
   "dibujo": "orbe",
   "color": "#f43f5e",
   "percibe": "Los enlaces abiertos que salen de cada equipo que infecta.",
   "recuerda": "Nada: solo avanza por la red buscando los datos.",
   "acciones": "Saltar al equipo vecino por un cable abierto. Un cortafuegos lo detiene.",
   "meta": "Llegar a la base de datos. Tu meta es que no pueda."
  },
  "objeto": "",
  "objeto_plural": "datos",
  "verbos": {},
  "modo": "visitar",
  "final": "basedatos",
  "unidad": "saltos",
  "unidad_larga": "saltos",
  "mapa": [
   "..............",
   ".W--S---S---T.",
   "....-...-.....",
   ".T--S-S-S--S..",
   "....-.-...-...",
   "..S-S.S---S-T.",
   "..-...-...-...",
   "..S---S---S...",
   "......-...-...",
   ".T----S---D...",
   ".............."
  ],
  "leyenda": {
   ".": "vacio",
   "-": "cable",
   "S": "switch",
   "W": "comprometido",
   "T": "terminal",
   "D": "basedatos",
   "x": "cortado",
   "F": "firewall",
   "a": "aislado"
  },
  "tipos": {
   "vacio": {
    "nombre": "Piso técnico",
    "paso": false,
    "piso": "#111827",
    "patron": "rejilla"
   },
   "cable": {
    "nombre": "Cable de red",
    "costo": 1,
    "red": true,
    "piso": "#111827",
    "patron": "cable"
   },
   "switch": {
    "nombre": "Switch",
    "costo": 1,
    "red": true,
    "piso": "#111827",
    "patron": "cable",
    "forma": {
     "f": "switch"
    }
   },
   "comprometido": {
    "nombre": "Servidor comprometido",
    "costo": 1,
    "inicio": true,
    "red": true,
    "piso": "#111827",
    "patron": "cable",
    "forma": {
     "f": "servidor",
     "color": "#f43f5e"
    }
   },
   "terminal": {
    "nombre": "Terminal de empleado",
    "costo": 1,
    "red": true,
    "piso": "#111827",
    "patron": "cable",
    "forma": {
     "f": "terminal"
    }
   },
   "basedatos": {
    "nombre": "Base de datos de clientes",
    "costo": 1,
    "red": true,
    "piso": "#111827",
    "patron": "cable",
    "forma": {
     "f": "basedatos"
    }
   },
   "cortado": {
    "nombre": "Cable cortado",
    "paso": false,
    "piso": "#111827",
    "patron": "cable_cortado"
   },
   "firewall": {
    "nombre": "Cortafuegos (deja pasar a los empleados)",
    "paso": false,
    "legitimo": true,
    "red": true,
    "piso": "#111827",
    "patron": "cable",
    "forma": {
     "f": "firewall"
    }
   },
   "aislado": {
    "nombre": "Switch aislado",
    "paso": false,
    "red": true,
    "piso": "#111827",
    "patron": "cable",
    "forma": {
     "f": "switch",
     "apagado": true
    }
   }
  },
  "herramientas": [
   {
    "id": "cortar",
    "nombre": "Cortar cable",
    "ayuda": "Corta el enlace para todos, gusano y empleados.",
    "ciclos": [
     [
      "cable",
      "cortado"
     ]
    ]
   },
   {
    "id": "firewall",
    "nombre": "Cortafuegos",
    "ayuda": "Bloquea al gusano y deja pasar el tráfico de los empleados.",
    "ciclos": [
     [
      "cable",
      "firewall"
     ]
    ]
   },
   {
    "id": "aislar",
    "nombre": "Aislar switch",
    "ayuda": "Apaga un switch completo.",
    "ciclos": [
     [
      "switch",
      "aislado"
     ]
    ]
   }
  ],
  "parametros": [],
  "sugerido": "bfs",
  "preguntas": [
   "¿Cuál es el menor número de cortes que deja al gusano sin camino?",
   "¿Por qué un cortafuegos es mejor que un corte para las terminales?",
   "Si BFS no encuentra camino, ¿puede A* encontrar uno? ¿Por qué?"
  ],
  "relato": {
   "reloj": {
    "inicio": "02:47",
    "segundos_por_unidad": 4
   },
   "inicio": [
    "02:47. La consola del SOC se pone roja: tráfico extraño desde el servidor de la esquina.",
    "El gusano ya está buscando. Cada segundo cuenta."
   ],
   "terreno": {
    "switch": "El gusano alcanza un switch y escanea los puertos vecinos.",
    "terminal": "El gusano toca una terminal de empleado.",
    "basedatos": "El gusano llega a la base de datos. Brecha confirmada."
   },
   "eventos": {
    "replan": "{motivo} El gusano pierde su ruta y busca otra."
   },
   "ambiente": [
    "Los paquetes salen a ráfagas por el cable.",
    "Una alerta tras otra en la consola.",
    "El gusano salta al siguiente equipo.",
    "Reloj del SOC: {hora}."
   ],
   "fin": "Brecha a las {hora}. El gusano alcanzó los datos.",
   "contenido": "Contención lograda: el gusano no tiene ningún camino hasta los datos."
  },
  "dinamica": {
   "continuo": false,
   "turno": 60,
   "resumen": "Los técnicos reconectan cables, reinician switches y alguien conecta cables sin autorización.",
   "eventos": [
    {
     "nombre": "Reconectan",
     "prob": 0.05,
     "a": {
      "cortado": "cable"
     },
     "textos": [
      "Un técnico reconecta el cable de {celda} sin avisar."
     ]
    },
    {
     "nombre": "Reinician",
     "prob": 0.03,
     "a": {
      "aislado": "switch"
     },
     "textos": [
      "Reinician el switch {celda}: vuelve a la red."
     ]
    },
    {
     "nombre": "Cable sin autorización",
     "prob": 0.04,
     "a": {
      "vacio": "cable"
     },
     "junto_a": [
      "cable",
      "switch",
      "terminal"
     ],
     "textos": [
      "Alguien conecta un cable sin autorización en {celda}: hay una ruta nueva en la red."
     ]
    }
   ]
  }
 },
 {
  "id": "tutor",
  "orden": 12,
  "reto": 12,
  "titulo": "El tutor académico inteligente",
  "lugar": "Mapa de competencias de un curso",
  "concepto": "Requisitos antes de avanzar",
  "dificultad": "Avanzada",
  "escena": {
   "fondo": [
    "#fef3c7",
    "#fcd34d"
   ],
   "losa": [
    "#fffbeb",
    "#e7d8b0",
    "#d6c08e"
   ],
   "calor": [
    234,
    88,
    12
   ],
   "ruta": "#7c3aed",
   "noche": false,
   "alto": 50
  },
  "historia": "Ada empieza el curso de programación. El tutor no le muestra todo a la vez: una actividad de lógica solo se abre cuando Ada domina los fundamentos, y la de programación solo después de lógica. Cada casilla es una actividad con sus horas: leer cuesta poco, practicar cuesta más, una tutoría ahorra tiempo. El tutor propone el siguiente paso calculando el camino de menor esfuerzo que respeta los requisitos.",
  "objetivo": "Dominar fundamentos, lógica y programación, en ese orden, y presentar el proyecto final.",
  "agente": {
   "nombre": "Ada",
   "dibujo": "persona",
   "color": "#7c3aed",
   "birrete": true,
   "percibe": "Qué actividades están abiertas y cuántas horas pide cada una.",
   "recuerda": "Qué competencias ya domina.",
   "acciones": "Tomar una actividad vecina. Un examen solo se presenta con su requisito.",
   "meta": "Tres competencias dominadas y el proyecto final presentado."
  },
  "objeto": "la competencia",
  "objeto_plural": "competencias",
  "verbos": {
   "visita": "domina"
  },
  "modo": "visitar",
  "final": "proyecto",
  "unidad": "h",
  "unidad_larga": "horas de estudio",
  "mapa": [
   "##############",
   "#I.::#..:#:..#",
   "#.::.#.::#.:.#",
   "#:F..1.L:2:R.#",
   "#..::#.:.#.:.#",
   "#.:..#::.#..C#",
   "##############"
  ],
  "leyenda": {
   "#": "muro",
   ".": "lectura",
   ":": "practica",
   "I": "inicio",
   "F": "fundamentos",
   "L": "logica",
   "R": "programacion",
   "1": "examen_logica",
   "2": "examen_prog",
   "C": "proyecto",
   "t": "tutoria",
   "x": "cerrada"
  },
  "tipos": {
   "muro": {
    "nombre": "Muro",
    "paso": false,
    "forma": {
     "f": "bloque",
     "alto": 16,
     "color": "#d6c08e",
     "techo": "#eadbb5"
    }
   },
   "lectura": {
    "nombre": "Lectura",
    "costo": 1,
    "piso": "#fef9c3",
    "patron": "baldosa"
   },
   "practica": {
    "nombre": "Práctica guiada",
    "costo": 2,
    "piso": "#e0e7ff",
    "patron": "baldosa"
   },
   "tutoria": {
    "nombre": "Tutoría",
    "costo": 1,
    "piso": "#bbf7d0",
    "patron": "baldosa",
    "forma": {
     "f": "hito",
     "color": "#16a34a",
     "icono": "T",
     "bajo": true
    }
   },
   "cerrada": {
    "nombre": "Actividad cancelada",
    "paso": false,
    "piso": "#e5e7eb",
    "forma": {
     "f": "barrera"
    }
   },
   "inicio": {
    "nombre": "Inscripción",
    "costo": 1,
    "inicio": true,
    "piso": "#fef9c3",
    "forma": {
     "f": "marca",
     "color": "#7c3aed"
    }
   },
   "fundamentos": {
    "nombre": "Competencia: fundamentos",
    "costo": 2,
    "objetivo": "visitar",
    "clase": "fundamentos",
    "piso": "#fde68a",
    "forma": {
     "f": "hito",
     "color": "#f59e0b",
     "icono": "F"
    },
    "nombre_obj": "los fundamentos"
   },
   "logica": {
    "nombre": "Competencia: lógica",
    "costo": 3,
    "objetivo": "visitar",
    "clase": "logica",
    "piso": "#fde68a",
    "forma": {
     "f": "hito",
     "color": "#0ea5e9",
     "icono": "L"
    },
    "nombre_obj": "la lógica"
   },
   "programacion": {
    "nombre": "Competencia: programación",
    "costo": 4,
    "objetivo": "visitar",
    "clase": "programacion",
    "piso": "#fde68a",
    "forma": {
     "f": "hito",
     "color": "#db2777",
     "icono": "P"
    },
    "nombre_obj": "la programación"
   },
   "examen_logica": {
    "nombre": "Puerta de lógica (pide fundamentos)",
    "costo": 1,
    "requiere": "fundamentos",
    "piso": "#fef9c3",
    "forma": {
     "f": "reja",
     "color": "#f59e0b"
    }
   },
   "examen_prog": {
    "nombre": "Puerta de programación (pide lógica)",
    "costo": 1,
    "requiere": "logica",
    "piso": "#fef9c3",
    "forma": {
     "f": "reja",
     "color": "#0ea5e9"
    }
   },
   "proyecto": {
    "nombre": "Proyecto final",
    "costo": 2,
    "requiere": "programacion",
    "piso": "#ddd6fe",
    "forma": {
     "f": "portal",
     "color": "#a78bfa"
    }
   }
  },
  "zonas": [
   {
    "nombre": "módulo 1",
    "desde": [
     1,
     1
    ],
    "hasta": [
     5,
     4
    ]
   },
   {
    "nombre": "módulo 2",
    "desde": [
     1,
     6
    ],
    "hasta": [
     5,
     8
    ]
   },
   {
    "nombre": "módulo 3",
    "desde": [
     1,
     10
    ],
    "hasta": [
     5,
     12
    ]
   }
  ],
  "herramientas": [
   {
    "id": "tutoria",
    "nombre": "Tutorías",
    "ayuda": "Convierte una práctica en tutoría: cuesta 1 hora.",
    "ciclos": [
     [
      "practica",
      "tutoria"
     ]
    ]
   },
   {
    "id": "cancelar",
    "nombre": "Cancelar actividad",
    "ayuda": "Una lectura deja de estar disponible.",
    "ciclos": [
     [
      "lectura",
      "cerrada"
     ]
    ]
   }
  ],
  "parametros": [
   {
    "id": "parciales",
    "nombre": "Semana de parciales",
    "ayuda": "Practicar cuesta 4 horas en vez de 2.",
    "valor": false,
    "costos": {
     "practica": 4
    }
   }
  ],
  "sugerido": "astar",
  "preguntas": [
   "¿Por qué el tutor no puede proponer la actividad de lógica al principio, aunque esté a dos casillas?",
   "Pon tutorías en el módulo 2. ¿Cuántas horas ahorra Ada?",
   "¿Qué pasaría si la puerta de programación pidiera fundamentos en vez de lógica?"
  ],
  "relato": {
   "reloj": {
    "inicio": "Semana 1",
    "semanas": true,
    "horas_por_semana": 6
   },
   "medidor": {
    "nombre": "Energía",
    "inicio": 100,
    "por_unidad": 2,
    "unidad": "%"
   },
   "inicio": [
    "Ada se inscribe. El tablero del curso le muestra solo lo que puede hacer hoy.",
    "El tutor marca la primera meta: los fundamentos."
   ],
   "zonas": {
    "módulo 1": "Módulo 1: fundamentos. Variables, tipos, la primera función.",
    "módulo 2": "Módulo 2 abierto: lógica, condiciones, ciclos.",
    "módulo 3": "Módulo 3: programación. Aquí se construye en serio."
   },
   "terreno": {
    "practica": "Una práctica guiada. Cuesta, pero se queda.",
    "tutoria": "Tutoría: lo que tomaba dos horas se resuelve en una.",
    "examen_logica": "Ada presenta la prueba de fundamentos. Aprobada: se abre lógica.",
    "examen_prog": "Prueba de lógica aprobada. Se abre programación.",
    "proyecto": "Ada presenta el proyecto final."
   },
   "eventos": {
    "visita": "Ada {verbo} {obj}. El tutor la marca como sabida.",
    "replan": "{motivo} El tutor reorganiza el plan de estudio."
   },
   "ambiente": [
    "Ada toma apuntes en el margen.",
    "Un compañero pregunta por el taller de la semana.",
    "El foro tiene una duda nueva; Ada la responde.",
    "Energía: {medidor}. Toca un descanso pronto."
   ],
   "fin": "{hora}: proyecto entregado. Ada termina el curso.",
   "eventos_clase": {
    "fundamentos": "Ada aprueba fundamentos. El tutor abre la puerta del módulo 2.",
    "logica": "Ada domina la lógica. Se abre el módulo de programación.",
    "programacion": "Ada ya programa por su cuenta. Solo falta el proyecto final."
   }
  },
  "dinamica": {
   "continuo": false,
   "turno": 60,
   "resumen": "Se cancelan actividades y abren tutorías nuevas durante el semestre.",
   "eventos": [
    {
     "nombre": "Cancelan",
     "prob": 0.03,
     "a": {
      "lectura": "cerrada"
     },
     "textos": [
      "Se cancela la actividad de {celda}."
     ]
    },
    {
     "nombre": "Tutoría nueva",
     "prob": 0.04,
     "a": {
      "practica": "tutoria"
     },
     "textos": [
      "Abren una tutoría nueva en {celda}."
     ]
    }
   ]
  }
 },
 {
  "id": "rescate",
  "orden": 13,
  "reto": 13,
  "titulo": "El robot de rescate",
  "lugar": "Barrio después del sismo",
  "concepto": "Descubrir obstáculos y replanificar",
  "dificultad": "Avanzada",
  "escena": {
   "fondo": [
    "#fde68a",
    "#c2410c"
   ],
   "losa": [
    "#a8a29e",
    "#78716c",
    "#57534e"
   ],
   "calor": [
    234,
    179,
    8
   ],
   "ruta": "#22d3ee",
   "noche": false,
   "alto": 50
  },
  "historia": "Una hora después del sismo, Tango sale del puesto de socorro hacia tres personas atrapadas. El mapa que lleva es el de antes del sismo: muestra las calles despejadas. Algunas no lo están. Tango solo descubre un escombro cuando su sensor lo tiene enfrente, y en ese momento tiene que abandonar el plan viejo y buscar otro.",
  "objetivo": "Llegar a las tres personas atrapadas y volver al puesto de socorro.",
  "agente": {
   "nombre": "Tango",
   "dibujo": "rover",
   "color": "#f97316",
   "percibe": "Solo las cuatro calles que tiene al lado. Lo demás es el mapa viejo.",
   "recuerda": "A quién ya rescató y los escombros que ya descubrió.",
   "acciones": "Avanzar una cuadra. Cruzar fuego o agua cuesta más.",
   "meta": "Tres personas atendidas y Tango en el puesto de socorro."
  },
  "objeto": "la persona",
  "objeto_plural": "personas atrapadas",
  "verbos": {
   "visita": "rescata a"
  },
  "modo": "visitar",
  "final": "inicio",
  "unidad": "min",
  "unidad_larga": "minutos",
  "sensor": 1,
  "mapa": [
   "HHHHHHHHHHHHHH",
   "H....H...v...H",
   "H.HH.H.HH.HH.H",
   "H.HH...HH.?..H",
   "H....?....H..H",
   "HH.HHH.HH.H.HH",
   "H...v..?..f..H",
   "H.HH.HH.HHH?.H",
   "H.HH.?.w.v...H",
   "HP...H.......H",
   "HHHHHHHHHHHHHH"
  ],
  "leyenda": {
   "H": "ruina",
   ".": "calle",
   "v": "victima",
   "P": "puesto",
   "?": "oculto",
   "x": "escombro",
   "f": "fuego",
   "w": "agua"
  },
  "tipos": {
   "ruina": {
    "nombre": "Edificio colapsado",
    "paso": false,
    "piso": "#78716c",
    "forma": {
     "f": "ruina"
    }
   },
   "calle": {
    "nombre": "Calle",
    "costo": 1,
    "piso": "#a8a29e",
    "patron": "asfalto"
   },
   "victima": {
    "nombre": "Persona atrapada",
    "costo": 2,
    "objetivo": "visitar",
    "suelo": "calle",
    "forma": {
     "f": "persona",
     "color": "#ef4444",
     "pulso": true
    }
   },
   "puesto": {
    "nombre": "Puesto de socorro",
    "costo": 1,
    "inicio": true,
    "suelo": "calle",
    "forma": {
     "f": "carpa"
    }
   },
   "oculto": {
    "nombre": "Calle (según el mapa viejo)",
    "parece": "calle",
    "revela": "escombro",
    "suelo": "calle"
   },
   "escombro": {
    "nombre": "Escombro",
    "paso": false,
    "suelo": "calle",
    "forma": {
     "f": "escombro"
    }
   },
   "fuego": {
    "nombre": "Fuego",
    "costo": 6,
    "suelo": "calle",
    "forma": {
     "f": "fuego"
    }
   },
   "agua": {
    "nombre": "Tubo roto: agua",
    "costo": 3,
    "suelo": "calle",
    "forma": {
     "f": "charco",
     "color": "rgba(56,189,248,0.7)"
    }
   }
  },
  "herramientas": [
   {
    "id": "escombro",
    "nombre": "Escombros",
    "ayuda": "Un escombro que ya se ve en el mapa.",
    "ciclos": [
     [
      "calle",
      "escombro"
     ]
    ]
   },
   {
    "id": "oculto",
    "nombre": "Escombro escondido",
    "ayuda": "Un escombro que el robot no sabe que existe.",
    "ciclos": [
     [
      "calle",
      "oculto"
     ]
    ]
   },
   {
    "id": "fuego",
    "nombre": "Fuego",
    "ayuda": "Se puede cruzar, pero cuesta 6.",
    "ciclos": [
     [
      "calle",
      "fuego"
     ]
    ]
   }
  ],
  "parametros": [
   {
    "id": "lluvia",
    "nombre": "Lluvia",
    "ayuda": "El fuego baja a 2, el agua sube a 5.",
    "valor": false,
    "costos": {
     "fuego": 2,
     "agua": 5
    }
   }
  ],
  "sugerido": "astar",
  "preguntas": [
   "¿Cuántas veces replanifica Tango? ¿En qué celda descubre cada escombro?",
   "Activa «Ver lo que Tango no sabe». ¿Habría cambiado el plan si lo hubiera sabido desde el principio?",
   "¿Por qué el plan inicial era óptimo y aun así terminó costando más?"
  ],
  "relato": {
   "reloj": {
    "inicio": "14:22",
    "segundos_por_unidad": 60
   },
   "medidor": {
    "nombre": "Batería",
    "inicio": 100,
    "por_unidad": 1.1,
    "unidad": "%"
   },
   "inicio": [
    "Las sirenas no paran. Tango sale del puesto de socorro con el mapa de antes del sismo.",
    "Tres señales de celular siguen activas bajo los escombros."
   ],
   "terreno": {
    "fuego": "Calor intenso. Tango cruza el fuego con los ventiladores al máximo.",
    "agua": "Un tubo roto inundó la calle. Las ruedas patinan."
   },
   "eventos": {
    "visita": "Tango {verbo} {obj}: le deja agua, una manta y marca la posición para la brigada.",
    "revela": "El sensor detecta un escombro en {celda}. El mapa viejo estaba equivocado.",
    "replan": "{motivo} Tango deja el plan viejo y calcula otro."
   },
   "ambiente": [
    "Polvo en el aire. La cámara se limpia sola.",
    "Un perro ladra desde un balcón que ya no existe.",
    "Radio: la brigada pregunta por la posición. {hora}.",
    "Batería: {medidor}."
   ],
   "fin": "Tango vuelve al puesto a las {hora}. Tres posiciones marcadas para la brigada."
  },
  "dinamica": {
   "continuo": true,
   "turno": 180,
   "resumen": "Hay réplicas que el robot no ve, el fuego avanza y aparecen nuevas señales.",
   "eventos": [
    {
     "nombre": "Réplica",
     "prob": 0.04,
     "a": {
      "calle": "oculto"
     },
     "textos": [
      "Réplica del sismo. Algo cambió en el barrio, pero Tango no lo sabe."
     ]
    },
    {
     "nombre": "Fuego avanza",
     "prob": 0.04,
     "a": {
      "calle": "fuego"
     },
     "junto_a": [
      "fuego"
     ],
     "textos": [
      "El fuego avanza hacia {celda}."
     ]
    },
    {
     "nombre": "Nueva señal",
     "prob": 0.025,
     "a": {
      "calle": "victima"
     },
     "textos": [
      "Nueva señal de celular bajo los escombros, en {celda}."
     ]
    }
   ]
  }
 },
 {
  "id": "logistica",
  "orden": 14,
  "reto": 14,
  "titulo": "El agente de logística",
  "lugar": "Centro de distribución y cinco tiendas",
  "concepto": "Un solo paquete no cierra la misión",
  "dificultad": "Avanzada",
  "escena": {
   "fondo": [
    "#ecfccb",
    "#a3e635"
   ],
   "losa": [
    "#d4d4d8",
    "#a1a1aa",
    "#71717a"
   ],
   "calor": [
    124,
    58,
    237
   ],
   "ruta": "#2563eb",
   "noche": false,
   "alto": 70
  },
  "historia": "El camión sale del centro de distribución a las seis con cinco pedidos. La misión no termina con la primera entrega ni con la última: termina cuando el camión vuelve al centro con la bodega vacía. El orden de visita importa tanto como las calles; con cinco tiendas hay 120 órdenes posibles, y la búsqueda los compara todos sin escribirlos.",
  "objetivo": "Entregar en las cinco tiendas y volver al centro de distribución.",
  "agente": {
   "nombre": "Camión 12",
   "dibujo": "vehiculo",
   "color": "#2563eb",
   "largo": true,
   "percibe": "Obras, trancones y restricciones de cada vía.",
   "recuerda": "Qué tiendas ya recibieron su pedido.",
   "acciones": "Avanzar una cuadra por avenida o calle.",
   "meta": "Cinco entregas y camión en el centro."
  },
  "objeto": "la tienda",
  "objeto_plural": "tiendas",
  "verbos": {
   "visita": "entrega en"
  },
  "modo": "visitar",
  "final": "inicio",
  "unidad": "min",
  "unidad_larga": "minutos",
  "mapa": [
   "===============",
   "=HHtHH.HH.HH.H=",
   "=HH.HH.HH.HH.H=",
   "=.........t...=",
   "=HH.HHtHH.HH.H=",
   "=HH.HH.HH.HH.H=",
   "=======C=======",
   "=HH.HH.PP.HH.H=",
   "=HH.HH.PP.HH.H=",
   "=.t...........=",
   "=HH.HH.HH.HHtH=",
   "==============="
  ],
  "leyenda": {
   "=": "avenida",
   ".": "calle",
   "H": "edificio",
   "P": "parque",
   "t": "tienda",
   "C": "centro",
   "o": "obra",
   "j": "trancon"
  },
  "tipos": {
   "avenida": {
    "nombre": "Avenida",
    "costo": 1,
    "piso": "#52525b",
    "patron": "asfalto"
   },
   "calle": {
    "nombre": "Calle",
    "costo": 2,
    "piso": "#71717a",
    "patron": "asfalto"
   },
   "edificio": {
    "nombre": "Edificio",
    "paso": false,
    "piso": "#a8a29e",
    "forma": {
     "f": "edificio",
     "alto": [
      14,
      34
     ],
     "colores": [
      "#fde68a",
      "#fecaca",
      "#bfdbfe",
      "#ddd6fe",
      "#bbf7d0",
      "#fed7aa"
     ]
    }
   },
   "parque": {
    "nombre": "Parque",
    "paso": false,
    "piso": "#84cc16",
    "patron": "cesped",
    "forma": {
     "f": "arbol"
    }
   },
   "tienda": {
    "nombre": "Tienda",
    "costo": 2,
    "objetivo": "visitar",
    "suelo": "calle",
    "forma": {
     "f": "tienda"
    }
   },
   "centro": {
    "nombre": "Centro de distribución",
    "costo": 1,
    "inicio": true,
    "suelo": "avenida",
    "forma": {
     "f": "marca",
     "color": "#2563eb"
    }
   },
   "obra": {
    "nombre": "Obra",
    "paso": false,
    "suelo": "calle",
    "forma": {
     "f": "barrera"
    }
   },
   "trancon": {
    "nombre": "Trancón",
    "costo": 6,
    "suelo": "avenida",
    "forma": {
     "f": "trancon"
    }
   }
  },
  "herramientas": [
   {
    "id": "obra",
    "nombre": "Obras",
    "ayuda": "Cierra una cuadra de calle.",
    "ciclos": [
     [
      "calle",
      "obra"
     ]
    ]
   },
   {
    "id": "trancon",
    "nombre": "Trancón",
    "ayuda": "La cuadra de avenida cuesta 6.",
    "ciclos": [
     [
      "avenida",
      "trancon"
     ]
    ]
   },
   {
    "id": "tienda",
    "nombre": "Pedidos",
    "ayuda": "Agrega o quita una tienda. Máximo 6.",
    "ciclos": [
     [
      "calle",
      "tienda"
     ]
    ]
   }
  ],
  "parametros": [
   {
    "id": "pico",
    "nombre": "Pico y placa",
    "ayuda": "Las calles cuestan 4 en vez de 2.",
    "valor": false,
    "costos": {
     "calle": 4
    }
   }
  ],
  "sugerido": "astar",
  "preguntas": [
   "¿En qué orden visita el camión las tiendas? ¿Es el orden en que están escritas?",
   "Agrega una sexta tienda. ¿Cuántos estados más expande costo uniforme?",
   "Con «Pico y placa», ¿qué tramo de calle evita el camión?"
  ],
  "relato": {
   "reloj": {
    "inicio": "06:00",
    "segundos_por_unidad": 60
   },
   "medidor": {
    "nombre": "Combustible",
    "inicio": 100,
    "por_unidad": 0.8,
    "unidad": "%"
   },
   "inicio": [
    "06:00. Se cierra la puerta trasera del camión: cinco pedidos amarrados.",
    "El conductor revisa la hoja de ruta que el agente acaba de calcular."
   ],
   "terreno": {
    "calle": "El camión entra a una calle estrecha. Avanza con cuidado.",
    "trancon": "Trancón. El camión se detiene tras un bus."
   },
   "eventos": {
    "visita": "El camión {verbo} {obj}. Firma, foto y a seguir.",
    "replan": "{motivo} El agente reordena las entregas."
   },
   "ambiente": [
    "Un ciclista se adelanta por la derecha.",
    "La radio anuncia lluvia para la tarde.",
    "Combustible: {medidor}.",
    "El conductor tacha una línea de la hoja de ruta."
   ],
   "fin": "El camión vuelve al centro a las {hora}, con la bodega vacía."
  },
  "dinamica": {
   "continuo": true,
   "turno": 240,
   "resumen": "Entran pedidos nuevos durante el día y el tráfico cambia.",
   "eventos": [
    {
     "nombre": "Pedido nuevo",
     "prob": 0.04,
     "a": {
      "calle": "tienda"
     },
     "textos": [
      "Entra un pedido nuevo de la tienda en {celda}."
     ]
    },
    {
     "nombre": "Trancón",
     "prob": 0.05,
     "a": {
      "avenida": "trancon"
     },
     "textos": [
      "Trancón en la avenida, {celda}."
     ]
    },
    {
     "nombre": "Despeja",
     "prob": 0.1,
     "a": {
      "trancon": "avenida"
     },
     "textos": [
      "Se despeja la avenida en {celda}."
     ]
    },
    {
     "nombre": "Obra",
     "prob": 0.02,
     "a": {
      "calle": "obra"
     },
     "textos": [
      "Cierran por obras la calle en {celda}."
     ]
    },
    {
     "nombre": "Fin de obra",
     "prob": 0.05,
     "a": {
      "obra": "calle"
     },
     "textos": [
      "Terminó la obra de {celda}."
     ]
    }
   ]
  }
 },
 {
  "id": "dos",
  "orden": 15,
  "reto": 15,
  "titulo": "Dos agentes, una misión",
  "lugar": "Pasillo compartido de una fábrica",
  "concepto": "Estado conjunto sin choques",
  "dificultad": "Avanzada",
  "escena": {
   "fondo": [
    "#e2e8f0",
    "#64748b"
   ],
   "losa": [
    "#cbd5e1",
    "#94a3b8",
    "#64748b"
   ],
   "calor": [
    234,
    88,
    12
   ],
   "ruta": "#2563eb",
   "ruta2": "#f97316",
   "noche": false,
   "alto": 50
  },
  "historia": "Alfa y Beta trabajan en la misma línea de producción. Alfa tiene que llevar piezas al extremo este; Beta, al oeste. El pasillo es de un solo carril. Si cada uno planea solo, chocan de frente a mitad de camino. El agente coordinador planea a los dos al tiempo: el estado ya no es una posición sino un par de posiciones, y en cada paso cada robot avanza o espera.",
  "objetivo": "Llevar a Alfa y a Beta a sus estaciones sin ocupar la misma celda ni cruzarse de frente.",
  "agente": {
   "nombre": "Alfa",
   "dibujo": "robot",
   "color": "#2563eb",
   "percibe": "Su posición y la del otro robot.",
   "recuerda": "Nada aparte del par de posiciones: el estado conjunto lo dice todo.",
   "acciones": "Cada robot avanza una celda o espera. Nunca a la misma celda, nunca un intercambio de frente.",
   "meta": "Alfa en su estación este y Beta en su estación oeste."
  },
  "agente2": {
   "nombre": "Beta",
   "dibujo": "robot",
   "color": "#f97316"
  },
  "objeto": "",
  "objeto_plural": "estaciones",
  "verbos": {},
  "modo": "dos",
  "final": "meta_a",
  "final2": "meta_b",
  "unidad": "pasos",
  "unidad_larga": "pasos-robot",
  "mapa": [
   "##############",
   "#MMM##.###MMM#",
   "#a..B.....A.b#",
   "#MMM##.###MMM#",
   "##############"
  ],
  "leyenda": {
   "#": "muro",
   "M": "maquina",
   ".": "piso",
   "a": "salida_a",
   "b": "salida_b",
   "A": "meta_a",
   "B": "meta_b",
   "c": "cajas",
   "n": "nicho"
  },
  "tipos": {
   "muro": {
    "nombre": "Muro",
    "paso": false,
    "forma": {
     "f": "bloque",
     "alto": 20,
     "color": "#cbd5e1",
     "techo": "#e2e8f0"
    }
   },
   "maquina": {
    "nombre": "Máquina",
    "paso": false,
    "piso": "#94a3b8",
    "forma": {
     "f": "maquina"
    }
   },
   "piso": {
    "nombre": "Pasillo",
    "costo": 1,
    "piso": "#d4d4d8",
    "patron": "rejilla"
   },
   "nicho": {
    "nombre": "Nicho abierto",
    "costo": 1,
    "piso": "#d4d4d8",
    "patron": "rejilla"
   },
   "salida_a": {
    "nombre": "Salida de Alfa",
    "costo": 1,
    "inicio": true,
    "piso": "#d4d4d8",
    "forma": {
     "f": "marca",
     "color": "#93c5fd"
    }
   },
   "salida_b": {
    "nombre": "Salida de Beta",
    "costo": 1,
    "inicio2": true,
    "piso": "#d4d4d8",
    "forma": {
     "f": "marca",
     "color": "#fdba74"
    }
   },
   "meta_a": {
    "nombre": "Estación de Alfa",
    "costo": 1,
    "piso": "#d4d4d8",
    "forma": {
     "f": "marca",
     "color": "#2563eb"
    }
   },
   "meta_b": {
    "nombre": "Estación de Beta",
    "costo": 1,
    "piso": "#d4d4d8",
    "forma": {
     "f": "marca",
     "color": "#f97316"
    }
   },
   "cajas": {
    "nombre": "Cajas",
    "paso": false,
    "suelo": "piso",
    "forma": {
     "f": "cajas"
    }
   }
  },
  "herramientas": [
   {
    "id": "cajas",
    "nombre": "Cajas",
    "ayuda": "Bloquea una celda del pasillo.",
    "ciclos": [
     [
      "piso",
      "cajas"
     ]
    ]
   },
   {
    "id": "nicho",
    "nombre": "Abrir nicho",
    "ayuda": "Abre un hueco en una máquina para hacerse a un lado.",
    "ciclos": [
     [
      "maquina",
      "nicho"
     ]
    ]
   }
  ],
  "parametros": [],
  "sugerido": "astar",
  "preguntas": [
   "¿Quién se hace a un lado y en qué paso? ¿Por qué ese y no el otro?",
   "Tapa el nicho del centro con cajas. ¿Sigue habiendo plan?",
   "¿Cuántos estados conjuntos hay? Compáralo con las celdas del pasillo."
  ],
  "relato": {
   "reloj": {
    "inicio": "08:00",
    "segundos_por_unidad": 5
   },
   "medidor": {
    "nombre": "Distancia mínima",
    "distancia": true,
    "unidad": "celdas"
   },
   "inicio": [
    "Turno de la mañana. Alfa y Beta reciben sus órdenes al mismo tiempo.",
    "Un solo carril, dos robots en sentido contrario."
   ],
   "terreno": {
    "nicho": "Un robot se mete al nicho para dejar pasar al otro."
   },
   "eventos": {
    "espera": "{quien} espera un paso para no chocar.",
    "replan": "{motivo} El coordinador recalcula a los dos robots juntos."
   },
   "ambiente": [
    "Las máquinas zumban a ambos lados.",
    "Distancia entre robots: {medidor}.",
    "Un operario observa desde la baranda.",
    "Bip corto: los dos robots se ven."
   ],
   "fin": "Los dos robots llegan a sus estaciones a las {hora}, sin un roce."
  },
  "dinamica": {
   "continuo": false,
   "turno": 50,
   "resumen": "Los operarios dejan y recogen cajas en el pasillo.",
   "eventos": [
    {
     "nombre": "Cajas",
     "prob": 0.12,
     "a": {
      "piso": "cajas"
     },
     "textos": [
      "Un operario deja cajas en {celda}."
     ]
    },
    {
     "nombre": "Recogen",
     "prob": 0.15,
     "a": {
      "cajas": "piso"
     },
     "textos": [
      "Recogen las cajas de {celda}."
     ]
    }
   ]
  }
 },
 {
  "id": "finanzas",
  "orden": 16,
  "reto": 16,
  "vista": "finanzas",
  "titulo": "La panadería sale de deudas",
  "lugar": "Una panadería de barrio",
  "concepto": "Planear bajo incertidumbre",
  "dificultad": "Avanzada",
  "historia": "Lucía tiene una panadería que vende bien, pero arrastra tres deudas: un préstamo gota a gota que cobra 10 % al mes, la tarjeta de crédito y un crédito bancario. No tiene un peso ahorrado. Cada mes, después de pagar insumos, nómina y cuotas mínimas, le sobran unos millones. El agente financiero decide dónde ponerlos: abonar a una deuda o guardar para el fondo de emergencia. Y cada mes puede pasar algo: se daña el horno, hay paro, sube la harina. Si no hay fondo, el imprevisto va a la tarjeta o, peor, al gota a gota.",
  "objetivo": "Quedar sin deudas y con un fondo de emergencia de 4 millones, pagando la menor cantidad posible de intereses.",
  "agente": {
   "nombre": "Asesor financiero",
   "percibe": "El saldo de cada cuenta, la tasa de cada deuda y si este mes hubo un imprevisto.",
   "recuerda": "Nada más que los saldos: con ellos sabe todo lo que necesita (el estado).",
   "acciones": "Repartir el excedente del mes, en millones enteros, entre las deudas y el fondo.",
   "meta": "Todas las deudas en cero y el fondo de emergencia lleno."
  },
  "unidad": "M",
  "unidad_larga": "millones de pesos",
  "horizonte": 36,
  "valores": {
   "excedente": 3,
   "riesgo": 0.1,
   "choques": 0.25
  },
  "cuentas": [
   {
    "id": "informal",
    "nombre": "Préstamo gota a gota",
    "corto": "Gota a gota",
    "tipo": "deuda",
    "saldo": 3,
    "tasa": 0.1,
    "max": 12,
    "color": "#dc2626",
    "comision": 0.2
   },
   {
    "id": "tarjeta",
    "nombre": "Tarjeta de crédito",
    "corto": "Tarjeta",
    "tipo": "deuda",
    "saldo": 8,
    "tasa": 0.028,
    "max": 8,
    "color": "#f97316"
   },
   {
    "id": "credito",
    "nombre": "Crédito bancario",
    "corto": "Banco",
    "tipo": "deuda",
    "saldo": 10,
    "tasa": 0.014,
    "max": 10,
    "color": "#eab308"
   },
   {
    "id": "fondo",
    "nombre": "Fondo de emergencia",
    "corto": "Fondo",
    "tipo": "ahorro",
    "saldo": 0,
    "meta": 4,
    "color": "#16a34a"
   }
  ],
  "desborde": [
   "informal"
  ],
  "choques": {
   "min": 1,
   "max": 4,
   "textos": [
    "Se daña el horno y toca repararlo",
    "Un paro de transporte deja dos semanas de ventas flojas",
    "Sube el precio de la harina de un día para otro",
    "Llega una multa por un permiso vencido",
    "La nevera de los quesos deja de enfriar",
    "Un cliente grande paga con dos meses de retraso"
   ]
  },
  "parametros": [
   {
    "id": "excedente",
    "nombre": "Excedente mensual",
    "ayuda": "Millones que quedan libres cada mes.",
    "opciones": [
     2,
     3,
     4
    ],
    "etiquetas": [
     "2 M",
     "3 M",
     "4 M"
    ]
   },
   {
    "id": "choques",
    "nombre": "Imprevistos",
    "ayuda": "Probabilidad de un imprevisto cada mes.",
    "opciones": [
     0,
     0.15,
     0.25,
     0.4
    ],
    "etiquetas": [
     "Ninguno",
     "Pocos",
     "Normales",
     "Muchos"
    ]
   },
   {
    "id": "riesgo",
    "nombre": "Prudencia",
    "ayuda": "Cuánto le pesa al planificador cada mes sin fondo de emergencia.",
    "opciones": [
     0,
     0.1,
     0.3
    ],
    "etiquetas": [
     "Nada",
     "Algo",
     "Mucha"
    ]
   }
  ],
  "sugerido": "astar",
  "preguntas": [
   "Sin imprevistos, ¿qué estrategia paga menos intereses? ¿Y con imprevistos normales?",
   "¿Por qué el plan óptimo de enero deja de ser óptimo en marzo, si hubo un imprevisto?",
   "Sube la prudencia a «Mucha». ¿Qué hace distinto el agente los primeros meses?",
   "BFS minimiza meses, no intereses. ¿Cuánto más le cuesta su plan a Lucía?"
  ],
  "relato": {
   "inicio": [
    "Enero. Lucía abre la panadería a las cinco. Huele a pan de bono y a deudas.",
    "El asesor revisa las tres cuentas: el gota a gota cobra todos los sábados."
   ],
   "meses": [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
   ],
   "cubre": "El fondo cubre {cubre} M. Por eso se guardaba.",
   "desborda": "No había fondo suficiente: {falta} M van a {cuenta}.",
   "libre": "Lucía cierra el mes sin una sola deuda y con el fondo lleno. El gota a gota ya no la llama.",
   "paga": [
    "Abono a {cuenta}: {monto} M.",
    "{monto} M para {cuenta}."
   ],
   "tranquilo": [
    "Mes tranquilo: las ventas salen como se esperaba.",
    "Sin sorpresas. El horno funciona y la harina no sube.",
    "Buen mes: se vendieron todas las tortas de la primera comunión."
   ]
  }
 },
 {
  "id": "cosmetica",
  "orden": 17,
  "reto": 17,
  "vista": "cosmetica",
  "titulo": "La rutina para cada piel",
  "lugar": "Una tienda de cuidado de la piel",
  "concepto": "Buscar entre combinaciones con restricciones",
  "dificultad": "Intermedia",
  "historia": "Llega una persona a la tienda con una pregunta concreta: «¿qué me sirve a mí?». Su piel tiene un tipo, unas preocupaciones y unos límites. El asesor no puede probar todos los productos en su cara: arma la rutina en su cabeza, paso a paso, descartando lo que no conviene, hasta llegar a la combinación que cumple todo al menor precio.",
  "objetivo": "Armar una rutina de mañana y noche que cubra todas las preocupaciones de la persona, sea apta para su piel, no irrite y quepa en el presupuesto.",
  "aviso": "Ejercicio educativo con productos ficticios. Las reglas siguen recomendaciones generales de cuidado de la piel; no reemplazan la consulta con un dermatólogo.",
  "agente": {
   "nombre": "Asesor de la tienda",
   "percibe": "El perfil de la persona: tipo de piel, sensibilidad, preocupaciones, embarazo y presupuesto. Y qué productos hay en estante.",
   "recuerda": "Los productos que ya puso en la rutina: de ellos dependen el gasto, la irritación acumulada y qué preocupaciones ya están cubiertas.",
   "acciones": "Agregar el producto del siguiente paso de la rutina. Los tratamientos se pueden saltar; limpiador, hidratante y protector no.",
   "meta": "Rutina completa que cubre todas las preocupaciones sin romper ninguna regla."
  },
  "unidad": "mil $",
  "pasos": [
   {
    "id": "limpiador",
    "nombre": "Limpiador",
    "momento": "ambos",
    "obligatorio": true
   },
   {
    "id": "trat_am",
    "nombre": "Tratamiento de mañana",
    "momento": "am",
    "obligatorio": false,
    "categoria": "tratamiento"
   },
   {
    "id": "trat_pm",
    "nombre": "Tratamiento de noche",
    "momento": "pm",
    "obligatorio": false,
    "categoria": "tratamiento"
   },
   {
    "id": "hidratante",
    "nombre": "Hidratante",
    "momento": "ambos",
    "obligatorio": true
   },
   {
    "id": "protector",
    "nombre": "Protector solar",
    "momento": "am",
    "obligatorio": true
   }
  ],
  "preocupaciones": {
   "acne": "Acné y granitos",
   "manchas": "Manchas",
   "envejecimiento": "Líneas y firmeza",
   "deshidratacion": "Tirantez o deshidratación",
   "rojeces": "Rojeces"
  },
  "tipos_piel": {
   "grasa": "Grasa",
   "mixta": "Mixta",
   "normal": "Normal",
   "seca": "Seca"
  },
  "productos": [
   {
    "id": "L1",
    "categoria": "limpiador",
    "nombre": "Gel limpiador con ácido salicílico",
    "precio": 38,
    "activos": [
     "salicilico"
    ],
    "cubre": [
     "acne"
    ],
    "irrita": 2,
    "pieles": [
     "grasa",
     "mixta"
    ]
   },
   {
    "id": "L2",
    "categoria": "limpiador",
    "nombre": "Limpiador cremoso con ceramidas",
    "precio": 42,
    "activos": [
     "ceramidas"
    ],
    "cubre": [
     "deshidratacion"
    ],
    "irrita": 0,
    "pieles": [
     "normal",
     "seca",
     "mixta"
    ]
   },
   {
    "id": "L3",
    "categoria": "limpiador",
    "nombre": "Espuma suave sin fragancia",
    "precio": 25,
    "activos": [],
    "cubre": [],
    "irrita": 0,
    "pieles": [
     "grasa",
     "mixta",
     "normal",
     "seca"
    ]
   },
   {
    "id": "L4",
    "categoria": "limpiador",
    "nombre": "Limpiador con peróxido de benzoilo 4 %",
    "precio": 35,
    "activos": [
     "peroxido"
    ],
    "cubre": [
     "acne"
    ],
    "irrita": 3,
    "pieles": [
     "grasa"
    ]
   },
   {
    "id": "T1",
    "categoria": "tratamiento",
    "nombre": "Sérum de niacinamida 10 %",
    "precio": 45,
    "activos": [
     "niacinamida"
    ],
    "cubre": [
     "manchas",
     "rojeces"
    ],
    "irrita": 1,
    "pieles": [
     "grasa",
     "mixta",
     "normal",
     "seca"
    ],
    "momentos": [
     "am",
     "pm"
    ]
   },
   {
    "id": "T2",
    "categoria": "tratamiento",
    "nombre": "Sérum de vitamina C 15 %",
    "precio": 70,
    "activos": [
     "vitamina_c"
    ],
    "cubre": [
     "manchas",
     "envejecimiento"
    ],
    "irrita": 2,
    "pieles": [
     "grasa",
     "mixta",
     "normal",
     "seca"
    ],
    "momentos": [
     "am"
    ]
   },
   {
    "id": "T3",
    "categoria": "tratamiento",
    "nombre": "Retinol 0,3 %",
    "precio": 65,
    "activos": [
     "retinol"
    ],
    "cubre": [
     "envejecimiento",
     "acne"
    ],
    "irrita": 3,
    "pieles": [
     "grasa",
     "mixta",
     "normal",
     "seca"
    ],
    "momentos": [
     "pm"
    ],
    "no_embarazo": true
   },
   {
    "id": "T4",
    "categoria": "tratamiento",
    "nombre": "Gel de ácido azelaico 10 %",
    "precio": 58,
    "activos": [
     "azelaico"
    ],
    "cubre": [
     "acne",
     "manchas",
     "rojeces"
    ],
    "irrita": 1,
    "pieles": [
     "grasa",
     "mixta",
     "normal",
     "seca"
    ],
    "momentos": [
     "am",
     "pm"
    ]
   },
   {
    "id": "T5",
    "categoria": "tratamiento",
    "nombre": "Tónico de ácido glicólico 7 %",
    "precio": 40,
    "activos": [
     "glicolico"
    ],
    "cubre": [
     "manchas",
     "envejecimiento"
    ],
    "irrita": 3,
    "pieles": [
     "grasa",
     "mixta",
     "normal"
    ],
    "momentos": [
     "pm"
    ]
   },
   {
    "id": "T6",
    "categoria": "tratamiento",
    "nombre": "Sérum de ácido hialurónico",
    "precio": 35,
    "activos": [
     "hialuronico"
    ],
    "cubre": [
     "deshidratacion"
    ],
    "irrita": 0,
    "pieles": [
     "grasa",
     "mixta",
     "normal",
     "seca"
    ],
    "momentos": [
     "am",
     "pm"
    ]
   },
   {
    "id": "H1",
    "categoria": "hidratante",
    "nombre": "Gel hidratante libre de aceites",
    "precio": 40,
    "activos": [],
    "cubre": [
     "deshidratacion"
    ],
    "irrita": 0,
    "pieles": [
     "grasa",
     "mixta"
    ]
   },
   {
    "id": "H2",
    "categoria": "hidratante",
    "nombre": "Crema reparadora con ceramidas",
    "precio": 52,
    "activos": [
     "ceramidas"
    ],
    "cubre": [
     "deshidratacion",
     "rojeces"
    ],
    "irrita": 0,
    "pieles": [
     "mixta",
     "normal",
     "seca"
    ]
   },
   {
    "id": "H3",
    "categoria": "hidratante",
    "nombre": "Crema nutritiva con manteca de karité",
    "precio": 30,
    "activos": [],
    "cubre": [
     "deshidratacion"
    ],
    "irrita": 1,
    "pieles": [
     "normal",
     "seca"
    ]
   },
   {
    "id": "P1",
    "categoria": "protector",
    "nombre": "Protector FPS 50 fluido toque seco",
    "precio": 55,
    "activos": [],
    "cubre": [],
    "irrita": 0,
    "pieles": [
     "grasa",
     "mixta",
     "normal"
    ]
   },
   {
    "id": "P2",
    "categoria": "protector",
    "nombre": "Protector mineral FPS 50 para piel sensible",
    "precio": 68,
    "activos": [],
    "cubre": [
     "rojeces"
    ],
    "irrita": 0,
    "pieles": [
     "grasa",
     "mixta",
     "normal",
     "seca"
    ]
   },
   {
    "id": "P3",
    "categoria": "protector",
    "nombre": "Protector FPS 30 en crema",
    "precio": 35,
    "activos": [],
    "cubre": [],
    "irrita": 1,
    "pieles": [
     "normal",
     "seca"
    ]
   }
  ],
  "incompatibles": [
   {
    "a": "retinol",
    "b": "salicilico",
    "por": "Retinol y ácido salicílico en la misma noche irritan y resecan."
   },
   {
    "a": "retinol",
    "b": "glicolico",
    "por": "Retinol y ácido glicólico en la misma noche irritan y resecan."
   },
   {
    "a": "retinol",
    "b": "peroxido",
    "por": "El peróxido de benzoilo degrada el retinol y suma irritación."
   },
   {
    "a": "glicolico",
    "b": "salicilico",
    "por": "Dos exfoliantes químicos juntos irritan."
   }
  ],
  "tolerancia": {
   "normal": 6,
   "sensible": 3
  },
  "valores": {
   "tipo": "mixta",
   "sensible": false,
   "preocupaciones": [
    "acne",
    "manchas"
   ],
   "embarazo": false,
   "presupuesto": 220
  },
  "personas": [
   {
    "id": "camila",
    "nombre": "Camila, 19 años",
    "texto": "Estudiante. Piel grasa, granitos en la frente y marcas que le dejan.",
    "perfil": {
     "tipo": "grasa",
     "sensible": false,
     "preocupaciones": [
      "acne",
      "manchas"
     ],
     "embarazo": false,
     "presupuesto": 180
    }
   },
   {
    "id": "jorge",
    "nombre": "Jorge, 58 años",
    "texto": "Trabaja al sol. Piel seca, líneas marcadas y sensación de tirantez.",
    "perfil": {
     "tipo": "seca",
     "sensible": false,
     "preocupaciones": [
      "envejecimiento",
      "deshidratacion"
     ],
     "embarazo": false,
     "presupuesto": 220
    }
   },
   {
    "id": "valeria",
    "nombre": "Valeria, 31 años",
    "texto": "Embarazada. Le salieron manchas y algo de acné; quiere evitar lo que no conviene.",
    "perfil": {
     "tipo": "mixta",
     "sensible": false,
     "preocupaciones": [
      "manchas",
      "acne"
     ],
     "embarazo": true,
     "presupuesto": 200
    }
   },
   {
    "id": "andres",
    "nombre": "Andrés, 26 años",
    "texto": "Piel sensible: casi todo le arde. Rojeces en las mejillas.",
    "perfil": {
     "tipo": "normal",
     "sensible": true,
     "preocupaciones": [
      "rojeces",
      "deshidratacion"
     ],
     "embarazo": false,
     "presupuesto": 160
    }
   }
  ],
  "sugerido": "astar",
  "preguntas": [
   "¿Qué rutina da BFS y cuál da costo uniforme para Camila? ¿Por qué no son la misma?",
   "Marca a Valeria como embarazada y quítalo. ¿Qué producto entra o sale y por qué?",
   "Para Andrés, ¿cuántas combinaciones descarta la regla de irritación?",
   "Agota en el estante el producto elegido. ¿Cuál es la siguiente mejor opción?"
  ],
  "tienda": {
   "mapa": [
    "#############",
    "#...........#",
    "#.LLLL..TTT.#",
    "#...........#",
    "#.HHH...TTT.#",
    "#...........#",
    "#.PPP.......#",
    "#E.......KCQ#",
    "#############"
   ],
   "estantes": {
    "L": "limpiador",
    "T": "tratamiento",
    "H": "hidratante",
    "P": "protector"
   },
   "escena": {
    "fondo": [
     "#fdf2f8",
     "#f9a8d4"
    ],
    "losa": [
     "#fce7f3",
     "#f5c2da",
     "#e9a8c8"
    ],
    "calor": [
     219,
     39,
     119
    ],
    "ruta": "#db2777",
    "noche": false,
    "alto": 40
   },
   "zonas": [
    {
     "nombre": "Limpiadores",
     "desde": [
      3,
      2
     ],
     "hasta": [
      3,
      5
     ]
    },
    {
     "nombre": "Tratamientos",
     "desde": [
      3,
      8
     ],
     "hasta": [
      3,
      10
     ]
    },
    {
     "nombre": "Hidratantes",
     "desde": [
      5,
      2
     ],
     "hasta": [
      5,
      4
     ]
    },
    {
     "nombre": "Protectores",
     "desde": [
      5,
      6
     ],
     "hasta": [
      6,
      7
     ]
    },
    {
     "nombre": "Caja",
     "desde": [
      6,
      9
     ],
     "hasta": [
      6,
      10
     ]
    }
   ]
  }
 }
];
