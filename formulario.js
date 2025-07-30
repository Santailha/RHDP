import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    }
});

const questions = [
    { category: 'Desempenho', text: 'Este colaborador entrega os resultados esperados para sua função com qualidade e no prazo?' },
    { category: 'Desempenho', text: 'Demonstra domínio técnico e conhecimento necessário para exercer suas atividades?' },
    { category: 'Desempenho', text: 'Tem iniciativa e autonomia para resolver problemas e buscar melhorias no dia a dia?' },
    { category: 'Desempenho', text: 'Contribui efetivamente para o alcance das metas da equipe/setor?' },
    { category: 'Comportamento', text: 'Demonstra atitudes alinhadas aos valores e à cultura da empresa?' },
    { category: 'Comportamento', text: 'Colabora com a equipe, comunica-se bem e mantém uma postura respeitosa com colegas e clientes?' },
    { category: 'Comportamento', text: 'É confiável, comprometido e mantém uma postura ética em sua atuação?' }
];
const options = [
    { value: 9, label: 'Destaques' }, { value: 8, label: 'Aprimorar técnica' },
    { value: 7, label: 'Aprimorar comportamento' }, { value: 6, label: 'Aprimorar comportamento e técnica' },
    { value: 5, label: 'Desenvolver técnica' }, { value: 4, label: 'Desenvolver comportamento' },
    { value: 3, label: 'Verificar situação' }, { value: 2, label: 'Trabalhar Valores' },
    { value: 1, label: 'Insuficiente' }
];

const questionsContainer = document.getElementById('questions-container');
questions.forEach((q, index) => {
    const questionBlock = document.createElement('div');
    questionBlock.classList.add('question-block');
    const categoryTitle = document.createElement('h3');
    categoryTitle.textContent = `${q.category}`;
    const questionLabel = document.createElement('label');
    questionLabel.textContent = q.text;
    questionLabel.htmlFor = `q${index}`;
    const select = document.createElement('select');
    select.id = `q${index}`;
    select.required = true;
    options.forEach(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt.value;
        optionEl.textContent = `${opt.value} - ${opt.label}`;
        select.appendChild(optionEl);
    });
    questionBlock.appendChild(categoryTitle);
    questionBlock.appendChild(questionLabel);
    questionBlock.appendChild(select);
    questionsContainer.appendChild(questionBlock);
});

const form = document.getElementById('evaluation-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    const answers = [];
    questions.forEach((_, index) => {
        const select = document.getElementById(`q${index}`);
        answers.push({
            question: questions[index].text,
            score: parseInt(select.value)
        });
    });

    const evaluationData = {
        colaboradorNome: document.getElementById('colaborador-nome').value,
        colaboradorCargo: document.getElementById('colaborador-cargo').value,
        coordenadorNome: document.getElementById('coordenador-nome').value,
        answers: answers,
        createdAt: new Date()
    };

    try {
        const docRef = await addDoc(collection(db, 'avaliacoes'), evaluationData);
        window.location.href = `resultado.html?id=${docRef.id}`;
    } catch (error) {
        console.error("Erro ao salvar avaliação: ", error);
        alert("Ocorreu um erro ao salvar. Tente novamente.");
        submitButton.disabled = false;
        submitButton.textContent = 'Finalizar e Ver Resultado';
    }
});
