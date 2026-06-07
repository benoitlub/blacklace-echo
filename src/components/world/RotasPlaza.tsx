type Props={entering:boolean;onBack:()=>void};

export default function RotasPlaza({entering,onBack}:Props){
  return <section className={entering?"rotas-plaza is-entering":"rotas-plaza is-ready"}><button className="rotas-back" onClick={onBack}>Retour carte</button></section>;
}
