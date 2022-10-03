import { ChainGetter, ObservableChainQuery, ObservableChainQueryMap, QueryResponse } from '@keplr-wallet/stores';
import { KVStore } from '@keplr-wallet/common';
import { AccountLockedLongerDuration } from './types';
import { makeObservable } from 'mobx';
import { computedFn } from 'mobx-utils';
import { Duration } from 'dayjs/plugin/duration';
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import { AppCurrency } from '@keplr-wallet/types';

export class ObservableQueryAccountLockedInner extends ObservableChainQuery<AccountLockedLongerDuration> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, protected readonly bech32Address: string) {
		super(kvStore, chainId, chainGetter, `/rebus/lockup/v1beta1/account_locked_longer_duration/${bech32Address}`);

		makeObservable(this);
	}

	protected canFetch(): boolean {
		return this.bech32Address !== '';
	}

	protected setResponse(response: Readonly<QueryResponse<AccountLockedLongerDuration>>) {
		super.setResponse(response);

		const chainInfo = this.chainGetter.getChain(this.chainId);
		const unknownCurrencies: string[] = [];
		for (const lock of response.data.locks) {
			unknownCurrencies.push(...lock.coins.map(coin => coin.denom));
		}
		// Remove duplicates.
		chainInfo.addUnknownCurrencies(...[...new Set(unknownCurrencies)]);
	}

	readonly getLockedCoinWithDuration = computedFn((currency: AppCurrency, duration: Duration): {
		amount: CoinPretty;
		lockIds: string[];
	} => {
		if (!this.response) {
			return {
				amount: new CoinPretty(currency, new Dec(0)),
				lockIds: [],
			};
		}

		const matchedLocks = this.response.data.locks
			.filter(lock => {
				// Accepts the lock duration with jitter (~60s)
				return Math.abs(Number.parseInt(lock.duration.replace('s', '')) - duration.asSeconds()) <= 60;
			})
			.filter(lock => {
				// Filter the unlocking, unlockable locks.
				return new Date(lock.end_time).getTime() <= 0;
			})
			.filter(lock => {
				return lock.coins.find(coin => coin.denom === currency.coinMinimalDenom) != null;
			});

		let coin = new CoinPretty(currency, new Dec(0));
		for (const lock of matchedLocks) {
			const matchedCoin = lock.coins.find(coin => coin.denom === currency.coinMinimalDenom);
			if (matchedCoin) {
				coin = coin.add(new CoinPretty(currency, new Dec(matchedCoin.amount)));
			}
		}

		return {
			amount: coin,
			lockIds: matchedLocks.map(lock => lock.ID),
		};
	});

	readonly getUnlockingCoinWithDuration = computedFn((currency: AppCurrency, duration: Duration): {
		amount: CoinPretty;
		lockIds: string[];
		endTime: Date;
	}[] => {
		if (!this.response) {
			return [];
		}

		const matchedLocks = this.response.data.locks
			.filter(lock => {
				// Accepts the lock duration with jitter (~60s)
				return Math.abs(Number.parseInt(lock.duration.replace('s', '')) - duration.asSeconds()) <= 60;
			})
			.filter(lock => {
				// Filter the locked.
				return new Date(lock.end_time).getTime() > 0;
			})
			.filter(lock => {
				return lock.coins.find(coin => coin.denom === currency.coinMinimalDenom) != null;
			});

		const map: Map<
			number,
			{
				amount: CoinPretty;
				lockIds: string[];
				endTime: Date;
			}
		> = new Map();

		for (const lock of matchedLocks) {
			const matchedCoin = lock.coins.find(coin => coin.denom === currency.coinMinimalDenom);
			if (matchedCoin) {
				const time = new Date(lock.end_time).getTime();
				if (!map.has(time)) {
					map.set(time, {
						amount: new CoinPretty(currency, new Dec(0)),
						lockIds: [],
						endTime: new Date(lock.end_time),
					});
				}

				const value = map.get(time)!;
				value.amount = value.amount.add(new CoinPretty(currency, new Dec(matchedCoin.amount)));
				value.lockIds.push(lock.ID);

				map.set(time, value);
			}
		}

		return [...map.values()].sort((v1, v2) => {
			return v1.endTime > v2.endTime ? 1 : -1;
		});
	});
}

export class ObservableQueryAccountLocked extends ObservableChainQueryMap<AccountLockedLongerDuration> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		super(kvStore, chainId, chainGetter, (bech32Address: string) => {
			return new ObservableQueryAccountLockedInner(this.kvStore, this.chainId, this.chainGetter, bech32Address);
		});
	}

	get(bech32Address: string): ObservableQueryAccountLockedInner {
		return super.get(bech32Address) as ObservableQueryAccountLockedInner;
	}
}
