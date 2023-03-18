const { Events } = require('discord.js');
const { roleMembre, rolePatchNotes, roleIos, roleAndroid, roleSite , roleBonPlan, roleGenshin} = require('../config.json');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()){

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
            await interaction.reply({ content: 'Il y a eu une erreur lors de l’exécution de cette commande !', ephemeral: true });
		}
	}
	else{
	let role = {};
    switch (interaction.customId) {
        case 'verifyButton':
            role = interaction.guild.roles.cache.find(role => role.id == roleMembre);
            if(interaction.member.roles.cache.find(r => r.id === roleMembre)){
                interaction.reply({ content: 'Le rôle <@&'+roleMembre+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+roleMembre+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        case 'role-patchnote':
            role = interaction.guild.roles.cache.find(role => role.id == rolePatchNotes);
            if(interaction.member.roles.cache.find(r => r.id === rolePatchNotes)){
                interaction.reply({ content: 'Le rôle <@&'+rolePatchNotes+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+rolePatchNotes+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        case 'role-ios':
            role = interaction.guild.roles.cache.find(role => role.id == roleIos);
            if(interaction.member.roles.cache.find(r => r.id === roleIos)){
                interaction.reply({ content: 'Le rôle <@&'+roleIos+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+roleIos+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        case 'role-android':
            role = interaction.guild.roles.cache.find(role => role.id == roleAndroid);
            if(interaction.member.roles.cache.find(r => r.id === roleAndroid)){
                interaction.reply({ content: 'Le rôle <@&'+roleAndroid+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+roleAndroid+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        case 'role-siteweb':
            role = interaction.guild.roles.cache.find(role => role.id == roleSite);
            if(interaction.member.roles.cache.find(r => r.id === roleSite)){
                interaction.reply({ content: 'Le rôle <@&'+roleSite+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+roleSite+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        case 'role-bonplan':
            role = interaction.guild.roles.cache.find(role => role.id == roleBonPlan);
            if(interaction.member.roles.cache.find(r => r.id === roleBonPlan)){
                interaction.reply({ content: 'Le rôle <@&'+roleBonPlan+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+roleBonPlan+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        case 'role-genshin':
            role = interaction.guild.roles.cache.find(role => role.id == roleGenshin);
            if(interaction.member.roles.cache.find(r => r.id === roleGenshin)){
                interaction.reply({ content: 'Le rôle <@&'+roleGenshin+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+roleGenshin+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        default:
            interaction.reply({ content: 'Une erreur est survenue, contactez <@&245604480278593537>', ephemeral: true });
            break;
            
        }
	}
	},
};
