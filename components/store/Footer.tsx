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

          {/* SSL */}
          <div className="bg-white rounded-2xl px-6 py-4 flex flex-col items-center gap-2 shadow-sm w-32 border border-gray-100">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current text-green-600"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
            </div>
            <p className="text-xs font-black text-gray-800 text-center">Site Seguro</p>
            <p className="text-xs text-gray-400 text-center -mt-1">SSL certificado</p>
          </div>

          {/* PagarMe */}
          <div className="bg-white rounded-2xl px-6 py-4 flex flex-col items-center gap-2 shadow-sm w-32 border border-gray-100">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current text-emerald-600"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
            </div>
            <p className="text-xs font-black text-gray-800 text-center">Pagar.me</p>
            <p className="text-xs text-gray-400 text-center -mt-1">Pagamento seguro</p>
          </div>

          {/* ClearSale */}
          <div className="bg-white rounded-2xl px-6 py-4 flex flex-col items-center gap-2 shadow-sm w-32 border border-gray-100">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current text-orange-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </div>
            <p className="text-xs font-black text-gray-800 text-center">ClearSale</p>
            <p className="text-xs text-gray-400 text-center -mt-1">Antifraude</p>
          </div>

          {/* Melhor Envio */}
          <div className="bg-white rounded-2xl px-6 py-4 flex flex-col items-center gap-2 shadow-sm w-32 border border-gray-100">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current text-blue-500"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
            </div>
            <p className="text-xs font-black text-gray-800 text-center">Melhor Envio</p>
            <p className="text-xs text-gray-400 text-center -mt-1">Entrega garantida</p>
          </div>

        </div>
      </div>

      {/* Rodape final */}
      <div className="max-w-7xl mx-auto border-t border-green-900 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-green-600">
        <div>
          <div className="flex flex-wrap gap-4 mb-3">
            <a href="#" className="hover:text-green-400 transition-colors">Atendimento</a>
            <a href="#" className="hover:text-green-400 transition-colors">Compra Segura</a>
            <a href="#" className="hover:text-green-400 transition-colors">Perguntas Frequentes</a>
            <a href="#" className="hover:text-green-400 transition-colors">Política de Entrega</a>
            <a href="tel:4799149-3270" className="hover:text-green-400 transition-colors flex items-center gap-1">📞 (47) 99149-3270</a>
          </div>
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
      <div className="bg-gray-900 border-t border-gray-800 py-3">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
      <span>© {new Date().getFullYear()} Taschibra S.A. — CNPJ 83.600.393/0001-53</span>
      <div className="flex gap-4">
        <a href="/privacidade" className="hover:text-green-400 transition-colors">Política de Privacidade</a>
        <a href="/termos" className="hover:text-green-400 transition-colors">Termos de Uso</a>
      </div>
    </div>
  </div>
</footer>
  )
}
