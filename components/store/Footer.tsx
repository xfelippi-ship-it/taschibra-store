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

      {/* Selos de seguranca */}
      <div className="max-w-7xl mx-auto border-t border-green-900 pt-8 pb-6">
        <p className="text-xs text-green-600 uppercase tracking-widest font-bold mb-5 text-center">Compra 100% Segura</p>
        <div className="flex flex-wrap items-stretch justify-center gap-4">
          <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm w-32 border border-gray-100">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-green-600"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
            </div>
            <div className="text-center"><p className="text-xs font-black text-gray-800">Site Seguro</p><p className="text-xs text-gray-400 mt-0.5">SSL certificado</p></div>
          </div>
          <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm w-32 border border-gray-100">
            <div className="h-14 w-full flex items-center justify-center">
              <img src="/logos/logo-pagarme.png" alt="Pagar.me" className="max-h-10 max-w-full object-contain" />
            </div>
            <div className="text-center"><p className="text-xs font-black text-gray-800">Pagar.me</p><p className="text-xs text-gray-400 mt-0.5">Pagamento seguro</p></div>
          </div>
          <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm w-32 border border-gray-100">
            <div className="h-14 w-full flex items-center justify-center">
              <img src="/logos/ClearSale - Experian logo-orange.webp" alt="ClearSale" className="max-h-10 max-w-full object-contain" />
            </div>
            <div className="text-center"><p className="text-xs font-black text-gray-800">ClearSale</p><p className="text-xs text-gray-400 mt-0.5">Antifraude</p></div>
          </div>
          <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm w-32 border border-gray-100">
            <div className="h-14 w-full flex items-center justify-center">
              <img src="/logos/me_3.webp" alt="Melhor Envio" className="max-h-10 max-w-full object-contain" />
            </div>
            <div className="text-center"><p className="text-xs font-black text-gray-800">Melhor Envio</p><p className="text-xs text-gray-400 mt-0.5">Entrega garantida</p></div>
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
        <div className="flex flex-wrap gap-2 items-center">
          <div className="bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 52 32" className="h-9 w-16"><rect fill="#1A1F71" width="52" height="32" rx="3"/><text x="8" y="23" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">VISA</text></svg>
          </div>
          <div className="bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 52 32" className="h-9 w-16"><rect fill="#252525" width="52" height="32" rx="3"/><circle fill="#EB001B" cx="19" cy="16" r="9"/><circle fill="#F79E1B" cx="33" cy="16" r="9"/><path fill="#FF5F00" d="M26 8.5a9 9 0 0 1 0 15A9 9 0 0 1 26 8.5z"/></svg>
          </div>
          <div className="bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 52 32" className="h-9 w-16"><rect fill="#00A4E0" width="52" height="32" rx="3"/><text x="8" y="24" fill="white" fontSize="17" fontWeight="bold" fontFamily="Arial">elo</text></svg>
          </div>
          <div className="bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 52 32" className="h-9 w-16"><rect fill="#32BCAD" width="52" height="32" rx="3"/><text x="10" y="23" fill="white" fontSize="15" fontWeight="bold" fontFamily="Arial">PIX</text></svg>
          </div>
          <div className="bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 52 32" className="h-9 w-16"><rect fill="#f0f0f0" width="52" height="32" rx="3"/><rect x="5" y="6" width="3" height="20" fill="#444"/><rect x="10" y="6" width="2" height="20" fill="#444"/><rect x="14" y="6" width="4" height="20" fill="#444"/><rect x="20" y="6" width="3" height="20" fill="#444"/><rect x="25" y="6" width="2" height="20" fill="#444"/><rect x="29" y="6" width="4" height="20" fill="#444"/><rect x="35" y="6" width="3" height="20" fill="#444"/><rect x="40" y="6" width="3" height="20" fill="#444"/><rect x="45" y="6" width="2" height="20" fill="#444"/></svg>
          </div>
          <div className="bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 52 32" className="h-9 w-16"><rect fill="#007BC1" width="52" height="32" rx="3"/><text x="4" y="14" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial">AMERICAN</text><text x="6" y="24" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial">EXPRESS</text></svg>
          </div>
        </div>
      </div>
    </footer>
  )
}
