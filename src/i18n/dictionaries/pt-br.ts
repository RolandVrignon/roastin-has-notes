import pt from "@/i18n/dictionaries/pt";
import type { Dictionary } from "@/i18n/types";

const dictionary = {
  ...pt,
  languageName: "Português (Brasil)",
  common: { ...pt.common, close: "Fechar", back: "Voltar", createReport: "Fazer roast do chat", myReports: "Meus relatórios", contact: "Contato", deleteData: "Excluir meus dados", adultOnly: "Somente maiores de 18" },
  seo: { title: "Roastin Has Notes — Seu chat, sem filtro", description: "Envie uma conversa do WhatsApp e receba um relatório privado, divertido e estranhamente certeiro sobre o seu grupo." },
  nav: { how: "Como funciona", data: "Seus dados", faq: "Dúvidas" },
  landing: { ...pt.landing,
    titleBefore: "Seu chat tem", titleAfter: "Roastin anotou tudo.", subtitle: "Envie uma conversa do WhatsApp. Receba o relatório sem filtro e estranhamente certeiro que ninguém do grupo teria coragem de escrever.", privacyNote: "A conversa original não é armazenada depois da geração", trust: ["Verificado pelo WhatsApp", "Privado por padrão", "Pronto em minutos"],
    howText: "Sem questionários nem testes constrangedores. Roastin usa o que o grupo já disse.", steps: [{ title: "Mande as provas", text: "Exporte o chat do WhatsApp e envie o arquivo .txt ou .zip." }, { title: "Roastin faz anotações", text: "Ele encontra padrões repetidos e escreve um relatório baseado na conversa." }, { title: "Leia, surte, compartilhe", text: "Receba perfis, prêmios, piadas internas e um veredito feito para o grupo." }],
    reportEyebrow: "Um relatório que só seu chat poderia criar", reportText: "Cada observação vem de padrões visíveis: quem faz planos, quem some e quem só usa um emoji.", privacyEyebrow: "Seu chat continua sendo seu", privacyText: "A conversa é criptografada em armazenamento temporário durante a geração, nunca é salva no banco de dados do aplicativo e é excluída ao final do processamento.",
    privacyCards: [{ title: "Uma única finalidade", text: "A conversa é usada para gerar o relatório." }, { title: "Original não armazenado", text: "O arquivo original é descartado no fim da solicitação." }, { title: "Relatório privado", text: "O relatório derivado é armazenado para você consultar e excluir." }],
    faqs: [{ question: "Vocês guardam minha conversa?", answer: "Não salvamos o arquivo original no nosso banco. Ele é processado para criar o relatório e descartado. O relatório derivado fica privado até você excluí-lo." }, { question: "As outras pessoas vão saber?", answer: "Só se você contar. Os relatórios são privados e o link de compartilhamento pode ser revogado." }, { question: "É cruel?", answer: "Roastin brinca com comportamentos repetidos, nunca com identidade, aparência ou características sensíveis." }, { question: "Quais chats funcionam melhor?", answer: "Grupos ativos são ideais, mas casais, melhores amigos, famílias e equipes também funcionam." }],
    finalTitle: "Seu grupo já escreveu o material.", finalText: "Roastin só tem coragem de dizer em voz alta.", finalCta: "Mande as provas",
  },
  onboarding: { ...pt.onboarding,
    errors: { format: "Escolha uma exportação .txt do WhatsApp ou o arquivo .zip.", size: "Esta versão beta aceita conversas de até 2 MB.", archive: "O arquivo não contém uma exportação de texto legível.", short: "Não encontramos mensagens suficientes. Escolha uma exportação original.", generation: "Não foi possível criar o relatório. Tente novamente." },
    types: { ...pt.onboarding.types, title: "Que tipo de chat temos aqui?", text: "Cada grupo tem suas próprias leis da física. Isso ajuda Roastin a entender o clima.", options: { friends: { label: "Grupo de amigos", detail: "O belo caos" }, partner: { label: "Parceiro ou crush", detail: "Leia por sua conta e risco" }, "best-friend": { label: "Melhor amigo", detail: "Uma instituição de duas pessoas" }, family: { label: "Família", detail: "História geracional incluída" }, work: { label: "Trabalho ou equipe", detail: "Profissionalmente pouco profissional" }, other: { label: "Outra coisa", detail: "Roastin vai entender" } } },
    context: { eyebrow: "Contexto opcional", title: "Algo que Roastin deveria saber?", text: "Uma frase basta. Pule se as mensagens falarem por si.", placeholder: "A gente se conhece desde a faculdade e toda viagem vira seis semanas de negociação…" },
    upload: { ...pt.onboarding.upload, text: "Escolha o .txt ou .zip de uma exportação sem mídia. A primeira análise acontece no navegador.", choose: "Escolher .txt ou .zip", limits: "Máximo de 2 MB · Sem mídia", replace: "Escolher outro arquivo", privacy: "Conversa original descartada após a geração", sample: "Testar a conversa de exemplo" },
    review: { eyebrow: "Elenco", title: "Confira se entendemos o grupo.", text: "Use nomes ou apelidos. Eles aparecerão no relatório.", chatName: "Nome do chat" },
    launch: { ready: "Roastin está pronto para", messages: "mensagens", protagonists: "protagonistas", warning: "Eles não fazem ideia do que vão descobrir.", cards: ["Padrões", "Perfis", "Veredito"], consent: "Confirmo que tenho 18 anos ou mais, que a conversa não envolve menores e concordo com o processamento temporário para criar o relatório.", loading: "Lendo nas entrelinhas. Pode levar um minuto…", cta: "Deixar Roastin cozinhar" },
  },
  pages: {
    privacy: { ...pt.pages.privacy, title: "O que processamos, armazenamos e excluímos", intro: "Este aviso explica o produto como ele funciona hoje. Não afirma que não armazenamos nada." },
    terms: { ...pt.pages.terms, intro: "Estes termos da versão beta explicam os limites. Dados finais da empresa e jurisdição ainda são necessários." },
    help: { ...pt.pages.help, intro: "Respostas rápidas sobre importação, privacidade, acesso e compartilhamento." },
    contact: { ...pt.pages.contact, eyebrow: "Contato", title: "Fale com uma pessoa", intro: "Para suporte, privacidade ou segurança, escreva sem incluir a conversa." },
    delete: { ...pt.pages.delete, eyebrow: "Excluir dados", title: "Exclua o relatório ou os dados de entrega", intro: "Você pode excluir o relatório na página privada. A exclusão completa da conta ainda exige uma solicitação verificada." },
  },
} satisfies Dictionary;

export default dictionary;
