import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const userInfo = document.getElementById('user-info');
const userEmailSpan = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            window.location.href = 'formulario.html';
        })
        .catch((error) => {
            errorMessage.textContent = "E-mail ou senha incorretos.";
            console.error("Erro no login:", error);
        });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginForm.style.display = 'none';
        userInfo.style.display = 'block';
        userEmailSpan.textContent = user.email;
    } else {
        loginForm.style.display = 'block';
        userInfo.style.display = 'none';
    }
});

logoutButton.addEventListener('click', () => {
    signOut(auth).catch((error) => {
        console.error("Erro no logout:", error);
    });
});
