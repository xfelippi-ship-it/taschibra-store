export default function Footer() {
  return (
    <footer className="bg-green-950 text-green-300 mt-16 px-12 pt-14 pb-8">

      {/* Colunas principais */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">

        {/* Logo + descricao */}
        <div>
          <div className="mb-4">
            <img src="/images/logo.png" alt="Taschibra Store" className="h-10 w-auto object-contain" />
          </div>
          <p className="text-sm text-green-400 leading-relaxed mt-2">
            Uma das maiores industrias de iluminacao da America Latina. Sede em Indaial/SC. Mais de 30 anos iluminando o Brasil.
          </p>
        </div>

        {/* Links */}
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

      {/* Selos + bandeiras */}
      <div className="max-w-7xl mx-auto border-t border-green-900 pt-8 pb-6">

        <p className="text-xs text-green-500 uppercase tracking-widest font-bold mb-6 text-center">Compra 100% Segura</p>

        {/* 4 selos grandes */}
        <div className="flex flex-wrap items-stretch justify-center gap-3 mb-6">
          {[
            { img: '/logos/SSL SEGURANCA.png', label: 'SSL Certificado' },
            { img: '/logos/PAGAR.ME.png',      label: 'Pagamento Seguro' },
            { img: '/logos/CLEAR SALE.png',    label: 'Antifraude' },
            { img: '/logos/MELHOR ENVIO.png',  label: 'Entrega Garantida' },
          ].map((selo) => (
            <div
              key={selo.label}
              className="flex flex-col items-center justify-center bg-white rounded-xl gap-3"
              style={{ width: '160px', height: '110px', padding: '16px 20px' }}
            >
              <img src={selo.img} alt={selo.label} className="h-12 w-auto object-contain" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide text-center leading-tight">
                {selo.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bandeiras centralizadas */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { img: '/logos/VISA.png',             alt: 'Visa' },
            { img: '/logos/MASTER.png',           alt: 'Mastercard' },
            { img: '/logos/ELO.png',              alt: 'Elo' },
            { img: '/logos/PIX.png',              alt: 'Pix' },
            { img: '/logos/BOLETO.png',           alt: 'Boleto' },
            { img: '/logos/AMERICAN EXPRESS.png', alt: 'American Express' },
          ].map((b) => (
            <div key={b.alt} className="bg-white rounded-lg flex items-center justify-center"
              style={{ width: '64px', height: '40px', padding: '4px 8px' }}>
              <img src={b.img} alt={b.alt} className="h-6 w-auto object-contain" />
            </div>
          ))}
        </div>
      </div>

      {/* Rodape inferior */}
      <div className="max-w-7xl mx-auto border-t border-green-900 pt-6">

        {/* Links uteis */}
        <div className="flex flex-wrap items-center justify-start gap-6 text-xs text-green-600 mb-3">
          <a href="#" className="hover:text-white transition-colors">Atendimento</a>
          <a href="#" className="hover:text-white transition-colors">Compra Segura</a>
          <a href="#" className="hover:text-white transition-colors">Perguntas Frequentes</a>
          <a href="#" className="hover:text-white transition-colors">Política de Entrega</a>
          <span>📞 (47) 99149-3270</span>
        </div>

        {/* Razao social + bandeiras lado a lado */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="text-xs text-green-700 space-y-1">
            <p>Blumenox Iluminacao LTDA — CNPJ: 02.477.605/0001-01</p>
            <p>Rodovia BR 470 KM 65.931, n 2135 — Encano do Norte, Indaial/SC — CEP 89085-144</p>
            <p>Taschibra Store 2025 — Todos os direitos reservados</p>
          </div>

          {/* Bandeiras no rodape direito */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { img: '/logos/VISA.png',             alt: 'Visa' },
              { img: '/logos/MASTER.png',           alt: 'Mastercard' },
              { img: '/logos/ELO.png',              alt: 'Elo' },
              { img: '/logos/PIX.png',              alt: 'Pix' },
              { img: '/logos/BOLETO.png',           alt: 'Boleto' },
              { img: '/logos/AMERICAN EXPRESS.png', alt: 'American Express' },
            ].map((b) => (
              <div key={b.alt} className="bg-white rounded flex items-center justify-center"
                style={{ width: '52px', height: '32px', padding: '3px 6px' }}>
                <img src={b.img} alt={b.alt} className="h-5 w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-green-900 mt-4 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-green-700">
          <span>© 2026 Taschibra &nbsp; CNPJ 83.600.393/0001-53</span>
          <div className="flex gap-4">
            <a href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</a>
            <a href="/termos" className="hover:text-white transition-colors">Termos de Uso</a>
          </div>
        </div>
      </div>

    </footer>
  )
}
