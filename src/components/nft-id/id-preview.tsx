import React, { LegacyRef, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { NftIdData } from 'src/types/nft-id';
import { IdCard } from './id-card';
import useWindowSize from 'src/hooks/use-window-size';
import { renderToImage } from 'src/utils/nft-id';
import { BigLoader } from '../common/loader';
import styled from '@emotion/styled';

type IdPreviewProps = {
	className?: string;
	data?: NftIdData;
	// If this property is specified, only an image will be rendered
	idImageDataString?: string;
	isFetchingImage?: boolean;
	onRenderPublicImage?: (image: string) => void;
	onRenderPrivateImage?: (image: string) => void;
	title?: string;
	titleSuffix?: React.ReactElement;
};

const EMPTY_OBJ = {};

export const IdPreview: React.FC<IdPreviewProps> = ({
	className,
	data = EMPTY_OBJ,
	idImageDataString,
	isFetchingImage,
	onRenderPublicImage,
	onRenderPrivateImage,
	title,
	titleSuffix,
}) => {
	const privateCardRef = useRef<HTMLDivElement>();
	const publicCardRef = useRef<HTMLDivElement>();
	const { isMobileView } = useWindowSize();
	const renderIteration = useRef(0);
	const [watermarkLoaded, setWatermarkLoaded] = useState(false);
	const [imageSrc, setImageSrc] = useState('');

	// Needed since on the first render the watermark image might not be loaded yet, so the generated images won't have it
	const onWatermarkLoaded = useCallback(() => setWatermarkLoaded(true), []);

	useEffect(() => {
		const currentIteration = ++renderIteration.current;

		if (typeof idImageDataString !== 'undefined') {
			return;
		}

		renderToImage(publicCardRef.current as HTMLElement, dataUrl => {
			if (renderIteration.current !== currentIteration) {
				return;
			}

			setImageSrc(dataUrl);

			if (onRenderPublicImage) {
				onRenderPublicImage(dataUrl);
			}

			if (onRenderPrivateImage) {
				if (renderIteration.current !== currentIteration) {
					return;
				}

				renderToImage(privateCardRef.current as HTMLElement, dataUrl => {
					onRenderPrivateImage(dataUrl);
				});
			}
		});
	}, [data, idImageDataString, onRenderPrivateImage, onRenderPublicImage, watermarkLoaded]);

	return (
		<div className={className}>
			{(title || titleSuffix) && (
				<div className="flex items-center mb-6">
					<h5 className="whitespace-nowrap">{title}</h5>
					{titleSuffix}
				</div>
			)}

			{!idImageDataString && (
				<div style={{ position: 'absolute', top: 0, zIndex: -1 }}>
					<IdCard
						className="absolute top-0"
						data={data}
						displayBlurredData={true}
						ref={privateCardRef as MutableRefObject<HTMLDivElement>}
						onWatermarkLoad={onWatermarkLoaded}
					/>
					<IdCard
						className="absolute top-0"
						data={data}
						ref={publicCardRef as MutableRefObject<HTMLDivElement>}
						onWatermarkLoad={onWatermarkLoaded}
					/>
				</div>
			)}
			{isFetchingImage || (!idImageDataString && !imageSrc) ? (
				<BigLoader
					style={{
						height: 'auto',
						margin: '64px 0',
					}}
				/>
			) : (
				<img
					className="rounded-3xl overflow-hidden"
					src={idImageDataString || imageSrc}
					style={{ minWidth: isMobileView ? '420px' : '550px' }}
				/>
			)}
		</div>
	);
};
