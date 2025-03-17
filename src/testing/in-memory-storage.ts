import { BrowserStorage } from '../interface/storage';

export class InMemoryStorage implements BrowserStorage {
  private readonly storage = new Map<string, string>();

  public getItem(key: string): string | null {
    const item = this.storage.get(key);

    return item !== undefined ? item : null; // tslint:disable-line:no-null-keyword
  }

  public setItem(key: string, data: string): void {
    this.storage.set(key, data);
  }

  public removeItem(key: string): void {
    this.storage.delete(key);
  }
}
