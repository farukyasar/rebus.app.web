export type WalletTypes = 'metamask' | 'crypto' | 'cosmostation' | 'falcon' | undefined;

(window as any).enableFalcon = (isEnabled = true) => {
	localStorage.setItem('falcon_enabled', isEnabled ? 'true' : 'false');
	window.location.reload();
};

export const WALLET_LIST: {
	name: string;
	description: string;
	logoUrl: string;
	type: 'extension' | 'wallet-connect';
	walletType?: WalletTypes;
	link?: string;
}[] = [
	{
		name: 'Keplr Wallet',
		description: 'Keplr Browser Extension',
		logoUrl: '/public/assets/other-logos/keplr.png',
		type: 'extension',
	},
	{
		name: 'WalletConnect',
		description: 'Keplr Mobile',
		logoUrl: '/public/assets/other-logos/wallet-connect.png',
		type: 'wallet-connect',
	},
	{
		name: 'Metamask',
		description: 'Metamask Browser Extension',
		logoUrl: '/public/assets/other-logos/metamask.png',
		type: 'extension',
		walletType: 'metamask',
		link: 'https://metamask.io/',
	},
	{
		name: 'Cosmostation',
		description: 'Cosmostation Browser Extension',
		logoUrl: '/public/assets/other-logos/cosmostation.jpg',
		type: 'extension',
		walletType: 'cosmostation',
		link: 'https://www.cosmostation.io/wallet/',
	},
	(localStorage.getItem('falcon_enabled') === 'true' && {
		name: 'Falcon',
		description: 'Falcon Browser Extension',
		logoUrl: '/public/assets/other-logos/falcon.jpg',
		type: 'extension',
		walletType: 'falcon',
		link: 'https://www.falconwallet.app/',
	}) as any,
	{
		name: 'Crypto.com',
		description: 'Crypto.com Browser Extension (Transactions Not Supported)',
		logoUrl: '/public/assets/other-logos/crypto.jpg',
		type: 'extension',
		walletType: 'crypto',
	},
].filter(Boolean);
