import "@/styles/rotas.css";

type Props = { entering: boolean; onBack: () => void };

export default function RotasPlaza({ entering, onBack }: Props) {
  return (
    <section className={`rotas-plaza ${entering ? "is-entering" : "is-ready"}`}>
      <div className="rotas-sky" />
      <div className="rotas-sea" />
      <div className="rotas-world">
        <div className="rotas-building tea-house"><span className="rotas-dome" /><span className="rot