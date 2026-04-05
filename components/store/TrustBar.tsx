export default function TrustBar() {
  const items = [
    { icon: '🚚', text: 'Enviamos para todo o Brasil' },
    { icon: '💳', text: 'Parcele em até 10x sem juros' },
    { icon: '🔒', text: 'Compra 100% segura' },
    { icon: '🏭', text: 'Fábrica própria em Indaial/SC' },
  ]
  return (
    <div className="bg-green-50 border-b border-green-100 py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-center gap-12 flex-wrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm font-semibold text-green-800">
            <span className="text-xl">{item.icon}</span>
            {item.text}
          </div>
        ))}
      </div>
    </div>
  )
}
