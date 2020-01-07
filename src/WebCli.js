import { html, css, LitElement } from 'lit-element';

export class WebCli extends LitElement {
  static get styles() {
    return css`
      :host {
        --web-cli-text-color: #f0f0f0;
        --web-cli-bg-color: #333;
        --web-cli-font-family: monospace;
        --web-cli-radius: 3px;

        color: var(--web-cli-text-color);
        background-color: var(--web-cli-text-color);
        font-family: var(--web-cli-font-family), monospace;
        font-size: 16px;
        display: block;
        padding: 0.5em;
      }

      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      .console-output {
        height: 25em;
        overflow-y: auto;
        word-break: break-all;
        white-space: pre-wrap;
        background-color: var(--web-cli-bg-color);
        border-radius: var(--web-cli-radius);
      }

      .input-form {
        position: relative;
        display: flex;
        align-items: center;
        padding: 0;
        margin: 0;
        margin-top: 0.5em;
        flex-wrap: nowrap;
      }

      input,
      button {
        font-family: inherit;
        font-size: inherit;
      }

      .control {
        display: flex;
        align-items: center;
        flex-grow: 1;
        margin-right: 0.5em;
        background-color: var(--web-cli-bg-color);
        box-shadow: 0 4px 8px rgba(10, 10, 10, 0.15);
        padding: 0;
        border-radius: var(--web-cli-radius);
      }

      .prompt {
        display: block;
        padding: 4px;
        padding-right: calc(0.5em - 4px);
        color: #999;
      }

      input {
        flex-grow: 1;
        border: 0;
        padding: 4px;
        margin: 0;
        color: inherit;
        background-color: transparent;
      }

      button {
        box-shadow: inset 0px 1px 0px 0px #ffffff;
        background: linear-gradient(to bottom, #ededed 5%, #dfdfdf 100%);
        background-color: #ffffff;
        border-radius: var(--web-cli-radius);
        border: 1px solid #dbdbdb;
        display: inline-block;
        color: #666666;
        padding: 3px 10px;
        text-decoration: none;
        text-shadow: 0px 1px 0px #ffffff;
      }

      button:hover {
        background: linear-gradient(to bottom, #dfdfdf 5%, #ededed 100%);
        background-color: #f6f6f6;
      }

      button:active {
        transform: translateY(1px);
      }

      .line {
        padding: 0 0.5em;
        line-height: 1.2;
      }

      .line:first-child {
        padding-top: 0.5em;
      }

      .line:last-child {
        padding-bottom: 0.5em;
      }

      .line.in {
        color: #999;
      }

      @media (max-width: 540px) {
        .input-form {
          flex-wrap: wrap;
        }
        .control {
          margin-right: 0;
          margin-bottom: 0.5em;
        }
        button {
          width: 100%;
        }
      }
    `;
  }

  static get properties() {
    return {
      prompt: { type: String },
      lines: { type: Array },
      savedInput: { type: String },
      commands: { type: Array },
      commandIndex: { type: Number },
    };
  }

  constructor() {
    super();
    this.prompt = '>';
    this.lines = [];
    this.savedInput = '';
    this.commands = [];
    this.commandIndex = -1;
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has('lines')) {
      const $output = this.shadowRoot.getElementById('stdout');
      $output.scrollTop = $output.scrollHeight;
    }
  }

  __onKeydown(event) {
    if (!this.commands.length) return;
    const $input = this.shadowRoot.getElementById('stdin');
    if (event.key === 'ArrowUp') {
      if (this.commandIndex === -1) {
        this.savedInput = $input.value;
      }
      this.commandIndex += 1;
    } else if (event.key === 'ArrowDown') {
      this.commandIndex -= 1;
    } else {
      return;
    }

    event.preventDefault();

    this.commandIndex = Math.min(this.commandIndex, this.commands.length - 1);
    this.commandIndex = Math.max(this.commandIndex, -1);

    if (this.commandIndex === -1) {
      $input.value = this.savedInput;
    } else {
      $input.value = this.commands[this.commandIndex];
    }
  }

  __onSubmit(event) {
    event.preventDefault();
    const $input = this.shadowRoot.getElementById('stdin');
    const value = $input.value.trim();

    if (value) {
      const line = { isInput: true, text: `${this.prompt} ${value}` };
      this.lines = this.lines.concat([line]);
      $input.value = '';
      $input.focus();
      this.commands = [value].concat(this.commands);
      this.savedInput = '';
      this.commandIndex = -1;
      this.dispatchEvent(new CustomEvent('cli-input', { detail: value }));
    }
  }

  addLine(line = '') {
    this.lines = this.lines.concat([{ isInput: false, text: line }]);
  }

  render() {
    return html`
      <div class="console">
        <div id="stdout" class="console-output">${this.lines.map(
          line =>
            html`<div class="line ${line.isInput ? 'in' : ''}">${line.text}</div>`,
        )}</div>
        <form class="input-form" autocomplete="off" @submit="${this.__onSubmit}">
          <div class="control">
            <label for="stdin" class="prompt">${this.prompt}</label>
            <input id="stdin" @keydown="${this.__onKeydown}" />
          </div>
          <button type="submit">⏎</button>
        </form>
      </div>
    `;
  }
}
