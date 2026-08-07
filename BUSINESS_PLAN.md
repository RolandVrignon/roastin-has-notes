# Business plan — Roastin Has Notes

> Version 1.0 — 7 août 2026  
> Horizon : lancement et douze premiers mois  
> Marché initial : France, puis Europe occidentale francophone et anglophone

## 1. Résumé exécutif

`Roastin Has Notes` transforme une exportation WhatsApp en rapport éditorial privé, drôle, mordant et partageable. Le produit monétise la curiosité déjà créée par l'aperçu : le rapport Classic est vendu 11,99 € en paiement unique et le quiz interactif est proposé ensuite à 4,99 €.

La thèse de croissance est virale : une personne achète, partage le rapport dans son groupe, puis plusieurs lecteurs veulent analyser leur propre conversation. TikTok, Instagram et Facebook servent à acquérir le grand public ; LinkedIn sert surtout à construire la marque, raconter les coulisses et crédibiliser le fondateur.

La principale menace n'est pas le prix de Stripe ou l'hébergement. C'est le coût des utilisateurs qui génèrent un rapport complet puis ne paient pas. Le rapport réel de 4 507 messages traité avec Grok 4.5 a coûté 0,8376 € en IA. Si ce coût est engagé pour 100 % des utilisateurs mais que seuls 5 % paient, le produit perd de l'argent avant même d'acheter le moindre clic.

### Décision stratégique

Il faut distinguer agressivité éditoriale et agressivité budgétaire :

- Publier immédiatement avec une cadence très élevée.
- Ne pas accélérer fortement les dépenses publicitaires tant que l'aperçu gratuit ne coûte pas 0,15 € ou moins.
- Générer l'analyse complète et le rapport long après paiement.
- Exiger au moins 10 % de conversion aperçu → achat avant le passage à l'échelle.
- Viser un CAC Classic inférieur ou égal à 4 € et un CAC blended inférieur ou égal à 3,50 € après effet viral.

## 2. Produit et proposition de valeur

### Problème

Les groupes de messagerie contiennent des années de running gags, de contradictions, d'organisations ratées et de rôles implicites. Ces éléments ont une forte valeur émotionnelle, mais personne ne les transforme en contenu lisible et partageable.

### Solution

Roastin produit un magazine privé du groupe :

- Ouverture personnalisée.
- Portrait et personnalité conversationnelle de chaque participant.
- Citations présentées comme des messages WhatsApp.
- Awards, dictionnaire, dynamiques et flags.
- Verdict final plus trash, mais toujours fondé sur les comportements observés.
- Quiz de groupe optionnel.

### Différenciation

- Le produit part des preuves réelles du chat, pas d'un questionnaire générique.
- Le résultat est un contenu de divertissement fini, pas une interface d'IA.
- Le rapport se partage naturellement avec les personnes directement concernées.
- La conversation brute est supprimée après génération.
- La narration est localisée culturellement, pas traduite mot à mot.

## 3. Clients et usages prioritaires

### Cœur de cible

- 18–35 ans.
- Groupes d'amis, meilleurs amis, couples, fratries et colocations.
- Utilisateurs actifs de WhatsApp et consommateurs de Reels/TikTok.
- Acheteurs d'impulsion pour un anniversaire, un week-end, un mariage, un voyage ou une soirée.

### Segments de lancement

1. Groupes d'amis de longue durée : historique riche et forte envie de partage.
2. Couples et meilleurs amis : forte curiosité, moins de participants, génération moins chère.
3. Familles et fratries : contenu reconnaissable et forte distribution Facebook/Instagram.
4. EVJF, EVG, anniversaires et voyages : intention d'achat et échéance immédiate.

### Segments à éviter au démarrage

- Conversations professionnelles confidentielles.
- Groupes contenant des mineurs.
- Conversations utilisées dans un contexte de harcèlement, litige ou surveillance.
- Très gros groupes sans relation claire entre les participants.

## 4. Offre et tarification

### Classic — 11,99 € TTC

- Rapport complet.
- Personnalités incluses.
- Paiement unique.
- Lien privé et partage révocable.

### Quiz — 4,99 € TTC

- Supplément après achat de Classic.
- Aucun nouvel appel IA : marge incrémentale très forte.
- Questions produites depuis les citations, awards et expressions déjà enregistrés.

### Tests de prix à prévoir

- Contrôle : Classic 11,99 €.
- Variante : Classic 14,99 €.
- Bundle : Classic + Quiz à 14,99 € au lieu de 16,98 €.
- Ne lancer le test qu'après 100 achats afin de ne pas tirer de conclusion sur un échantillon trop faible.
- Juger le revenu net par visite et non le seul taux de conversion.

## 5. Économie unitaire

### Hypothèses prudentes

| Variable | Hypothèse |
|---|---:|
| Classic TTC | 11,99 € |
| Quiz TTC | 4,99 € |
| TVA de modélisation | 20 % |
| Stripe carte EEE | 1,5 % + 0,25 € |
| Coût IA d'un gros rapport complet | 0,84 € |
| Objectif coût aperçu gratuit | 0,15 € maximum |
| Taux d'attachement Quiz | 20 % |
| Remboursements et gestes commerciaux | 3 % du revenu net |

Stripe affiche actuellement 1,5 % + 0,25 € pour une carte standard de l'EEE et 20 € pour un litige reçu. Les cartes internationales et la conversion de devise coûtent davantage ; le modèle doit donc conserver une marge de sécurité. [Tarification Stripe France](https://stripe.com/fr/pricing)

### Marge d'une commande payée

Classic à 11,99 € :

- Revenu hors TVA : 9,99 €.
- Frais Stripe estimés : 0,43 €.
- Revenu après TVA et Stripe : 9,56 €.
- Coût IA complet prudent : 0,84 €.
- Contribution Classic avant acquisition, support et infrastructure : 8,72 €.

Quiz à 4,99 € :

- Revenu hors TVA : 4,16 €.
- Frais Stripe estimés : 0,32 €.
- Contribution avant coûts fixes : 3,83 €.
- Avec 20 % d'attachement, le Quiz ajoute environ 0,77 € de contribution attendue par acheteur Classic.

Contribution moyenne attendue par acheteur, avant acquisition et coûts fixes : environ 9,49 €.

### Le problème des non-payeurs

Le tableau suivant simule 1 000 utilisateurs arrivés jusqu'à la génération. Il suppose le coût prudent de 0,84 € pour un rapport complet et 20 % d'attachement Quiz. Les résultats sont avant publicité, infrastructure, remboursement et support.

| Conversion aperçu → Classic | Acheteurs | Architecture actuelle : contribution | Aperçu à 0,15 € puis complet après paiement |
|---:|---:|---:|---:|
| 5 % | 50 | -324 € | +324 € |
| 10 % | 100 | +193 € | +799 € |
| 15 % | 150 | +709 € | +1 273 € |
| 25 % | 250 | +1 742 € | +2 222 € |

Avec l'architecture actuelle, le point mort avant publicité se situe autour de 8–9 % de conversion pour une conversation coûteuse. À 10 %, il ne reste qu'environ 1,93 € par acheteur pour financer l'acquisition et tout le reste. Ce n'est pas scalable.

Avec un aperçu à 0,15 € et la génération complète après paiement, il reste environ 7,99 € par acheteur à 10 % de conversion. Un CAC de 4 € devient possible tout en gardant une réserve pour l'infrastructure, les remboursements et le support.

## 6. Architecture économique recommandée

### Phase gratuite

1. Parsing et statistiques déterministes dans le navigateur.
2. Échantillonnage stratifié de la conversation : début, fin, périodes actives et messages représentatifs de chaque participant.
3. Analyse courte avec un modèle moins cher ou une enveloppe stricte de tokens.
4. Génération du titre, de l'ouverture et de deux extraits seulement.
5. Budget maximal serveur : 0,15 € par aperçu.

### Après paiement

1. Confirmation serveur du paiement.
2. Analyse complète avec Grok 4.5.
3. Rédaction du rapport long.
4. Affichage de la progression réelle.
5. Suppression de la conversation brute.
6. Déblocage et livraison WhatsApp transactionnelle.

### Protection contre l'abus

- Un aperçu gratuit par numéro vérifié sur une période glissante de sept jours.
- Vérification WhatsApp placée juste avant le premier appel IA payant, après l'import et la personnalisation afin de conserver une faible friction initiale.
- Limites par IP, appareil, numéro et empreinte normalisée de conversation.
- CAPTCHA adaptatif seulement après signal de risque.
- Plafond de messages, participants, tokens et coût par génération.
- Refus ou offre premium spécifique pour les conversations hors plafond.
- Kill switch journalier OpenRouter et alerte lorsque le coût moyen dépasse 0,20 € pour l'aperçu ou 1 € pour le rapport complet.
- Déduplication des retries et des workflows Temporal.
- Aucun second rapport gratuit si le même contenu est renvoyé avec un nom différent.

L'empreinte anti-abus doit avoir une durée de vie courte, être documentée comme donnée de sécurité et ne jamais permettre de reconstruire la conversation.

## 7. Entonnoir et métriques

### Funnel principal

`Impression → visite → import → aperçu → paywall → checkout → paiement → quiz → partage → nouveau créateur`

### Tableau de bord quotidien

| KPI | Alerte | Objectif de passage à l'échelle |
|---|---:|---:|
| Visite → début d'import | < 12 % | ≥ 20 % |
| Début → import valide | < 60 % | ≥ 80 % |
| Import → aperçu | < 80 % | ≥ 90 % |
| Aperçu → checkout | < 12 % | ≥ 20 % |
| Aperçu → paiement | < 8 % | ≥ 10 %, cible 12–15 % |
| Checkout → paiement | < 60 % | ≥ 75 % |
| Coût moyen aperçu | > 0,20 € | ≤ 0,15 € |
| Coût P95 rapport complet | > 1,20 € | ≤ 1 € |
| CAC Classic | > 5 € | ≤ 4 € |
| Attachement Quiz | < 10 % | ≥ 20 % |
| Acheteur → partage | < 20 % | ≥ 30 % |
| Rapport partagé → nouveau démarrage | < 3 % | ≥ 5 % |
| Remboursements | > 5 % | < 3 % |
| Échec de génération | > 5 % | < 2 % |

### Règles de décision

- Couper une campagne si son CAC dépasse 6 € après un volume significatif sans tendance d'amélioration.
- Ne jamais compenser une mauvaise conversion produit par davantage de budget média.
- Augmenter un budget de 20 à 30 % par palier, pas le multiplier brutalement.
- Mesurer séparément acquisition payante, organique, partage et créateurs.
- Attribuer une valeur au partage : le bon KPI est le CAC blended, pas uniquement le CAC de la plateforme publicitaire.

## 8. Positionnement de communication

### Promesse

> Donne-lui votre groupe WhatsApp. Roastin ressort les preuves que personne n'avait intérêt à relire.

### Ton

- Agressif dans l'accroche.
- Très concret dans la démonstration.
- Trash dans les punchlines, jamais dans la protection des données.
- Aucune promesse vague du type « découvre ta personnalité grâce à l'IA ».
- Le produit doit être visible dans les deux premières secondes.

### Hooks prioritaires

- « 4 507 messages. 9 suspects. Aucun innocent. »
- « On a donné quatre ans de WhatsApp à Roastin. Il a détruit le groupe en 90 secondes. »
- « Le pote qui écrit “j'arrive” depuis son lit va enfin être jugé. »
- « Ton groupe appelle ça des private jokes. Roastin appelle ça des preuves. »
- « Les tests de personnalité peuvent mentir. Vos messages, non. »
- « Ne donne jamais ton groupe WhatsApp à une IA qui sait écrire des punchlines. »

## 9. Plan de communication agressif

### Répartition des rôles

| Canal | Rôle | Part du budget média initial |
|---|---|---:|
| TikTok | Découverte, volume créatif, UGC | 35 % |
| Instagram | Reels, preuve visuelle, retargeting | 30 % |
| Facebook | Reels, familles, couples, retargeting | 20 % |
| Créateurs et whitelisting | Confiance et production native | 10 % |
| LinkedIn | Amplification sélective du fondateur | 5 % maximum |

La cadence peut être agressive partout, mais LinkedIn ne doit pas recevoir une grande part du budget de conversion B2C. LinkedIn recommande lui-même d'éviter le contenu trop commercial et de partir d'idées fraîches et de thought leadership. Le canal doit raconter le produit, les chiffres et les décisions de construction avant de vendre. [Guide LinkedIn Marketing Solutions](https://business.linkedin.com/advertise/ads/how-to-market-on-linkedin)

### TikTok

Cadence : deux à trois vidéos par jour pendant 60 jours.

- 40 % révélations de rapport.
- 20 % personnages universels du groupe.
- 20 % réactions filmées avec consentement.
- 10 % coulisses et fabrication.
- 10 % confidentialité et suppression des données.

Formats : face caméra, split screen, écran du rapport, faux chat synthétique et réaction immédiate. TikTok recommande le format vertical 9:16, le son, une esthétique native peu polie, une proposition dans les trois premières secondes et un hook dans les six premières. [Bonnes pratiques créatives TikTok](https://ads.tiktok.com/help/article/creative-best-practices?lang=en)

### Instagram

Cadence :

- Deux Reels par jour.
- Trois carrousels par semaine.
- Stories quotidiennes : sondages, extraits, coulisses et réponses aux objections.
- Un live hebdomadaire de roast sur une conversation synthétique ou consentie.

Utiliser le même moteur créatif que TikTok, mais remonter la qualité visuelle, le branding et les carrousels partageables. Meta indique que les Reels 9:16 avec audio et éléments importants dans la safe zone obtiennent de meilleurs résultats que de simples images dans ses tests. [Reels Ads Meta](https://www.facebook.com/business/ads/facebook-instagram-reels-ads)

### Facebook

Cadence :

- Un Reel par jour.
- Trois publications communautaires par semaine.
- Retargeting des visiteurs consentis et des personnes ayant vu 50 % d'une vidéo.
- Angles familles, fratries, couples, mariages et groupes de vacances.

Ne pas spammer les groupes Facebook avec des liens. Apporter d'abord un contenu autonome et drôle, puis proposer le produit lorsque les règles du groupe l'autorisent.

### LinkedIn

Cadence : cinq publications fondateur par semaine.

Piliers :

1. Build in public : coût réel d'un rapport, modèle choisi et arbitrages.
2. Produit : avant/après du tunnel, sans contenu privé.
3. Business : taux de conversion, échecs et décisions de prix.
4. IA responsable : suppression, minimisation, sécurité et limites du roast.
5. Distribution : ce qui marche réellement sur TikTok et Meta.

Exemples :

- « Notre premier rapport Grok a coûté 0,84 €. Le vrai problème n'est pas l'IA : ce sont les 90 % qui ne paieront peut-être jamais. »
- « J'ai construit un produit qui lit 4 507 messages puis juge neuf adultes. Voici pourquoi je supprime la source avant même de savoir s'ils vont payer. »
- « On ne vend pas un chatbot. On vend le magazine privé d'un groupe WhatsApp. »

Booster uniquement les publications organiques qui ont déjà prouvé leur capacité à générer des commentaires qualifiés ou des visites. Les Thought Leader Ads peuvent amplifier un post existant du fondateur, sans CTA ajouté par la publicité. [Spécifications LinkedIn Thought Leader Ads](https://business.linkedin.com/advertise/ads/sponsored-content/thought-leader-ads/specs)

## 10. Machine créative

### Cadence de production hebdomadaire

- Lundi : tourner 12 hooks face caméra.
- Mardi : enregistrer 6 démonstrations produit.
- Mercredi : monter 15 variantes courtes.
- Jeudi : publier les résultats, dupliquer les deux meilleures et changer uniquement le hook.
- Vendredi : tourner trois réactions consenties ou scénarios synthétiques.
- Week-end : formats couples, groupes d'amis, fêtes et voyages.

### Matrice de test

Chaque concept produit :

- Trois hooks.
- Deux durées : 12–15 secondes et 20–25 secondes.
- Deux CTA : « importe ton chat » et « juge ton groupe ».
- Deux preuves : capture du rapport et réaction visage.

Un concept représente donc 24 combinaisons possibles, mais seules quatre à six variantes sont lancées simultanément afin de garder un budget lisible.

### Réutilisation

- TikTok performant → Reel Instagram → Reel Facebook.
- Résultat chiffré → post LinkedIn.
- Punchline → carousel Instagram.
- Commentaire utilisateur → nouvelle vidéo réponse.
- Extrait partageable → créateur partenaire.

## 11. Budget marketing sur 90 jours

### Prérequis : zéro accélération avant les garde-fous

Avant le premier euro média significatif :

- Analytics complet du funnel.
- Coût aperçu ≤ 0,15 €.
- Tracking du coût IA par rapport.
- Rate limiting et plafond budgétaire.
- 20 créations prêtes.
- Pages légales et consentement analytics.

### Mois 1 — validation : 1 500 €

- 500 € TikTok.
- 400 € Instagram.
- 300 € Facebook.
- 150 € créateurs/UGC.
- 150 € LinkedIn ou réserve.

Objectif : identifier trois hooks générant des imports, pas maximiser les impressions.

### Mois 2 — confirmation : 3 500 €

Condition : conversion aperçu → paiement ≥ 10 % et CAC ≤ 5 €.

- Amplifier les trois meilleurs concepts.
- Lancer retargeting Meta.
- Tester cinq micro-créateurs.
- Tester 11,99 € contre 14,99 €.

### Mois 3 — accélération : 7 000 €

Condition : CAC ≤ 4 €, remboursement < 3 %, partage ≥ 25 % et génération stable.

- 60 % acquisition directe.
- 20 % retargeting.
- 15 % créateurs/whitelisting.
- 5 % expérimentations LinkedIn et nouveaux marchés.

Budget 90 jours maximal : 12 000 €. S'il manque un seul garde-fou économique, conserver la cadence organique et geler la hausse média.

## 12. Projection financière à douze mois

Ces projections sont des scénarios de pilotage, pas des prévisions comptables. Elles utilisent le funnel à deux étapes, un coût d'aperçu de 0,15 €, un coût complet de 0,84 €, les frais Stripe EEE, une TVA de modélisation à 20 % et une réserve de remboursement de 3 %. Elles excluent la rémunération du fondateur et l'impôt sur les sociétés.

| Scénario annuel | Aperçus | Conversion | Classic payés | Quiz | CA TTC | Contribution avant rémunération fondateur |
|---|---:|---:|---:|---:|---:|---:|
| Prudent | 30 000 | 8 % | 2 400 | 360 | 30 572 € | négative, environ -13 k€ |
| Base | 100 000 | 12 % | 12 000 | 2 400 | 155 856 € | environ +29 k€ |
| Croissance | 300 000 | 15 % | 45 000 | 11 250 | 595 688 € | environ +173 k€ |

### Hypothèses de coûts des scénarios

Scénario prudent : CAC média 5 €, faible levier organique et 18 k€ de coûts fixes/créatifs annuels.

Scénario base : CAC média 3 €, 30 k€ de coûts fixes, créatifs, support, outils, juridique et infrastructure.

Scénario croissance : CAC média 2,50 € grâce au partage et aux créateurs, 90 k€ de coûts fixes et équipe élargie.

Le scénario prudent montre pourquoi il ne faut pas acheter du volume avant le product-market fit. Le scénario base devient crédible uniquement avec une forte production organique, un partage réel et un aperçu très peu coûteux.

## 13. Organisation et opérations

### Jusqu'à 1 000 ventes mensuelles

- Fondateur : produit, data et LinkedIn.
- Freelance/alternant contenu : montage et publication.
- Micro-créateurs rémunérés au forfait et à la performance.
- Support asynchrone sous 24 heures.
- Expert-comptable et juriste externes.

### Au-delà de 1 000 ventes mensuelles

- Responsable contenu/creator ops.
- Support client à temps partiel puis temps plein.
- Ingénieur ou ops pour fiabilité, coûts et fraude.
- Reporting financier hebdomadaire par devise et marché.

### Réserves

- 3 % du revenu net pour remboursements et gestes commerciaux.
- Réserve spécifique pour litiges carte, qui peuvent coûter 20 € chacun chez Stripe.
- Budget juridique et sécurité avant internationalisation.
- Trésorerie de trois mois de coûts fixes avant recrutement.

## 14. Confidentialité, conformité et confiance

Le produit traite les messages de personnes qui ne sont pas nécessairement l'acheteur. Ce point doit être traité comme un risque fondateur, pas comme une simple case à cocher.

- Faire valider la base légale et l'information des participants par un juriste RGPD.
- Maintenir l'interdiction des conversations impliquant des mineurs.
- Obtenir une confirmation explicite que l'utilisateur est autorisé à importer la conversation.
- Limiter les données à ce qui est nécessaire pour le rapport.
- Supprimer la conversation brute rapidement et rendre cette suppression vérifiable.
- Ne jamais réutiliser les conversations pour entraîner un modèle.
- Contractualiser la rétention et les transferts avec les fournisseurs IA.
- Obtenir un consentement valide avant pixels marketing et retargeting en Europe.
- Prévoir export, suppression, révocation des liens et journal des incidents.
- Utiliser uniquement des conversations synthétiques dans les publicités, sauf consentement documenté de tous les participants concernés.
- Ne jamais suggérer une affiliation officielle avec WhatsApp ou Meta.

La CNIL rappelle que les données personnelles doivent être adéquates, pertinentes et limitées à ce qui est nécessaire, avec une vigilance renforcée lorsque des données sensibles peuvent apparaître. [Protection des données dès la conception — CNIL](https://www.cnil.fr/fr/tenir-compte-de-la-protection-des-donnees-dans-la-conception-du-systeme)

## 15. Risques et réponses

| Risque | Impact | Réponse |
|---|---|---|
| Trop de non-payeurs | Marge détruite | Aperçu plafonné, complet après paiement, rate limit |
| Conversation très longue | Coût et temps explosent | Échantillonnage, limite tokens, surcharge premium |
| Créatives qui fatiguent | CAC augmente | 15 variantes par semaine, rotation continue |
| Roast jugé trop violent | Remboursements et bad buzz | Intensité claire, signalement, garde-fous, exemples avant achat |
| Rapport générique | Conversion faible | Citations exactes, scoring de spécificité, QA automatique |
| Fuite de données | Risque existentiel | Minimisation, chiffrement, suppression, audit et DPA |
| Abus contre une personne | Risque humain et réputation | Consentement, blocage mineurs, safety, suppression urgente |
| Dépendance Grok/OpenRouter | Prix ou qualité change | Routage multi-modèle, budgets, tests de régression |
| Stripe/WhatsApp suspendu | Vente ou livraison bloquée | Accès web autonome, monitoring et procédures d'appel |
| Chargebacks | Frais disproportionnés | Descripteur clair, preuve de livraison, remboursement rapide |
| Expansion trop rapide | Support et qualité chutent | France d'abord, langues activées par cohortes |

## 16. Roadmap commerciale

### Jours 1–14

- Instrumenter coûts et funnel.
- Concevoir l'aperçu à 0,15 € maximum.
- Produire 20 vidéos françaises.
- Recruter 30 bêta-testeurs.
- Mesurer la conversion sans publicité importante.

### Jours 15–30

- Lancer 1 500 € de tests média.
- Obtenir 100 achats cumulés.
- Tester le prix et le bundle.
- Lancer le programme micro-créateurs.
- Publier quotidiennement les coulisses sur LinkedIn.

### Jours 31–60

- Garder uniquement les trois meilleurs angles.
- Retargeting Meta avec consentement.
- Mesurer le coefficient viral.
- Améliorer le partage WhatsApp et les cartes partageables.
- Décider si le CAC justifie 3 500 € au mois 2.

### Jours 61–90

- Accélérer uniquement si les seuils sont atteints.
- Préparer l'anglais avec des créations natives.
- Négocier cinq partenariats créateurs récurrents.
- Automatiser reporting, remboursement et alertes coût.

### Mois 4–12

- France rentable avant expansion.
- Déploiement anglais, puis espagnol/italien selon la traction organique.
- Nouveaux produits à marge forte : cartes partageables, rapport couple, événement, bundle.
- Ne pas ajouter un abonnement tant qu'un usage réellement récurrent n'est pas démontré.

## 17. Conditions de passage à l'échelle

Roastin peut augmenter fortement son budget uniquement lorsque les cinq conditions suivantes sont vraies sur une cohorte d'au moins 200 achats :

1. Aperçu → achat ≥ 10 %.
2. CAC Classic ≤ 4 €.
3. Coût aperçu ≤ 0,15 € et coût complet P95 ≤ 1 €.
4. Remboursement < 3 % et échec de génération < 2 %.
5. Au moins 25 % des acheteurs partagent le rapport.

Si ces conditions ne sont pas réunies, la bonne réponse n'est pas davantage de publicité. C'est une meilleure qualité de rapport, une promesse plus claire, un aperçu moins cher ou un prix mieux calibré.

## 18. Décision finale

Le produit a un potentiel de distribution très fort, car son résultat implique plusieurs personnes et produit naturellement des réactions. Mais son économie ne pardonne pas une génération complète gratuite pour une majorité de non-payeurs.

La stratégie recommandée est donc :

1. Repenser immédiatement la génération gratuite.
2. Publier massivement sur TikTok, Instagram, Facebook et LinkedIn.
3. Garder LinkedIn organique et fondateur-led.
4. Mettre l'essentiel du média sur TikTok et Meta.
5. Piloter chaque hausse de budget par le CAC, la conversion, le coût IA et le partage.
6. Faire de la confidentialité une preuve produit, pas une note de bas de page.

Communication agressive : oui. Croissance achetée à perte : non.
