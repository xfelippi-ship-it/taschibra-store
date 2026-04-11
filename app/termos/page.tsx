import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'

export default function TermosPage() {
  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-black text-gray-800 mb-2">Termos de Uso</h1>
        <p className="text-xs text-gray-400 mb-8">Última atualização: abril de 2025</p>

        <div className="prose prose-sm text-gray-600 space-y-6">
          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">1. Aceitação dos Termos</h2>
            <p>Ao acessar ou utilizar a Taschibra Store, você concorda com estes Termos de Uso. Se não concordar, por favor, não utilize nosso site.</p>
          </section>
          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">2. Cadastro</h2>
            <p>Para realizar compras, você deverá criar uma conta fornecendo informações verdadeiras e atualizadas. É sua responsabilidade manter a confidencialidade de sua senha.</p>
          </section>
          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">3. Produtos e Preços</h2>
            <p>A Taschibra se reserva o direito de alterar preços e disponibilidade de produtos sem aviso prévio. Os preços exibidos já incluem os impostos aplicáveis. Erros de preço são passíveis de cancelamento do pedido, com reembolso integral.</p>
          </section>
          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">4. Pedidos e Pagamentos</h2>
            <p>Após a confirmação do pagamento, seu pedido será processado. Aceitamos pagamento via PIX, cartão de crédito e boleto bancário. Pedidos suspeitos de fraude podem ser cancelados.</p>
          </section>
          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">5. Entrega</h2>
            <p>Os prazos de entrega são estimativas e podem variar conforme a localidade e disponibilidade. A Taschibra não se responsabiliza por atrasos causados por transportadoras ou eventos de força maior.</p>
          </section>
          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">6. Trocas e Devoluções</h2>
            <p>Você tem direito de arrependimento em até 7 dias corridos após o recebimento do produto, conforme o Código de Defesa do Consumidor. Para produtos com defeito, o prazo é de 90 dias. Entre em contato pelo SAC para iniciar o processo.</p>
          </section>
          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">7. Propriedade Intelectual</h2>
            <p>Todo o conteúdo deste site (imagens, textos, logos, marcas) é propriedade da Taschibra S.A. e está protegido por lei. É vedada a reprodução sem autorização prévia.</p>
          </section>
          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">8. Limitação de Responsabilidade</h2>
            <p>A Taschibra não se responsabiliza por danos indiretos decorrentes do uso do site. Nossa responsabilidade máxima se limita ao valor do pedido realizado.</p>
          </section>
          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">9. Foro</h2>
            <p>Fica eleito o foro da comarca de Blumenau/SC para dirimir quaisquer disputas decorrentes destes Termos.</p>
          </section>
          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">10. Contato</h2>
            <p>Dúvidas? Entre em contato pelo e-mail <strong>sac@taschibra.com.br</strong> ou pelos canais de atendimento disponíveis no site.</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}
