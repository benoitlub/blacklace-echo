import "@/styles/rotas.css";

type Props = { entering: boolean; onBack: () => void };

const points = [
  { id: "tea", label: "Salon de the", x: 22, y: 52 },
  { id: "eye", label: "Maison de l'Oeil", x: 49, y: 36 },
  { id: "shop", label: "Boutique", x: 74, y: 52 },
  { id: "fountain", label: "Fontaine", x: 51, y: 61 },
  { id: "market", label: "Marche", x: 39, y: 70 },
];

export default function RotasPlaza({ entering, onBack }: Props) {
  return (
    <section className={`rotas-pl