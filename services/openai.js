const OpenAI = require('openai-api');
const config = require('../config')
const request = require('request')

// Load your key from an environment variable or secret management service
// (do not include your key directly in your code)
const OPENAI_API_KEY = config.OPENAI_API_KEY;

const openai = new OpenAI(OPENAI_API_KEY);


function callOpenAi (req, res){
  var jsonText = req.body.value;
  (async () => {
    const gptResponse = await openai.complete({
        engine: 'davinci-instruct-beta-v3',
        prompt: jsonText,
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        presencePenalty: 0,
        frequencyPenalty: 0,
        bestOf: 1,
        n: 1,
        stream: false
    });
    res.status(200).send(gptResponse.data)
})();
}

module.exports = {
	callOpenAi
}
