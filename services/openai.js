const OpenAI = require('openai-api');
const config = require('../config')

// Load your key from an environment variable or secret management service
// (do not include your key directly in your code)
const OPENAI_API_KEY = config.OPENAI_API_KEY;

const openai = new OpenAI(OPENAI_API_KEY);


function callOpenAi (req, res){
  //comprobar créditos del usuario
  
  var jsonText = req.body.value;
  (async () => {
    try {
        const gptResponse = await openai.complete({
          engine: 'text-davinci-003',//davinci-instruct-beta-v3
          prompt: jsonText,
          maxTokens: 300,
          temperature: 0,
          topP: 1,
          presencePenalty: 0,
          frequencyPenalty: 0,
          bestOf: 1,
          n: 1,
          stream: false
      });
      res.status(200).send(gptResponse.data)
    }catch(e){
      console.error("[ERROR]: " + e)
      res.status(500).send(e)
    }
    
  })();
}

module.exports = {
	callOpenAi
}
