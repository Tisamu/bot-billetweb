# Bot billetweb.fr 🤖

J'ai dev ce bot à l'occasion du DevFest mais il est utilisable sur n'importe quel billetterie BilletWeb.

## 🚨 Disclaimer

**Même si ce bot fonctionne très bien**, nous ne sommes pas à l'abris que le DevFest change un nom de billet au dernier moment
pour palier à ce genre de pratiques.

▶️ Je recommande donc de quand même tenter un process classique de billetterie en parallèle de l'utilisation du bot. 👍

▶️ Je recommande également l'utilisation d'un VPN pendant que le bot tourne, ça vous évitera un ban IP potentiel de toutes les billetteries billetweb.fr 👀

## Prérequis

- NodeJS
  - (>= v18 de préférence).
- Un environnement de bureau
  - (Non utilisable sur un serveur headless puisqu'il faut remplir le formulaire d'achat une fois le panier rempli.)

## Installation

- Cloner ce repo
- `npm install` ou `yarn` à la racine du projet

## Utilisation

- Paramétrage via un fichier JSON à placer dans le dossier `datas` (exemples présents dans ce même dossier) .
- Lancement via `npm run start <nom-du-json-sans-extension>`
  - Par exemple `npm run start devfest` pour lancer le bot configuré avec le fichier `devfest.json`.

## ❌ Cas non gérés

- Si la boutique préselectionne un billet que l'on souhaite et que son nombre est supérieur au nombre voulu.
  - Par exemple je souhaite 2x"billet 1" et la boutique en préselectionne 3, le bot ne sait pas réduire ce nombre.

## ⚠️ Cas non testés

- On veut 1x"billet 1" et 1x"billet 2", la boutique présélectionne 1x"billet 3" par défaut mais nous n'en voulons pas dans le panier.
  - ▶️ Ce cas devrait être fonctionnel mais non testé car je n'ai pas réussi à préparer une boutique avec des billets préselectionnés.

### License

Ce projet est sous license [GNU General Public License 3.0](https://choosealicense.com/licenses/gpl-3.0/)
