muh_imageboard_thing
====================
Attempting to make decentralized imageboard software.

TODO:
-----
* Implement client-side startup procedure (connecting to the network, filling the DHT, etc)
* Implement server-side startup procedure (^)
* Figure out how to communicate between browser tabs, so that only one tab has to manage connections
* Figure out how to/if it is possible to transfer connections to another tab so as to change which tab is the "root" tab
* Figure out how permission to host content on another node should be granted.
* Figure out how posts should be made
* Figure out how we verify users so that they can add/remove hosts from their posts without other users being able to do this.
* Figure out how to implement a persistent database of posts, both client-side and server-side
  * Particularly, figure out how we store all the data client-side if a client node wants to be a host;
    we won't be able to create files on a whim so this could be tricky.  
