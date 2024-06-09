 1. **Erstellen Sie die package.json mit `npm init -y`**
 2. **Setzen Sie den Typ in der packag.json auf `type: module`**i
 3. **Installieren Sie die benötigten Pakete `npm i bcryptjs cors dotenv express jsonwebtoken mongoose`**

 4. **Einrichten von Umgebungsvariablen:**
 - Erstellen Sie eine .env-Datei mit folgendem Inhalt
  ```javascript
  TOKEN_KEY = your secret key
  MONGO_URL = your monGO URL
  API_PORT=3002
  ```
5. **Datenbankverbindung erstellen**
 - Erstellen Sie eine neue ordner  `database`
 - In `database` Erstellen Sie eine neue Datei  `connectDB.js`
 - In der `connectDB.js`-Datei erstellen Sie eine Datenbankverbindung mit mongoDB, wie folgt:

```javascript
import mongoose from "mongoose";

const connectDB = (url) => {
  return mongoose.connect(url);
};

export default connectDB;
```


6. **Benutzermodell erstellen**
 - Erstellen Sie eine neue Datei  models/User.js

 ```javascript
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: {type: String,required: true,},
    email: { type: String, required: true },
    password: {type: String,required: true},
    token: { type: String },
    role: {type: String,default: 'benutzer',},
})

const User = mongoose.model('SecureUsers', userSchema)
export default User

 ```


7. **PostModel erstellen**
 - Erstellen Sie eine neue Datei  models/Post.js

 ```javascript
import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'SecureUsers',
    },
    content: String,
})

const Post = mongoose.model('UserPosts', postSchema)
export default Post

 ```


8. **Express-Server erstellen und die erforderlichen Middleware importieren**

```javascript

import dotenv from 'dotenv';
dotenv.config();
import connect from './database/connectDB.js';
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Post from "./models/Post.js";
import roleCheck from "./middleware/roleCheck.js";
import auth from "./middleware/auth.js";

app.use(express.json());
const port = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log("Verbindung mit MongoDB hat geklappt");
    app.listen(port, () => {
      console.log("Server läuft auf:", port);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
```

9. **JWT-Authentifizierungsmiddleware erstellen** 
- Erstellen Sie eine neue Datei middleware/auth.
- Importieren Sie das Modul jsonwebtoken zur Handhabung von JWT.
- Holen Sie Umgebungsvariablen ab.
- Definieren Sie eine Middleware-Funktion zur Überprüfung von JWT-Token.

```javascript
import jwt from 'jsonwebtoken';

const config = process.env;
const auth = (req, res, next) => {
 
  const token =
  req.body.token || req.query.token || req.headers.authorization?.split(" ")[1];;
  

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
 
    return next();
    
  } catch (err) {
    return res.status(401).send(`${token} ${err.name}`);
  }
};

export default auth;

```

## -----------Endpunkte---------------

10. **Benutzerregistrierungs-Endpunkt:**
  - Definieren Sie einen POST-Endpunkt unter `/register`    für die Benutzerregistrierung.
   - Überprüfen Sie die Benutzereingabe (Vorname, Nachname, E-Mail und Passwort).
   - Verschlüsseln Sie das Passwort des Benutzers mit bcrypt.
   - Erstellen Sie einen neuen Benutzer in der Datenbank.
   - Senden Sie die neuen Benutzerdaten in der Antwort.

```javascript   
app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { username, email, password  } = req.body;

    // Validate user input
    if (!(email && password && username )) {
      res.status(400).send(req.body);
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login ");
    }

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      username,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });
    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});
```

11.  **Benutzeranmelde-Endpunkt:**
  - Definieren Sie einen POST-Endpunkt unter /login für die Benutzeranmeldung.
  - Überprüfen Sie die Benutzereingabe (E-Mail und Passwort).
  - Überprüfen Sie, ob der Benutzer in der Datenbank existiert und das Passwort übereinstimmt.
  - Generieren Sie ein JWT-Token zur Authentifizierung.
  - Senden Sie die Benutzerdaten zusammen mit dem Token in der Antwort.

 ```javascript  
app.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password,role } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (bcrypt.compare(password, user.password))) {
    
      // Generate token
      const token = jwt.sign(
        { user_id: user._id, email,role: role},
        process.env.TOKEN_KEY,
      
        {
          expiresIn: "2h",
        }
      );
      user.token = token;
   

      // user
      res.status(200).json(user);
    }else{

      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
  }

});

```


12.  **Alle Benutzerabrufen Endpunkt:**
```javascript
// get all users 
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
  }
});
```

13.  **Einen POST-erstellen Endpunkt**
```javascript
app.post('/post', async (req, res) => {
  const post = await Post.create(req.body)
  res.json(post)
})
```


14.  **Endpunkt zum Abrufen von posts nach Benutzer-ID**
  
```javascript
app.get('/posts/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch posts for the specified user
    const posts = await Post.find({ owner: userId });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
```


15.  **Endpunkt zum löschen von post nach post id**
  
```javascript
app.get('/post/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch posts for the specified user
    const posts = await Post.find({ owner: userId });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
```