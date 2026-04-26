import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'

export const metadata = {
  title: 'Política de Privacidade | Taschibra Store',
  description: 'Saiba como a Taschibra coleta, usa e protege seus dados pessoais.',
}

export default function PrivacidadePage() {
  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-black text-gray-800 mb-2">Política de Privacidade</h1>
        <p className="text-xs text-gray-400 mb-8">Última atualização: abril de 2026</p>

        <div className="prose prose-sm text-gray-600 space-y-6">
          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">1. Quem somos</h2>
            <p>A Blumenox Iluminação LTDA (CNPJ 02.477.605/0001-01), detentora da marca Taschibra, com sede em Indaial/SC, é responsável pelo tratamento dos seus dados pessoais no âmbito da Taschibra Store.</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">2. Dados que coletamos</h2>
            <p>Coletamos apenas os dados necessários para a prestação dos nossos serviços:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nome, e-mail, CPF e endereço para cadastro e entrega</li>
              <li>Dados de pagamento — processados com segurança pela PagarMe (não armazenamos dados de cartão)</li>
              <li>Histórico de pedidos e navegação para melhorar sua experiência</li>
              <li>Dados de acesso (IP, dispositivo, navegador) para segurança e análise</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">3. Como usamos seus dados</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Processar e entregar seus pedidos</li>
              <li>Enviar comunicações sobre seu pedido (confirmação, envio, entrega)</li>
              <li>Oferecer suporte ao cliente</li>
              <li>Melhorar nossos produtos e serviços</li>
              <li>Cumprir obrigações legais e fiscais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">4. Cookies</h2>
            <p>Utilizamos cookies essenciais para o funcionamento do site e cookies de análise para entender como você navega. Você pode aceitar ou recusar cookies não essenciais pelo banner exibido na sua primeira visita.</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">5. Compartilhamento de dados</h2>
            <p>Seus dados são compartilhados apenas com parceiros necessários para a prestação do serviço:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>PagarMe</strong> — processamento de pagamentos</li>
              <li><strong>MelhorEnvio / transportadoras</strong> — entrega dos pedidos</li>
              <li><strong>ClearSale</strong> — prevenção a fraudes</li>
              <li><strong>Tidio</strong> — atendimento via chat</li>
            </ul>
            <p className="mt-2">Não vendemos nem cedemos seus dados a terceiros para fins publicitários.</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">6. Seus direitos (LGPD)</h2>
            <p>Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
            <p className="mt-2">Para exercer seus direitos, acesse <strong>Minha Conta → Preferências → Excluir conta</strong> ou entre em contato pelo e-mail <strong>privacidade@taschibra.com.br</strong>.</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">7. Segurança</h2>
            <p>Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou alteração. Toda a comunicação é criptografada via HTTPS/TLS.</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">8. Retenção de dados</h2>
            <p>Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política e obrigações legais. Após a exclusão da conta, os dados são anonimizados ou eliminados em até 30 dias, salvo obrigação legal de retenção.</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">9. Contato e DPO</h2>
            <p>Responsável pela proteção de dados: <strong>privacidade@taschibra.com.br</strong></p>
            <p className="mt-1">Blumenox Iluminação LTDA — Marca Taschibra — Indaial/SC</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-800 mb-2">10. Alterações nesta política</h2>
            <p>Esta política pode ser atualizada periodicamente. Notificaremos mudanças significativas por e-mail ou aviso no site.</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}
