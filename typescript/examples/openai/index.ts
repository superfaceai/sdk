import OpenAI from 'openai';
import Superface from 'superface/openai';

require('dotenv').config();

const openai = new OpenAI();
const superfaceToolkit = new Superface();

async function main() {
  const runner = await openai.beta.chat.completions
    .runTools({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'List my calendars' }],
      tools: await superfaceToolkit.beta.getTools({ userId: 'example_user' }),
    })
    .on('message', (message) => console.log(message));

  const finalContent = await runner.finalContent();
  console.log();
  console.log('Final content:', finalContent);
}

void main();
