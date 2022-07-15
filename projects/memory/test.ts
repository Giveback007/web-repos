// https://www.wordreference.com/es/en/translation.asp?spen=regalo

type Mem = {
    question: string;
    answer: string;
    score: number;
    timing: number;
    reviewOn: number;
    ease: number;
    timeCreated: number;
    id: string;
};

const x: [string, string][] = [];

// 101
// a.split('\n').map(x => x.split(':')[1]).filter(x => x).map(x => {
//     const [ first, ...rest ] = x.trim();
//     return first.toUpperCase() + rest.join('');
// }).map(x => [x, ""]);

[
    [
        "Por",
        "By"
    ],
    [
        "Para",
        "In order to / For order of"
    ],
    [
        "Que",
        "That"
    ],
    [
        "Qué",
        "What"
    ],
    [
        "Está",
        "[He/She] Is"
    ],
    [
        "Su",
        "His/Her/Their/Its"
        
    ],
    [
        "Más",
        "More/Most"
    ],
    [
        "Aquí",
        "Here"
    ],
    [
        "Del",
        "Of The"
    ],
    [
        "Hay",
        "There [is/are]"
    ],
    [
        "Todo vs Todos",
        "All - Everything (vs) Everyone"
    ],
    [
        "Como",
        "As/Like"
    ],
    [
        "Si",
        "If"
    ],
    [
        "Sí",
        "Yes"
    ],
    [
        "Bien",
        "Well/Right/Good"
    ],
    [
        "Ha",
        "Has"
    ],
    [
        "Al",
        "To/At"
    ],
    [
        "Ahora",
        "Now"
    ],
    [
        "Algo",
        "Something"
    ],
    [ // https://www.youtube.com/watch?v=W3SJ_rP7Lxo
        "Así",
        "As-So/Also"
    ], // same-as
    [
        "Tener",
        "To Have/Own"
    ],
    [
        "Haber",
        "To Have"
    ],
    [
        "He",
        "(I) Have"
    ],
    [
        "Ser",
        "Be"
    ],
    [
        "Muy",
        "Very"
    ],
    [
        "Era",
        "Was [Perm (Soy)]"
    ],
    [
        "Fue",
        "Was [Temp (Estoy)]"
    ],
    [
        "Ya",
        "Already"
    ],
    [
        "Hacer",
        "To-Do / To-Make"
    ],
    [
        "Sé",
        "(I) Know"
    ],
    [
        "Nada",
        "Nothing / Anything"
    ],
    [ // https://www.youtube.com/watch?v=RZP6fTb2Dpk
        "Le",
        "To/From (him/her/you)"
    ],
    [
        "Sólo",
        "Only"
    ],
    [
        "Creo",
        "(I) Think/Believe"
    ],
    [
        "Puede",
        "(You) Can"
    ],
    [
        "Vez",
        "Time/Once"
    ],
    [
        "Tal Vez",
        "Maybe"
    ],
    [
        "Otra Vez",
        "Again"
    ],
    [
        "Va",
        "(Is) Going"
    ],
    [
        "Eres",
        "You Are"
    ],
    [
        "Voy",
        "(I'm) Going"
    ],
    [
        "Son",
        "Are"
    ],
    [
        "Vamos",
        "Let's (go/do)"
    ],
    [
        "Estaba",
        "Was Being"
    ],
    [
        "Cómo",
        "How"
    ],
    [
        "Solo",
        "Alone"
    ],
    [
        "Hace",
        "Ago/Makes"
    ],
    [
        "Entonces",
        "Then/So"
    ],
    [
        "Decir",
        "To Say/Tell"
    ],
    [
        "Vida",
        "Life"
    ],
    [
        "Porque",
        "Because"
    ],
    [
        "Has",
        "(You) Have"
    ],
    [
        "Mucho",
        "Much/A-lot"
    ],
    [
        "Ver",
        "To See"
    ],
    [
        "Nunca",
        "Never"
    ],
    [
        "Probar",
        "To Try"
    ]
];


/*
    [
        "",
        ""
    ],
*/


// I am
[
    [
        "Soy", // 65
        "[Perm] 'Soy Alto'"
    ],
    [
        "Estoy", // 50
        "[Temp] 'Estoy Cansado'"
    ]
];

// Reflexive Pronouns
// "performs and receives the action"
// https://www.spanish.academy/blog/a-simple-guide-to-the-5-spanish-reflexive-pronouns/
[
    [ // Yo
        "Me", // 24
        "Me (Self) [Rflxv]"
    ],
    [ // Tú
        "Te", // 39
        "You-[sgl] (Self) [Rflxv]"
    ],
    [ // El/Ella/Usted || Ellos
        "Se", // 16
        "He/She/They/It (Self) [Rflxv]"
    ],
    [ // Nosotros
        "Nos", // 107
        "We (Self) [Rflxv]"
    ],
    [ // Vosotros
        "Os", // 844
        "You-[plr] (Self) [Rflxv]"
    ]
];

// Subject Pronouns
// https://www.thoughtco.com/using-subject-pronouns-spanish-3079374#:~:text=The%20biggest%20difference%20is%20that,primarily%20for%20clarity%20or%20emphasis.
[
    [
        "Yo", // 26
        "I",
    ],
    [
        "Usted", // 59
        "You (sgl-frm)",
    ],
    [
        "Tú", // 95
        "You (sgl-fml)",
    ],
    [
        "Él", // 40
        "He",
    ],
    [
        "Ella", // 47
        "She"
    ],
    [
        "Nosotros", // 130
        "We",
    ],
    [
        "Ellos", // 135
        "They (msc)",
    ],
    [
        "Ellas", // 661
        "They (fem)",
    ],
    // [
    //     "Nosotras", // --
    //     "We (fem)",
    // ],
    // [
    //     "Vosotros", // --
    //     "You (msc) (plr-fml)",
    // ],
    // [
    //     "Vosotras",
    //     "You (fem) (plr-fml)", // --
    // ],
    // [
    //     "Ustedes",
    //     "You (plr-fml)", // --
    // ],
];

// Possessive Pronouns
[
    [ 
        "Tu",
        "Your"
    ]
];

// Prepositional Pronouns
// https://www.rocketlanguages.com/spanish/prepositions/spanish-prepositional-pronouns
[
    [
        "Mí", // 96
        "[For/Abt] Me"
    ],
    [
        "Ti", // 44
        "[For/Abt] You"
    ],
];

// This/That These/Those [15]
[
    [
        "Esto", // 32
        "This (ntr)"
    ],
    [
        "Eso", // 23
        "That (ntr)"
    ],
    [
        "Aquello", // 2060
        "That-[far] (ntr)"
    ],


    [
        "Esta", // 43
        "This (sgl-fem)"
    ],
    [
        "Esa", // 80
        "That (sgl-fem)"
    ],
    [
        "Aquella", // 1499
        "That-[far] (sgl-fem)"
    ],


    [
        "Este", // 49
        "This (sgl-msc)"
    ],
    [
        "Ese", // 76
        "That (sgl-msc)"
    ],
    [
        "Aquel", // 1910
        "That-[far] (sgl-msc)"
    ],


    [
        "Estas", // 223
        "This (plr-fem)"
    ],
    [
        "Esas", // 315
        "That (plr-fem)"
    ],
    [
        "Aquellas", // 4613
        "That-[far] (plr-fem)"
    ],


    [
        "Estos", // 251
        "This (plr-msc)"
    ],
    [
        "Esos", // 309
        "That (plr-msc)"
    ],
    [
        "Aquellos", // 1910
        "That-[far] (plr-msc)"
    ],
];
