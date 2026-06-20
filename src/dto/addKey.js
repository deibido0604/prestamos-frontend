export const addKey = (data = []) => {
  if (JSON.stringify(data) === JSON.stringify([{}])) {
    return [];
  }
  return data.map((item, index) => ({ ...item, key: (index + 1).toString() }));
};
