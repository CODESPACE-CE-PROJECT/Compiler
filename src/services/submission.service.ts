import { ISubmission } from "../interfaces/submission.interface";
import { api } from "./api.service";

export const submissionService = {
  submit: async (body: ISubmission, token: string | undefined) => {
    try {
      const response = await api.post("/submission", body, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 20000
      });
      return response.data;
    } catch (error: any) {
      throw new Error("Error Create Submission");
    }
  },
  learnifySubmit: async (body: ISubmission, token: string | undefined) => {

  }
};

