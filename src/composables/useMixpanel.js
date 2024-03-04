import mixpanel from 'mixpanel-browser';

export const useMixpanelComposable = () => {
	const mixpanelEvent = (event, payload) => {
		if (payload.hasEnv) mixpanel.track(event, payload);
	};

	return { mixpanelEvent };
};
