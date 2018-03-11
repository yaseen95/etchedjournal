
export class Etch {
  /** id */
  id: number;

  /** Etch content */
  content: string;

  /** The key used to encrypt the content plaintext (this itself is encrypted by the master key) */
  contentKey: string;

  /** The iv used to encrypt the content plaintext (this itself is encrypted by the master key) */
  contentIv: string;

  /** The iv used to encrypt the contentKey */
  keyIv: string;

  /** The iv used to encrypt the contentIv */
  ivIv: string;

  /** Position of etch relative to other etches */
  position: number;

  constructor(content: string, contentKey: string, contentIv: string, keyIv: string, ivIv: string) {
    this.content = content;
    this.contentKey = contentKey;
    this.contentIv = contentIv;
    this.keyIv = keyIv;
    this.ivIv = ivIv;
    // TODO: Actually increment position.
    this.position = 1;
  }
}
