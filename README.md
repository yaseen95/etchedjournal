# Etched Journal
A journal where entries are "etched" in stone. That's the idea anyway.

A few years ago I started journaling and I set a rule where I would try my best not to press
backspace. It feels like a cool enough idea to implement.

## Key Features
* All journal entries are encrypted on the client side
* After {x} seconds, entries cannot be edited

## Encryption
1. User uses a single passphrase. Will likely enforce >= 20 chars.
2. When creating an entry, user generates a random key. This key is used to encrypt the etches. 
The key itself is then encrypted with the passphrase and stored alongside the entry.
3. The content of an etch is encrypted using the random key.
