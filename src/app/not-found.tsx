import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section">
      <h1 className="section__title" style={{ fontSize: 120 }}>404</h1>
      <p>Essa página caiu do skate.</p><br />
      <Link className="btn" href="/">Voltar pro início</Link>
    </section>
  );
}
