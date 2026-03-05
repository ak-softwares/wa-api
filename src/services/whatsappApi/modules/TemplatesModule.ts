import { Template, TemplateComponentCreate } from "@/types/Template";
import { FB_GRAPH_VERSION } from "@/utiles/constans/apiConstans";

interface Config {
  waba_id: string;
  permanent_token: string;
}

export interface GetTemplatesOptions {
  limit?: number;
  after?: string | null;
}

export class TemplatesModule {
  private waba_id: string;
  private token: string;

  constructor(config: Config) {
    this.waba_id = config.waba_id;
    this.token = config.permanent_token;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Get templates with pagination
   */
  async getTemplates(options: GetTemplatesOptions = {}) {
    const { limit = 20, after = null } = options;

    let url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${this.waba_id}/message_templates?limit=${limit}`;

    if (after) {
      url += `&after=${after}`;
    }

    const res = await fetch(url, {
      headers: this.headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error?.message || "Failed to fetch templates");
    }

    return {
      templates: data?.data || [],
      paging: data?.paging || {},
    };
  }

  /**
   * Create template
   */
  async createTemplate(payload: {
    name: string;
    category: string;
    language: string;
    components: TemplateComponentCreate[];
  }) {
    const { name, category, language, components } = payload;

    if (!/^[a-z0-9_]+$/.test(name)) {
      throw new Error(
        "Template name must be lowercase alphanumeric with underscores"
      );
    }

    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${this.waba_id}/message_templates`;

    const res = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        name,
        category,
        language,
        components,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const err =
        data?.error?.error_user_msg ||
        data?.error?.message ||
        "Template creation failed";

      throw new Error(err);
    }

    return data;
  }

  /**
   * Update template
   */
  async updateTemplate(payload: {
    id: string;
    name: string;
    category: string;
    language: string;
    components: TemplateComponentCreate[];
  }) {
    const { id, name, category, language, components } = payload;

    if (!id) throw new Error("Template ID is required");

    if (!name || !category || !language || !components) {
      throw new Error("Missing required fields ( name, category, language, components )");
    }

    if (!/^[a-z0-9_]+$/.test(name)) {
      throw new Error(
        "Template name must be lowercase alphanumeric with underscores"
      );
    }

    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${id}`;

    const res = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        name,
        category,
        language,
        components,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const err =
        data?.error?.error_user_msg ||
        data?.error?.message ||
        "Template creation failed";

      throw new Error(err);
    }

    return data;
  }

  /**
   * Delete single template by name
   */
  async deleteTemplate(name: string) {
    if (!name) throw new Error("Template name required");

    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${this.waba_id}/message_templates?name=${encodeURIComponent(
      name
    )}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: this.headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error?.message || "Delete failed");
    }

    return data;
  }

  /**
   * Bulk delete templates
   */
  async deleteTemplates(names: string[]) {
    if (!Array.isArray(names) || names.length === 0) {
      throw new Error("Template names array required");
    }

    const results: {
      name: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const name of names) {
      try {
        await this.deleteTemplate(name);
        results.push({ name, success: true });
      } catch (err: any) {
        results.push({
          name,
          success: false,
          error: err.message,
        });
      }
    }

    return results;
  }
}