async function archiveGroup(client, message, groupsToArchive, debug = false) {
  if (message.from.endsWith('@g.us') && groupsToArchive.includes(message.from)) {  
    if (debug) {
      console.log("Group Message =>");
      console.log(message);
      console.log("<= End Group Message");
    }
    try {
      let chat = await client.getChatById(message.from);
      if (debug) {
        console.log("Chat =>");
        console.log(chat);
        console.log("<= Chat End");
      }
      await chat.archive();
      if (debug) {
        console.log('Group archived');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
}

module.exports = archiveGroup;



