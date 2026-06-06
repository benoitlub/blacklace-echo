import { useState } from "react";
import "@/styles/rotas.css";

type RotasPlazaProps = {
  entering: boolean;
  onBack: () => void;
};

const spots = [
  { id: "tea", label: "Salon de thé", x: 22, y: 52, title: "Salon de thé", text: "Un refuge calme et parfumé. On y vient pour ralentir et écouter les rumeurs de Rotas." },
  { id: "eye", label: "Maison de l’Œil", x: 49, y: 36, title: "Maison de l’Œil", text: "Le bâtiment