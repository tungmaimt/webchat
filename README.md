This project was made by Mai Thanh Tung
version 1.0.0

Using react, nodejs server and webpack.

You need to install nodejs, mongodb and redis to run this project.

How to run develop
  Edit redis connect url in .env file with your redis connect url.
  Start your redis.
  Open your terminal or command prompt at the directory.
  Install package of react client side, run:
    > npm install
  Install package of server side, run:
    > cd src/server/
    > npm install
  If using terminal, run:
    > cd ../../
    > npm run dev
  If using command prompt:
    Start your mongodb.
    Run:
      > cd ../../
      > npm run client
    Open another command prompt at the directory and run:
      > cd src/server/
      > npm run dev
  