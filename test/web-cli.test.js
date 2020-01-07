import { html, fixture, expect, elementUpdated } from '@open-wc/testing';

import '../web-cli.js';

describe('WebCli', () => {
  it('has a default prompt ">"', async () => {
    const el = await fixture(html`
      <web-cli></web-cli>
    `);

    expect(el.prompt).to.equal('>');
  });

  it('adds a line on form submit', async () => {
    const el = await fixture(html`
      <web-cli></web-cli>
    `);
    el.shadowRoot.querySelector('input').value = 'Hello world';
    el.shadowRoot.querySelector('button').click();

    expect(el.lines[0].text).to.equal(`${el.prompt} Hello world`);
    expect(el.lines[0].isInput).to.equal(true);
  });

  it('does not add a new line if the input value is only whitespace', async () => {
    const el = await fixture(html`
      <web-cli></web-cli>
    `);
    el.shadowRoot.querySelector('input').value = '';
    el.shadowRoot.querySelector('button').click();
    expect(el.lines.length).to.equal(0);

    el.shadowRoot.querySelector('input').value = '   ';
    el.shadowRoot.querySelector('button').click();
    expect(el.lines.length).to.equal(0);
  });

  it('can override the prompt via attribute', async () => {
    const el = await fixture(html`
      <web-cli prompt="hello $"></web-cli>
    `);

    expect(el.prompt).to.equal('hello $');
  });

  it('adds a new line when `addLine` is called', async () => {
    const el = await fixture(
      html`
        <web-cli></web-cli>
      `,
    );
    el.addLine('new line');

    await elementUpdated(el);

    expect(el.shadowRoot.querySelector('.line').textContent).to.equal('new line');
    expect(el.lines[0].text).to.equal('new line');
    expect(el.lines[0].isInput).to.equal(false);

    el.addLine();
    expect(el.lines[1].text).to.equal('');
    expect(el.lines[1].isInput).to.equal(false);
  });

  it('cycles through previous commands on `ArrowUp` and `ArrowDown`', async () => {
    const el = await fixture(
      html`
        <web-cli></web-cli>
      `,
    );
    const button = el.shadowRoot.querySelector('button');
    const stdin = el.shadowRoot.querySelector('input');
    stdin.value = 'Hello';
    button.click();
    await elementUpdated(el);

    stdin.value = 'world';
    button.click();
    await elementUpdated(el);

    expect(stdin.value).to.equal('');
    stdin.value = 'foo';
    stdin.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    await elementUpdated(el);
    expect(stdin.value).to.equal('world');

    stdin.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    await elementUpdated(el);
    expect(stdin.value).to.equal('Hello');

    stdin.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    await elementUpdated(el);
    expect(stdin.value).to.equal('Hello');

    stdin.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await elementUpdated(el);
    expect(stdin.value).to.equal('world');

    stdin.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await elementUpdated(el);
    expect(stdin.value).to.equal('foo');
  });

  // it('shows initially the text "hey there Nr. 5!" and an "increment" button', async () => {
  //   const el = await fixture(html`
  //     <web-cli></web-cli>
  //   `);

  //   expect(el).shadowDom.to.equalSnapshot();
  // });

  it('passes the a11y audit', async () => {
    const el = await fixture(html`
      <web-cli></web-cli>
    `);

    await expect(el).shadowDom.to.be.accessible();
  });
});
