
export class EtchedUser {

  constructor(
    readonly id: string,
    readonly username: string,
    readonly email: string,
    readonly admin: boolean = false,

    // these can be set after registration.
    // the fields below are all for deriving the Master Key.
    public algo: string | null,
    public salt: string | null,
    public keySize: number | null,
    public iterations: number | null,
    ) {
  }

  /**
   * Check if the user's encryption properties have been configured
   * @returns {boolean} true if encryption has been configured
   */
  encryptionConfigured(): boolean {
    let encryptionProperties = [this.algo, this.salt, this.keySize, this.iterations];
    // TODO: Check that all or none are undefined. If some are defined throw an exception.
    return encryptionProperties.every((x) => x !== null);
  }
}
