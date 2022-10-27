import { REST_URL, RPC_URL } from 'src/constants/url';
import { DeliverTxResponse, SigningStargateClient } from '@cosmjs/stargate';
import { OfflineSigner, SigningCosmosClient } from '@cosmjs/launchpad';
import { AccountData, makeSignDoc } from '@cosmjs/amino';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { config } from 'src/config-insync';
import { getAccount } from 'src/utils/account';

const chainId = config.CHAIN_ID;

export const initializeChain = (cb: (error: string | null, accounts?: readonly AccountData[] | undefined) => void) => {
	(async () => {
		if (!window.getOfflineSignerOnlyAmino || !window.keplr) {
			const error = 'Please install keplr extension';
			cb(error);
		}

		if (window.keplr) {
			await window.keplr.enable(chainId);

			const offlineSigner = window.getOfflineSignerOnlyAmino?.(chainId);
			const accounts = await offlineSigner?.getAccounts();
			cb(null, accounts);
		} else {
			return null;
		}
	})();
};

export const signTxAndBroadcast = (
	tx: any,
	address: string,
	cb: (error: string | null | undefined, result?: DeliverTxResponse | undefined) => void
) => {
	(async () => {
		(await window.keplr) && window.keplr?.enable(chainId);
		const offlineSigner = window.getOfflineSignerOnlyAmino && window.getOfflineSignerOnlyAmino(chainId);
		const client = await SigningStargateClient.connectWithSigner(RPC_URL, offlineSigner as OfflineSigner);
		client
			.signAndBroadcast(address, tx.msgs ? tx.msgs : [tx.msg], tx.fee, tx.memo)
			.then((result: any) => {
				if (result && result.code !== undefined && result.code !== 0) {
					cb(result.log || result.rawLog);
				} else {
					cb(null, result);
				}
			})
			.catch(error => {
				cb(error && error.message);
			});
	})();
};

export const cosmosSignTxAndBroadcast = (
	tx: any,
	address: string,
	cb: (error: string | null | undefined, result?: DeliverTxResponse | undefined) => void
) => {
	(async () => {
		(await window.keplr) && window.keplr?.enable(chainId);
		const offlineSigner = window.getOfflineSignerOnlyAmino && window.getOfflineSignerOnlyAmino(chainId);
		const cosmJS = new SigningCosmosClient(REST_URL, address, offlineSigner as OfflineSigner);

		cosmJS
			.signAndBroadcast(tx.msg, tx.fee, tx.memo)
			.then((result: any) => {
				if (result && result.code !== undefined && result.code !== 0) {
					cb(result.log || result.rawLog);
				} else {
					cb(null, result);
				}
			})
			.catch(error => {
				cb(error && error.message);
			});
	})();
};

export const aminoSignTxAndBroadcast = (
	tx: any,
	address: string,
	cb: (error: string | null | undefined, result?: DeliverTxResponse | undefined) => void
) => {
	(async () => {
		(await window.keplr) && window.keplr?.enable(chainId);
		const offlineSigner = window.getOfflineSignerOnlyAmino && window.getOfflineSignerOnlyAmino(chainId);

		const client2 = await SigningStargateClient.connectWithSigner(RPC_URL, offlineSigner as OfflineSigner);
		const account: any = {};
		try {
			const { accountNumber, sequence } = await client2.getSequence(address);
			account.accountNumber = accountNumber;
			account.sequence = sequence;
		} catch (e) {
			account.accountNumber = 0;
			account.sequence = 0;
		}
		const signDoc = makeSignDoc(
			tx.msgs ? tx.msgs : [tx.msg],
			tx.fee,
			chainId,
			tx.memo,
			account.accountNumber,
			account.sequence
		);

		if (!offlineSigner) {
			cb(null);
			return;
		}

		const { signed, signature } = await offlineSigner.signAmino(address, signDoc);

		const msg = signed.msgs;
		const fee = signed.fee;
		const memo = signed.memo;

		const voteTx: any = {
			msg,
			fee,
			memo,
			signatures: [signature],
		};

		client2
			.broadcastTx(voteTx)
			.then((result: any) => {
				if (result && result.code !== undefined && result.code !== 0) {
					cb(result.log || result.rawLog);
				} else {
					cb(null, result);
				}
			})
			.catch(error => {
				cb(error && error.message);
			});
	})();
};

export const aminoSignTx = async (tx: any, address: string, offlineSigner: OfflineSigner | null, isEvmos: boolean) => {
	if (!offlineSigner) {
		(await window.keplr) && window.keplr?.enable(chainId);
		offlineSigner = (window.getOfflineSignerOnlyAmino && window.getOfflineSignerOnlyAmino(chainId)) as OfflineSigner;
	}

	const client = await SigningStargateClient.connectWithSigner(RPC_URL, offlineSigner);
	const myac = await getAccount(address);

	if (!myac) {
		throw new Error('Account not found');
	}

	const signerData = {
		accountNumber: myac.accountNumber,
		sequence: myac.sequence,
		chainId: chainId,
	};

	const result = await (client as any).signAmino(
		address,
		tx.msgs ? tx.msgs : [tx.msg],
		tx.fee,
		tx.memo,
		signerData,
		isEvmos
	);

	const txBytes = TxRaw.encode(result).finish();

	return client.broadcastTx(txBytes);
};