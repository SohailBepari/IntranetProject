  The project is to make an offline storage system like drive with a login system.To use the project, do the following:
  
  1. Download all the files and folders in the repository as it is and copy all of it in a suitable folder( preferably in F drive).
  2. Install node.js and install all dependencies by entering this in command line - npm install
  3. Edit updown.js and passport.js file and enter your MySQL database credentials. The database schema is :
  <pre>
  {
    name            varchar(20)   not null Primary Key,
    email           varchar(30)   not null unique,
    userPassword    varchar(100)  not null,
    date timestamp  default CURRENT_TIMESTAMP
  }
  </pre>
  4. Change directory in command line and execute "node mainnodefile" in the directory in which all downloaded files and folders reside.
  5. Now you can visit localhost in your browser with port 8000 and use the website.
