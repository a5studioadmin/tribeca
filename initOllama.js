const { Ollama } = require("ollama");
const { OLLAMA_MODEL, MODELFILE } = require("./config");

async function initOllama() {
  try {
    const ollama = new Ollama();
    await ollama.create({
      model: OLLAMA_MODEL,
      modelfile: MODELFILE,
      stream: false,
    });
    const response = await ollama.list();
    console.log(
      "Available ollama models:",
      response.models.map((model) => model.name)
    );
    console.log(`Using ${OLLAMA_MODEL}`);
    return ollama;
  } catch {
    throw new Error(
      "Unable to start llama3. Are you sure your ollama server is running?"
    );
  }
}

module.exports = {
  initOllama,
};
