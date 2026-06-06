import { useState } from "react";
import "@/styles/rotas.css";

type Props = { entering: boolean; onBack: () => void };

const spots = [
  { id: "tea", label: "Salon de the", x: 22, y: 52, title: "Salon de the", text: "Un refuge calme au bord de la place." },
  { id: "eye", label: "Maison de l oeil", x: 49, y: 36, title: "Maison de l oeil", text: "Le batiment signature observe la