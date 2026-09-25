/** Editorial world directory. References are not proof of 3D assets or live NPCs. */
export type Resident = { id: string; name: string; role: string; places: string[]; note: string };
export type WorldLocation = { id: string; name: string; residents: string[]; detail: string; image?: string; existingRoute?: string };
export const residents: Resident[] = [
  { id:"marie-jeanne",name:"Marie Jeanne",role:"Accueil des visiteurs",places:["port"],note:"Le parcours commence au port avec Marie Jeanne." },
  { id:"natasha",name:"Natasha",role:"Diffusion, boutique et studio",places:["rotas","natasha-loft"],note:"Loft, podcast/YouTube et signal Blacklace." },
  { id:"marty",name:"Marty",role:"Artiste et réalisateur",places:["seawall","marty-studio","sator"],note:"Peintures de la digue et tournages Moscomiul Break." },
  { id:"max",name:"Max Liberty",role:"Bar de la plage",places:["max"],note:"Le comptoir et les conversations du littoral." },
  { id:"nikolas",name:"Nikolas",role:"Créateur",places:["nikolas-lab"],note:"Ses créations sont présentées au Feuch Lab." },
  { id:"slobodane",name:"Slobodane",role:"Jardin",places:["slobodane-garden"],note:"Son jardin fait partie des lieux à explorer." },
  { id:"ludmila",name:"Ludmila",role:"Club et expériences perceptives",places:["ludmila"],note:"Le yacht secret est une zone distincte à documenter." },
  { id:"lolo",name:"Lolo",role:"Laboratoire",places:["lolo-lab"],note:"Laboratoire de Lolo." },
  { id:"ten-net",name:"Ten-Net",role:"Tatouage",places:["ten-net-tattoo"],note:"Atelier de tatouage de l'île." },
  { id:"feuch",name:"Feuch",role:"Chaos et Fournaise",places:["feuch-cave","fournaise"],note:"Grotte et cratère-scène de rave." },
  { id:"fee-belette",name:"Fée Belette",role:"Reboot",places:["reboot","belette-meadow"],note:"Cascade Reboot et prairie." },
  { id:"aloisia",name:"Aloisia",role:"Mémoire et signal de l'île",places:["aloisia-cave"],note:"Cœur sous-marin ; ne pas assimiler à un PNJ ordinaire." },
];
export const worldLocations: WorldLocation[] = [
  {id:"port",name:"Port de Porsa Rotas",residents:["marie-jeanne"],detail:"Point de départ du parcours.",existingRoute:"/map"},
  {id:"rotas",name:"Place de Rotas",residents:["natasha"],detail:"Maison de l’Œil, salon de thé, boutique, échoppes et fontaine.",existingRoute:"/map"},
  {id:"max",name:"Bar de la plage · Max Liberty",residents:["max"],detail:"Ambiance Moscomiul.",existingRoute:"/map"},
  {id:"seawall",name:"Digue · route côtière",residents:["marty"],detail:"Peintures de Marty."},
  {id:"institute",name:"Feuch Institute",residents:[],detail:"Projets, inventions et soutien.",existingRoute:"/map"},
  {id:"nikolas-lab",name:"Feuch Lab · Nikolas",residents:["nikolas"],detail:"Créations de Nikolas ; distinct du portail web."},
  {id:"natasha-loft",name:"Loft et studio de Natasha",residents:["natasha"],detail:"Podcast, YouTube et transmissions."},
  {id:"slobodane-garden",name:"Jardin de Slobodane",residents:["slobodane"],detail:"Jardin de l'île."},
  {id:"feuch-cave",name:"Grotte du Feuch",residents:["feuch"],detail:"Zone du Feuch."},
  {id:"reboot",name:"Cascade Reboot",residents:["fee-belette"],detail:"Cascade de la Fée Belette.",existingRoute:"/map"},
  {id:"belette-meadow",name:"Prairie de la Fée Belette",residents:["fee-belette"],detail:"Zone naturelle."},
  {id:"fournaise",name:"Fournaise et cratère",residents:["feuch"],detail:"Cratère et scène de rave.",existingRoute:"/map"},
  {id:"ludmila",name:"Club Ludmila",residents:["ludmila"],detail:"Expériences perceptives ; yacht secret à part.",existingRoute:"/map"},
  {id:"hanging-forest",name:"Forêt suspendue",residents:[],detail:"Exploration."},
  {id:"mangrove",name:"Mangrove",residents:[],detail:"Exploration."},
  {id:"lolo-lab",name:"Laboratoire de Lolo",residents:["lolo"],detail:"Laboratoire."},
  {id:"marty-studio",name:"Studio Moscomiul Break",residents:["marty"],detail:"Plateau de tournage."},
  {id:"sator",name:"Dolmens · clairière SATOR",residents:["marty"],detail:"Archives et indices.",existingRoute:"/map"},
  {id:"aloisia-cave",name:"Grotte sous-marine d'Aloisia",residents:["aloisia"],detail:"Cœur de l'île."},
  {id:"ten-net-tattoo",name:"Salon de tatouage de Ten-Net",residents:["ten-net"],detail:"Atelier de tatouage."},
];
