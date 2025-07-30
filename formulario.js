import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
    { category: 'Desempenho', text: 'Tem iniciativa para resolver problemas e buscar melhorias no dia a dia?' },
    { category: 'Desempenho', text: 'Contribui efetivamente para o alcance das metas da equipe/setor?' },
    { category: 'Comportamento', text: 'Demonstra atitudes alinhadas aos valores e à cultura da empresa?' },
    { category: 'Comportamento', text: 'Colabora com a equipe, comunica-se bem e mantém uma postura respeitosa com colegas e clientes?' },
    { category: 'Comportamento', text: 'É confiável, comprometido e mantém uma postura ética em sua atuação?' }
];
const options = [
    { value: 9, label: 'Destaque (Alta performance e forte alinhamento comportamental.)' }, { value: 8, label: 'Aprimorar técnica (Alto comportamento, mas com lacunas técnicas.)' },
    { value: 7, label: 'Aprimorar comportamento (Bom desempenho técnico, mas precisa melhorar atitude.)' }, { value: 6, label: 'Aprimorar comportamento e técnica (Parcialmente, há fragilidades em ambos os pilares.)' },
    { value: 5, label: 'Desenvolver técnica (Demonstra potencial e boa postura, mas falta conhecimento técnico.)' }, { value: 4, label: 'Desenvolver comportamento (Demonstra comportamentos desalinhados ou riscos à cultura.)' },
    { value: 3, label: 'Verificar situação (Instável, pode estar em adaptação ou com questões externas afetando.)' }, { value: 2, label: 'Trabalhar Valores (Postura ou atitude em desacordo com os valores organizacionais. Impacta negativamente o ambiente.)' },
    { value: 1, label: 'Insuficiente (Desempenho e comportamento críticos. Pode comprometer a equipe.)' }
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
        window.location.href = `sucesso.html`;
    } catch (error) {
        console.error("Erro ao salvar avaliação: ", error);
        alert("Ocorreu um erro ao salvar. Tente novamente.");
        submitButton.disabled = false;
        submitButton.textContent = 'Finalizar Avaliação';
    }
});

// MUDANÇA AQUI: Lógica para MOSTRAR o ícone, em vez de criar um botão.
const authForLink = getAuth(app);
onAuthStateChanged(authForLink, async (user) => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        // Remove o botão antigo, caso ele exista de uma versão anterior do código
        const oldAdminLink = document.getElementById('admin-link');
        if (oldAdminLink) {
            oldAdminLink.remove();
        }

        // Procura pelo novo ícone no HTML
        const adminIconLink = document.getElementById('admin-icon-link');
        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            // Se for admin, torna o ícone visível
            if(adminIconLink) adminIconLink.style.display = 'block';
        } else {
            // Garante que o ícone esteja escondido para não-admins
            if(adminIconLink) adminIconLink.style.display = 'none';
        }
    }
});
