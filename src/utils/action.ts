export class Action {
  private didKey = 'dododawn_action_did';

  private did = '';
  private requestUrl = '';

  constructor() {}

  private get baseData() {
    return { did: this.did, url: location.href, page: location.pathname };
  }

  config({ url }) {
    this.did = this.generateId();
    this.requestUrl = url;
  }

  private generateId() {
    const storageKey = localStorage.getItem(this.didKey);

    if (storageKey) {
      return storageKey;
    }

    const UUID = crypto.randomUUID();
    localStorage.setItem(this.didKey, UUID);
    return UUID;
  }

  visit(obj_id = '', extra?: Record<string, any>) {
    return this.request('visit', { obj_id, extra });
  }

  show(obj_id = '', extra?: Record<string, any>) {
    return this.request('show', { obj_id, extra });
  }

  click(obj_id = '', extra?: Record<string, any>) {
    return this.request('click', { obj_id, extra });
  }

  private request(type = '', data: Record<string, any>) {
    return fetch(`${this.requestUrl}/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...this.baseData, ...data }),
    })
      .then((res) => res.json())
      .catch(console.error);
  }
}

export const action = new Action();
