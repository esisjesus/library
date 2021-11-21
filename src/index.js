const signUpForm = document.querySelector("#signUpForm")
const signInForm = document.querySelector("#signInForm")
const logout = document.querySelector("#logout")
const signUpModal = new bootstrap.Modal(document.querySelector('#signUpModal'))
const signInModal = new bootstrap.Modal(document.querySelector('#signInModal'))

// REGISTER A NEW USER USING FIREBASE AUTH:
signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();


    const email = document.querySelector("#signUpEmail").value
    const password = document.querySelector("#signUpPassword").value

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user
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
            console.log(user)
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
googleButtons.forEach(e=>{
    e.addEventListener('click', (e) => {
        const provider = new firebase.auth.GoogleAuthProvider()
        auth.signInWithPopup(provider)
            .then(result => {
                console.log(result.user, result.credential)
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
