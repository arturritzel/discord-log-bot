const { Client, GatewayIntentBits, AuditLogEvent, EmbedBuilder } = require('discord.js')
require('dotenv/config')


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
})

client.on('ready', () => {
    console.log('bot ta pronto')
})

client.on('messageUpdate', (oldMessage, newMessage) => {
    client.channels.cache.get(process.env.LOG_CHANNEL).send({
        embeds: [
            new EmbedBuilder()
            .setTitle(newMessage.author.tag)
            .setDescription(`:pencil: **Uma mensagem de ${newMessage.author} foi editada:**`)
            .addFields(
                { name: 'Antes:', value: `\`\`\`${oldMessage.content}\`\`\``},
                { name: 'Depois:', value: `\`\`\`${newMessage.content}\`\`\``},
                { name: 'Canal:', value: `${newMessage.channel}`},
            )
            .setFooter({
                text: `ID: ${newMessage.author.id}`,
            })
            .setTimestamp()
            .setColor('Yellow')
        ]
    })
})


client.on('messageDelete', async message => {

    let deleter = "a";
    
	const fetchedLogs = await message.guild.fetchAuditLogs({
		limit: 1,
		type: AuditLogEvent.MessageDelete,
	});
    const deletionLog = fetchedLogs.entries.first();

    if (!deletionLog){ 
        deleter = "Regitro de auditoria não encontrado."
    }
    else{
        const { executor, target } = deletionLog;

        if (target.id === message.author.id){
		    deleter = `${executor}`
	    } 
        
        else{
		    deleter = `${message.author}`
	    }
    }

    client.channels.cache.get(process.env.LOG_CHANNEL).send({
        embeds: [
            new EmbedBuilder()
            .setTitle(message.author.tag)
            .setDescription(`:pencil: **Uma mensagem de ${message.author} foi excluída:**`)
            .addFields(
                { name: 'Mensagem deletada:', value: `\`\`\`${message.content}\`\`\``},
                { name: 'Canal:', value: `${message.channel}`},
                { name: 'Excluída por:', value: deleter},
            )
            .setFooter({
                text: `ID: ${message.author.id}`,
            })
            .setTimestamp()
            .setColor('Orange')
        ]
    })
})

client.on('guildMemberUpdate', (oldMember, newMember) => {
    if(newMember.guild.id !== process.env.LOG_GUILD){
        return;
    }

    if(oldMember.displayName !== newMember.displayName){
        
        client.channels.cache.get(process.env.LOG_CHANNEL).send({
            embeds: [
                new EmbedBuilder()
                .setTitle(newMember.user.tag)
                .setDescription(`:pencil: **O nickname de ${newMember.user} foi alterado:**`)
                .addFields(
                    { name: 'nickname antigo:', value: oldMember.displayName},
                    { name: 'nickname novo:  ', value: newMember.displayName},
                )
                .setFooter({
                    text: `ID: ${newMember.id}`,
                })
                .setTimestamp()
                .setColor('Aqua')
            ]
        })
    }

    if(newMember.roles.cache.size > oldMember.roles.cache.size){

        newMember.roles.cache.forEach(role => {
            if(!oldMember.roles.cache.has(role.id)){
                console.log(newMember.user.tag + "/" + newMember.id + ": cargo a mais: " + role.name);

                client.channels.cache.get(process.env.LOG_CHANNEL).send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(newMember.user.tag)
                        .setDescription(`:pencil: **Os cargos de ${newMember.user} foram alterados:**`)
                        .addFields(
                            { name: 'Cargo adicionado:', value: `<@&${role.id}>`},
                        )
                        .setFooter({
                            text: `ID: ${newMember.id}`,
                        })
                        .setTimestamp()
                        .setColor('Green')
                    ]
                })
            }
        });

    }

    if(oldMember.roles.cache.size > newMember.roles.cache.size){

        oldMember.roles.cache.forEach(role => {
            if(!newMember.roles.cache.has(role.id)){
                console.log(newMember.user.tag + "/" + newMember.id + ": cargo a mais: " + role.name);

                client.channels.cache.get(process.env.LOG_CHANNEL).send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(newMember.user.tag)
                        .setDescription(`:pencil: **Os cargos de ${newMember.user} foram alterados:**`)
                        .addFields(
                            { name: 'Cargo removido:', value: `<@&${role.id}>`},
                        )
                        .setFooter({
                            text: `ID: ${newMember.id}`,
                        })
                        .setTimestamp()
                        .setColor('Red')
                    ]
                })
            }
        });

    }
})


client.login(process.env.TOKEN)
