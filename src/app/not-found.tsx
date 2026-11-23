import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="nf">
      <p className="nf__kicker">Erro 404</p>
      <h1 className="nf__title">Essa página caiu do skate.</h1>
      <p className="nf__text">O link pode estar errado ou a peça já esgotou e saiu do ar.</p>
      <div className="nf__links">
        <Link className="btn" href="/loja?tag=novo">Ver novidades</Link>
        <Link className="btn btn--ghost" href="/">Voltar pro início</Link>
      </div>
    </section>
  );
}
