import { IFilterSettings } from "../interfaces/IFilterSettings";

export const loadFilterSettings = (): Promise<IFilterSettings> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get("filterSettings", (result) => {
      if (result.filterSettings) {
        resolve(result.filterSettings);
      } else {
        const defaultSettings: IFilterSettings = {
          enabled: true,
          likes: [0, Infinity],
          ads: true,
          political: true,
        };

        chrome.storage.sync.set({ filterSettings: defaultSettings });

        resolve(defaultSettings);
      }
    });
  });
};
