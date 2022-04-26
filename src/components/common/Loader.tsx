import React, { FunctionComponent } from 'react';
import cn from 'clsx';

// TODO : implement a properly designed loader
export const Loader: FunctionComponent<ILoader> = ({ className }) => {
	return (
		<div className="w-full h-screen flex items-center justify-center">
			<img
				alt="logo"
				className={cn('s-spin', className ? className : 'w-5 h-5 md:w-10 md:h-10')}
				src={'/public/assets/main/rebus-logo-single.svg'}
			/>
		</div>
	);
};

interface ILoader {
	className?: string;
}
