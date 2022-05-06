import { ROUTES } from './routes';

export const LAYOUT = {
	SIDEBAR: {
		/*TRADE: {
			ICON: '/public/assets/Icons/Trade.svg',
			ICON_SELECTED: '/public/assets/Icons/Trade_selected.svg',
			TEXT: 'Trade',
			ROUTE: '/',
			SELECTED_CHECK: '/',
		},*/
		POOLS: {
			ICON: '/public/assets/Icons/Pool.svg',
			ICON_SELECTED: '/public/assets/Icons/Pool_selected.svg',
			TEXT: 'Pools',
			SELECTED_CHECK: [ROUTES.POOLS, /\/pool\/[0-9]+/],
			ROUTE: ROUTES.POOLS,
		},
		/*
		LBP: {
			ICON: '/public/assets/Icons/LBP.svg',
			ICON_SELECTED: '/public/assets/Icons/LBP_selected.svg',
			TEXT: 'LBP',
			ROUTE: '/bootstrap',
			SELECTED_CHECK: '/bootstrap',
		},
		 */
		/*
		AIRDROP: {
			ICON: '/public/assets/Icons/Airdrop.svg',
			ICON_SELECTED: '/public/assets/Icons/Airdrop_selected.svg',
			TEXT: 'Airdrop',
			ROUTE: '/airdrop',
			SELECTED_CHECK: '/airdrop',
		},
		 */
		ASSETS: {
			ICON: '/public/assets/Icons/Asset.svg',
			ICON_SELECTED: '/public/assets/Icons/Asset_selected.svg',
			TEXT: 'Assets',
			ROUTE: '/assets',
			SELECTED_CHECK: '/assets',
		},
		PROPOSALS: {
			ICON: '/public/assets/Icons/Vote.svg',
			ICON_SELECTED: '/public/assets/Icons/Vote_selected.svg',
			TEXT: 'Vote',
			ROUTE: '/proposals',
			SELECTED_CHECK: '/proposals',
		},
		STAKE: {
			ICON: '/public/assets/Icons/Ticket.svg',
			ICON_SELECTED: '/public/assets/Icons/Ticket_selected.svg',
			TEXT: 'Stake',
			ROUTE: '/staking',
			SELECTED_CHECK: '/staking',
		},
		TOOLS: {
			ICON: '/public/assets/Icons/Ticket.svg',
			ICON_SELECTED: '/public/assets/Icons/Ticket_selected.svg',
			TEXT: 'Tools',
			ROUTE: ROUTES.TOOLS,
			SELECTED_CHECK: ROUTES.TOOLS,
		},
	},
};
export type TSIDEBAR_ITEM = {
	ICON: string;
	ICON_SELECTED: string;
	TEXT: string;
	ROUTE: string;
	SELECTED_CHECK: TSIDEBAR_SELECTED_CHECK;
} & {
	ICON: string;
	TEXT: string;
	LINK: string;
};

export type TSIDEBAR_SELECTED_CHECK = string | (string | RegExp)[];
