import en from "@/i18n/dictionaries/en";
import type { Dictionary } from "@/i18n/types";

const dictionary = {
  ...en,
  languageName: "Français",
  common: {
    skipToContent: "Aller au contenu", language: "Langue", close: "Fermer", back: "Retour", continue: "Continuer",
    createReport: "Roaster mon chat", myReports: "Mes rapports", privacy: "Confidentialité", terms: "Conditions", help: "Aide",
    contact: "Contact", deleteData: "Supprimer mes données", adultOnly: "18 ans et plus",
  },
  seo: { title: "Roastin Has Notes — Ton groupe, sans filtre", description: "Importe une conversation WhatsApp et reçois un rapport privé, drôle et troublant de justesse sur les habitudes de ton groupe." },
  nav: { how: "Comment ça marche", data: "Tes données", faq: "FAQ" },
  landing: {
    ...en.landing,
    eyebrow: "Le rapport du groupe", titleBefore: "Ton chat a des", titleAccent: "secrets.", titleAfter: "Roastin a pris des notes.",
    subtitle: "Importe une conversation WhatsApp. Reçois le rapport sans filtre et étrangement juste que personne dans le groupe n’oserait écrire.",
    privacyNote: "La conversation originale n’est pas conservée après la génération", trust: ["Vérifié par WhatsApp", "Privé par défaut", "Prêt en quelques minutes"],
    ticker: ["Personne n’a demandé.", "Roastin a répondu.", "Les preuves sont là."],
    howEyebrow: "Ridiculement simple", howTitle: "Du groupe au premier rôle", howText: "Pas de questionnaire. Pas de quiz gênant. Roastin travaille avec ce que votre groupe a déjà dit.",
    steps: [
      { title: "Sors les dossiers", text: "Exporte ton chat WhatsApp et importe le fichier .txt ou .zip." },
      { title: "Roastin prend des notes", text: "Il repère les habitudes récurrentes et écrit un rapport ancré dans la conversation." },
      { title: "Lis, grimace, partage", text: "Découvre portraits, awards, private jokes et un verdict fait pour ton groupe." },
    ],
    reportEyebrow: "Un rapport que seul ton chat pouvait écrire", reportTitle: "Les tests de personnalité génériques peuvent aller se rhabiller.",
    reportText: "Chaque observation vient de comportements visibles : qui lance les plans, qui disparaît et qui ne connaît qu’un seul emoji.",
    features: ["Portraits des participants", "Awards du groupe", "Votre dictionnaire privé", "Dynamiques cachées", "Green, yellow et red flags", "Réactions prédites"],
    privacyEyebrow: "Ton chat reste à toi", privacyTitle: "Les potins sont chauds. Notre stockage du chat brut, non.",
    privacyText: "Nous avons besoin de la conversation pour créer le rapport. Elle est chiffrée dans un stockage temporaire pendant la génération, jamais enregistrée dans notre base applicative, puis supprimée à la fin du traitement.",
    privacyCards: [
      { title: "Un seul usage", text: "La conversation sert à générer ton rapport." },
      { title: "Original non conservé", text: "Le fichier brut est abandonné à la fin de la demande de génération." },
      { title: "Rapport privé", text: "Le rapport dérivé est stocké pour que tu puisses le retrouver et le supprimer." },
    ],
    faqEyebrow: "Avant de nous confier les potins", faqTitle: "Questions légitimes.",
    faqs: [
      { question: "Conservez-vous ma conversation ?", answer: "Nous n’enregistrons pas l’export original dans notre base applicative. Il est traité pour créer le rapport puis abandonné. Le rapport dérivé reste privé jusqu’à sa suppression." },
      { question: "Les autres vont-ils le savoir ?", answer: "Seulement si tu leur dis. Les rapports sont privés par défaut. Un lien de partage distinct peut être révoqué." },
      { question: "Est-ce méchant ?", answer: "Roastin vise les comportements répétés et les habitudes du groupe, jamais l’identité, l’apparence ou les traits sensibles." },
      { question: "Quels chats fonctionnent le mieux ?", answer: "Les groupes actifs avec plusieurs personnes sont idéaux, mais couples, meilleurs amis, familles et équipes fonctionnent aussi." },
    ],
    finalTitle: "Ton groupe a déjà écrit le spectacle.", finalText: "Roastin est juste assez courageux pour le dire à voix haute.", finalCta: "Sors les dossiers",
  },
  onboarding: {
    ...en.onboarding,
    step: "Étape", of: "sur", back: "Retour", continue: "Continuer", close: "Fermer",
    errors: { format: "Choisis un export WhatsApp .txt ou son archive .zip.", size: "Cette bêta accepte les conversations jusqu’à 2 Mo.", archive: "Cette archive ne contient pas d’export texte WhatsApp lisible.", short: "Pas assez de messages trouvés. Choisis un export texte WhatsApp non modifié.", generation: "Le rapport n’a pas pu être créé. Réessaie." },
    types: { eyebrow: "Pose le décor", title: "À quel genre de chat avons-nous affaire ?", text: "Chaque groupe a ses propres lois de la physique. Cela aide Roastin à lire la pièce.", options: {
      friends: { label: "Groupe d’amis", detail: "Le beau chaos" }, partner: { label: "Partenaire ou crush", detail: "À lire à tes risques" }, "best-friend": { label: "Meilleur ami", detail: "Une institution à deux" }, family: { label: "Famille", detail: "Légendes générationnelles incluses" }, work: { label: "Travail ou équipe", detail: "Professionnellement pas pro" }, other: { label: "Autre chose", detail: "Roastin comprendra" },
    } },
    context: { eyebrow: "Contexte facultatif", title: "Quelque chose à signaler à Roastin ?", text: "Une phrase suffit. Passe si les messages parlent d’eux-mêmes.", placeholder: "On se connaît depuis la fac et chaque départ en vacances devient six semaines de négociation…" },
    upload: { eyebrow: "Les dossiers", title: "Dépose ton export WhatsApp.", text: "Choisis le fichier .txt ou l’archive .zip d’un export sans médias. L’analyse initiale se fait dans ton navigateur avant tout envoi.", choose: "Choisir l’export .txt ou .zip", limits: "2 Mo maximum · Sans médias", messages: "messages", participants: "participants", replace: "Choisir un autre fichier", privacy: "Conversation originale abandonnée après génération", sample: "Essayer plutôt le chat d’exemple" },
    review: { eyebrow: "Casting", title: "Vérifie qu’on a bien lu la salle.", text: "Utilise des prénoms ou surnoms. Ce sont les noms affichés dans le rapport.", chatName: "Nom du chat", participantName: "Nom affiché", invalidNames: "Chaque personne doit avoir un prénom ou surnom unique." },
    verification: { eyebrow: "Une dernière étape", title: "Garde ton rapport.", text: "Vérifie maintenant ton numéro WhatsApp pour créer le rapport et recevoir son lien privé.", phoneLabel: "Numéro WhatsApp", consent: "J’accepte de recevoir le code de vérification et les liens transactionnels du rapport sur WhatsApp. Aucun message marketing.", sendCode: "Envoyer le code sur WhatsApp", codeTitle: "Regarde sur WhatsApp.", codeText: "Nous avons envoyé un code à six chiffres au {phone}.", codeLabel: "Code à six chiffres", verifyAndLaunch: "Vérifier et créer mon rapport", differentNumber: "Utiliser un autre numéro", sessionExpired: "Ta session a expiré. Vérifie ton numéro WhatsApp pour continuer." },
    launch: { ready: "Roastin est prêt pour", messages: "messages", protagonists: "protagonistes", warning: "Ils n’ont aucune idée de ce qu’ils vont apprendre.", cards: ["Habitudes", "Portraits", "Verdict"], consent: "Je confirme avoir 18 ans ou plus, que cette conversation n’implique pas de mineurs et consentir à son traitement temporaire pour créer le rapport.", loading: "Lecture entre les lignes. Cela peut prendre une minute…", cta: "Laisser Roastin cuisiner" },
  },
  pages: {
    privacy: { eyebrow: "Confidentialité", title: "Ce que nous traitons, conservons et supprimons", intro: "Cette notice en langage clair décrit le produit tel qu’il fonctionne aujourd’hui. Elle ne prétend pas que nous ne stockons rien.", sections: [
      { title: "La conversation originale", paragraphs: ["Ton navigateur lit localement l’export pour le premier résumé. À la demande du rapport, la conversation est transmise par HTTPS, nettoyée des emails et numéros évidents, puis chiffrée en AES-256-GCM dans un stockage temporaire avant son traitement par le worker et le fournisseur d’IA configuré.", "Le payload chiffré est exclu de la base applicative et des sauvegardes. Il est supprimé après succès, échec ou annulation, avec une expiration automatique sous 24 heures comme ultime filet de sécurité. Les conditions propres du fournisseur d’IA continuent de s’appliquer."] },
      { title: "Ce que nous conservons", paragraphs: ["Nous stockons le rapport dérivé et son aperçu, le nom du chat, la langue, les totaux agrégés, les dates, l’identifiant réel du modèle, le coût exact de génération en dollars et en euros, le taux de change utilisé et la trace de fin du traitement brut."], bullets: ["Un jeton de session temporaire haché côté serveur", "Ton numéro WhatsApp vérifié chiffré au repos, son empreinte, le consentement et les codes de connexion temporaires", "Les références Stripe de paiement", "Les liens de partage et de livraison révocables", "Le template WhatsApp, l’identifiant fournisseur et le statut de livraison"] },
      { title: "Finalités et durées", paragraphs: ["Ces données servent à fournir et sécuriser le service, exécuter les achats, prévenir les abus et respecter les obligations comptables. Les rapports restent jusqu’à leur suppression. Les sessions expirent actuellement après 30 jours et les liens de livraison après 7 jours."], bullets: ["La durée finale des numéros WhatsApp chiffrés n’est pas encore configurée ; leur retrait immédiat est possible depuis le rapport.", "Les logs ne doivent pas contenir de messages, mais les prestataires peuvent garder des métadonnées techniques selon leurs politiques."] },
      { title: "Tes choix", paragraphs: ["Tu peux supprimer un rapport depuis sa page privée, révoquer ses liens et retirer les données de livraison WhatsApp. Pour l’accès, la rectification, l’export ou la suppression d’un compte, utilise la page contact. Certaines traces de transaction peuvent rester si la loi l’impose."] },
      { title: "Sous-traitants et transferts", paragraphs: ["Selon les fonctions activées, les données peuvent être traitées par l’hébergeur, la base de données, OpenRouter et le modèle choisi, Stripe et Meta pour l’authentification et la livraison transactionnelle WhatsApp. Leurs localisations et garanties doivent être documentées avant lancement."] },
      { title: "Statut avant lancement", paragraphs: ["L’entité responsable de traitement, son adresse, le contact dédié, les bases légales par pays et le calendrier de conservation final ne sont pas encore configurés. Le service ne doit pas être présenté comme juridiquement prêt avant leur validation et celle du traitement des non-utilisateurs."] },
    ] },
    terms: { eyebrow: "Conditions", title: "Règles d’utilisation de Roastin", intro: "Ces conditions bêta expliquent les limites du produit. Les informations finales sur la société et le droit applicable restent requises avant lancement commercial.", sections: [
      { title: "Qui peut l’utiliser", paragraphs: ["Tu dois avoir au moins 18 ans. N’importe pas de conversation impliquant des mineurs. Tu dois disposer d’une base légale et des autorisations nécessaires pour traiter et partager la conversation."] },
      { title: "Usage acceptable", paragraphs: ["N’utilise pas Roastin pour harceler, menacer, discriminer, exposer des coordonnées, prendre des décisions importantes ou analyser du contenu illégal. Ne contourne pas les contrôles d’accès."] },
      { title: "Le rapport", paragraphs: ["Les rapports sont un divertissement automatisé fondé sur des comportements visibles. Ils peuvent être inexacts et ne sont ni un diagnostic ni un conseil médical, juridique, professionnel ou relationnel. Relis avant de partager."] },
      { title: "Achats", paragraphs: ["Un rapport est un achat numérique unique via Stripe. Le prix et la devise affichés au paiement s’appliquent. Les règles de remboursement, rétractation et fiscalité doivent être finalisées par marché avant ouverture payante."] },
      { title: "Disponibilité et responsabilité", paragraphs: ["La bêta peut changer, tomber en panne ou être retirée. Rien n’exclut les droits ou responsabilités qui ne peuvent légalement l’être. Le droit applicable et les litiges attendent la revue juridique."] },
    ] },
    help: { eyebrow: "Aide", title: "Un export propre pour un meilleur rapport", intro: "Les réponses rapides sur l’import, la confidentialité, l’accès et le partage.", sections: [
      { title: "Exporter depuis WhatsApp", paragraphs: ["Ouvre le chat, choisis Exporter discussion, sélectionne Sans médias, puis importe le .txt ou .zip obtenu. La bêta accepte 2 Mo maximum."] },
      { title: "Problèmes d’import", paragraphs: ["Utilise un export texte WhatsApp original avec au moins deux participants et huit messages. N’envoie ni captures, ni PDF, ni archive de médias."] },
      { title: "Confidentialité et sécurité", paragraphs: ["L’export original n’est pas stocké dans notre base applicative. Les rapports sont privés par défaut. Le produit refuse les conversations qui semblent impliquer des mineurs et retire les emails et numéros évidents avant l’IA."] },
      { title: "Accès et partage", paragraphs: ["Connecte-toi avec ton numéro WhatsApp vérifié pour créer et retrouver tes rapports. Après paiement, le lien privé valable sept jours est envoyé automatiquement à ce numéro. Les liens de partage distincts restent révocables."] },
    ] },
    contact: { eyebrow: "Contact", title: "Parler à un humain", intro: "Pour l’aide produit, les demandes de confidentialité ou la sécurité, utilise la conversation WhatsApp officielle de Roastin sans inclure le contenu du chat.", sections: [
      { title: "Support", paragraphs: ["Envoie l’identifiant du rapport et une courte description dans la conversation WhatsApp officielle de Roastin. Ne joins jamais l’export."] },
      { title: "Demandes de confidentialité", paragraphs: ["Utilise l’objet « Demande de confidentialité ». Nous pouvons vérifier que tu contrôles le rapport ou le compte. Le délai officiel et le contact du responsable seront confirmés avant lancement."] },
      { title: "Sécurité", paragraphs: ["Commence par « Signalement de sécurité » et évite d’inclure des détails exploitables. Le canal WhatsApp Business doit être créé et surveillé avant lancement."] },
    ] },
    delete: { eyebrow: "Suppression", title: "Supprimer un rapport ou ton compte", intro: "La suppression d’un rapport est disponible depuis sa page privée et la suppression globale depuis les paramètres du compte.", sections: [
      { title: "Supprimer un rapport", paragraphs: ["Ouvre le rapport privé dans le navigateur ou le compte propriétaire et choisis Supprimer. Le contenu et l’aperçu sont vidés et les liens cessent de fonctionner. Les traces de paiement peuvent rester si la loi l’exige."] },
      { title: "Retirer un numéro WhatsApp", paragraphs: ["Depuis le rapport payé, retire les données de livraison. Le numéro chiffré et son empreinte sont effacés, et les liens de livraison révoqués."] },
      { title: "Supprimer un compte", paragraphs: ["Ouvre les paramètres du compte après connexion avec ton numéro WhatsApp vérifié, puis choisis la suppression définitive. N’envoie jamais la conversation au support."] },
    ] },
  },
} satisfies Dictionary;

export default dictionary;
