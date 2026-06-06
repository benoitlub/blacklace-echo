import { useState } from "react";
import "@/styles/rotas-art.css";

type RotasPlazaProps = { entering: boolean; onBack: () => void };

const spots = [
  { id: "tea", label: "Salon de the", x: 31, y: 45, text: "Un refuge calme et parfume. On y vient pour ralentir et ecouter les rumeurs." },
  { id: "eye", label: "Maison de l'Oeil", x: 52, y: 37, text: "Le batiment signature