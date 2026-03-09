const config = require('../config.json');

function commandNotFound(message) {
	message.channel.send('Commande non trouvée ! Essayez \`' + config.BOT.PREFIX + 'commandes\` pour voir les commandes disponibles');
}

module.exports = {commandNotFound};