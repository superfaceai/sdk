import { runAgent } from '.';

require('dotenv').config();

async function main() {
  const agent = runAgent({
    prompt: 'Lookup Superface in ARES',
  });

  for await (const message of agent) {
    if (message.kind === 'tool_run') {
      console.log('Tool run:', message.toolRun);
    } else {
      console.log('Message:', message.content);
    }
  }
}

try {
  void main();
} catch (err) {
  console.error(err);
}
