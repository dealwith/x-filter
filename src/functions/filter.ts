import { FilterSettings } from "../interfaces/IFilterSettings";

export const loadFilterSettings = (): Promise<FilterSettings> => {
	return new Promise((resolve) => {
		chrome.storage.sync.get('filterSettings', (result) => {
			if (result.filterSettings) {
				resolve(result.filterSettings);
			} else {
				const defaultSettings: FilterSettings = {
					enabled: true,
					likes: [0, Infinity],
					ads: true,
					political: true,
				};

				resolve(defaultSettings);
			}
		});
	});
};
