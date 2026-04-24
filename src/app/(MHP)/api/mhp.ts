import axios from "axios";
import axiosInstance from "@/lib/axios";
import { BASEURLDOTNETAPI } from "@/lib/base";

export type MHPData = {
  userId: string;
  email: string;
  phoneNumber: string;
  message: string;
  mhpId: string;
  firstname?: string;
  lastname?: string;
};

export type ClientData = {
  id: string;
  userId: string;
  email: string;
  phoneNumber: string;
  message: string;
  mhpId: string;
  inSession: boolean;
  inFollowUp: boolean;
  isApproved?: boolean;
};

export type MHPListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type UserProfile = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  roles: string[];
};

export type SeekRequestPayload = {
  id: number;
  userId: string;
  email: string;
  phoneNumber: string;
  message: string;
  mhpId: string;
  inSession: boolean;
  inFollowUp: boolean;
  isApproved?: boolean;
};

export async function getMHPById(mhpId: string): Promise<MHPData> {
  try {
    const response = await axiosInstance.get<MHPData>(
      `${BASEURLDOTNETAPI}api/MHPSeekControllers/get-by-id/${mhpId}`,
    );
    console.log("✅ getMHPById success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ getMHPById error:", error);
    throw new Error(`Failed to fetch MHP data: ${error}`);
  }
}

export async function getClientsByMHP(mhpId: string): Promise<ClientData[]> {
  try {
    const response = await axiosInstance.get<ClientData[]>(
      `${BASEURLDOTNETAPI}api/MHPSeekControllers/get-by-id/${mhpId}`,
    );
    console.log("✅ getClientsByMHP success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ getClientsByMHP error:", error);
    return [];
  }
}

export async function updateClientStatus(
  seekRequestId: string,
  userId: string,
  data: ClientData,
): Promise<void> {
  try {
    await axiosInstance.put<void>(
      `${BASEURLDOTNETAPI}api/MHPSeekControllers/update/${seekRequestId}/${userId}`,
      data,
    );
    console.log("✅ updateClientStatus success:", seekRequestId, userId);
  } catch (error) {
    console.error("❌ updateClientStatus error:", error);
    throw new Error(`Failed to update client status: ${error}`);
  }
}

// Backend delete endpoint expects a numeric seek-request id in the `userId` query param (Swagger naming).
export async function deleteClient(seekRequestId: string): Promise<void> {
  try {
    await axiosInstance.delete<void>(
      `${BASEURLDOTNETAPI}api/MHPSeekControllers/delete`,
      {
        params: { userId: seekRequestId },
      },
    );
    console.log("✅ deleteClient success:", seekRequestId);
  } catch (error) {
    console.error("❌ deleteClient error:", error);
    throw new Error(`Failed to delete client: ${error}`);
  }
}

export async function getAllMHPs(): Promise<MHPListItem[]> {
  try {
    const response = await axiosInstance.get<{ data: MHPListItem[] }>(
      `${BASEURLDOTNETAPI}api/MHPSeekControllers/get-all-mhp`,
    );
    console.log("✅ getAllMHPs success:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("❌ getAllMHPs error:", error);
    throw new Error(`Failed to fetch MHPs: ${error}`);
  }
}

export async function createSeekRequest(
  payload: SeekRequestPayload,
): Promise<void> {
  try {
    await axiosInstance.post<void>(
      `${BASEURLDOTNETAPI}api/MHPSeekControllers/create`,
      payload,
    );
    console.log("✅ createSeekRequest success");
  } catch (error) {
    console.error("❌ createSeekRequest error:", error);
    throw new Error(`Failed to create seek request: ${error}`);
  }
}

export async function getUserProfileById(userId: string): Promise<UserProfile> {
  try {
    const response = await axiosInstance.get<UserProfile>(
      `${BASEURLDOTNETAPI}api/User/GetProfileById`,
      { params: { userId } },
    );
    console.log("✅ getUserProfileById success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ getUserProfileById error:", error);
    throw new Error(`Failed to fetch user profile: ${error}`);
  }
}

export type MHPSessionListItem = {
  id: number;
  userId: string;
  mhpId: string;
  sessionType: string;
  sessionSetting: string;
  sessionDate: string;
  sessionTime: string;
  attendance: string;
  progress: number;
  dateCreated: string;
};

export type MHPSessionDetail = MHPSessionListItem & {
  googleMeetLink: string;
  duration: number;
  topicsCovered: string;
  therapistNotes: string;
  nextScheduledSession?: string | null;
  dateUpdated: string;
};

export type UpdateSessionPayload = {
  userId: string;
  mhpId: string;
  sessionType: string;
  sessionSetting: string;
  googleMeetLink: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  attendance: string;
  progress: number;
  topicsCovered: string;
  therapistNotes: string;
  nextScheduledSession?: string | null;
};

export type CreateApprovedSessionPayload = {
  userId: string;
  mhpId: string;
  sessionType: string;
  sessionSetting: string;
  googleMeetLink: string;
  sessionDate: string;
  sessionTime: string;
  duration?: number;
  attendance?: string;
  progress?: number;
  topicsCovered?: string;
  therapistNotes?: string;
  nextScheduledSession?: string | null;
};

export type ApproveSessionEmailPayload = {
  userId: string;
  clientName: string;
  clientEmail: string;
  messageToClient: string;
  sessionType: string;
  googleMeetLink: string;
  date: string;
  time: string;
  mhpEmail: string;
  mhpPhone: string;
  additionalNotes: string;
};

export async function getSessionsByMHP(
  mhpId: string,
): Promise<MHPSessionListItem[]> {
  try {
    const response = await axiosInstance.get<{
      message: string;
      data: MHPSessionListItem[];
      count: number;
    }>(`${BASEURLDOTNETAPI}api/mhpsessionapproved/mhp/${mhpId}`);
    console.log("✅ getSessionsByMHP success:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("❌ getSessionsByMHP error:", error);
    throw new Error(`Failed to fetch sessions: ${error}`);
  }
}

export async function getSessionsByClient(
  clientId: string,
): Promise<MHPSessionListItem[]> {
  try {
    const response = await axiosInstance.get<{
      message: string;
      data: MHPSessionListItem[];
      count: number;
    }>(`${BASEURLDOTNETAPI}api/mhpsessionapproved/client/${clientId}`);
    console.log("✅ getSessionsByClient success:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("❌ getSessionsByClient error:", error);
    throw new Error(`Failed to fetch client sessions: ${error}`);
  }
}

export async function getSessionById(id: number): Promise<MHPSessionDetail> {
  try {
    const response = await axiosInstance.get<{
      message: string;
      data: MHPSessionDetail;
    }>(`${BASEURLDOTNETAPI}api/mhpsessionapproved/${id}`);
    console.log("✅ getSessionById success:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("❌ getSessionById error:", error);
    throw new Error(`Failed to fetch session: ${error}`);
  }
}

export async function updateSession(
  id: number,
  payload: UpdateSessionPayload,
): Promise<void> {
  try {
    await axiosInstance.put<void>(
      `${BASEURLDOTNETAPI}api/mhpsessionapproved/${id}`,
      payload,
    );
    console.log("✅ updateSession success:", id);
  } catch (error) {
    console.error("❌ updateSession error:", error);
    throw new Error(`Failed to update session: ${error}`);
  }
}

export async function deleteSession(id: number): Promise<void> {
  try {
    await axiosInstance.delete<void>(
      `${BASEURLDOTNETAPI}api/mhpsessionapproved/${id}`,
    );
    console.log("✅ deleteSession success:", id);
  } catch (error) {
    console.error("❌ deleteSession error:", error);
    throw new Error(`Failed to delete session: ${error}`);
  }
}

export async function createApprovedSession(
  payload: CreateApprovedSessionPayload,
): Promise<void> {
  try {
    await axiosInstance.post<void>(
      `${BASEURLDOTNETAPI}api/mhpsessionapproved/create`,
      payload,
    );
    console.log("âœ… createApprovedSession success");
  } catch (error) {
    console.error("âŒ createApprovedSession error:", error);
    throw new Error(`Failed to create approved session: ${error}`);
  }
}

export async function sendApprovedSessionEmail(
  payload: ApproveSessionEmailPayload,
): Promise<void> {
  try {
    await axiosInstance.post<void>(
      `${BASEURLDOTNETAPI}api/MHPSeekControllers/approve-session`,
      payload,
    );
    console.log("âœ… sendApprovedSessionEmail success");
  } catch (error) {
    console.error("âŒ sendApprovedSessionEmail error:", error);
    throw new Error(`Failed to send approval email: ${error}`);
  }
}

export async function createApprovedSessionSafe(
  payload: CreateApprovedSessionPayload,
): Promise<void> {
  try {
    await axiosInstance.post<void>(
      `${BASEURLDOTNETAPI}api/mhpsessionapproved/create`,
      payload,
    );
    console.log("createApprovedSession success");
  } catch (error) {
    console.error("createApprovedSession error:", error);
    if (axios.isAxiosError(error)) {
      const validationErrors = error.response?.data?.errors;
      const formattedValidationErrors =
        validationErrors &&
        typeof validationErrors === "object" &&
        !Array.isArray(validationErrors)
          ? Object.entries(validationErrors)
              .map(([field, messages]) => {
                const value = Array.isArray(messages)
                  ? messages.join(", ")
                  : String(messages);
                return `${field}: ${value}`;
              })
              .join(" | ")
          : "";
      const apiMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message ||
            formattedValidationErrors ||
            error.response?.data?.title ||
            JSON.stringify(error.response?.data);
      throw new Error(
        `Failed to create approved session: ${apiMessage || error.message}`,
      );
    }
    throw new Error(`Failed to create approved session: ${error}`);
  }
}
