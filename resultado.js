import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// A verificação de permissão 'admin' continua a mesma
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            // Se for admin, carregue o painel 9 Box global
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
    // Esconde a mensagem de "loading" e mostra o conteúdo principal
    document.getElementById('loading').style.display = 'none';
    document.getElementById('result-content').style.display = 'block';

    // Remove as informações gerais de um único colaborador, pois agora é uma visão global
    const generalInfo = document.getElementById('general-info');
    if (generalInfo) {
        generalInfo.style.display = 'none';
    }
    const descriptionWrapper = document.getElementById('final-description-wrapper');
    if (descriptionWrapper) {
        descriptionWrapper.style.display = 'none';
    }
    
    // Altera o título da página para refletir a nova função
    const mainTitle = document.querySelector('.container h1');
    if(mainTitle) {
        mainTitle.textContent = "Painel 9 Box Global";
    }

    try {
        // Busca TODAS as avaliações da coleção
        const querySnapshot = await getDocs(collection(db, 'avaliacoes'));

        if (querySnapshot.empty) {
            console.log("Nenhuma avaliação encontrada para exibir no painel.");
            return;
        }

        // Itera sobre CADA avaliação encontrada
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Para cada avaliação, calcula a nota final
            const totalScore = data.answers.reduce((sum, answer) => sum + answer.score, 0);
            const averageScore = totalScore / data.answers.length;
            const finalScore = Math.round(averageScore);

            // Encontra a caixa correta na grade para esta avaliação
            const targetBox = document.querySelector(`.result-box[data-score="${finalScore}"]`);

            if (targetBox) {
                // Cria o "card" com o nome do colaborador
                const employeeCard = document.createElement('div');
                employeeCard.className = 'employee-card-result';
                employeeCard.textContent = data.colaboradorNome;

                // Adiciona o card do colaborador dentro da caixa correta
                // Uma caixa agora pode ter vários cards
                targetBox.appendChild(employeeCard);
            }
        });

    } catch (error) {
        console.error("Erro ao carregar o painel 9 Box: ", error);
        alert("Ocorreu um erro ao carregar os dados.");
    }
}
