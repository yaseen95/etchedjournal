# Etched Journal (In Development)
A journal where entries are "etched" in stone. That's the idea anyway.

[![Build Status](https://travis-ci.org/yaseen95/subjecthub.svg?branch=master)](https://travis-ci.org/yaseen95/subjecthub)

A few years ago I started journaling and I set a rule where I would try my best not to press
backspace. It feels like a cool enough idea to implement.

## Key Features
* All journal entries are encrypted on the client side
* After {x} seconds, entries cannot be edited

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


## Keycloak
Keycloak is used as the backend auth service

To run keycloak:
```bash
docker run -d \
  --name keycloak \
  -e KEYCLOAK_USER=admin \
  -e KEYCLOAK_PASSWORD=admin \
  -p 9001:8080 \
  jboss/keycloak 
```
### Setup
#### Manual Setup
1. Open `http://localhost:9001/auth/admin/master/console`
2. Login as an admin with the credentials you supplied at runtime
3. On the left panel, hover over "Master" and click the "Add realm" button
4. Using the file import option, import `config/keycloak/realm-export.json`. After an import, the
realm on the left side should now show "Etched" where it showed "Master" in the previous step.
**NOTE**: Because the keycloak export by default doesn't include the client secret, edit the value
before importing it or generate a new secret from the Admin interface in the `Credentials` tab of
the `etched-backend` client.
5. Due to [KEYCLOAK-5202](https://issues.jboss.org/browse/KEYCLOAK-5202) the required client roles
aren't exported. To add the client roles:   
   1. Select `clients` from the left hand side
   2. Select `etched-backend` from the list
   3. Select `Service Account Roles` tab
   4. From the `Client roles` dropdown, select `realm-management`
   5. Add `manage-users`, `view-users`, and `view-realm` roles

#### CLI Setup
As an alternative to the above steps, you can execute the following commands.
```bash
# Copy file into docker container
docker cp config/keycloak/realm-export.json keycloak:/opt/jboss/

# Enter docker container - cwd should be /opt/jboss/
docker exec -it keycloak /bin/bash

ADMIN_CMD="/opt/jboss/keycloak/bin/kcadm.sh"

# Login as admin
$ADMIN_CMD config credentials \
  --server http://localhost:8080/auth \
  --realm master \
  --user admin \
  --password admin

# Import 'etched' realm
# NOTE: See step 4 of manual steps regarding client secret. Specify secret in file or generate new. 
$ADMIN_CMD create realms -f realm-export.json

# TODO: Add CLI steps for fixing service account role issue
```
7. Should be all setup now. To make sure everything works, import the postman config and start
playing with the REST API.

## Postman
Postman config files are also stored in `config/postman/`. It makes it easy to test and verify API
functionality.

Because auth is required for most requests, be sure to first login. Copy the `access_token` value, 
select edit on the `etched` collection on the left side, select the `Variables` tab and paste the
value.

All requests should now work correctly.
