export const fetchDocWithId = async (id, token) => {
  try {
    const res = await fetch(`https://docs.googleapis.com/v1/documents/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const getDocLastIndex = (docData) => {
  const content = docData?.body?.content;

  if (!content || content.length === 0) {
    return 0;
  }
  return content[content.length - 1].endIndex - 1;
};
