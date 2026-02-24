import { MediaModule } from "./modules/MediaModule";

interface WhatsAppClientConfig {
  phone_number_id: string;
  permanent_token: string;
}

export class WhatsAppClient {
  media: MediaModule;
  // messages: MessagesModule;
  // templates: TemplatesModule;

  constructor(config: WhatsAppClientConfig) {
    this.media = new MediaModule(config);
    // this.messages = new MessagesModule(config);
    // this.templates = new TemplatesModule(config);
  }
}