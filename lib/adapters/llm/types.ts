/**
 * LLM provider adapter interface.
 *
 * An LLM provider generates text and produces embeddings. This interface is
 * intentionally generic across providers:
 *
 *   - OpenAI (gpt-4o, gpt-4o-mini, ...)
 *   - Anthropic (claude-3.5-sonnet, ...)
 *   - Google Gemini
 *   - OpenRouter (multi-provider gateway)
 *   - Ollama (self-hosted)
 *
 * Model-specific options are passed via the opts bag; callers stay
 * provider-agnostic.
 */

export interface GenerateOptions {
  /** Model identifier, provider-specific (e.g. "gpt-4o", "claude-3.5-sonnet"). */
  model?: string
  /** Sampling temperature, 0..2 range. Provider clamps to its supported range. */
  temperature?: number
  /** Hard cap on output tokens. Provider may enforce a lower cap. */
  maxTokens?: number
}

export interface ILLMProvider {
  /**
   * Generate a completion for the given prompt. Returns the generated text.
   * The caller controls model and sampling via opts.
   */
  generate(prompt: string, opts?: GenerateOptions): Promise<string>

  /**
   * Compute an embedding vector for the given text. Vector dimension is
   * provider-defined; callers must match the dimension to the vector store
   * they persist into.
   */
  embed(text: string): Promise<number[]>
}
