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
        // Usuário está logado, agora vamos verificar sua função (role)
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            // Se for admin, carregue as avaliações
            loadEvaluations();
        } else {
            // Se não for admin, expulse da página
            alert("Acesso negado. Esta página é restrita a administradores.");
            window.location.href = 'index.html';
        }
    } else {
        // Se não estiver logado, vá para a página de login
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

        let html = '<table><thead><tr><th>Colaborador</th><th>Cargo</th><th>Data</th><th>Ação</th></tr></thead><tbody>';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.createdAt.toDate().toLocaleDateString('pt-BR');
            html += `
                <tr>
                    <td>${data.colaboradorNome}</td>
                    <td>${data.colaboradorCargo}</td>
                    <td>${date}</td>
                    <td><a href="resultado.html?id=${doc.id}">Ver Detalhes</a></td>
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
