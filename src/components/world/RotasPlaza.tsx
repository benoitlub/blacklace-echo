import { useState } from "react";
import "@/styles/rotas-art.css";

type RotasPlazaProps = {
  entering: boolean;
  onBack: () => void;
};

const plazaHotspots = [
  {
    id: "tea",
    label: "Salon de thé",
    x: 31,
    y: 45,
    text: "Un refuge calme et parfumé. On y vient pour ralentir, écouter les rumeurs et laisser les signaux refroidir.",
  },
  {
    id: "eye",
    label: "Maison de l’Œil",
    x: 52,
    y: 37,
    text: "Le bâtiment-signature de Rotas. Il observe autant qu’il accueille. Aloisia y laisse parfois des traces.",
  },
  {
    id: "boutique",
    label: "Boutique",
    x: 78,
    y: 48,
    text: "Objets, curiosités, accessoires et petites merveilles qui n’existent qu’ici. La vitrine change