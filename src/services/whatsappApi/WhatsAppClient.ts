import { MediaModule } from "./modules/MediaModule";
import { TemplatesModule } from "./modules/TemplatesModule";
import { UploadModule } from "./modules/UploadModule";

interface WhatsAppClientConfig {
  phone_number_id: string;
  permanent_token: string;
  waba_id: string;
}

export class WhatsAppClient {
  media: MediaModule;
  templates: TemplatesModule;
  uploads: UploadModule;

  constructor(config: WhatsAppClientConfig) {
    this.media = new MediaModule(config);
    this.templates = new TemplatesModule({
      waba_id: config.waba_id,
      permanent_token: config.permanent_token,
    });
    this.uploads = new UploadModule({
      app_id: config.phone_number_id,
      permanent_token: config.permanent_token,
    });
  }
}