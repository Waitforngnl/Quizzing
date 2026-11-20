const API_URL = 'http://localhost:5000';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const api = {
    createQuiz: async (name: string) => {
        const res = await fetch(`${API_URL}/quizzes`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name, status: 'draft' })
        });
        return res.json();
    },

    getMyQuizzes: async () => {
        const res = await fetch(`${API_URL}/quizzes`, {
            method: 'GET',
            headers: getHeaders()
        });
        return res.json();
    },

    getQuizDetail: async (id: number) => {
        const res = await fetch(`${API_URL}/quizzes/${id}`, {
            method: 'GET',
            headers: getHeaders()
        });
        return res.json();
    },

    deleteQuiz: async (id: number) => {
        const res = await fetch(`${API_URL}/quizzes/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return res.json();
    },

    updateQuiz: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/quizzes/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    getQuestions: async (quizId: number) => {
        const res = await fetch(`${API_URL}/quizzes/${quizId}/questions`, {
            method: 'GET',
            headers: getHeaders()
        });
        return res.json();
    },

    addQuestion: async (quizId: number, content: string, type: string, data: any) => {
        const res = await fetch(`${API_URL}/quizzes/${quizId}/questions`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ content, type, data })
        });
        return res.json();
    },

    updateQuestion: async (quizId: number, questionId: number, content: string, type: string, data: any) => {
        const res = await fetch(`${API_URL}/quizzes/${quizId}/questions/${questionId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ content, type, data }) // <--- Include type here
        });
        return res.json();
    },

    getHistory: async () => {
        const res = await fetch(`${API_URL}/history`, {
            method: 'GET',
            headers: getHeaders()
        });
        return res.json();
    },

    getQuizStats: async (quizId: number) => {
        const res = await fetch(`${API_URL}/quizzes/${quizId}/stats`, {
            method: 'GET',
            headers: getHeaders()
        });
        return res.json();
    },
    submitAttempt: async (attemptId: number, answers: any[]) => {
        const res = await fetch(`${API_URL}/attempts/${attemptId}/submit`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ answers })
        });
        return res.json();
    },

    enrollQuiz: async (accessCode: string) => {
        const res = await fetch(`${API_URL}/quizzes/join`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ accessCode })
        });
        return res.json();
    },

    // [NEW] Get list of quizzes I have joined
    getEnrolledQuizzes: async () => {
        const res = await fetch(`${API_URL}/quizzes/enrolled`, {
            method: 'GET',
            headers: getHeaders()
        });
        return res.json();
    },

    // [NEW] Get list of members (For Owner)
    getQuizMembers: async (quizId: number) => {
        const res = await fetch(`${API_URL}/quizzes/${quizId}/members`, {
            method: 'GET',
            headers: getHeaders()
        });
        return res.json();
    },
    
    getPopular: async () => {
        const res = await fetch(`${API_URL}/quizzes/popular`, {
            method: 'GET',
            headers: getHeaders() // Optional if public
        });
        return res.json();
    },
    startAttempt: async (quizId: number) => {
        const res = await fetch(`${API_URL}/quizzes/${quizId}/start`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({})
        });
        return res.json();
    },
    searchQuizzes: async (query: string) => {
        const res = await fetch(`${API_URL}/quizzes/search?name=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: getHeaders()
        });
        return res.json();
    },
    
    joinByCode: async (_accessCode: string) => {
        // Assuming your backend handles code lookup logic in 'joinQuiz' or similar
        // For now, mapping to startAttempt if you find the ID, or a specific endpoint
        // This needs a specific controller method if you want to join purely by code string
        return { message: "Feature in progress" }; 
    },

    deleteQuestion: async (quizId: number, questionId: number) => {
        const res = await fetch(`${API_URL}/quizzes/${quizId}/questions/${questionId}`,{
        method: 'DELETE',
        headers: getHeaders()
        }
    )

    
        return res.json();
    },

};