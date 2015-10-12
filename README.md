# Grommet Example App: people-finder

This app demonstrates a small-sized application using [Modular Grommet](http://grommet.io/docs/documentation/modular-grommet).
We demonstrate mobile-first UI interactions that work great on desktop as well.  Also use patterns such as WebSocket connections and Search. This application **must** have a back-end to perform the REST and LDAP operations.

To run this application, execute the following commands:

  1. Install people-finder
    ```
    $ npm install
    ```

  2. Start development server
    ```
    $ gulp dev
    ```

  3. Create the app distribution to be used by the back-end server

    ```
    $ gulp dist
    ```

  4. Start the back-end server

    ```
    $ node server/server.js
    ```
