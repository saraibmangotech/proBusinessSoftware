function Storage() {

  const setStorageItem = (key, value) => {
    if (typeof window !== "undefined" && key && value) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  };

  const getStorageItem = (key) => {
    if (typeof window !== "undefined" && key) {
      const data = JSON.parse(localStorage.getItem(key))
      return data
    }
  };

  const removeItem = (key) => {
    localStorage.removeItem(key)
  };

  return {
    setStorageItem,
    getStorageItem,
    removeItem
  }

}

export default Storage;