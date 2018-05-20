# Design Considerations

### Should the backend allow users to update an Etch?
This is a question of the backend solely i.e. do you we have an "edit etch" endpoint? The frontend
won't allow it, but should the backend support it?

A few scenarios arise:
    1. A user wishes to encrypt their etches with new keys. Might happen if/when:
        - User changes the master key
        - There was a bug with how we were encrypting the data
        - There was a bug with a browser specific crypto implementation (really, really doubt this)
    2. A user wants to add/edit tags to an etch
        This is complex and depends on how we want to implement tags
            - Are they inside the encrypted payload
            - Are they a separate encrypted field on the etch/entry
    3. We change the format of the etches and want to gracefully upgrade formats
        I don't see having too many data formats, but just in case

### How do we enable searching?

#### Tags
We will definitely enable tagging. How we do it I'm not sure.

1. Tags inside encrypted payload

    Before the payload gets encrypted we can add a tags field.
    
    But this means that server side searching is not an option. A user must have all etches/entries
    locally in order to search for it.
    
2. Tags are encrypted alongside payload

    A tag becomes it's own resource. They are encrypted as etches are encrypted. An etch/entry then
    has references to the tag. The server has no way of knowing what is inside the tag. Tags are
    unique per user. This allows the server to filter by tags and preserves anonymity
    
    Because a tag is encrypted, we can have a specialised representation e.g. it may include extra
    fields such as timestamp created, store ids of entries associated, etc.
    
3. Tags are stored as sha-xxx hashes that includes private key in hash
    
    `taghash = sha-xxx('tagname', privatekey)`
    
    We still have to store the plaintext tags encrypted as another resource. But it simplifies the
    client-side implementation, it's a simple hash without encryption or anything.
    
    We don't get the flexibility of having extra details such as date created, etc.

4. Tags are stored as straightforward sha-xxx hashes

    **Not doing this but wanted to document it regardless**
    
    `taghash = sha-xxx('tagname')`
    
    A tag is sha-xxx hashed and uploaded to the server. It's the same as Option 2 but without
    encryption and without uniqueness. We can see that users `cisco` and `samsepiol` might have
    entries with the same tag. Because tags will be simple words, it will be very easy to figure out
    exactly what each user tagged an etch with. 
    
    We're creating a journal that contains *very private* details. We MUST NOT know that a user has
    written entries with certain tags.


#### Downloadable indexes
On the client side we create indexes of the content and upload the indexes encrypted to the server.

I know literally nothing about searching/indexing and I'm not even sure if it's possible...

Ideally there is a cross platform solution, but I'm not sure if one exists.
