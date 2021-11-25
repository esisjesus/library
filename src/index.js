const signUpForm = document.querySelector("#signUpForm")
const signInForm = document.querySelector("#signInForm")
const logout = document.querySelector("#logout")
const signUpModal = new bootstrap.Modal(document.querySelector('#signUpModal'))
const signInModal = new bootstrap.Modal(document.querySelector('#signInModal'))
const addBookForm = document.querySelector('#addBookForm')
const addBookModal = new bootstrap.Modal(document.querySelector('#addBookModal'))

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
signInForm.addEventListener('submit', (e) => {
    e.preventDefault();


    const email = document.querySelector("#signInEmail").value
    const password = document.querySelector("#signInPassword").value

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

// GOOGLE SIGN IN FUNCTION:
const googleButtons = document.querySelectorAll("#googleSignIn")
googleButtons.forEach(e => {
    e.addEventListener('click', (e) => {
        const provider = new firebase.auth.GoogleAuthProvider()
        auth.signInWithPopup(provider)
            .then(result => {
                // Create the new user document in firestore
                createNewUserDocument(result.user)
            }).catch(err => {
                console.log(err)
            })
        signUpForm.reset()
        signUpModal.hide()
        signInForm.reset()
        signInModal.hide()
    })
})

// LOGOUT EVENT: 
logout.addEventListener("click", (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        console.log("logged out")
    })
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

    db.collection('users').doc(auth.currentUser.uid).collection('books').doc().set(Object.assign({}, newBook))
}

addBookForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const title = document.querySelector('#bookTitle').value
    const author = document.querySelector('#bookAuthor').value
    const pages = document.querySelector('#bookPages').value
    const description = document.querySelector('#bookDescription').value
    const read = document.querySelector('#bookRead').value

    addNewBook(title, author, pages, description, read)

    addBookForm.reset()
    addBookModal.hide()
})

// DISPLAY BOOKS
function fetchBooks() {
    const docRef = db.collection('users').doc(auth.currentUser.uid).collection('books')
    docRef.get().then(data => 
        console.log(data))
}
