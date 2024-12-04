import { ChatCompletionTool } from 'openai/resources/index.mjs';
import SuperfaceClient, { SuperfaceOptions } from '../client';
import { SuperfaceOpenAIBeta } from './beta';

export class Superface {
  private client: SuperfaceClient;
  public beta: SuperfaceOpenAIBeta;

  constructor(opts: SuperfaceOptions = {}) {
    this.client = new SuperfaceClient(opts);
    this.beta = new SuperfaceOpenAIBeta(this);
  }

  async getTools(): Promise<ChatCompletionTool[]> {
    return await this.client.getTools();
  }

  async runTool(
    ...args: Parameters<SuperfaceClient['runTool']>
  ): ReturnType<SuperfaceClient['runTool']> {
    return await this.client.runTool(...args);
  }

  async configurationLink(
    ...args: Parameters<SuperfaceClient['configurationLink']>
  ): ReturnType<SuperfaceClient['configurationLink']> {
    return await this.client.configurationLink(...args);
  }
}

export default Superface;
