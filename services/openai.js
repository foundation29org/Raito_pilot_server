const axios = require('axios');
const config = require('../config')

// Azure OpenAI endpoint
const AZURE_OPENAI_URL = 'https://raitoopenai.openai.azure.com/openai/deployments/gpt-4o/chat/completions';
const API_VERSION = '2025-01-01-preview';

function callOpenAi (req, res){
  //comprobar créditos del usuario
  var jsonText = req.body.value;
  var content = req.body.context;
  var promt = 'Behave like a doctor. Returns only the name of the active ingredient of the following drug, nothing more: '+ jsonText;
  
  (async () => {
    try {
      const requestBody = {
        messages: [
          { role: "user", content: promt },
          { role: "system", content: content }
        ],
        max_tokens: 400,
        temperature: 0,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        model: "gpt-4o"
      };

      const response = await axios.post(
        `${AZURE_OPENAI_URL}?api-version=${API_VERSION}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.OPENAI_API_KEY}`
          }
        }
      );

      res.status(200).send(response.data);
    } catch(e) {
      console.error("[ERROR]: " + e.message);
      if (e.response) {
        console.error("[ERROR]: Status:", e.response.status);
        console.error("[ERROR]: Data:", e.response.data);
        res.status(e.response.status || 500).send({
          error: 'Error en Azure OpenAI',
          message: e.response.data?.error?.message || e.message,
          status: e.response.status
        });
      } else {
        res.status(500).send({
          error: 'Error de conexión',
          message: e.message
        });
      }
    }
  })();
}

module.exports = {
	callOpenAi
}
