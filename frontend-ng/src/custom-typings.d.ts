// Type definitions for openpgp 4.0.0
// Project: http://openpgpjs.org/
// Definitions by: Guillaume Lacasa <https://blog.lacasa.fr>
//                 Errietta Kostala <https://github.com/errietta>
//                 Daniel Montesinos <https://github.com/damonpam>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

import { enums, Keyid, KeyOptions } from 'openpgp';

declare module 'openpgp' {
    export namespace key {
        interface KeyResult {
            keys: Array<Key>;
            err: Array<Error>;
        }

        /**
         * Class that represents an OpenPGP key. Must contain a primary key. Can contain additional subkeys, signatures, user ids, user attributes.
         */
        interface Key {
            armor(): string;
            decrypt(passphrase: string): boolean;
            getExpirationTime(): Date;
            getKeyIds(): Array<Keyid>;
            getPreferredHashAlgorithm(): string;
            getPrimaryUser(): any;
            getUserIds(): Array<string>;
            isPrivate(): boolean;
            isPublic(): boolean;
            primaryKey: packet.PublicKey;
            toPublic(): Key;
            update(key: Key): void;
            verifyPrimaryKey(): enums.keyStatus;

            /**
             * Transforms structured key data to packetlist
             * @returns {packet.List} The packets that form a key
             */
            toPacketlist(): packet.List;
        }

        /**
         * Generates a new OpenPGP key. Currently only supports RSA keys. Primary and subkey will
         * be of same type.
         *
         * @param options
         */
        function generate(options: KeyOptions): Key;

        /**
         * Reads an OpenPGP armored text and returns one or multiple key objects
         *
         * @param armoredText text to be parsed
         */
        function readArmored(armoredText: string): KeyResult;

        /**
         * Reads an unarmored OpenPGP key list and returns one or multiple key objects
         * @param {Uint8Array} data to be parsed
         * @returns {Promise<{keys: Array<module:key.Key>}
         *            err: (Array<Error>|null)}>} result object with key and error arrays
         */
        function read(data: Uint8Array): Promise<{ keys: Array<key.Key> }>;
    }

    export namespace packet {
        interface PublicKey {
            algorithm: enums.publicKey;
            created: Date;
            fingerprint: string;

            getBitSize(): number;
            getFingerprint(): string;
            getKeyId(): string;
            read(input: string): any;
            write(): any;
        }

        interface SecretKey extends PublicKey {
            read(bytes: string): void;
            write(): string;
            clearPrivateMPIs(str_passphrase: string): boolean;
            encrypt(passphrase: string): void;
        }

        /**
         * This class represents a list of openpgp packets.
         * Take care when iterating over it - the packets themselves
         * are stored as numerical indices.
         *
         * --YASEEN--
         * This is a mutable list.
         *
         * @see https://openpgpjs.org/openpgpjs/doc/packet_packetlist.js.html
         */
        export interface List {
            /**
             * The number of packets contained within the list.
             * @readonly
             * @type {Integer}
             */
            readonly length: number;

            /**
             * Concatenates packetlist or array of packets
             *
             * --YASEEN--
             * Concatenates the packetlist with this packetlist and returns the concatenated packetlist.
             *
             * @return this list concatenated with the supplied packets
             */
            concat(packetlist: List): List;

            /**
             * Reads a stream of binary data and interpets it as a list of packets.
             * @param {Uint8Array | ReadableStream<Uint8Array>} A Uint8Array of bytes.
             */
            read(A: Uint8Array | ReadableStream): void;

            /**
             * Executes the callback function once for each element,
             * returns true if all callbacks returns a truthy value
             */
            every(callback: (value: any, index: number, array: List) => boolean): boolean;

            /**
             * Creates a binary representation of openpgp objects contained within the
             * class instance.
             * @returns {Uint8Array} A Uint8Array containing valid openpgp packets.
             */
            write(): Uint8Array;
        }
    }

    export namespace util {
        /**
         * Convert a Base-64 encoded string an array of 8-bit integer
         *
         * Note: accepts both Radix-64 and URL-safe strings
         *
         * --YASEEN--
         *
         * @param {String} base64 Base-64 encoded string to convert
         * @returns {Uint8Array} An array of 8-bit integers
         */
        function b64_to_Uint8Array(base64: string): Uint8Array;

        /**
         * Convert an array of 8-bit integer to a Base-64 encoded string
         *
         * --YASEEN--
         *
         * @param {Uint8Array} bytes An array of 8-bit integers to convert
         * @param {boolean}    url   If true, output is URL-safe
         * @returns {String}         Base-64 encoded string
         */
        function Uint8Array_to_b64(bytes: Uint8Array, url?: boolean): string;

        /**
         * Convert an array of 8-bit integers to a string
         *
         * @param {Uint8Array} bytes An array of 8-bit integers to convert
         * @returns {String} String representation of the array
         */
        function Uint8Array_to_str(bytes: Uint8Array): string;

        /**
         * Convert a string to an array of 8-bit integers
         *
         * @param {String} str String to convert
         * @returns {Uint8Array} An array of 8-bit integers
         */
        function str_to_Uint8Array(str: string): Uint8Array;
    }

    export namespace stream {
        /**
         * Read a stream to the end and return its contents, concatenated by the concat function
         * (defaults to concat).
         *
         * @param {ReadableStream|Uint8Array|String} input
         * @param {Function?} concat
         * @returns {Promise<Uint8Array|String|Any>} the return value of concat()
         * @async
         */
        function readToEnd(
            input: ReadableStream | Uint8Array | string,
            concat?: Function
        ): Promise<Uint8Array | string | any>;
    }
}
