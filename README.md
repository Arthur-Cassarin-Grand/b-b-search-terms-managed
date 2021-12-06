# Google Ads Search Terms Managed Detector

Extrait les termes de recherche d'un compte, les classe et les ordonne en fonction de leur intérêt à être gérés sur le compte en [exact] dans une campagne Managed (1 groupe d'annonce = 1 mot-clé) pour gérer finement les enchères, afin d'obtenir les meilleures performances. L'affichage se fait dans un Google Spreadsheet généré en sortie du script.

## COMMENT LE LANCER

1. Aller dans votre compte Google Ads > "Outils et paramètres" > "Actions groupées" > "Scripts"
2. Créer un script, le nommer comme vous voulez.
3. Copier-coller le code du script.
4. Modifier la ligne 21 : indiquer l'URL de votre fichier Spreadsheet de sortie (attention : le script efface toute donnée existante dans le premier onglet).
5. Modifier les variables de filtres dans la section "Min-Max settings" du code (section suivante).
6. Enregistrer.
7. Cliquer sur "Aperçu".
8. Il vous demandera des autorisations, faites "Autoriser" et accorder les droits demandés.
9. Recommencer en appuyant sur "Aperçu".
10. Attendre. Le fichier Spreadsheet se remplira.

Le script mets en général quelques minutes à s'exécuter.
Il n'effectue aucune opération sur le compte (lecture seule), donc vous pouvez l'utiliser sans risque sur n'importe quel compte.
Si le script mets plus de 30 min à terminer, Google l'arrête automatiquement. Essayez de prendre une plage de date plus réduite dans ce cas.

## FILTRES DISPONIBLES

Modifier les variables de filtres dans la section "Min-Max settings" du code (ligne 23)

- lastNDays : extraire les search terms des X derniers jours (sans aujourd'hui)
- minImpressions : le nombre minimal d'impressions de chaque TDR doit être supérieur ou égal à X
- minClicks : le nombre minimal de clics de chaque TDR doit être supérieur ou égal à X
- minConversions : le nombre minimal de conversions de chaque TDR doit être supérieur ou égal à X
- minConversionValue : le volume de valeur de conversion (CA par ex.) de chaque TDR doit être supérieur ou égal à X
- maxCPA : le coût par acquisition de chaque TDR doit être inférieur ou égal à X
- minCost : le coût total de chaque TDR doit être supérieur ou égal à X

Autres paramètres (cas spécifiques) :

- currency : permet de changer la devise dans le Spreadsheet (pour les coûts/conv et les conv. value)
- suffixForManagedCampaigns : permet de personnaliser le suffixe proposé pour la nouvelle campagne managed à créer
- defaultManagedMatchType : par défaut, les suggestions de mots-clés managed seront en exact, si vous voulez mettre des expressions, mettez "phrase" à la place.
- prioritizeConversionValue : (pour le score de pertinence) : permet de ne pas considérer la valeur de conversion dans le calcul de la pertinence. Utile si le tracking e-commerce du compte est bugué ou si vous avez défini pour vos conversions (en B2B par ex.) des valeurs de conversions arbitraires pour vos conversions (lead signé, lead pourri, etc.) et que vous ne voulez pas considérer ces valeurs dans le calcul de la pertinence.