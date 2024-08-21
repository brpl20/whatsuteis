  // Schedule the daily message to be executed at 8:20 AM every day
  // Apenas para conhecimento - nao utilizado
  async function cronCob(quemDeve, mensagemProDevedor, cronSchedules){
    client.on('ready', () => {
      cron.schedule('59 8 * * *', () => {
        client.sendMessage(quemDeve[2], mensagemProDevedor[0]);
      })
      cron.schedule('59 13 * * *', () => {
        client.sendMessage(quemDeve[2], mensagemProDevedor[0]);
      })
      cron.schedule('59 17 * * *', () => {
        client.sendMessage(quemDeve[2], mensagemProDevedor[0]);
      })
    })};


    async function cronCob(quemDeve, mensagemProDevedor, schedules) {
      client.on('ready', () => {
        schedules.forEach((schedule) => {
          cron.schedule(schedule, () => {
            mensagemProDevedor.forEach((msg) => {
              client.sendMessage(quemDeve, msg)
                .then((response) => {
                  console.log('Message sent:', response);
                  })})})})})};
  

cronCob(dailyCobBrunoNumber, dailyCobBruno, cronSchedulesPeople);
