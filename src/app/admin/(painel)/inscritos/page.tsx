import { db } from '@/lib/db';

export default async function Subscribers() {
  const subs = await db.subscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
  const total = await db.subscriber.count();
  return (
    <>
      <div className="admin__bar">
        <h1 className="section__title">Inscritos ({total})</h1>
        <a className="btn" href="/admin/inscritos/csv">Baixar CSV</a>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>E-mail</th><th>Origem</th><th>Data</th></tr></thead>
          <tbody>
            {subs.map((s) => <tr key={s.id}><td>{s.email}</td><td>{s.source}</td><td>{s.createdAt.toLocaleDateString('pt-BR')}</td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  );
}
