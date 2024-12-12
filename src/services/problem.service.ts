import { api } from "./api.service";

export const problemService = {
  getTestCases: async (problemId: string, token: string | undefined) => {
    try {
      const response = await api.get(`/problem/${problemId}/testcase`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error("Error Fetch Test Case");
    }
  },
};
