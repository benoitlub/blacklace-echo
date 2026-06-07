type ZonePhase = "focusing-zone" | "zone-board";

type ZoneBoardOverlayProps = {
  zoneId: string;
  phase: ZonePhase;
  onEnter: () => void;
  onBack: () => void;
};

const BOARDS = {
  rotas: {
    title: "Place de Rotas",
    subtitle: "Centre ville vivant",
    status: "zone stable",
    enter: "Entrer dans Rotas",
    points: [
      ["eye", "Maison de l'Oeil