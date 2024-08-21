const tesseract = require("node-tesseract-ocr")
const OpenAI = require('openai');
const clientOAI = new OpenAI({apiKey: ''});
const fs = require('fs');

function recognizeImage(imagePath, config) {
  return tesseract.recognize(imagePath, config)
    .then(text => {
      console.log("Texto resultante:", text)
    })
    .catch(error => {
      console.log(error.message)
    })
}


const config = {
  lang: "por",
  oem: 1,
  psm: 3,
}

text = recognizeImage("./media/temp.jpeg", config)



async function processChatCompletion(text) {
  const response = await clientOAI.chat.completions.create({
    model: 'gpt-3.5-turbo-0125',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Você é meu assistente JSON. Por favor me indique qual foi o valor da transação, use o termo VALOR como a chave do JSON. Qual foi a data da transação, use o termo DATA como a chave do JSON. Quem enviou a operação, use o termo ENVIADO como a chave do JSON. Quem recebeu, use o termo RECEBEDOR como a chave do JSON.' },
      { role: 'user', content: text}
    ]
  });
  console.log(response.choices[0].message.content);
}

processChatCompletion(text);
