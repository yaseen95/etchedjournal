# Etched Journal
A journal where entries are "etched" in stone. That's the idea anyway.

A few years ago I started journaling and I set a rule where I would try my best not to press
backspace. It feels like a cool enough idea to implement.

## Key Features
* All journal entries are encrypted on the client side
* After {x} seconds, entries cannot be edited

## Encryption
### Entry/Etches
For every new entry, an IV and key are generated. The IV and key are used to encrypt etches. Process outlined below

1. Generate secure random iv and key
2. Use key and iv are used as input to AES encrypt every etch for an entry
3. The key and iv are then encrypted by the Master Encryption Key and uploaded alongside the
message content to the server.

### Master Encryption Key
The master encryption key is used to encrypt all the other data sent to the servers. This will
encrypt the keys and ivs. Because there is only one key, this key is derived by a passphrase.

1. User passphrase is stretched using PBKDF2
2. Stretching will use very strong values e.g. tens of thousands of iterations
3. The stretched passphrase becomes the master encryption key.
