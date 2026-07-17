/** Regions that can be highlighted in the 3D diagram overlay. */
export type RegionId = 'shadow' | 'photon' | 'isco' | 'orbit' | 'tidal';

export type ConceptId =
    | 'horizon'
    | 'schwarzschild'
    | 'photon-sphere'
    | 'isco'
    | 'lensing'
    | 'doppler'
    | 'redshift'
    | 'tidal'
    | 'spaghettification'
    | 'distant-observer';

export interface Concept {
    readonly id: ConceptId;
    readonly title: string;
    readonly body: string;
    /** Region highlighted in the scene when this concept is selected. */
    readonly region: RegionId | null;
}

/**
 * Contextual explanations shown in educational mode. Written for non-specialists
 * and scientifically responsible: they describe what the visualization shows and
 * flag where it approximates reality.
 */
export const CONCEPTS: readonly Concept[] = [
    {
        id: 'horizon',
        title: 'Horizonte de sucesos',
        body: 'Es la frontera de no retorno. Cualquier cosa que la cruza, incluida la luz, no puede volver a salir. Por eso el centro se ve como una sombra absolutamente negra.',
        region: 'shadow',
    },
    {
        id: 'schwarzschild',
        title: 'Radio de Schwarzschild',
        body: 'El tamaño del horizonte de un agujero negro sin rotación: r_s = 2GM/c². Crece de forma proporcional a la masa. Aquí define la escala de toda la simulación.',
        region: 'shadow',
    },
    {
        id: 'photon-sphere',
        title: 'Esfera de fotones',
        body: 'A 1,5 veces el radio de Schwarzschild la gravedad es tan intensa que la luz puede orbitar en círculo. Su lente crea el anillo brillante y fino junto a la sombra.',
        region: 'photon',
    },
    {
        id: 'isco',
        title: 'Órbita estable más interna (ISCO)',
        body: 'El radio mínimo donde la materia puede orbitar de forma estable. Por dentro, cae inevitablemente. Marca el borde interior del disco de acreción.',
        region: 'isco',
    },
    {
        id: 'lensing',
        title: 'Lente gravitacional',
        body: 'La gravedad curva la trayectoria de la luz. Por eso vemos el disco doblarse por encima y por debajo del agujero, y las estrellas del fondo desplazarse formando arcos.',
        region: 'shadow',
    },
    {
        id: 'doppler',
        title: 'Asimetría de brillo (Doppler)',
        body: 'El disco gira a velocidades relativistas. El lado que se acerca a nosotros aparece más brillante y azulado; el que se aleja, más tenue y rojizo. Por eso el disco no es simétrico.',
        region: 'orbit',
    },
    {
        id: 'redshift',
        title: 'Corrimiento al rojo gravitacional',
        body: 'La luz que escapa de cerca del horizonte pierde energía y se desplaza hacia el rojo. Cuanto más cerca de la sombra, mayor es el efecto.',
        region: 'shadow',
    },
    {
        id: 'tidal',
        title: 'Fuerzas de marea',
        body: 'La gravedad es mucho más intensa en el lado cercano de un objeto que en el lejano. Esa diferencia lo estira hacia el agujero y lo comprime lateralmente.',
        region: 'tidal',
    },
    {
        id: 'spaghettification',
        title: 'Espaguetización',
        body: 'Cuando las fuerzas de marea superan la cohesión del objeto, este se alarga como un fideo hacia el agujero antes de fragmentarse. La deformación depende de la posición de cada punto.',
        region: 'tidal',
    },
    {
        id: 'distant-observer',
        title: 'El cruce nunca visto',
        body: 'Para un observador lejano, la dilatación temporal hace que un objeto parezca frenarse y desvanecerse al acercarse al horizonte, sin llegar a cruzarlo del todo.',
        region: 'shadow',
    },
];

/** Documented approximations of the model (brief §12 requirement). */
export const APPROXIMATIONS: readonly string[] = [
    'La lente gravitacional usa una aproximación analítica en espacio de pantalla basada en el parámetro de impacto, no integración de geodésicas por píxel.',
    'El disco de acreción se genera con un pase de ray-marching curvado y emisión procedural; no es transferencia radiativa.',
    'Las órbitas de la materia usan gravedad newtoniana con decaimiento y precesión aproximada, no dinámica relativista completa.',
    'El espín (Kerr) es una aproximación visual y analítica (ISCO y esfera de fotones) sobre un modelo base de Schwarzschild.',
    'La temperatura del disco y la tasa de acreción son estimaciones de orden de magnitud.',
    'La espaguetización deforma los vértices según el gradiente de marea; el brillo y el color son artísticos calibrados.',
    'Las partículas de fragmentación priorizan visibilidad sobre lensing exacto.',
    'El sonido es una representación artística: el espacio no transmite sonido como lo hace la atmósfera.',
];
