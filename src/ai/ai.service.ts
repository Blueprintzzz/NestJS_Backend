import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
  private readonly MODEL = process.env.AI_MODEL || 'qwen3:1.7b';

  async chat(message: string): Promise<string> {
    const res = await axios.post(`${this.OLLAMA_URL}/api/chat`, {
      model: this.MODEL,
      messages: [{ role: 'user', content: message }],
      stream: false,
    });
    return res.data.message.content;
  }
}