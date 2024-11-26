const { Configuration, OpenAIApi } = require("openai");
const config = require('../config')

// Load your key from an environment variable or secret management service
// (do not include your key directly in your code)

const configuration = new Configuration({
  apiKey: config.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function callOpenAi (req, res){
  //comprobar créditos del usuario
  var jsonText = req.body.value;
  var content = req.body.context;
  var promt = 'Behave like a doctor. Returns only the name of the active ingredient of the following drug, nothing more: '+ jsonText;
  (async () => {
    try {
      const gptResponse = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [{role: "user", content:promt}, {role: "system", content: content}],
        //prompt: jsonText,
        temperature: 0,
        max_tokens: 400,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      res.status(200).send(gptResponse.data)
    }catch(e){
      console.error("[ERROR]: " + e)
      res.status(500).send('error')
    }
    
  })();
}

module.exports = {
	callOpenAi
}
