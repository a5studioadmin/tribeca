import { Ollama } from "ollama";
import { MODELFILE, OLLAMA_MODEL } from "./config.js";
import chalk from "chalk";

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
    console.log(chalk.bold.green(`Using ${OLLAMA_MODEL}`));
    return ollama;
  } catch (error) {
    throw new Error(
      `Unable to start llama3. Are you sure your ollama server is running? (${error.message})`
    );
  }
}

export { initOllama };
