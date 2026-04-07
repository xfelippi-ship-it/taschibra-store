import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-green-950 text-green-300 mt-16 px-12 pt-14 pb-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
        <div>
          <div className="mb-4">
            <Image
              src="/images/logo.png"
              alt="Taschibra Store"
              width={180}
              height={54}
              className="object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
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
        <span>Taschibra © 2025 — Indaial/SC</span>
        <div className="flex gap-2">
          {['PIX','VISA','MASTER','ELO','BOLETO'].map(p => (
            <span key={p} className="bg-green-900 px-2 py-1 rounded text-green-400 font-bold">{p}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
