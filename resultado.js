import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            loadGlobal9Box();
        } else {
            alert("Acesso negado. Esta página é restrita a administradores.");
            window.location.href = 'index.html';
        }
    } else {
        window.location.href = 'index.html';
    }
});

async function loadGlobal9Box() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('result-content').style.display = 'block';

    const generalInfo = document.getElementById('general-info');
    if (generalInfo) {
        generalInfo.style.display = 'none';
    }
    const descriptionWrapper = document.getElementById('final-description-wrapper');
    if (descriptionWrapper) {
        descriptionWrapper.style.display = 'none';
    }
    
    // Altera o título da página
    const mainTitle = document.querySelector('.container h1');
    if(mainTitle) {
        // MUDANÇA AQUI: Corrigindo o título para "Painel Global"
        mainTitle.textContent = "Painel Global";
    }

    try {
        const querySnapshot = await getDocs(collection(db, 'avaliacoes'));

        if (querySnapshot.empty) {
            console.log("Nenhuma avaliação encontrada para exibir no painel.");
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const totalScore = data.answers.reduce((sum, answer) => sum + answer.score, 0);
            const averageScore = totalScore / data.answers.length;
            const finalScore = Math.round(averageScore);

            const targetBox = document.querySelector(`.result-box[data-score="${finalScore}"]`);

            if (targetBox) {
                const employeeCard = document.createElement('div');
                employeeCard.className = 'employee-card-result';
                employeeCard.textContent = data.colaboradorNome;
                targetBox.appendChild(employeeCard);
            }
        });

    } catch (error) {
        console.error("Erro ao carregar o painel 9 Box: ", error);
        alert("Ocorreu um erro ao carregar os dados.");
    }
}
