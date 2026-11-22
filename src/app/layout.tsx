import type { Metadata, Viewport } from 'next';
import { Archivo, Geist, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import { Suspense } from 'react';
import './globals.css';
import './verao27.css';
import './bf27.css';
import './home.css';
import { CartProvider } from '@/components/CartProvider';
import { CartDrawer } from '@/components/CartDrawer';
import { Header, Logo } from '@/components/Header';
import { SignupPopup, WhatsAppButton } from '@/components/Extras';
import { SiteChrome } from '@/components/SiteChrome';
import { shopConfig, siteUrl } from '@/lib/config';
import { site } from '@/content/site';
import { getBf, getProductsBySlugs } from '@/lib/products';

// Todas as páginas leem estoque/preço do banco a cada acesso
export const dynamic = 'force-dynamic';

// Archivo larga (expanded) nos títulos, Geist no texto
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const mono = JetBrains_Mono({ weight: '500', subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: site.fullName, template: `%s — ${site.fullName}` },
  description: site.tagline,
  openGraph: { siteName: site.fullName, locale: 'pt_BR', type: 'website' },
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%232b3bff'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-family='Arial Black,sans-serif' font-size='14' fill='%23fff'%3ESD%3C/text%3E%3C/svg%3E" },
};
export const viewport: Viewport = { themeColor: '#ffffff' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [bf, catArt] = await Promise.all([getBf(), getProductsBySlugs(Object.values(site.categoryArt))]);
  const menuArt = Object.fromEntries(Object.entries(site.categoryArt).map(([cat, slug]) => [cat, catArt.find((p) => p.slug === slug)]));
  const list = bf.phase === 'live'
    ? [`BLACK FRIDAY · ATÉ ${bf.maxPercent}% OFF`, `SÓ ATÉ ${bf.endLabel}`, ...site.announcements]
    : bf.phase === 'teaser'
      ? [`BLACK FRIDAY ${bf.startLabel} · ATÉ ${bf.maxPercent}% OFF`, ...site.announcements]
      : site.announcements;
  const ann = [...list, ...list];
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${geist.variable} ${mono.variable}`}>
      <body>
        <CartProvider config={shopConfig}>
          <SiteChrome>
          <div className={`announce ${bf.phase === 'live' ? 'announce--bf' : ''}`} aria-label="Avisos">
            <div className="announce__track">{ann.map((a, i) => <span key={i}>{a}</span>)}</div>
          </div>
          <Suspense fallback={<header className="header" />}>
            <Header blackFriday={bf.phase !== 'off'} menuArt={menuArt} />
          </Suspense>
          </SiteChrome>
          <main id="conteudo">{children}</main>
          <SiteChrome>
          <footer className="footer">
            <div className="footer__grid">
              <div>
                <Logo footer />
                <p className="muted">Feito na rua, desde 2026.</p>
              </div>
              <div>
                <h4>Loja</h4>
                <Link href="/loja?tag=novo">Novidades</Link><Link href="/loja?cat=roupas">Roupas</Link>
                <Link href="/loja?cat=acessorios">Acessórios</Link><Link href="/loja?cat=skate">Skate</Link>
                <Link href="/collabs">Collabs</Link><Link href="/drop">Drop da semana</Link>
              </div>
              <div>
                <h4>{site.name}</h4>
                <Link href="/sobre">Sobre</Link><Link href="/blog">Blog</Link><Link href="/lookbook">Lookbook</Link>
              </div>
              <div>
                <h4>Ajuda</h4>
                <Link href="/ajuda#trocas">Trocas e devoluções</Link><Link href="/ajuda#envio">Envio e prazos</Link>
                <Link href="/ajuda#medidas">Tabela de medidas</Link><a href={site.social.whatsapp} target="_blank" rel="noopener">Fale com a gente</a>
              </div>
              <div>
                <h4>Pagamento</h4>
                <div className="pay-badges"><span>PIX</span><span>VISA</span><span>MASTER</span><span>ELO</span><span>BOLETO</span></div>
                <p className="muted small">{shopConfig.pixDiscountPercent}% off no Pix · até {shopConfig.maxInstallments}x sem juros no cartão</p>
              </div>
            </div>
            <div className="footer__bottom">
              <span>
                © {new Date().getFullYear()} {site.company.legalName || site.fullName}
                {site.company.cnpj && ` · CNPJ ${site.company.cnpj}`}
                {site.company.address && ` · ${site.company.address}`}
              </span>
              <span><Link href="/privacidade">Privacidade</Link> · <Link href="/termos">Termos de uso</Link></span>
              <span><a href={site.social.instagram} target="_blank" rel="noopener">Instagram</a> · <a href={site.social.tiktok} target="_blank" rel="noopener">TikTok</a></span>
            </div>
          </footer>
          </SiteChrome>
          <CartDrawer />
          <WhatsAppButton href={site.social.whatsapp} />
          <SignupPopup blackFriday={bf.phase === 'teaser'} maxPercent={bf.maxPercent} />
        </CartProvider>
      </body>
    </html>
  );
}
