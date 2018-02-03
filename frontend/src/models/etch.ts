
export class Etch {
  /** Etch content */
  content: string;

  /** The key used to encrypt the content plaintext (this itself is encrypted by the master key) */
  contentKey: string;

  /** The iv used to encrypt the content plaintext (this itself is encrypted by the master key) */
  contentIv: string;

  /** The iv used to encrypt the contentKey and contentIv */
  initVector: string;

  /** Indicates whether content, contentKey, and contentIv are encrypted */
  encrypted: boolean;

  constructor(content: string, contentKey: string, contentIv: string, initVector: string, encrypted: boolean) {
    this.content = content;
    this.contentKey = contentKey;
    this.contentIv = contentIv;
    this.initVector = initVector;
    this.encrypted = encrypted;
  }
}
