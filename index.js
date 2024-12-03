const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Define route for home
app.get('/home', (req, res) => {
  res.render('home');
});

// Define route for signup pages
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/chairs', (req, res) => {
  res.render('chairs');
});

app.get('/signup3', (req, res) => {
  res.render('signup3');
});

// Define route for signup submission
app.post('/signupsubmit', (req, res) => { 
  const { username, firstname, lastname, email, password } = req.body;

  if (!email) {
    res.status(400).send("Email is required");
    return;
  }

  db.collection('Customer')
    .where("email", "==", email)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        res.render("signupfail");
      } else {
        bcrypt.hash(password, 8)
          .then((hashedPassword) => {
            return db.collection('Customer').add({
              name: firstname + ' ' + lastname,
              email: email,
              password: hashedPassword,
            });
          })
          .then(() => {
            res.render("home");
          })
          .catch((error) => {
            console.error("Error signing up:", error);
            res.send("Signup failed");
          });
      }
    })
    .catch((error) => {
      console.error("Error checking for existing email:", error);
      res.send("Signup failed");
    });
});

// Define route for signin pages
app.get('/signin', (req, res) => {
  res.render('signin');
});

app.get('/signin2', (req, res) => {
  res.render('signin2');
});

app.get('/signin3', (req, res) => {
  res.render('signin3');
});


// Define route for signin submission
app.post('/signinsubmit', (req, res) => {
  const { email, password } = req.body;

  db.collection('Customer')
    .where("email", "==", email)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        const customerData = docs.docs[0].data();
        bcrypt.compare(password, customerData.password)
          .then((result) => {
            if (result) {
              db.collection('Customer').doc(docs.docs[0].id).get()
                .then((doc) => {
                  res.redirect("/home"); // Redirect to home page
                })
                .catch((error) => {
                  console.error("Error retrieving customer data:", error);
                  res.send("Login failed");
                });
            } else {
              res.send("Invalid email or password");
            }
          })
          .catch((error) => {
            console.error("Error comparing passwords:", error);
            res.send("Login failed");
          });
      } else {
        res.send("Invalid email or password");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
      res.send("Login failed");
    });
});

// Define routes for other pages
app.get('/drop', (req, res) => {
  res.render('drop');
});

app.get('/affiliate', (req, res) => {
  res.render('affiliate');
});

app.get('/team', (req, res) => {
  res.render('team');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/viewprofile', (req, res) => {
  res.render('viewprofile');
});

app.get('/price', (req, res) => {
  res.render('price')
})
app.get('/questions', (req, res) => {
  res.render('questions')
})

app.get('/dashbord', (req, res) => {
  res.render('dashbord')
})

app.get('/orders', (req, res) => {
  res.render('orders')
})
app.get('/products', (req, res) => {
  res.render('products')
})

// Example endpoint for fetching data from Firestore
app.get('/your-endpoint', async (req, res) => {
  const collectionReference = db.collection('your-collection'); 
  const queryValue = req.query.someValue;

  if (queryValue !== undefined) {
    try {
      const snapshot = await collectionReference.where('fieldName', '==', queryValue).get();
      const data = snapshot.docs.map(doc => doc.data());
      res.send(data);
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    console.log('Query value is undefined, skipping query');
    res.status(400).send('Bad Request: Query value is undefined');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

