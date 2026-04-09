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
          <p className="text-sm text-green-400 leading-relaxed">Uma das maiores industrias de iluminacao da America Latina. Sede em Indaial/SC. Mais de 30 anos iluminando o Brasil.</p>
        </div>
        {[
          { title: 'Comprando', links: ['Seguranca', 'Termos de Uso', 'Politica de Troca', 'Privacidade'] },
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

      {/* Selos de seguranca — arte SVG inline */}
      <div className="max-w-7xl mx-auto border-t border-green-900 pt-8 pb-6">
        <p className="text-xs text-green-600 uppercase tracking-widest font-bold mb-5 text-center">Compra 100% Segura</p>
        <div className="flex flex-wrap items-stretch justify-center gap-3">

          {/* SSL */}
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm w-28 border border-gray-100">
            <svg viewBox="0 0 64 40" className="w-full h-10">
              <rect width="64" height="40" rx="8" fill="#f0fdf4"/>
              <path d="M32 4L18 10v8c0 8.84 5.88 17.12 14 19.2C40.12 35.12 46 26.84 46 18V10L32 4z" fill="#16a34a"/>
              <path d="M27 21l-4-4 1.4-1.4L27 18.2l8.6-8.6L37 11l-10 10z" fill="white"/>
            </svg>
            <p className="text-xs font-black text-gray-700 text-center leading-tight">SSL Seguro</p>
          </div>

          {/* PagarMe */}
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm w-28 border border-gray-100">
            <svg viewBox="0 0 64 40" className="w-full h-10">
              <rect width="64" height="40" rx="8" fill="#f8f8f8"/>
              <rect x="8" y="12" width="48" height="16" rx="3" fill="#00C08B"/>
              <rect x="8" y="12" width="48" height="5" rx="3" fill="#00A87A"/>
              <rect x="14" y="21" width="8" height="4" rx="1" fill="white" opacity="0.8"/>
              <circle cx="44" cy="23" r="3" fill="white" opacity="0.6"/>
              <circle cx="50" cy="23" r="3" fill="white" opacity="0.4"/>
              <text x="32" y="8" textAnchor="middle" fill="#00C08B" fontSize="5" fontWeight="bold" fontFamily="Arial">pagar.me</text>
            </svg>
            <p className="text-xs font-black text-gray-700 text-center leading-tight">Pagamento seguro</p>
          </div>

          {/* ClearSale */}
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm w-28 border border-gray-100">
            <svg viewBox="0 0 64 40" className="w-full h-10">
              <rect width="64" height="40" rx="8" fill="#fff8f5"/>
              <circle cx="32" cy="20" r="14" fill="#FF5722" opacity="0.1"/>
              <path d="M32 8c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12S38.6 8 32 8zm-2 17l-5-5 1.4-1.4L30 22.2l8.6-8.6L40 15l-10 10z" fill="#FF5722"/>
              <text x="32" y="37" textAnchor="middle" fill="#FF5722" fontSize="5" fontWeight="bold" fontFamily="Arial">ClearSale</text>
            </svg>
            <p className="text-xs font-black text-gray-700 text-center leading-tight">Antifraude</p>
          </div>

          {/* Melhor Envio */}
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm w-28 border border-gray-100">
            <svg viewBox="0 0 64 40" className="w-full h-10">
              <rect width="64" height="40" rx="8" fill="#f0f9ff"/>
              <path d="M8 22h32v6H8z" fill="#0099CC" rx="2"/>
              <path d="M40 22l8 6H40v-6z" fill="#007AB0"/>
              <rect x="10" y="28" width="5" height="5" rx="2.5" fill="#333"/>
              <rect x="32" y="28" width="5" height="5" rx="2.5" fill="#333"/>
              <rect x="8" y="16" width="20" height="6" fill="#0099CC" opacity="0.4"/>
              <path d="M28 16l8 6h-8v-6z" fill="#0099CC" opacity="0.6"/>
              <text x="32" y="10" textAnchor="middle" fill="#0099CC" fontSize="5" fontWeight="bold" fontFamily="Arial">Melhor Envio</text>
            </svg>
            <p className="text-xs font-black text-gray-700 text-center leading-tight">Entrega garantida</p>
          </div>

        </div>
      </div>

      {/* Rodape final */}
      <div className="max-w-7xl mx-auto border-t border-green-900 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-green-600">
        <div>
          <p>Blumenox Iluminacao LTDA - CNPJ: 02.477.605/0001-01</p>
          <p className="mt-0.5">Rodovia BR 470 KM 65,931, n 2135 - Encano do Norte, Indaial/SC - CEP 89085-144</p>
          <p className="mt-0.5">Taschibra Store 2025 - Todos os direitos reservados</p>
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <div className="bg-white rounded-md p-1 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 44 28" className="h-7 w-12"><rect fill="#1A1F71" width="44" height="28" rx="2"/><text x="7" y="20" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">VISA</text></svg>
          </div>
          <div className="bg-white rounded-md p-1 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 44 28" className="h-7 w-12"><rect fill="#252525" width="44" height="28" rx="2"/><circle fill="#EB001B" cx="16" cy="14" r="8"/><circle fill="#F79E1B" cx="28" cy="14" r="8"/><path fill="#FF5F00" d="M22 7.2a8 8 0 0 1 0 13.6A8 8 0 0 1 22 7.2z"/></svg>
          </div>
          <div className="bg-white rounded-md p-1 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 44 28" className="h-7 w-12"><rect fill="#00A4E0" width="44" height="28" rx="2"/><text x="7" y="20" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial">elo</text></svg>
          </div>
          <div className="bg-white rounded-md p-1 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 44 28" className="h-7 w-12"><rect fill="#32BCAD" width="44" height="28" rx="2"/><text x="9" y="20" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial">PIX</text></svg>
          </div>
          <div className="bg-white rounded-md p-1 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 44 28" className="h-7 w-12"><rect fill="#f0f0f0" width="44" height="28" rx="2"/><rect x="4" y="5" width="3" height="18" fill="#444"/><rect x="9" y="5" width="2" height="18" fill="#444"/><rect x="13" y="5" width="3" height="18" fill="#444"/><rect x="18" y="5" width="2" height="18" fill="#444"/><rect x="22" y="5" width="3" height="18" fill="#444"/><rect x="27" y="5" width="2" height="18" fill="#444"/><rect x="31" y="5" width="3" height="18" fill="#444"/><rect x="36" y="5" width="2" height="18" fill="#444"/></svg>
          </div>
          <div className="bg-white rounded-md p-1 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 44 28" className="h-7 w-12"><rect fill="#007BC1" width="44" height="28" rx="2"/><text x="3" y="12" fill="white" fontSize="6" fontWeight="bold" fontFamily="Arial">AMERICAN</text><text x="5" y="21" fill="white" fontSize="6" fontWeight="bold" fontFamily="Arial">EXPRESS</text></svg>
          </div>
        </div>
      </div>
    </footer>
  )
}
