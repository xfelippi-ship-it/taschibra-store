export default function TrustBar() {
  const items = [
    { icon: '🚚', text: 'Enviamos para todo o Brasil' },
    { icon: '💳', text: 'Parcele em até 10x sem juros' },
    { icon: '🔒', text: 'Compra 100% segura' },
    { icon: '🏭', text: 'Fábrica própria em Indaial/SC' },
  ]
  return (
    <div className="bg-green-50 border-b border-green-100 py-4 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:flex md:justify-center gap-3 md:gap-12">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs md:text-sm font-semibold text-green-800">
            <span className="text-lg md:text-xl flex-shrink-0">{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
