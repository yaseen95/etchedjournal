# Etched Journal (In Development)
A journal where entries are "etched" in stone. That's the idea anyway.

A few years ago I started journaling and I set a rule where I would try my best not to press
backspace. It feels like a cool enough idea to implement.

## Key Features
* All journal entries are encrypted on the client side
* After {x} seconds, entries cannot be edited

## Timeline
|Date      |Goals|
|----------|-----|
|2018-03-15|First RC|
|2018-04-10|Deployed to production|

## Encryption
### Entry/Etches
For each etch, an IV and key are randomly generated and used for encryption. The key and iv are 
then encrypted by the Master Encryption Key (and a new iv) and uploaded alongside the message 
content to the server.

### Master Encryption Key
The master encryption key is used to encrypt all the other data sent to the servers. This will
encrypt the keys and ivs. Because there is only one key, this key is derived by a passphrase.

1. User passphrase is stretched using PBKDF2
2. Stretching will use very strong values e.g. tens of thousands of iterations
3. The stretched passphrase becomes the master encryption key.
