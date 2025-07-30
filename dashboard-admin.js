import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const evaluationsListDiv = document.getElementById('evaluations-list');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            loadEvaluations();
        } else {
            alert("Acesso negado. Esta página é restrita a administradores.");
            window.location.href = 'index.html';
        }
    } else {
        window.location.href = 'index.html';
    }
});

async function loadEvaluations() {
    try {
        const q = query(collection(db, 'avaliacoes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            evaluationsListDiv.innerHTML = '<p>Nenhuma avaliação encontrada.</p>';
            return;
        }
        
        // MUDANÇA AQUI: Tabela agora mostra a nota final, sem o link de detalhes
        let html = '<table><thead><tr><th>Colaborador</th><th>Cargo</th><th>Data</th><th>Nota Final</th></tr></thead><tbody>';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.createdAt.toDate().toLocaleDateString('pt-BR');
            
            // Calcula a nota final para exibir na tabela
            const totalScore = data.answers.reduce((sum, answer) => sum + answer.score, 0);
            const averageScore = totalScore / data.answers.length;
            const finalScore = Math.round(averageScore);

            html += `
                <tr>
                    <td>${data.colaboradorNome}</td>
                    <td>${data.colaboradorCargo}</td>
                    <td>${date}</td>
                    <td><b>${finalScore}</b></td>
                </tr>
            `;
        });
        html += '</tbody></table>';

        evaluationsListDiv.innerHTML = html;

    } catch (error) {
        console.error("Erro ao carregar avaliações: ", error);
        evaluationsListDiv.innerHTML = '<p>Ocorreu um erro ao carregar as avaliações.</p>';
    }
}
