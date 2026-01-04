import toast from "react-hot-toast";
import apiClient from "../../Utils/apiClient";
import { TrainingItem, TrainingType } from "./Types";

export const getAgentId = async (id: string): Promise<string | null> => {
  try {
    if (!id) return null;

    const url = `${apiClient.URLS.user}/${id}`;
    const res = await apiClient.get(url);
    console.log(res);
    return res?.body?.agentProfile?.id ?? null;
  } catch (err) {
    console.error("Failed to get agent id", err);
    return null;
  }
};

export const normalizeTrainingItem = (item: any): TrainingItem => ({
  ...item,
  lastAccessed: item?.lastAccessed ? new Date(item.lastAccessed) : undefined,
  createdAt: item?.createdAt ? new Date(item.createdAt) : item?.createdAt,
  updatedAt: item?.updatedAt ? new Date(item.updatedAt) : item?.updatedAt,
});

export const fetchChapters = async () => {
  try {
    const res = await apiClient.get(apiClient.URLS.training, {}, true);
    if (res.status === 200) {
      toast.success("Chapters fetched");
      return res.body;
    }
  } catch (e) {
    toast.error("Failed to fetch chapters");
    console.log("Failed to fetch chapters", e);
  }
};

export const createChapter = async (
  payload: {
    title: string;
    type: TrainingType;
    src: string;
  },
  setLoading: any
) => {
  setLoading(true);
  try {
    const res = await apiClient.post(apiClient.URLS.training, payload, true);

    if (res.status === 201 || res.status === 200) {
      toast.success("Chapter created");
      return res.body;
    }
  } catch (e: any) {
    toast.error(e?.message || "Failed to create chapter");
    throw e;
  } finally {
    setLoading(false);
  }
};

export const updateChapter = async (
  id: TrainingItem["id"],
  payload: { title: string; type: TrainingType; src: string },
  setLoading: any
) => {
  try {
    setLoading(true);
    const res = await apiClient.put(
      `${apiClient.URLS.training}/${id}`,
      payload,
      true
    );

    if (res.status === 200) {
      toast.success("Chapter updated");
      return res.body;
    }
  } catch (e: any) {
    toast.error(e?.message || "Failed to update chapter");
    throw e;
  } finally {
    setLoading(false);
  }
};

export const deleteChapterApi = async (
  id: TrainingItem["id"],
  setLoading: any
) => {
  setLoading(true);
  try {
    const res = await apiClient.delete(
      `${apiClient.URLS.training}/${id}`,
      {},
      true
    );

    if (res.status === 200) {
      toast.success("Chapter deleted");
      return res.body;
    }
  } catch (e: any) {
    toast.error(e?.message || "Failed to delete chapter");
    throw e;
  } finally {
    setLoading(false);
  }
};

export const updateProgress = async (
  id: TrainingItem["id"],
  payload: { completed?: boolean; viewedTime?: number; lastAccessed?: string },
  isAdmin: boolean,
  user: any
) => {
  if (isAdmin) return;
  try {
    const agentId = await getAgentId(user?.id as string);
    if (!agentId) return;
    const res = await apiClient.patch(
      `${apiClient.URLS.training}/${id}/progress/${agentId}`,
      payload,
      true
    );
    console.log(res);

    if (res.status === 200) {
      toast.success(
        payload.completed ? "Marked as completed" : "Marked as incomplete"
      );
      return res.body;
    }
  } catch (e: any) {
    toast.error(e?.message || "Failed to update progress");
    throw e;
  }
};
