import { useState } from "react";
import "@/styles/rotas-art.css";

type RotasPlazaProps = {
  entering: boolean;
  onBack: () => void;
};

const plazaHotspots = [
  { id: "tea", label: "Salon de thé", x: 31, y: 45, text: "Un refuge calme et parfumé. On y vient pour ralentir, écouter les rumeurs et laisser les signaux refroidir." },
  { id: "eye", label: "Maison de l’Œil", x: 52