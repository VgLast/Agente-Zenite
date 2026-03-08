// ==================== CONFIGURAÇÃO FIREBASE ====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    getDoc, 
    doc, 
    updateDoc, 
    deleteDoc,
    setDoc,
    query,
    where,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==================== CONFIGURAÇÃO FIREBASE ====================
const firebaseConfig = {
  apiKey: "AIzaSyC1k3S1mSzB4JSi2wFm_g0kuQCMfgTdXPw",
  authDomain: "agente-zenite.firebaseapp.com",
  projectId: "agente-zenite",
  storageBucket: "agente-zenite.firebasestorage.app",
  messagingSenderId: "673802919113",
  appId: "1:673802919113:web:e10e26c7b2466312cf0118"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('✅ Firebase inicializado com sucesso!');

// ==================== ESTADO GLOBAL ====================
let currentUser = null;
let currentAgentData = null;
let isAdmin = false;
let unsubscribeAgents = null;
let unsubscribeRequests = null;

// ==================== ELEMENTOS DOM ====================
const loginScreen = document.getElementById('loginScreen');
const requestScreen = document.getElementById('requestScreen');
const agentPanel = document.getElementById('agentPanel');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const logoutAgent = document.getElementById('logoutAgent');
const logoutAdmin = document.getElementById('logoutAdmin');
const showAgentRequest = document.getElementById('showAgentRequest');
const cancelRequest = document.getElementById('cancelRequest');
const submitRequest = document.getElementById('submitRequest');
const agentSideName = document.getElementById('agentSideName');
const agentProfileData = document.getElementById('agentProfileData');
const commissionDetails = document.getElementById('commissionDetails');
const progressList = document.getElementById('progressList');
const newStudentForm = document.getElementById('newStudentForm');
const notificationArea = document.getElementById('notificationArea');

// Admin elements
const agentsTableBody = document.getElementById('agentsTableBody');
const agentCount = document.getElementById('agentCount');
const adminSearchInput = document.getElementById('adminSearchInput');
const showCreateAgentModalBtn = document.getElementById('showCreateAgentModalBtn');
const createAgentModal = document.getElementById('createAgentModal');
const cancelCreateAgent = document.getElementById('cancelCreateAgent');
const confirmCreateAgent = document.getElementById('confirmCreateAgent');
const requestsView = document.getElementById('requestsView');
const agentsTableView = document.getElementById('agentsTableView');
const requestsList = document.getElementById('requestsList');
const requestsBadge = document.getElementById('requestsBadge');
const agentDetailsModal = document.getElementById('agentDetailsModal');
const agentDetailsContent = document.getElementById('agentDetailsContent');
const confirmModal = document.getElementById('confirmModal');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

// Inputs criar agente
const createNome = document.getElementById('createNome');
const createEmail = document.getElementById('createEmail');
const createNumero = document.getElementById('createNumero');
const createIdade = document.getElementById('createIdade');
const createProvincia = document.getElementById('createProvincia');
const createDistrito = document.getElementById('createDistrito');
const createBairro = document.getElementById('createBairro');
const createPagamento = document.getElementById('createPagamento');
const createBi = document.getElementById('createBi');
const createClasse = document.getElementById('createClasse');

// Inputs pedido vaga
const reqNome = document.getElementById('reqNome');
const reqEmail = document.getElementById('reqEmail');
const reqNumero = document.getElementById('reqNumero');
const reqIdade = document.getElementById('reqIdade');
const reqProvincia = document.getElementById('reqProvincia');
const reqDistrito = document.getElementById('reqDistrito');
const reqBairro = document.getElementById('reqBairro');
const reqPagamento = document.getElementById('reqPagamento');
const reqBi = document.getElementById('reqBi');
const reqClasse = document.getElementById('reqClasse');

// Inputs aluno
const alunoNome = document.getElementById('alunoNome');
const alunoNumero = document.getElementById('alunoNumero');
const alunoClasse = document.getElementById('alunoClasse');
const alunoProvincia = document.getElementById('alunoProvincia');
const alunoDistrito = document.getElementById('alunoDistrito');
const alunoDataNasc = document.getElementById('alunoDataNasc');

// ==================== NOTIFICAÇÕES ====================
function showNotification(message, type = 'info', duration = 60000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <i class="fas fa-times" onclick="this.parentElement.remove()" style="margin-left: auto; cursor: pointer;"></i>
    `;
    
    notificationArea.appendChild(notification);
    
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        width: 100%;
        background: linear-gradient(90deg, #f97316, #8b5cf6);
        animation: progressBar ${duration}ms linear forwards;
    `;
    notification.appendChild(progressBar);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.5s ease forwards';
            setTimeout(() => notification.remove(), 500);
        }
    }, duration);
}

// ==================== NOTIFICAÇÃO DE SENHA ====================
function showPasswordNotification(title, message, password, agentId, email) {
    const notification = document.createElement('div');
    notification.className = 'notification password-notification';
    notification.innerHTML = `
        <div style="padding: 5px;">
            <h4 style="color: #f97316; margin-bottom: 10px;">${title}</h4>
            <p style="color: #94a3b8; margin-bottom: 15px;">${message}</p>
            
            <div style="background: #1e2a44; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>ID:</span>
                    <strong style="color: #f97316;">${agentId}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Email:</span>
                    <strong>${email}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid #334155;">
                    <span>Senha:</span>
                    <strong style="color: #f97316; font-size: 1.3rem;">${password}</strong>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="copyPassword('${password}')" class="btn-primary" style="flex: 1; padding: 8px;">
                    <i class="fas fa-copy"></i> Copiar
                </button>
                <button onclick="confirmPassword(this)" class="btn-success" style="flex: 1; padding: 8px;">
                    <i class="fas fa-check"></i> Confirmar
                </button>
            </div>
        </div>
    `;
    
    notificationArea.appendChild(notification);
}

window.copyPassword = (password) => {
    navigator.clipboard.writeText(password);
    showNotification('✅ Senha copiada!', 'success', 3000);
};

window.confirmPassword = (btn) => {
    const notification = btn.closest('.notification');
    if (notification) {
        notification.style.background = '#10b981';
        notification.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fas fa-check-circle" style="font-size: 3rem;"></i><br><br><strong>Senha confirmada!</strong></div>';
        setTimeout(() => notification.remove(), 2000);
    }
};

// ==================== NOTIFICAÇÃO DE PAGAMENTO ====================
function showPaymentNotification(agentName, valor) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-hand-holding-usd" style="font-size: 2rem; color: #10b981;"></i>
        <div style="flex: 1;">
            <strong style="color: #10b981; font-size: 1.1rem;">💰 Pagamento Processado!</strong><br>
            <span style="color: #94a3b8;">${agentName} recebeu <strong style="color: #f97316;">${valor} MZN</strong></span>
        </div>
        <i class="fas fa-times" onclick="this.parentElement.remove()"></i>
    `;
    
    notificationArea.appendChild(notification);
    
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        width: 100%;
        background: linear-gradient(90deg, #10b981, #f97316);
        animation: progressBar 5000ms linear forwards;
    `;
    notification.appendChild(progressBar);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.5s ease forwards';
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
}

// ==================== NOTIFICAÇÃO DE PEDIDO ====================
function showRequestSuccessNotification(nome) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 2rem; color: #10b981;"></i>
        <div style="flex: 1;">
            <strong style="color: #10b981; font-size: 1.1rem;">✅ Pedido enviado!</strong><br>
            <span style="color: #94a3b8;">Olá ${nome}, seu pedido foi recebido.</span><br>
            <small style="color: #64748b;">A administração analisará em breve.</small>
        </div>
        <i class="fas fa-times" onclick="this.parentElement.remove()"></i>
    `;
    
    notificationArea.appendChild(notification);
    
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        width: 100%;
        background: linear-gradient(90deg, #10b981, #f97316);
        animation: progressBar 60000ms linear forwards;
    `;
    notification.appendChild(progressBar);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.5s ease forwards';
            setTimeout(() => notification.remove(), 500);
        }
    }, 60000);
}

function showLoadingNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification info';
    notification.innerHTML = `
        <i class="fas fa-spinner fa-pulse"></i>
        <span>${message}</span>
    `;
    notificationArea.appendChild(notification);
    return notification;
}

// ==================== GERADOR DE SENHA ====================
function generatePassword() {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `1818${random}`;
}

// ==================== GERADOR DE ID ====================
async function generateAgentId() {
    try {
        const snapshot = await getDocs(collection(db, 'agents'));
        const ids = [];
        snapshot.forEach(doc => ids.push(doc.id));
        
        if (ids.length === 0) return 'A001';
        
        const validIds = ids.filter(id => /^[A-Z]\d{3}$/.test(id));
        if (validIds.length === 0) return 'A001';
        
        validIds.sort((a, b) => {
            if (a[0] !== b[0]) return a[0].localeCompare(b[0]);
            return parseInt(a.slice(1)) - parseInt(b.slice(1));
        });
        
        const lastId = validIds[validIds.length - 1];
        const lastLetter = lastId[0];
        const lastNum = parseInt(lastId.slice(1));
        
        if (lastNum >= 100) {
            const nextLetter = String.fromCharCode(lastLetter.charCodeAt(0) + 1);
            return `${nextLetter}001`;
        }
        
        return `${lastLetter}${(lastNum + 1).toString().padStart(3, '0')}`;
        
    } catch (error) {
        console.error('Erro ao gerar ID:', error);
        return 'A001';
    }
}

// ==================== LOGIN ====================
loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    
    if (!email || !password) {
        showNotification('❌ Preencha email e senha', 'error', 5000);
        return;
    }
    
    try {
        if (email === 'admin@zenite.com' && password === 'leonardo123') {
            isAdmin = true;
            loginScreen.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            showNotification('👋 Bem-vindo, Administrador!', 'success', 5000);
            loadAdminPanel();
            return;
        }
        
        const loadingNotif = showLoadingNotification('🔄 Entrando...');
        await signInWithEmailAndPassword(auth, email, password);
        loadingNotif.remove();
        
    } catch (error) {
        console.error('Erro no login:', error);
        showNotification('❌ Email ou senha inválidos', 'error', 5000);
    }
});

// ==================== LOGOUT ====================
function logout() {
    if (!isAdmin) {
        signOut(auth).catch(console.error);
    }
    
    if (unsubscribeAgents) unsubscribeAgents();
    if (unsubscribeRequests) unsubscribeRequests();
    
    isAdmin = false;
    currentAgentData = null;
    
    agentPanel.classList.add('hidden');
    adminPanel.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    
    showNotification('👋 Até logo!', 'info', 3000);
}

logoutAgent.addEventListener('click', logout);
logoutAdmin.addEventListener('click', logout);

// ==================== AUTH STATE ====================
onAuthStateChanged(auth, async (user) => {
    if (user && !isAdmin) {
        try {
            const q = query(collection(db, 'agents'), where('authUid', '==', user.uid));
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
                currentAgentData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
                
                loginScreen.classList.add('hidden');
                agentPanel.classList.remove('hidden');
                
                showNotification(`👋 Bem-vindo, ${currentAgentData.nome}!`, 'success', 5000);
                loadAgentPanel();
            } else {
                await signOut(auth);
            }
        } catch (error) {
            console.error('Erro ao carregar agente:', error);
        }
    }
});

// ==================== PAINEL DO AGENTE ====================
function loadAgentPanel() {
    if (!currentAgentData) return;
    
    agentSideName.textContent = currentAgentData.nome;
    
    const profileHtml = `
        <div class="profile-item"><strong>ID:</strong> <span style="color: #f97316;">${currentAgentData.id}</span></div>
        <div class="profile-item"><strong>Nome:</strong> ${currentAgentData.nome}</div>
        <div class="profile-item"><strong>Email:</strong> ${currentAgentData.email}</div>
        <div class="profile-item"><strong>Telefone:</strong> ${currentAgentData.numero || '-'}</div>
        <div class="profile-item"><strong>Idade:</strong> ${currentAgentData.idade || '-'}</div>
        <div class="profile-item"><strong>Província:</strong> ${currentAgentData.provincia || '-'}</div>
        <div class="profile-item"><strong>Distrito:</strong> ${currentAgentData.distrito || '-'}</div>
        <div class="profile-item"><strong>Bairro:</strong> ${currentAgentData.bairro || '-'}</div>
        <div class="profile-item"><strong>Pagamento:</strong> ${currentAgentData.pagamento || '-'}</div>
        <div class="profile-item"><strong>BI:</strong> ${currentAgentData.bi || '-'}</div>
        <div class="profile-item"><strong>Classe:</strong> ${currentAgentData.classe || '-'}</div>
    `;
    agentProfileData.innerHTML = profileHtml;
    
    refreshAgentTabs();
    loadHistoricoPagamentos();
}

async function refreshAgentTabs() {
    if (!currentAgentData) return;
    
    try {
        const q = query(collection(db, 'students'), where('agentId', '==', currentAgentData.id));
        const snapshot = await getDocs(q);
        const alunos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const total = alunos.length;
        const comissao = Math.floor(total / 6) * 520;
        
        commissionDetails.innerHTML = `
            <div>Total de alunos: <strong>${total}</strong></div>
            <div>Blocos de 10: <strong>${Math.floor(total / 6)}</strong></div>
            <div style="font-size: 2rem; color: #f97316; margin-top: 10px;">${comissao} MZN</div>
        `;
        
        if (alunos.length === 0) {
            progressList.innerHTML = '<p style="color: #94a3b8;">Nenhum aluno cadastrado</p>';
        } else {
            let html = '';
            alunos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            alunos.forEach((al, i) => {
                html += `<div class="progress-item">${i+1}. ${al.nome} - ${al.classe}</div>`;
            });
            progressList.innerHTML = html;
        }
    } catch (error) {
        console.error('Erro ao atualizar abas:', error);
    }
}

// ==================== CARREGAR HISTÓRICO DE PAGAMENTOS ====================
async function loadHistoricoPagamentos() {
    if (!currentAgentData) {
        console.log('❌ Nenhum agente logado');
        return;
    }
    
    try {
        const agentDoc = await getDoc(doc(db, 'agents', currentAgentData.id));
        if (!agentDoc.exists()) return;
        
        const agent = agentDoc.data();
        const historico = agent.historicoPagamentos || [];
        
        // Calcular totais
        const totalRecebido = historico.reduce((acc, pag) => acc + (pag.valor || 0), 0);
        const ultimoPagamento = historico.length > 0 ? historico[historico.length - 1] : null;
        const totalPagamentos = historico.length;
        
// Atualizar elementos
        const totalRecebidoEl = document.getElementById('totalRecebido');
        const ultimoPagamentoEl = document.getElementById('ultimoPagamento');
        const totalPagamentosEl = document.getElementById('totalPagamentos');
        const listaEl = document.getElementById('historicoPagamentosList');
        
        if (totalRecebidoEl) totalRecebidoEl.textContent = `${totalRecebido} MZN`;
        if (totalPagamentosEl) totalPagamentosEl.textContent = totalPagamentos;
        
        if (ultimoPagamentoEl) {
            if (ultimoPagamento) {
                const data = new Date(ultimoPagamento.data).toLocaleDateString('pt-BR');
                ultimoPagamentoEl.textContent = `${data} - ${ultimoPagamento.valor} MZN`;
            } else {
                ultimoPagamentoEl.textContent = '—';
            }
        }
        
        // Renderizar lista
        if (listaEl) {
            if (historico.length === 0) {
                listaEl.innerHTML = `
                    <div class="empty-message">
                        <i class="fas fa-history"></i>
                        <p>Nenhum pagamento recebido ainda</p>
                        <small>Os pagamentos aparecerão aqui quando forem processados</small>
                    </div>
                `;
                return;
            }
            
            const historicoOrdenado = [...historico].sort((a, b) => new Date(b.data) - new Date(a.data));
            
            let html = '';
            historicoOrdenado.forEach((pag, index) => {
                const data = new Date(pag.data).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
                
                const isRecente = index === 0;
                
                html += `
                    <div class="pagamento-item">
                        <div class="pagamento-info">
                            <div class="pagamento-data">
                                <i class="fas fa-calendar-alt"></i> ${data}
                                ${isRecente ? '<span style="color: #f97316; margin-left: 10px;">✓ Mais recente</span>' : ''}
                            </div>
                            <div class="pagamento-valor">
                                <i class="fas fa-coins"></i> ${pag.valor} MZN
                            </div>
                            ${pag.alunosNoMomento ? `
                                <div class="pagamento-alunos">
                                    <i class="fas fa-users"></i> ${pag.alunosNoMomento} alunos
                                </div>
                            ` : ''}
                        </div>
                        <div class="pagamento-status">Pago</div>
                    </div>
                `;
            });
            
            listaEl.innerHTML = html;
        }
    } catch (error) {
        console.error('❌ Erro ao carregar histórico:', error);
    }
}

// ==================== NOVO ALUNO ====================
newStudentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentAgentData) {
        showNotification('❌ Sessão expirada', 'error', 5000);
        return;
    }
    
    const aluno = {
        nome: alunoNome.value.trim(),
        numero: alunoNumero.value.trim(),
        classe: alunoClasse.value.trim(),
        provincia: alunoProvincia.value.trim(),
        distrito: alunoDistrito.value.trim(),
        dataNasc: alunoDataNasc.value,
        agentId: currentAgentData.id,
        createdAt: new Date().toISOString()
    };
    
    if (!aluno.nome || !aluno.classe) {
        showNotification('⚠️ Nome e classe são obrigatórios', 'warning', 5000);
        return;
    }
    
    const loadingNotif = showLoadingNotification('📚 Salvando aluno...');
    
    try {
        await addDoc(collection(db, 'students'), aluno);
        await atualizarComissao(currentAgentData.id);
        
        loadingNotif.remove();
        showNotification('✅ Aluno cadastrado!', 'success', 5000);
        newStudentForm.reset();
        refreshAgentTabs();
        
    } catch (error) {
        console.error('Erro:', error);
        loadingNotif.remove();
        showNotification('❌ Erro ao cadastrar aluno', 'error', 5000);
    }
});

// ==================== ATUALIZAR COMISSÃO ====================
async function atualizarComissao(agentId) {
    try {
        const studentsQuery = query(collection(db, 'students'), where('agentId', '==', agentId));
        const studentsSnapshot = await getDocs(studentsQuery);
        const totalAlunos = studentsSnapshot.size;
        
        const novaComissao = Math.floor(totalAlunos / 10) * 270;
        
        await updateDoc(doc(db, 'agents', agentId), {
            comissao: novaComissao,
            totalAlunos: totalAlunos
        });
        
        return novaComissao;
    } catch (error) {
        console.error('Erro ao atualizar comissão:', error);
    }
}

// ==================== PAINEL DO ADMIN ====================
function loadAdminPanel() {
    loadAgentsData();
    loadRequestsData();
}

async function loadAgentsData() {
    try {
        const snapshot = await getDocs(collection(db, 'agents'));
        const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderAgentsTable(agents);
    } catch (error) {
        console.error('Erro ao carregar agentes:', error);
        showNotification('❌ Erro ao carregar agentes', 'error', 5000);
    }
}

async function loadRequestsData() {
    try {
        const q = query(collection(db, 'requests'), where('status', '==', 'pending'));
        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderRequestsList(requests);
        requestsBadge.textContent = requests.length;
        requestsBadge.style.display = requests.length ? 'inline' : 'none';
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
}

function renderAgentsTable(agents) {
    const search = adminSearchInput.value.toLowerCase();
    const filtered = agents.filter(a => 
        (a.nome || '').toLowerCase().includes(search) || 
        (a.id || '').toLowerCase().includes(search)
    );
    
    if (filtered.length === 0) {
        agentsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum agente encontrado</td></tr>';
        agentCount.textContent = '(0)';
        return;
    }
    
    let html = '';
    filtered.forEach(ag => {
        html += `
            <tr>
                <td><strong>${ag.nome || '-'}</strong><br><small style="color: #f97316;">${ag.id || '-'}</small></td>
                <td>${ag.idade || '-'}</td>
                <td>${ag.numero || '-'}</td>
                <td><strong style="color: #f97316;">${ag.comissao || 0} MT</strong></td>
                <td>
                    <button class="btn-icon" onclick="viewAgent('${ag.id}')" title="Ver"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon" onclick="processPayment('${ag.id}')" title="Pagar" style="color: #10b981;"><i class="fas fa-hand-holding-usd"></i></button>
                    <button class="btn-icon" onclick="deleteAgent('${ag.id}')" title="Eliminar" style="color: #ef4444;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    agentsTableBody.innerHTML = html;
    agentCount.textContent = `(${filtered.length})`;
}

function renderRequestsList(requests) {
    if (requests.length === 0) {
        requestsList.innerHTML = '<div class="empty-requests">Nenhum pedido pendente</div>';
        return;
    }
    
    let html = '';
    requests.forEach(req => {
        html += `
            <div class="request-card-item">
                <h4>${req.nome || '-'}</h4>
                <div style="margin: 10px 0;">
                    <div><small>Email:</small> ${req.email || '-'}</div>
                    <div><small>Telefone:</small> ${req.numero || '-'}</div>
                    <div><small>Província:</small> ${req.provincia || '-'}</div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-reject" onclick="rejectRequest('${req.id}')">Rejeitar</button>
                    <button class="btn-approve" onclick="approveRequest('${req.id}')">Aprovar</button>
                </div>
            </div>
        `;
    });
    requestsList.innerHTML = html;
}

// ==================== AÇÕES DO ADMIN ====================
window.approveRequest = async (requestId) => {
    try {
        const docSnap = await getDoc(doc(db, 'requests', requestId));
        if (!docSnap.exists()) {
            showNotification('❌ Pedido não encontrado', 'error', 5000);
            return;
        }
        
        const req = docSnap.data();
        const password = generatePassword();
        const agentId = await generateAgentId();
        const email = req.email || `${req.nome.toLowerCase().replace(/\s/g, '')}@zenite.com`;
        
        const loadingNotif = showLoadingNotification('🔄 Criando agente...');
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, 'agents', agentId), {
            id: agentId,
            nome: req.nome || '',
            email: email,
            numero: req.numero || '',
            idade: parseInt(req.idade) || 0,
            provincia: req.provincia || '',
            distrito: req.distrito || '',
            bairro: req.bairro || '',
            pagamento: req.pagamento || '',
            bi: req.bi || '',
            classe: req.classe || '',
            comissao: 0,
            authUid: userCredential.user.uid,
            createdAt: new Date().toISOString(),
            historicoPagamentos: []
        });
        
        await deleteDoc(doc(db, 'requests', requestId));
        loadingNotif.remove();
        
        showPasswordNotification(
            '✅ PEDIDO APROVADO',
            `Agente ${req.nome} criado!`,
            password,
            agentId,
            email
        );
        
    } catch (error) {
        console.error('Erro ao aprovar:', error);
        showNotification('❌ Erro ao aprovar: ' + error.message, 'error', 5000);
    }
};

window.rejectRequest = async (requestId) => {
    if (confirm('Tem certeza que deseja rejeitar este pedido?')) {
        try {
            await deleteDoc(doc(db, 'requests', requestId));
            showNotification('❌ Pedido rejeitado', 'warning', 5000);
        } catch (error) {
            console.error('Erro ao rejeitar:', error);
            showNotification('❌ Erro ao rejeitar', 'error', 5000);
        }
    }
};

window.viewAgent = async (agentId) => {
    try {
        const docSnap = await getDoc(doc(db, 'agents', agentId));
        if (!docSnap.exists()) {
            showNotification('❌ Agente não encontrado', 'error', 5000);
            return;
        }
        
        const agent = docSnap.data();
        
        const studentsQuery = query(collection(db, 'students'), where('agentId', '==', agentId));
        const studentsSnapshot = await getDocs(studentsQuery);
        const totalAlunos = studentsSnapshot.size;
        
        const historico = agent.historicoPagamentos || [];
        const totalPago = historico.reduce((acc, p) => acc + (p.valor || 0), 0);
        
        agentDetailsContent.innerHTML = `
            <div style="padding: 20px;">
                <h3 style="color: #f97316;">Detalhes do Agente ${agentId}</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                    <div><strong>Nome:</strong> ${agent.nome}</div>
                    <div><strong>Email:</strong> ${agent.email}</div>
                    <div><strong>Telefone:</strong> ${agent.numero || '-'}</div>
                    <div><strong>Idade:</strong> ${agent.idade || '-'}</div>
                    <div><strong>Total Alunos:</strong> ${totalAlunos}</div>
                    <div><strong>Comissão Atual:</strong> ${agent.comissao || 0} MT</div>
                    <div><strong>Total Pago:</strong> ${totalPago} MT</div>
                    <div><strong>Total Pagamentos:</strong> ${historico.length}</div>
                </div>
                <button class="btn-primary" onclick="document.getElementById('agentDetailsModal').classList.add('hidden')">Fechar</button>
            </div>
        `;
        agentDetailsModal.classList.remove('hidden');
    } catch (error) {
        console.error('Erro ao ver agente:', error);
        showNotification('❌ Erro ao carregar dados', 'error', 5000);
    }
};

window.deleteAgent = async (agentId) => {
    if (confirm('⚠️ Tem certeza que deseja eliminar este agente?')) {
        try {
            await deleteDoc(doc(db, 'agents', agentId));
            showNotification('🗑️ Agente eliminado', 'warning', 5000);
        } catch (error) {
            console.error('Erro ao eliminar:', error);
            showNotification('❌ Erro ao eliminar', 'error', 5000);
        }
    }
};

// ==================== PROCESSAR PAGAMENTO ====================
window.processPayment = async (agentId) => {
    try {
        const agentDoc = await getDoc(doc(db, 'agents', agentId));
        if (!agentDoc.exists()) {
            showNotification('❌ Agente não encontrado', 'error', 5000);
            return;
        }
        
        const agent = agentDoc.data();
        
        const studentsQuery = query(collection(db, 'students'), where('agentId', '==', agentId));
        const studentsSnapshot = await getDocs(studentsQuery);
        const totalAlunos = studentsSnapshot.size;
        
        const valorPagar = Math.floor(totalAlunos / 6) * 520;
        
        if (valorPagar === 0) {
            showNotification('⚠️ Agente não tem comissão (menos de 6 alunos)', 'warning', 5000);
            return;
        }
        
        const modalHtml = `
            <div style="padding: 20px; text-align: center;">
                <i class="fas fa-hand-holding-usd" style="font-size: 4rem; color: #f97316; margin-bottom: 20px;"></i>
                <h3 style="color: white; margin-bottom: 15px;">Confirmar Pagamento</h3>
                
                <div style="background: #1e2a44; padding: 20px; border-radius: 16px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Agente:</span>
                        <strong style="color: #f97316;">${agent.nome}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Total Alunos:</span>
                        <strong>${totalAlunos}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid #334155;">
                        <span style="font-size: 1.2rem;">💰 Valor:</span>
                        <strong style="font-size: 2rem; color: #10b981;">${valorPagar} MZN</strong>
                    </div>
                </div>
                
                <p style="color: #94a3b8; margin-bottom: 20px;">
                    <i class="fas fa-info-circle" style="color: #f97316;"></i>
                    Após o pagamento, a comissão será zerada.
                </p>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button class="btn-secondary" onclick="document.getElementById('confirmModal').classList.add('hidden')">
                        Cancelar
                    </button>
                    <button class="btn-success" onclick="confirmPayment('${agentId}', ${valorPagar})">
                        Confirmar Pagamento
                    </button>
                </div>
            </div>
        `;
        
        confirmTitle.innerHTML = '';
        confirmMessage.innerHTML = modalHtml;
        confirmYes.style.display = 'none';
        confirmNo.textContent = 'Fechar';
        confirmModal.classList.remove('hidden');
        
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        showNotification('❌ Erro ao processar pagamento', 'error', 5000);
    }
};

// ==================== CONFIRMAR PAGAMENTO ====================
window.confirmPayment = async (agentId, valorPago) => {
    try {
        const agentDoc = await getDoc(doc(db, 'agents', agentId));
        if (!agentDoc.exists()) {
            showNotification('❌ Agente não encontrado', 'error', 5000);
            return;
        }
        
        const agent = agentDoc.data();
        
        const studentsQuery = query(collection(db, 'students'), where('agentId', '==', agentId));
        const studentsSnapshot = await getDocs(studentsQuery);
        const totalAlunos = studentsSnapshot.size;
        
        const novoPagamento = {
            data: new Date().toISOString(),
            valor: valorPago,
            alunosNoMomento: totalAlunos
        };
        
        const historicoAtual = agent.historicoPagamentos || [];
        
        await updateDoc(doc(db, 'agents', agentId), {
            comissao: 0,
            ultimoPagamento: new Date().toISOString(),
            ultimoValorPago: valorPago,
            historicoPagamentos: [...historicoAtual, novoPagamento]
        });
        
        confirmModal.classList.add('hidden');
        showPaymentNotification(agent.nome, valorPago);
        
        if (document.getElementById('tab-historico')?.classList.contains('active')) {
            loadHistoricoPagamentos();
        }
        
        loadAgentsData();
        
    } catch (error) {
        console.error('Erro ao confirmar pagamento:', error);
        showNotification('❌ Erro ao confirmar pagamento', 'error', 5000);
    }
};

// ==================== CRIAR AGENTE ====================
confirmCreateAgent.addEventListener('click', async () => {
    const password = generatePassword();
    const agentId = await generateAgentId();
    const email = createEmail.value.trim();
    
    if (!createNome.value.trim() || !email) {
        showNotification('⚠️ Preencha nome e email', 'warning', 5000);
        return;
    }
    
    const loadingNotif = showLoadingNotification('🔄 Criando agente...');
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, 'agents', agentId), {
            id: agentId,
            nome: createNome.value.trim(),
            email: email,
            numero: createNumero.value.trim() || '',
            idade: parseInt(createIdade.value) || 0,
            provincia: createProvincia.value.trim() || '',
            distrito: createDistrito.value.trim() || '',
            bairro: createBairro.value.trim() || '',
            pagamento: createPagamento.value.trim() || '',
            bi: createBi.value.trim() || '',
            classe: createClasse.value.trim() || '',
            comissao: 0,
            authUid: userCredential.user.uid,
            createdAt: new Date().toISOString(),
            historicoPagamentos: []
        });
        
        loadingNotif.remove();
        
        showPasswordNotification(
            '🔐 NOVO AGENTE',
            `Agente ${createNome.value.trim()} criado!`,
            password,
            agentId,
            email
        );
        
        createAgentModal.classList.add('hidden');
        
        const inputs = [createNome, createEmail, createNumero, createIdade, 
                       createProvincia, createDistrito, createBairro, 
                       createPagamento, createBi, createClasse];
        inputs.forEach(i => { if (i) i.value = ''; });
        
    } catch (error) {
        loadingNotif.remove();
        console.error('Erro ao criar agente:', error);
        showNotification('❌ Erro ao criar: ' + error.message, 'error', 5000);
    }
});

// ==================== PEDIDO DE VAGA ====================
submitRequest.addEventListener('click', async () => {
    const requestData = {
        nome: reqNome.value.trim(),
        email: reqEmail.value.trim(),
        numero: reqNumero.value.trim(),
        idade: reqIdade.value.trim(),
        provincia: reqProvincia.value.trim(),
        distrito: reqDistrito.value.trim(),
        bairro: reqBairro.value.trim(),
        pagamento: reqPagamento.value.trim(),
        bi: reqBi.value.trim(),
        classe: reqClasse.value.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    if (!requestData.nome) {
        showNotification('❌ Nome é obrigatório', 'error', 5000);
        return;
    }
    
    const loadingNotif = showLoadingNotification('🔄 Enviando pedido...');
    
    try {
        await addDoc(collection(db, 'requests'), requestData);
        loadingNotif.remove();
        showRequestSuccessNotification(requestData.nome);
        requestScreen.classList.add('hidden');
        
        const inputs = [reqNome, reqEmail, reqNumero, reqIdade, reqProvincia,
                       reqDistrito, reqBairro, reqPagamento, reqBi, reqClasse];
        inputs.forEach(i => { if (i) i.value = ''; });
        
    } catch (error) {
        console.error('Erro ao enviar pedido:', error);
        loadingNotif.remove();
        showNotification('❌ Erro ao enviar pedido', 'error', 5000);
    }
});

// ==================== NAVEGAÇÃO ====================
document.querySelectorAll('.admin-sidebar ul li').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.admin-sidebar ul li').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        if (item.dataset.adminview === 'main') {
            agentsTableView.classList.remove('hidden');
            requestsView.classList.add('hidden');
        } else {
            agentsTableView.classList.add('hidden');
            requestsView.classList.remove('hidden');
        }
    });
});

document.querySelectorAll('.sidebar-nav li').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-nav li').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        const tab = item.dataset.tab;
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');
        
        if (tab === 'progresso' || tab === 'comissao') {
            refreshAgentTabs();
        }
        if (tab === 'historico') {
            loadHistoricoPagamentos();
        }
    });
});

// ==================== MODAIS ====================
showAgentRequest.addEventListener('click', (e) => {
    e.preventDefault();
    requestScreen.classList.remove('hidden');
});

cancelRequest.addEventListener('click', () => {
    requestScreen.classList.add('hidden');
});

showCreateAgentModalBtn.addEventListener('click', () => {
    createAgentModal.classList.remove('hidden');
});

cancelCreateAgent.addEventListener('click', () => {
    createAgentModal.classList.add('hidden');
});

adminSearchInput.addEventListener('input', () => {
    loadAgentsData();
});

window.addEventListener('click', (e) => {
    if (e.target === requestScreen) requestScreen.classList.add('hidden');
    if (e.target === createAgentModal) createAgentModal.classList.add('hidden');
    if (e.target === agentDetailsModal) agentDetailsModal.classList.add('hidden');
    if (e.target === confirmModal) confirmModal.classList.add('hidden');
});

confirmNo.addEventListener('click', () => {
    confirmModal.classList.add('hidden');
});

// ==================== ANIMAÇÕES CSS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes progressBar {
        from { width: 100%; }
        to { width: 0%; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
