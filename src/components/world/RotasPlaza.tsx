import React from "react";
import "@/styles/rotas.css";

type Props = { entering: boolean; onBack: () => void };

export default function RotasPlaza(props: Props) {
  const cls = props.entering ? "rotas-plaza is-entering" : "rotas-plaza is-ready";
  return React.createElement("section", { className: cls },
    React.createElement("div", { className: "rotas-sky" }),
    React.createElement("div", { className: "rotas-sea" }),
    React.createElement("div", { className: "rotas-world" },
      React.createElement("div", { className: "rotas-building tea-house" },
        React.createElement("span", { className: "rot