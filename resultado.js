import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, user => {
    if (!user) window.location.href = 'index.html';
});

const classificationMap = {
    9: { label: 'Destaques', description: 'Profissional com alto desempenho e potencial. Reter e desenvolver para futuras posições de liderança.' },
    8: { label: 'Aprimorar técnica', description: 'Alto potencial, mas precisa desenvolver habilidades técnicas para alcançar o próximo nível.' },
    7: { label: 'Aprimorar comportamento', description: 'Bom desempenho técnico, mas precisa desenvolver habilidades comportamentais e de relacionamento.' },
    6: { label: 'Aprimorar comportamento e técnica', description: 'Profissional em desenvolvimento. Precisa de um plano de ação focado em ambas as frentes.' },
    5: { label: 'Desenvolver técnica', description: 'Demonstra potencial, mas o baixo desempenho técnico é um impeditivo. Focar em treinamento.' },
    4: { label: 'Desenvolver comportamento', description: 'O desempenho é baixo devido a questões comportamentais. Requer feedback e acompanhamento próximo.' },
    3: { label: 'Verificar situação', description: 'Potencial existe, mas o desempenho está muito abaixo. Investigar as causas (motivação, problemas pessoais, etc.).' },
    2: { label: 'Trabalhar Valores', description: 'O desempenho é mediano, mas o comportamento não está alinhado à cultura. Risco para a equipe.' },
    1: { label: 'Insuficiente', description: 'Baixo desempenho e baixo potencial/alinhamento. Possível desalinhamento com a função ou cultura. Ação urgente necessária.' }
};

async function loadResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const evaluationId = urlParams.get('id');

    if (!evaluationId) {
        document.getElementById('loading').textContent = 'ID da avaliação não encontrado.';
        return;
    }

    try {
        const docRef = doc(db, 'avaliacoes', evaluationId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Lógica de cálculo (permanece a mesma)
            const totalScore = data.answers.reduce((sum, answer) => sum + answer.score, 0);
            const averageScore = totalScore / data.answers.length;
            const finalScore = Math.round(averageScore);
            const classification = classificationMap[finalScore];

            // --- NOVA LÓGICA DE RENDERIZAÇÃO ---

            // 1. Preenche as informações gerais
            document.getElementById('result-nome').textContent = data.colaboradorNome;
            document.getElementById('result-cargo').textContent = data.colaboradorCargo;

            // 2. Encontra a caixa correta na grade usando o atributo data-score
            const activeBox = document.querySelector(`.result-box[data-score="${finalScore}"]`);

            if (activeBox) {
                // 3. Adiciona a classe 'active' para destacá-la
                activeBox.classList.add('active');

                // 4. Cria o "card" com o nome do colaborador
                const employeeCard = document.createElement('div');
                employeeCard.className = 'employee-card-result';
                employeeCard.textContent = data.colaboradorNome;

                // 5. Adiciona o card do colaborador dentro da caixa ativa
                activeBox.appendChild(employeeCard);
            }
            
            // 6. Preenche a descrição do plano de ação
            document.getElementById('result-description').textContent = classification.description;

            // 7. Exibe o conteúdo e esconde o "loading"
            document.getElementById('loading').style.display = 'none';
            document.getElementById('result-content').style.display = 'block';

        } else {
            document.getElementById('loading').textContent = 'Avaliação não encontrada.';
        }
    } catch (error) {
        console.error("Erro ao buscar resultado:", error);
        document.getElementById('loading').textContent = 'Erro ao carregar o resultado.';
    }
}

loadResult();
