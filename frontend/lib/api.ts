const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface SignupData {
  email: string;
  password: string;
  full_name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export const api = {
  // Auth endpoints
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Signup failed');
    }

    return response.json();
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  },

  async getCurrentUser(token: string) {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    return response.json();
  },

  async logout(token: string) {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return response.json();
  },

  // Resume endpoints
  async uploadResume(file: File, token: string) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/resumes/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Resume upload failed');
    }

    return response.json();
  },

  async getResumes(token: string) {
    const response = await fetch(`${API_URL}/resumes/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch resumes');
    }

    return response.json();
  },

  async deleteResume(resumeId: number, token: string) {
    const response = await fetch(`${API_URL}/resumes/${resumeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete resume');
    }

    return response.json();
  },

  // Interview endpoints
  async createInterview(data: { resume_id: number; job_description: string; num_questions?: number }, token: string) {
    const response = await fetch(`${API_URL}/interviews/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create interview');
    }

    return response.json();
  },

  async getInterviews(token: string) {
    console.log('Fetching interviews with token:', token ? 'Token exists' : 'No token');
    const response = await fetch(`${API_URL}/interviews/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch interviews:', response.status, response.statusText);
      throw new Error('Failed to fetch interviews');
    }

    return response.json();
  },

  async getInterview(interviewId: number, token: string) {
    const response = await fetch(`${API_URL}/interviews/${interviewId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch interview');
    }

    return response.json();
  },

  async deleteInterview(interviewId: number, token: string) {
    const response = await fetch(`${API_URL}/interviews/${interviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete interview');
    }

    return response.json();
  },

  // Evaluation endpoints
  async getInterviewResults(interviewId: number, token: string) {
    const response = await fetch(`${API_URL}/evaluation/interviews/${interviewId}/results`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch interview results');
    }

    return response.json();
  },

  async triggerEvaluation(interviewId: number, token: string) {
    const response = await fetch(`${API_URL}/evaluation/interviews/${interviewId}/evaluate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to trigger evaluation');
    }

    return response.json();
  },
};
