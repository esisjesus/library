const signUpForm = document.querySelector("#signUpForm")
const signInForm = document.querySelector("#signInForm")
const logout = document.querySelector("#logout")
const signUpModal = new bootstrap.Modal(document.querySelector('#signUpModal'))
const signInModal = new bootstrap.Modal(document.querySelector('#signInModal'))
const addBookForm = document.querySelector('#addBookForm')
const addBookModal = new bootstrap.Modal(document.querySelector('#addBookModal'))
const library = document.querySelector("#library")

// REGISTER A NEW USER USING FIREBASE AUTH:
signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();


    const email = document.querySelector("#signUpEmail").value
    const password = document.querySelector("#signUpPassword").value

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user
            // Create the new user document in firestore
            createNewUserDocument(user)
            // Close and clear form
            signUpForm.reset()
            signUpModal.hide()
        }).catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
        });
})

// USER SIGN IN USING FIREBASE AUTH:
signInForm.addEventListener('submit', e => { handleSignIn(e) })

function handleSignIn(ev) {
    ev.preventDefault();
    signInWithEmail()
        .then(fetchBooks)
        .then(books => {
            books.forEach(book => {
                addCardToHTML(book.data().title, book.data().author, book.data().pages, book.data().description, book.data().read)
            })
        })
}
function signInWithEmail() {
    const email = document.querySelector("#signInEmail").value
    const password = document.querySelector("#signInPassword").value
    return new Promise((resolve, reject) => {
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                var user = userCredential.user;
                // Close and clear form
                signInForm.reset()
                signInModal.hide()

            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
            });
    })

}

// GOOGLE SIGN IN FUNCTION:
const googleButtons = document.querySelectorAll("#googleSignIn")
function handleGoogleSignIn() {
    signInWithGoogle()
        .then(fetchBooks)
        .then(books => {
            books.forEach(book => {
                addCardToHTML(book.data().title, book.data().author, book.data().pages, book.data().description, book.data().read)
            })
        })
}
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider()
    return new Promise((resolve, reject) => {
        auth.signInWithPopup(provider)
            .then(result => {
                // Create the new user document in firestore
                createNewUserDocument(result.user)

                signUpForm.reset()
                signUpModal.hide()
                signInForm.reset()
                signInModal.hide()

            }).catch(err => {
                console.log(err)
            })
    })
}
googleButtons.forEach(e => {
    e.addEventListener('click', handleGoogleSignIn)
})

// LOGOUT EVENT: 
logout.addEventListener("click", (e) => {
    e.preventDefault();
    auth.signOut()
        .then(clearFeed)
})

// CHECK USER
auth.onAuthStateChanged((user) => {
    if (user) {
        logout.style.display = "block"
        document.querySelector("#signIn").style.display = "none"
        document.querySelector("#signUp").style.display = "none"
    } else {
        logout.style.display = "none"
        document.querySelector("#signIn").style.display = "block"
        document.querySelector("#signUp").style.display = "block"
    }
})
//INIT USER STORAGE DOCUMENT
function createNewUserDocument(user) {
    db.collection('users').doc(user.uid).set({
        email: user.email
    })
}

//DISPLAY ADD NEW BOOK MODAL DEPENDS IF USER IS LOGGED IN OR NOT
function addNewBookModal() {
    if (auth.currentUser != null) {
        addBookModal.show()
    } else {
        signInModal.show()
    }
}
// BOOK CONSTRUCTOR
const Book = function (title, author, pages, description, read) {
    this.title = title
    this.author = author
    this.pages = pages
    this.description = description
    this.read = read
}
// ADD NEW BOOK TO LIBRARY
function addNewBook(title, author, pages, description, read) {
    const newBook = new Book(title, author, pages, description, read)
    return db.collection('users').doc(auth.currentUser.uid).collection('books').doc().set(Object.assign({}, newBook))
}

addBookForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const title = document.querySelector('#bookTitle').value
    const author = document.querySelector('#bookAuthor').value
    const pages = document.querySelector('#bookPages').value
    const description = document.querySelector('#bookDescription').value
    const read = document.querySelector('#bookRead').value
    
    addBookForm.reset()
    addBookModal.hide()

    
    addNewBook(title, author, pages, description, read)
    .then(fetchBooks)
    .then(books => {
        books.forEach(book => {
            addCardToHTML(book.data().title, book.data().author, book.data().pages, book.data().description, book.data().read)
        })
    })
    

})

// DISPLAY BOOKS
function fetchBooks() {
    const docRef = db.collection('users').doc(auth.currentUser.uid).collection('books')
    return new Promise((resolve, reject) => {
        docRef.get().then(querySnapshot => {
            resolve(querySnapshot.docs)
        }).catch(err => {
            console.log(err);

        })

    })
}

// INJECT THE BOOK CARDS INTO THE HTML
function addCardToHTML(title, author, pages, description, read) {
    const card = `<div class="card shadow col-sm-12 col-lg-3 m-3" style="max-width: 15rem; min-height: 350px;">
    <div class="card-body">
      <h5 class="card-title text-danger">${title}</h5>
      <h6 class="card-subtitle mb-2 text-muted">${author} ${pages}</h6>
      <p class="card-text">${description}</p>
      <span>${read == "on" ? "I've read this book" : "I haven't read this book yet"}</span>
    </div>
  </div>`

    library.innerHTML += card
}
// CLEAR BOOKS CARDS FROM FEED
function clearFeed() {
    return new Promise((resolve, reject) => {
        while (library.lastChild.id != "firstNode") {
            library.removeChild(library.lastChild)
        }
    })
}
//INIT
function init() {
    auth.onAuthStateChanged(user => {
        user ? fetchBooks()
            .then(books => {
                books.forEach(book => {
                    addCardToHTML(book.data().title, book.data().author, book.data().pages, book.data().description, book.data().read)
                })
            })
            : null
    })

}

window.onload = function () {
    init()
}





