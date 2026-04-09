export default function Footer() {
  return (
    <footer className="bg-green-950 text-green-300 mt-16 px-12 pt-14 pb-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-white font-black text-lg tracking-tight">TASCHIBRA</span>
            <span className="text-green-500 font-light text-lg">|</span>
            <span className="text-green-400 font-bold text-lg tracking-widest">STORE</span>
          </div>
          <p className="text-sm text-green-400 leading-relaxed">Uma das maiores indústrias de iluminação da América Latina. Sede em Indaial/SC. Mais de 30 anos iluminando o Brasil.</p>
        </div>
        {[
          { title: 'Comprando', links: ['Segurança', 'Termos de Uso', 'Política de Troca', 'Privacidade'] },
          { title: 'Atendimento', links: ['Minha Conta', 'Meus Pedidos', 'FAQ', '(47) 3281-7640'] },
          { title: 'Institucional', links: ['Sobre a Taschibra', 'Trabalhe Conosco', 'Contato', 'Para Empresas'] },
        ].map((col, i) => (
          <div key={i}>
            <h4 className="text-white font-black text-xs tracking-widest uppercase mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l, j) => (
                <li key={j}><a href="#" className="text-sm text-green-400 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto border-t border-green-900 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-green-600">
        <div>
          <p>Blumenox Iluminação LTDA — CNPJ: 02.477.605/0001-01</p>
          <p className="mt-0.5">Rodovia BR 470 KM 65,931, nº 2135 — Encano do Norte, Indaial/SC — CEP 89085-144</p>
          <p className="mt-0.5">Taschibra Store © 2025 — Todos os direitos reservados</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Visa */}
          <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center h-8 w-14">
            <svg viewBox="0 0 38 24" className="h-5"><path fill="#1A1F71" d="M35.6 0H2.4C1.1 0 0 1.1 0 2.4v19.2C0 22.9 1.1 24 2.4 24h33.2c1.3 0 2.4-1.1 2.4-2.4V2.4C38 1.1 36.9 0 35.6 0z"/><path fill="#FFFFFF" d="M16.3 16.7l1.5-8.9h2.4l-1.5 8.9h-2.4zm10.6-8.7c-.5-.2-1.2-.4-2.1-.4-2.3 0-4 1.2-4 2.9 0 1.3 1.1 2 2 2.4.9.4 1.2.7 1.2 1.1 0 .6-.7.9-1.4.9-.9 0-1.4-.1-2.2-.5l-.3-.1-.3 1.9c.5.2 1.5.4 2.5.4 2.4 0 4-1.2 4-3 0-1-.6-1.7-1.9-2.3-.8-.4-1.3-.7-1.3-1.1 0-.4.4-.8 1.3-.8.7 0 1.3.1 1.7.3l.2.1.3-1.8zm6 0h-1.8c-.6 0-1 .2-1.2.7l-3.4 8.2h2.4l.5-1.3h2.9l.3 1.3h2.1l-1.8-8.9zm-3 5.5l.9-2.5.5 2.5h-1.4zm-17.5-5.5l-2.3 6.1-.2-1.2c-.5-1.5-1.9-3.2-3.5-4l2.1 7.9h2.4l3.6-8.8h-2.1z"/><path fill="#FAA61A" d="M6.7 7.8H3.1l-.1.2c2.8.7 4.7 2.5 5.4 4.6l-.8-3.9c-.1-.5-.5-.8-.9-.9z"/></svg>
          </div>
          {/* Mastercard */}
          <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center h-8 w-14">
            <svg viewBox="0 0 38 24" className="h-5"><rect fill="#252525" width="38" height="24" rx="2.4"/><circle fill="#EB001B" cx="15" cy="12" r="7"/><circle fill="#F79E1B" cx="23" cy="12" r="7"/><path fill="#FF5F00" d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z"/></svg>
          </div>
          {/* Elo */}
          <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center h-8 w-14">
            <svg viewBox="0 0 38 24" className="h-5"><rect fill="#00A4E0" width="38" height="24" rx="2.4"/><text x="5" y="17" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial">elo</text></svg>
          </div>
          {/* PIX */}
          <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center h-8 w-14">
            <svg viewBox="0 0 38 24" className="h-5"><rect fill="#32BCAD" width="38" height="24" rx="2.4"/><text x="7" y="17" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">PIX</text></svg>
          </div>
          {/* Boleto */}
          <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center h-8 w-14">
            <svg viewBox="0 0 38 24" className="h-5"><rect fill="#white" width="38" height="24" rx="2.4"/><rect x="4" y="5" width="2" height="14" fill="#333"/><rect x="8" y="5" width="1" height="14" fill="#333"/><rect x="11" y="5" width="3" height="14" fill="#333"/><rect x="16" y="5" width="2" height="14" fill="#333"/><rect x="20" y="5" width="1" height="14" fill="#333"/><rect x="23" y="5" width="3" height="14" fill="#333"/><rect x="28" y="5" width="2" height="14" fill="#333"/><rect x="32" y="5" width="2" height="14" fill="#333"/></svg>
          </div>
          {/* Amex */}
          <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center h-8 w-14">
            <svg viewBox="0 0 38 24" className="h-5"><rect fill="#007BC1" width="38" height="24" rx="2.4"/><text x="3" y="17" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial">AMERICAN</text><text x="5" y="22" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial">EXPRESS</text></svg>
          </div>
        </div>
      </div>
    </footer>
  )
}
