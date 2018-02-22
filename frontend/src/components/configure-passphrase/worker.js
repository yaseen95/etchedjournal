import {EtchedCryptoUtils} from "../../crypto/etched-crypto";

/**
 * Hashes a passphrase and posts it back to the main thread as a StretchedKey
 * @param {MessageEvent} e
 */
onmessage = function(e) {
  console.log(`Starting hashing`);
  var hashed = EtchedCryptoUtils.hashPassphrase(e.data);
  console.log(`Finished hashing`);
  postMessage(hashed);
};
